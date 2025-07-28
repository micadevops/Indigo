// Componente para estimación rápida
class QuickEstimate {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.estimateTimeout = null;
    }

    initializeElements() {
        this.estimateBtn = document.getElementById('estimateBtn');
        this.quickEstimate = document.getElementById('quickEstimate');
        this.marginComparison = document.getElementById('marginComparison');
        this.weightInput = document.getElementById('weight');
        this.profitInput = document.getElementById('profit');
    }

    bindEvents() {
        this.estimateBtn.addEventListener('click', () => this.getQuickEstimate());
        
        // Auto-estimación mientras el usuario escribe
        this.weightInput.addEventListener('input', () => this.scheduleAutoEstimate());
        this.profitInput.addEventListener('input', () => this.scheduleAutoEstimate());
    }

    scheduleAutoEstimate() {
        // Cancelar estimación anterior
        if (this.estimateTimeout) {
            clearTimeout(this.estimateTimeout);
        }
        
        // Programar nueva estimación después de un delay
        this.estimateTimeout = setTimeout(() => {
            this.getQuickEstimate(true); // true = modo silencioso
        }, CONFIG.ESTIMATE_DELAY);
    }

    async getQuickEstimate(silent = false) {
        const formData = Helpers.getFormData();
        
        // Validar solo los campos necesarios para estimación
        if (!formData.category_id || !formData.product_id || !formData.weight) {
            if (!silent) {
                Helpers.showError('Completa categoría, producto y peso para obtener una estimación');
            }
            return;
        }

        if (!Helpers.validateNumericInput(formData.weight, 0.1)) {
            if (!silent) {
                Helpers.showError('El peso debe ser un número mayor a 0.1');
            }
            return;
        }

        try {
            if (!silent) {
                this.estimateBtn.classList.add('loading');
                this.estimateBtn.disabled = true;
            }

            const response = await apiService.getQuickEstimate(formData);
            
            if (response.success) {
                this.displayEstimate(response.data);
                
                // Mostrar comparación de márgenes solo si no es modo silencioso
                if (!silent) {
                    await this.showMarginComparison(formData);
                }
                
                if (response.isOffline && !silent) {
                    Helpers.showError('Estimación calculada en modo offline');
                }
            } else {
                throw new Error(response.error || 'Error en la estimación');
            }
            
        } catch (error) {
            if (!silent) {
                Helpers.showError('Error al obtener estimación: ' + error.message);
            }
            console.error('Error en estimación:', error);
        } finally {
            if (!silent) {
                this.estimateBtn.classList.remove('loading');
                this.estimateBtn.disabled = false;
            }
        }
    }

    displayEstimate(data) {
        const price = data.sale_price || '0.00';
        this.quickEstimate.innerHTML = `💰 Precio estimado: <strong>$${price}</strong>`;
        this.quickEstimate.classList.add('show');
        
        // Pequeña animación
        Helpers.animateElement(this.quickEstimate, 'animate-pulse', 500);
    }

    async showMarginComparison(baseData) {
        const margins = [30, 40, 50, 60, 70];
        let html = '<div style="display: Grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px;">';
        
        const promises = margins.map(async (margin) => {
            try {
                const data = { ...baseData, profit_margin: margin };
                const response = await apiService.getQuickEstimate(data);
                
                if (response.success) {
                    const isCurrentMargin = margin === baseData.profit_margin;
                    const extraClass = isCurrentMargin ? 'style="border: 2px solid #667eea;"' : '';
                    
                    return `
                        <div ${extraClass} style="background: #f8f9fa; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #dee2e6; transition: all 0.3s ease; cursor: pointer;" 
                             onmouseover="this.style.transform='scale(1.05)'" 
                             onmouseout="this.style.transform='scale(1)'"
                             onclick="document.getElementById('profit').value=${margin}; document.getElementById('profit').dispatchEvent(new Event('input'));">
                            <div style="font-size: 0.9em; color: #666;">${margin}%</div>
                            <div style="font-weight: bold; color: #333;">$${response.data.sale_price}</div>
                        </div>
                    `;
                }
            } catch (error) {
                console.warn(`Error calculando margen ${margin}%:`, error);
                return `
                    <div style="background: #f8d7da; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #f5c6cb;">
                        <div style="font-size: 0.9em; color: #721c24;">${margin}%</div>
                        <div style="font-size: 0.8em; color: #721c24;">Error</div>
                    </div>
                `;
            }
        });

        try {
            const results = await Promise.all(promises);
            html += results.join('');
            html += '</div>';
            
            this.marginComparison.innerHTML = html;
            this.marginComparison.style.animation = 'slideIn 0.5s ease';
        } catch (error) {
            console.error('Error en comparación de márgenes:', error);
            this.marginComparison.innerHTML = '<p style="color: #666; text-align: center;">No se pudo cargar la comparación</p>';
        }
    }

    // Limpiar estimación
    clear() {
        this.quickEstimate.classList.remove('show');
        this.quickEstimate.innerHTML = '💰 Precio estimado: $0.00';
        this.marginComparison.innerHTML = '';
        
        if (this.estimateTimeout) {
            clearTimeout(this.estimateTimeout);
        }
    }

    // Copiar estimación al portapapeles
    async copyEstimate() {
        const estimateText = this.quickEstimate.textContent;
        if (estimateText && estimateText !== '💰 Precio estimado: $0.00') {
            await Helpers.copyToClipboard(estimateText);
        }
    }
}