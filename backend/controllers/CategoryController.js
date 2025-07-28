// ===== controllers/CategoryController.js =====
import { CategoryService } from '../services/CategoryService.js';

export class CategoryController {
  
  // GET /api/categories - Obtener todas las categorías
  static async getAll(req, res) {
    try {
      const categories = await CategoryService.getAll();
      res.json({
        success: true,
        data: categories,
        message: 'Categorías obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error in CategoryController.getAll:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error al obtener las categorías'
      });
    }
  }

  // GET /api/categories/:id - Obtener categoría por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getById(id);
      
      res.json({
        success: true,
        data: category,
        message: 'Categoría obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error in CategoryController.getById:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al obtener la categoría'
      });
    }
  }

  // POST /api/categories - Crear nueva categoría
  static async create(req, res) {
    try {
      const categoryData = req.body;
      const newCategory = await CategoryService.create(categoryData);
      
      res.status(201).json({
        success: true,
        data: newCategory,
        message: 'Categoría creada exitosamente'
      });
    } catch (error) {
      console.error('Error in CategoryController.create:', error);
      const statusCode = error.message.includes('ya existe') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al crear la categoría'
      });
    }
  }

  // GET /api/categories/:id/products - Obtener productos de una categoría
  static async getProducts(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que la categoría existe
      await CategoryService.getById(id);
      
      // Importar ProductService aquí para evitar dependencias circulares
      const { ProductService } = await import('../services/ProductService.js');
      const products = await ProductService.getByCategory(id);
      
      res.json({
        success: true,
        data: products,
        message: `Productos de la categoría ${id} obtenidos exitosamente`
      });
    } catch (error) {
      console.error('Error in CategoryController.getProducts:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al obtener los productos de la categoría'
      });
    }
  }

  // GET /api/categories/:id/materials - Obtener materiales de una categoría
  static async getMaterials(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que la categoría existe
      await CategoryService.getById(id);
      
      // Importar MaterialService aquí para evitar dependencias circulares
      const { MaterialService } = await import('../services/MaterialService.js');
      const materials = await MaterialService.getByCategory(id);
      
      res.json({
        success: true,
        data: materials,
        message: `Materiales de la categoría ${id} obtenidos exitosamente`
      });
    } catch (error) {
      console.error('Error in CategoryController.getMaterials:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Error al obtener los materiales de la categoría'
      });
    }
  }
}