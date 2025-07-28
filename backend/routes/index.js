// ===== routes/index.js =====
import express from 'express';
import categoriesRoutes from './categories.js';
import productsRoutes from './products.js';
import calculatorRoutes from './calculator.js';

const router = express.Router();

// Rutas principales
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/calculator', calculatorRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión - API REST',
    version: '1.0.0',
    endpoints: {
      categories: {
        'GET /api/categories': 'Obtener todas las categorías',
        'GET /api/categories/:id': 'Obtener categoría por ID',
        'POST /api/categories': 'Crear nueva categoría',
        'GET /api/categories/:id/products': 'Productos de una categoría',
        'GET /api/categories/:id/materials': 'Materiales de una categoría'
      },
      products: {
        'GET /api/products': 'Obtener todos los productos',
        'GET /api/products/:id': 'Obtener producto por ID',
        'GET /api/products/category/:categoryId': 'Productos por categoría',
        'GET /api/products/:id/details': 'Detalles completos del producto',
        'POST /api/products': 'Crear nuevo producto'
      },
      calculator: {
        'POST /api/calculator/calculate': 'Calcular costo de producto',
        'POST /api/calculator/batch': 'Calcular múltiples productos',
        'POST /api/calculator/estimate': 'Estimación rápida',
        'GET /api/calculator/rules/:categoryId': 'Reglas de cálculo por categoría'
      }
    },
    documentation: 'Consulta la documentación para más detalles sobre cada endpoint'
  });
});

// Manejo de rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    available_endpoints: [
      'GET /api/',
      'GET /api/health',
      'GET /api/categories',
      'GET /api/products',
      'POST /api/calculator/calculate'
    ]
  });
});

export default router;