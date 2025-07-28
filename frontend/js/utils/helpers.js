// Funciones de utilidad
class Helpers {
    
    // Mostrar mensaje de error
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error animate-slideIn';
        errorDiv.innerHTML = `<strong>❌ Error:</strong> ${message}`;
        
        const container = document.querySelector('.container');
        container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 5000);
    }

    // Mostrar mensaje de éxito
    static showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success animate-slideIn';
        successDiv.innerHTML = `<strong>✅ Éxito:</strong> ${message}`;
        
        const container = document.querySelector('.container');
        container.insertBefore(successDiv, container.firstChild);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => successDiv.remove(), 300);
            }
        }, 3000);
    }

    // Mostrar/ocultar loading
    static showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }

    // Formatear precio
    static formatPrice(price) {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU',
            minimumFractionDigits: 2
        }).format(price);
    }

    // Formatear número
    static formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('es-UY', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    // Validar input numérico
    static validateNumericInput(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Actualizar estado de botones
    static updateButtonStates() {
        const categorySelect = document.getElementById('category');
        const productSelect = document.getElementById('product');
        const weightInput = document.getElementById('weight');
        const calculateBtn = document.getElementById('calculateBtn');
        const estimateBtn = document.getElementById('estimateBtn');

        const hasBasicData = categorySelect.value && 
                           productSelect.value && 
                           weightInput.value && 
                           this.validateNumericInput(weightInput.value, 0.1);

        calculateBtn.disabled = !hasBasicData;
        estimateBtn.disabled = !hasBasicData;

        // Agregar clases visuales
        if (hasBasicData) {
            calculateBtn.classList.add('animate-pulse');
            estimateBtn.classList.add('animate-pulse');
        } else {
            calculateBtn.classList.remove('animate-pulse');
            estimateBtn.classList.remove('animate-pulse');
        }
    }

    // Limpiar resultados
    static clearResults() {
        const results = document.getElementById('results');
        const quickEstimate = document.getElementById('quickEstimate');
        const marginComparison = document.getElementById('marginComparison');

        results.classList.add('hidden');
        quickEstimate.classList.remove('show');
        quickEstimate.innerHTML = '💰 Precio estimado: $0.00';
        marginComparison.innerHTML = '';
    }

    // Animar elemento
    static animateElement(element, animationClass, duration = 300) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    // Obtener datos del formulario
    static getFormData() {
        return {
            category_id: document.getElementById('category').value,
            product_id: document.getElementById('product').value,
            weight: parseFloat(document.getElementById('weight').value) || 0,
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            profit_margin: parseFloat(document.getElementById('profit').value) || 50
        };
    }

    // Validar datos del formulario
    static validateFormData(data) {
        const errors = [];

        if (!data.category_id) {
            errors.push('Debe seleccionar una categoría');
        }

        if (!data.product_id) {
            errors.push('Debe seleccionar un producto');
        }

        if (!data.weight || data.weight <= 0) {
            errors.push('El peso debe ser mayor a 0');
        }

        if (!data.quantity || data.quantity <= 0) {
            errors.push('La cantidad debe ser mayor a 0');
        }

        if (data.profit_margin < 0) {
            errors.push('El margen de ganancia no puede ser negativo');
        }

        return errors;
    }

    // Detectar si está en modo offline
    static isOnline() {
        return navigator.onLine;
    }

    // Guardar en localStorage (para cache básico)
    static saveToCache(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('No se pudo guardar en cache:', error);
        }
    }

    // Obtener del localStorage
    static getFromCache(key, maxAge = 5 * 60 * 1000) { // 5 minutos por defecto
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < maxAge) {
                    return parsed.data;
                }
            }
        } catch (error) {
            console.warn('No se pudo leer del cache:', error);
        }
        return null;
    }

    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Copiado al portapapeles');
        } catch (error) {
            console.error('Error al copiar:', error);
            this.showError('No se pudo copiar al portapapeles');
        }
    }
}