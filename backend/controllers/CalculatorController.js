// ===== controllers/CalculatorController.js =====
import { CalculatorService } from '../services/CalculatorService.js';

export class CalculatorController {
  
  // POST /api/calculator/calculate - Calcular costo de producto
  static async calculateProductCost(req, res) {
    try {
      const calculateRequest = req.body;
      
      // Validar datos requeridos
      const validation = CalculatorController.validateCalculateRequest(calculateRequest);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: `Datos inválidos: ${validation.errors.join(', ')}`,
          message: 'Error en los datos de entrada'
        });
      }
      
      const result = await CalculatorService.calculateProductCost(calculateRequest);
      
      res.json({
        success: true,
        data: result,
        message: 'Cálculo realizado exitosamente'
      });
    } catch (error) {
      console.error('Error in CalculatorController.calculateProductCost:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al calcular el costo del producto'
      });
    }
  }

  // GET /api/calculator/rules/:categoryId - Obtener reglas de cálculo por categoría
  static async getCalculationRules(req, res) {
    try {
      const { categoryId } = req.params;
      const rules = await CalculatorService.getCalculationRules(categoryId);
      
      res.json({
        success: true,
        data: rules,
        message: `Reglas de cálculo para la categoría ${categoryId} obtenidas exitosamente`
      });
    } catch (error) {
      console.error('Error in CalculatorController.getCalculationRules:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al obtener las reglas de cálculo'
      });
    }
  }

  // POST /api/calculator/batch - Calcular múltiples productos
  static async calculateBatch(req, res) {
    try {
      const { calculations } = req.body;
      
      if (!Array.isArray(calculations) || calculations.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de cálculos no vacío',
          message: 'Datos inválidos para cálculo en lote'
        });
      }
      
      const results = [];
      const errors = [];
      
      // Procesar cada cálculo
      for (let i = 0; i < calculations.length; i++) {
        try {
          const calculateRequest = calculations[i];
          const validation = CalculatorController.validateCalculateRequest(calculateRequest);
          
          if (!validation.isValid) {
            errors.push({
              index: i,
              request: calculateRequest,
              error: `Datos inválidos: ${validation.errors.join(', ')}`
            });
            continue;
          }
          
          const result = await CalculatorService.calculateProductCost(calculateRequest);
          results.push({
            index: i,
            request: calculateRequest,
            result: result
          });
        } catch (error) {
          errors.push({
            index: i,
            request: calculations[i],
            error: error.message
          });
        }
      }
      
      res.json({
        success: true,
        data: {
          successful_calculations: results.length,
          failed_calculations: errors.length,
          results: results,
          errors: errors
        },
        message: `Cálculo en lote completado: ${results.length} exitosos, ${errors.length} fallidos`
      });
    } catch (error) {
      console.error('Error in CalculatorController.calculateBatch:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al procesar el cálculo en lote'
      });
    }
  }

  // POST /api/calculator/estimate - Estimación rápida (sin guardar)
  static async quickEstimate(req, res) {
    try {
      const { category_id, product_id, weight, profit_margin = 50 } = req.body;
      
      if (!category_id || !product_id || !weight) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren category_id, product_id y weight',
          message: 'Datos insuficientes para la estimación'
        });
      }
      
      const calculateRequest = {
        category_id,
        product_id,
        weight: parseFloat(weight),
        quantity: 1,
        profit_margin: parseFloat(profit_margin)
      };
      
      const result = await CalculatorService.calculateProductCost(calculateRequest);
      
      // Devolver solo los datos esenciales para estimación rápida
      res.json({
        success: true,
        data: {
          product_name: result.product.name,
          unit_cost: result.costs.unit_cost,
          sale_price: result.costs.sale_price_per_unit,
          profit: result.costs.profit_per_unit,
          profit_margin: profit_margin
        },
        message: 'Estimación rápida realizada exitosamente'
      });
    } catch (error) {
      console.error('Error in CalculatorController.quickEstimate:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al realizar la estimación rápida'
      });
    }
  }

  // Método auxiliar para validar request de cálculo
  static validateCalculateRequest(request) {
    const errors = [];
    
    if (!request.category_id || typeof request.category_id !== 'string') {
      errors.push('category_id es requerido y debe ser string');
    }
    
    if (!request.product_id || typeof request.product_id !== 'string') {
      errors.push('product_id es requerido y debe ser string');
    }
    
    if (!request.weight || typeof request.weight !== 'number' || request.weight <= 0) {
      errors.push('weight es requerido y debe ser un número mayor a 0');
    }
    
    if (request.quantity !== undefined && (typeof request.quantity !== 'number' || request.quantity <= 0)) {
      errors.push('quantity debe ser un número mayor a 0');
    }
    
    if (request.profit_margin !== undefined && (typeof request.profit_margin !== 'number' || request.profit_margin < 0)) {
      errors.push('profit_margin debe ser un número mayor o igual a 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}