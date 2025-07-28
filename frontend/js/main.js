// Archivo principal - inicialización de la aplicación
class App {
    constructor() {
        this.calculator = null;
        this.quickEstimate = null;
        this.resultsManager = null;
        this.apiStatus = document.getElementById('apiStatus');
        this.refreshBtn = document.getElementById('refreshData');
        
        this.init();
    }

    async init() {
        try {
            // Mostrar estado de conexión inicial
            this.updateApiStatus('connecting', '🔄 Conectando...');
            
            // Inicializar componentes
            this.calculator = new Calculator();
            this.quickEstimate = new QuickEstimate();
            this.resultsManager = new ResultsManager();
            
            // Hacer los managers disponibles globalmente
            window.calculator = this.calculator;
            window.quickEstimate = this.quickEstimate;
            window.resultsManager = this.resultsManager;
            
            // Bindear eventos globales
            this.bindGlobalEvents();
            
            // Verificar conexión con API
            const isConnected = await this.checkApiConnection();
            
            if (isConnected) {
                // Cargar datos iniciales
                await this.loadInitialData();
                this.updateApiStatus('online', '🟢 API Online');
            } else {
                this.updateApiStatus('offline', '🔴 API Offline');
                this.showOfflineMessage();
            }
            
            // Configurar chequeo periódico de API
            this.startApiHealthCheck();
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            Helpers.showError('Error al inicializar la aplicación: ' + error.message);
            this.updateApiStatus('offline', '🔴 Error de Conexión');
        }
    }

    bindGlobalEvents() {
        // Botón de refrescar
        this.refreshBtn.addEventListener('click', () => this.refreshApp());
        
        // Detectar cambios en la conexión de red
        window.addEventListener('online', () => {
            Helpers.showSuccess('Conexión restaurada');
            this.checkApiConnection();
        });
        
        window.addEventListener('offline', () => {
            Helpers.showError('Sin conexión a internet');
            this.updateApiStatus('offline', '🔴 Sin Internet');
        });
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter para calcular
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.calculator.calculateBtn.disabled) {
                    this.calculator.calculateFullCost();
                }
            }
            
            // Escape para limpiar formulario
            if (e.key === 'Escape') {
                this.calculator.reset();
                this.quickEstimate.clear();
                this.resultsManager.hideResults();
            }
        });
    }

    async checkApiConnection() {
        try {
            const isConnected = await apiService.testConnection();
            return isConnected;
        } catch (error) {
            console.error('Error verificando conexión API:', error);
            return false;
        }
    }

    async loadInitialData() {
        try {
            await this.calculator.loadCategories();
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            throw error;
        }
    }

    updateApiStatus(status, message) {
        this.apiStatus.className = `api-status ${status}`;
        this.apiStatus.textContent = message;
    }

    showOfflineMessage() {
        Helpers.showError('No se puede conectar con el servidor. Verifica que esté ejecutándose en http://localhost:3001');
    }

    startApiHealthCheck() {
        setInterval(async () => {
            const isConnected = await this.checkApiConnection();
            
            if (isConnected) {
                this.updateApiStatus('online', '🟢 API Online');
            } else {
                this.updateApiStatus('offline', '🔴 API Offline');
            }
        }, CONFIG.API_CHECK_INTERVAL);
    }

    async refreshApp() {
        try {
            // Animar botón de refresh
            this.refreshBtn.style.animation = 'spin 1s linear infinite';
            
            // Limpiar formulario y resultados
            this.calculator.reset();
            this.quickEstimate.clear();
            this.resultsManager.hideResults();
            
            // Verificar conexión y recargar datos
            const isConnected = await this.checkApiConnection();
            
            if (isConnected) {
                await this.loadInitialData();
                this.updateApiStatus('online', '🟢 API Online');
                Helpers.showSuccess('Datos actualizados correctamente');
            } else {
                this.updateApiStatus('offline', '🔴 API Offline');
                this.showOfflineMessage();
            }
            
        } catch (error) {
            console.error('Error al refrescar:', error);
            Helpers.showError('Error al actualizar datos: ' + error.message);
        } finally {
            // Detener animación
            this.refreshBtn.style.animation = '';
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    
    // Solo mostrar errores críticos al usuario
    if (event.error && !event.error.message.includes('fetch')) {
        Helpers.showError('Error inesperado: ' + event.error.message);
    }
});

// Manejo de promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
    
    // Evitar mostrar errores de red constantes
    if (!event.reason.message.includes('fetch') && !event.reason.message.includes('API no disponible')) {
        Helpers.showError('Error de conexión: ' + event.reason.message);
    }
});