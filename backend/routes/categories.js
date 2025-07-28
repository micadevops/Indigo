import express from 'express';
import { CategoryController } from '../controllers/CategoryController.js';

const router = express.Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', CategoryController.getAll);

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', CategoryController.getById);

// POST /api/categories - Crear nueva categoría
router.post('/', CategoryController.create);

// GET /api/categories/:id/products - Obtener productos de una categoría
router.get('/:id/products', CategoryController.getProducts);

// GET /api/categories/:id/materials - Obtener materiales de una categoría
router.get('/:id/materials', CategoryController.getMaterials);

export default router;