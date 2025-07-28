import express from 'express';
import { ProductController } from '../controllers/ProductController.js';

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', ProductController.getAll);

// GET /api/products/category/:categoryId - Obtener productos por categoría
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get('/category/:categoryId', ProductController.getByCategory);

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', ProductController.getById);

// GET /api/products/:id/details - Obtener detalles completos del producto
router.get('/:id/details', ProductController.getDetails);

// POST /api/products - Crear nuevo producto
router.post('/', ProductController.create);

export default router;