import express from 'express';
import { CalculatorController } from '../controllers/CalculatorController.js';

const router = express.Router();

// POST /api/calculator/calculate - Calcular costo de producto
router.post('/calculate', CalculatorController.calculateProductCost);

// POST /api/calculator/batch - Calcular múltiples productos
router.post('/batch', CalculatorController.calculateBatch);

// POST /api/calculator/estimate - Estimación rápida
router.post('/estimate', CalculatorController.quickEstimate);

// GET /api/calculator/rules/:categoryId - Obtener reglas de cálculo por categoría
router.get('/rules/:categoryId', CalculatorController.getCalculationRules);

export default router;