// ===== config/app.js =====
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from '../routes/index.js';

export function createApp() {
  const app = express();

  // ===== MIDDLEWARE DE SEGURIDAD =====
  // Configurar CORS - permitir requests desde el frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || [
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'http://localhost:5173',
      'http://localhost:8080',    // ← AGREGADO
      'http://127.0.0.1:8080'     // ← AGREGADO
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Helmet para headers de seguridad
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // ===== MIDDLEWARE DE LOGGING =====
  // Morgan para logging de requests (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ===== MIDDLEWARE DE PARSING =====
  // Parser para JSON (limitar tamaño para seguridad)
  app.use(express.json({ 
    limit: '10mb',
    type: 'application/json'
  }));

  // Parser para URL encoded
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));

  // ===== MIDDLEWARE PERSONALIZADO =====
  // Agregar timestamp a cada request
  app.use((req, res, next) => {
    req.timestamp = new Date().toISOString();
    next();
  });

  // Middleware para logging de requests (opcional)
  app.use((req, res, next) => {
    console.log(`${req.timestamp} - ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
    next();
  });

  // ===== RUTAS ESTÁTICAS =====
  // Servir archivos estáticos si existen (para el frontend)
  app.use(express.static('public'));

  // ===== RUTAS DE LA API =====
  app.use('/api', routes);

  // Ruta raíz - información básica
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Sistema de Gestión - API REST',
      version: '1.0.0',
      timestamp: req.timestamp,
      documentation: '/api',
      health: '/api/health'
    });
  });

  // ===== MIDDLEWARE DE MANEJO DE ERRORES =====
  // Manejo de errores 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Ruta no encontrada',
      message: `${req.method} ${req.originalUrl} no existe`,
      timestamp: req.timestamp,
      suggestion: 'Consulta /api para ver las rutas disponibles'
    });
  });

  // Manejo global de errores
  app.use((error, req, res, next) => {
    console.error('Error global capturado:', error);
    
    // Error de JSON mal formado
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: 'JSON inválido',
        message: 'El JSON enviado tiene errores de sintaxis',
        timestamp: req.timestamp
      });
    }

    // Error genérico
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
      message: 'Ha ocurrido un error inesperado',
      timestamp: req.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });

  return app;
}

// ===== CONFIGURACIÓN DEL ENTORNO =====
export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080', // ← CAMBIADO de 3000 a 8080
  
  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },
  
  // Configuración de seguridad
  security: {
    jsonLimit: '10mb',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      'http://localhost:8080',    // ← CAMBIADO
      'http://127.0.0.1:8080'     // ← CAMBIADO
    ]
  }
};