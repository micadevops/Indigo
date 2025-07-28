// ===== controllers/ProductController.js =====
import { ProductService } from '../services/ProductService.js';

export class ProductController {
  
  // GET /api/products - Obtener todos los productos
  static async getAll(req, res) {
    try {
      const products = await ProductService.getAll();
      res.json({
        success: true,
        data: products,
        message: 'Productos obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error in ProductController.getAll:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al obtener los productos'
      });
    }
  }

  // GET /api/products/:id - Obtener producto por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(id);
      
      res.json({
        success: true,
        data: product,
        message: 'Producto obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error in ProductController.getById:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al obtener el producto'
      });
    }
  }

  // GET /api/products/category/:categoryId - Obtener productos por categoría
  static async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await ProductService.getByCategory(categoryId);
      
      res.json({
        success: true,
        data: products,
        message: `Productos de la categoría ${categoryId} obtenidos exitosamente`
      });
    } catch (error) {
      console.error('Error in ProductController.getByCategory:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al obtener los productos de la categoría'
      });
    }
  }

  // POST /api/products - Crear nuevo producto
  static async create(req, res) {
    try {
      const productData = req.body;
      const newProduct = await ProductService.create(productData);
      
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Producto creado exitosamente'
      });
    } catch (error) {
      console.error('Error in ProductController.create:', error);
      const statusCode = error.message.includes('ya existe') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al crear el producto'
      });
    }
  }

  // GET /api/products/:id/details - Obtener detalles completos del producto
  static async getDetails(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(id);
      
      // Obtener materiales y reglas de cálculo relacionadas
      const { MaterialService } = await import('../services/MaterialService.js');
      const { CalculatorService } = await import('../services/CalculatorService.js');
      
      const materials = await MaterialService.getByCategory(product.category_id);
      const calculationRules = await CalculatorService.getCalculationRules(product.category_id);
      
      // Filtrar solo los materiales que usa este producto
      const productMaterials = materials.filter(material => 
        product.materials.includes(material.id)
      );
      
      // Filtrar solo las reglas de cálculo que aplican a los materiales del producto
      const productRules = calculationRules.filter(rule => 
        product.materials.includes(rule.material_id)
      );
      
      res.json({
        success: true,
        data: {
          product: product,
          materials: productMaterials,
          calculation_rules: productRules
        },
        message: 'Detalles del producto obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error in ProductController.getDetails:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al obtener los detalles del producto'
      });
    }
  }
}