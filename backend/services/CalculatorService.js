import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CalculationRule } from '../models/CalculationRule.js';
import { MaterialService } from './MaterialService.js';
import { ProductService } from './ProductService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CalculatorService {
  static rulesPath = path.join(__dirname, '../data/calculation-rules.json');

  static async getCalculationRules(categoryId) {
    try {
      const data = await fs.readFile(this.rulesPath, 'utf8');
      const { calculation_rules } = JSON.parse(data);
      return calculation_rules
        .filter(rule => rule.category_id === categoryId && rule.active)
        .map(rule => new CalculationRule(rule));
    } catch (error) {
      console.error('Error reading calculation rules:', error);
      throw new Error('No se pudieron cargar las reglas de cálculo');
    }
  }

  // ⭐ MÉTODO FALTANTE: Calcula el costo de un material específico
  static calculateMaterialCost(rule, material, materialCost, productWeight, productId) {
    let quantityUsed = 0;
    let cost = 0;
    let description = '';
    let unit = rule.parameters.base_unit || material.unit;

    switch (rule.calculation_type) {
      case CalculationRule.CALCULATION_TYPES.PERCENTAGE_WEIGHT:
        // Calcular cantidad usada basada en porcentaje del peso
        quantityUsed = productWeight * rule.parameters.percentage;
        
        // Aplicar factor de conversión para el costo
        const conversionFactor = rule.parameters.conversion_factor || 1;
        cost = (quantityUsed / conversionFactor) * materialCost;
        
        description = `${(rule.parameters.percentage * 100).toFixed(1)}% del peso (${quantityUsed.toFixed(1)}${unit})`;
        break;

      case CalculationRule.CALCULATION_TYPES.FIXED_QUANTITY:
        // Cantidad fija por producto
        quantityUsed = rule.parameters.quantity;
        cost = quantityUsed * materialCost;
        description = `${quantityUsed} ${rule.parameters.unit || 'unidad(es)'}`;
        unit = rule.parameters.unit || 'unidades';
        break;

      case CalculationRule.CALCULATION_TYPES.VARIABLE_BY_PRODUCT:
        // Cantidad fija pero costo variable según producto
        quantityUsed = rule.parameters.quantity;
        
        if (rule.parameters.use_product_specific_cost) {
          // Usar el costo específico del material para este producto
          cost = quantityUsed * material.getCostForProduct(productId);
        } else {
          cost = quantityUsed * materialCost;
        }
        
        description = `${quantityUsed} ${rule.parameters.unit || 'unidad(es)'} (costo variable)`;
        unit = rule.parameters.unit || 'unidades';
        break;

      default:
        console.warn(`Tipo de cálculo desconocido: ${rule.calculation_type}`);
        quantityUsed = 0;
        cost = 0;
        description = 'Tipo de cálculo no soportado';
    }

    return {
      quantityUsed: parseFloat(quantityUsed.toFixed(3)),
      cost: parseFloat(cost.toFixed(2)),
      description,
      unit
    };
  }

  static async calculateProductCost(calculateRequest) {
    const {
      category_id,
      product_id,
      weight,
      quantity = 1,
      custom_material_costs = {},
      profit_margin = 50
    } = calculateRequest;

    try {
      // Get product, materials, and calculation rules
      const product = await ProductService.getById(product_id);
      const materials = await MaterialService.getByCategory(category_id);
      const rules = await this.getCalculationRules(category_id);

      // Create materials lookup
      const materialsMap = new Map(materials.map(m => [m.id, m]));
      const rulesMap = new Map(rules.map(r => [r.material_id, r]));

      const breakdown = [];
      let totalCostPerUnit = 0;

      // Calculate cost for each material used by this product
      for (const materialId of product.materials) {
        const material = materialsMap.get(materialId);
        const rule = rulesMap.get(materialId);

        if (!material || !rule) {
          console.warn(`Material ${materialId} or rule not found`);
          continue;
        }

        // Use custom cost if provided, otherwise use material's cost
        const materialCost = custom_material_costs[materialId] || 
                           material.getCostForProduct(product_id);

        const calculationResult = this.calculateMaterialCost(
          rule, 
          material, 
          materialCost, 
          weight, 
          product_id
        );

        totalCostPerUnit += calculationResult.cost;
        breakdown.push({
          material_id: materialId,
          material_name: material.name,
          description: calculationResult.description,
          quantity_used: calculationResult.quantityUsed,
          unit: calculationResult.unit,
          unit_cost: materialCost,
          total_cost: calculationResult.cost
        });
      }

      // Calculate final prices
      const salePrice = totalCostPerUnit * (1 + profit_margin / 100);
      const totalCost = totalCostPerUnit * quantity;
      const totalSalePrice = salePrice * quantity;
      const profitPerUnit = salePrice - totalCostPerUnit;
      const totalProfit = profitPerUnit * quantity;

      return {
        product: {
          id: product.id,
          name: product.name,
          weight,
          quantity
        },
        costs: {
          unit_cost: parseFloat(totalCostPerUnit.toFixed(2)),
          total_cost: parseFloat(totalCost.toFixed(2)),
          sale_price_per_unit: parseFloat(salePrice.toFixed(2)),
          total_sale_price: parseFloat(totalSalePrice.toFixed(2)),
          profit_per_unit: parseFloat(profitPerUnit.toFixed(2)),
          total_profit: parseFloat(totalProfit.toFixed(2))
        },
        breakdown,
        metadata: {
          profit_margin: profit_margin,
          calculated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error calculating product cost:', error);
      throw new Error('Error al calcular el costo del producto');
    }
  }
}  