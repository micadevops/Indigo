// Clase para manejar llamadas a la API
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE;
        this.fallbackURLs = CONFIG.FALLBACK_APIS;
        this.timeout = CONFIG.TIMEOUT;
        this.retryAttempts = CONFIG.RETRY_ATTEMPTS;
        this.currentAPIIndex = 0;
    }

    // Realizar petición HTTP con reintentos
    async makeRequest(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const requestOptions = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        let lastError;
        const allURLs = [this.baseURL, ...this.fallbackURLs];

        for (let urlIndex = 0; urlIndex < allURLs.length; urlIndex++) {
            const currentURL = allURLs[urlIndex];
            
            for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
                try {
                    clearTimeout(timeoutId);
                    const response = await fetch(`${currentURL}${endpoint}`, requestOptions);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    
                    // Si llegamos aquí, la petición fue exitosa
                    this.baseURL = currentURL; // Actualizar URL base exitosa
                    return data;

                } catch (error) {
                    lastError = error;
                    console.warn(`Intento ${attempt + 1} falló para ${currentURL}:`, error.message);
                    
                    // Esperar antes del siguiente intento
                    if (attempt < this.retryAttempts - 1) {
                        await this.delay(1000 * (attempt + 1));
                    }
                }
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        throw new Error(`API no disponible. Último error: ${lastError.message}`);
    }

    // Función de delay para reintentos
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Verificar estado de la API
    async checkHealth() {
        try {
            const response = await this.makeRequest('/health');
            return response.success;
        } catch (error) {
            console.error('API health check falló:', error);
            return false;
        }
    }

    // Obtener categorías
    async getCategories() {
        try {
            // Intentar obtener del cache primero
            const cached = Helpers.getFromCache('categories');
            if (cached && Helpers.isOnline()) {
                return { success: true, data: cached };
            }

            const response = await this.makeRequest('/categories');
            
            if (response.success) {
                Helpers.saveToCache('categories', response.data);
            }
            
            return response;
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            
            // Intentar usar datos del cache como fallback
            const cached = Helpers.getFromCache('categories', Infinity);
            if (cached) {
                Helpers.showError('Usando datos guardados (modo offline)');
                return { success: true, data: cached };
            }
            
            throw error;
        }
    }

    // Obtener productos por categoría
    async getProductsByCategory(categoryId) {
        try {
            const cacheKey = `products_${categoryId}`;
            const cached = Helpers.getFromCache(cacheKey);
            if (cached && Helpers.isOnline()) {
                return { success: true, data: cached };
            }

            const response = await this.makeRequest(`/products/category/${categoryId}`);
            
            if (response.success) {
                Helpers.saveToCache(cacheKey, response.data);
            }
            
            return response;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            
            const cached = Helpers.getFromCache(`products_${categoryId}`, Infinity);
            if (cached) {
                Helpers.showError('Usando datos guardados (modo offline)');
                return { success: true, data: cached };
            }
            
            throw error;
        }
    }

    // Obtener estimación rápida
    async getQuickEstimate(data) {
        try {
            const response = await this.makeRequest('/calculator/estimate', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            return response;
        } catch (error) {
            console.error('Error en estimación rápida:', error);
            
            // Fallback: cálculo básico local
            const estimate = this.calculateBasicEstimate(data);
            Helpers.showError('Usando cálculo básico (API no disponible)');
            
            return {
                success: true,
                data: estimate,
                isOffline: true
            };
        }
    }

    // Obtener cálculo completo
    async getFullCalculation(data) {
        try {
            const response = await this.makeRequest('/calculator/calculate', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            return response;
        } catch (error) {
            console.error('Error en cálculo completo:', error);
            
            // Fallback: cálculo básico local
            const calculation = this.calculateBasicFull(data);
            Helpers.showError('Usando cálculo básico (API no disponible)');
            
            return {
                success: true,
                data: calculation,
                isOffline: true
            };
        }
    }

    // Método simple para reintentar conexión
    async testConnection() {
        const allURLs = [this.baseURL, ...this.fallbackURLs];
        
        for (const url of allURLs) {
            try {
                const response = await fetch(`${url}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.ok) {
                    this.baseURL = url;
                    return true;
                }
            } catch (error) {
                console.warn(`No se pudo conectar a ${url}:`, error.message);
            }
        }
        
        return false;
    }
}

// Instancia global del servicio API
const apiService = new ApiService();