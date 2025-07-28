// Configuración de la aplicación
const CONFIG = {
    // URLs de la API - ajusta según tu backend
    API_BASE: 'http://localhost:3001/api',
    
    // URLs alternativas si tienes problemas de conexión
    FALLBACK_APIS: [
        'http://127.0.0.1:3001/api'
    ],
    
    // Configuración de timeouts
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    
    // Configuración de polling para estado de API
    API_CHECK_INTERVAL: 30000, // 30 segundos
    
    // Configuración de estimación automática
    ESTIMATE_DELAY: 1000 // 1 segundo después de escribir
};