// ===== server.js =====
import { createApp, config } from './config/app.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Crear la aplicación Express
const app = createApp();

// IMPORTANTE: CORS debe aplicarse ANTES que cualquier ruta
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:8080', 'http://127.0.0.1:8080'];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// ===== MANEJO DE SEÑALES DEL SISTEMA =====
let server;

// Función para iniciar el servidor
function startServer() {
  server = app.listen(config.port, () => {
    console.log('🚀 ===== SERVIDOR INICIADO =====');
    console.log(`📡 Servidor corriendo en: http://localhost:${config.port}`);
    console.log(`🌍 Entorno: ${config.nodeEnv}`);
    console.log(`📚 API Documentation: http://localhost:${config.port}/api`);
    console.log(`❤️  Health Check: http://localhost:${config.port}/api/health`);
    console.log('================================');
    
    // Mostrar rutas principales en desarrollo
    if (config.nodeEnv === 'development') {
      console.log('\n📋 Rutas principales disponibles:');
      console.log(`   GET  http://localhost:${config.port}/api/categories`);
      console.log(`   GET  http://localhost:${config.port}/api/products`);
      console.log(`   POST http://localhost:${config.port}/api/calculator/calculate`);
      console.log(`   POST http://localhost:${config.port}/api/calculator/estimate`);
      console.log('================================\n');
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Error: El puerto ${config.port} ya está en uso`);
      console.log('💡 Soluciones:');
      console.log('   1. Cambiar el puerto: PORT=3002 npm start');
      console.log('   2. Matar el proceso que usa el puerto');
      console.log(`   3. Usar: lsof -ti:${config.port} | xargs kill -9`);
    } else {
      console.error('❌ Error al iniciar el servidor:', error);
    }
    process.exit(1);
  });
}

// Función para cerrar el servidor de forma limpia
function gracefulShutdown(signal) {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor de forma limpia...`);
  
  if (server) {
    server.close((error) => {
      if (error) {
        console.error('❌ Error al cerrar el servidor:', error);
        process.exit(1);
      }
      
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      console.log('⏰ Forzando cierre del servidor...');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// ===== MANEJO DE ERRORES NO CAPTURADOS =====
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  console.error('Stack:', error.stack);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada en:', promise);
  console.error('Razón:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ===== MANEJO DE SEÑALES DE CIERRE =====
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// En Windows, manejar CTRL+C
if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

// ===== INICIAR EL SERVIDOR =====
// Verificar que estamos en el directorio correcto
const requiredFiles = [
  './models/Category.js',
  './services/CategoryService.js',
  './controllers/CategoryController.js',
  './routes/index.js'
];

async function checkRequiredFiles() {
  for (const file of requiredFiles) {
    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Error: Archivo requerido no encontrado: ${file}`);
      console.log('💡 Asegúrate de ejecutar el servidor desde la carpeta backend/');
      process.exit(1);
    }
  }
}

// Iniciar servidor después de verificar archivos
checkRequiredFiles()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    console.error('❌ Error al verificar archivos:', error);
    process.exit(1);
  });

// Exportar la app para testing
export default app;