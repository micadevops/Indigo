// Componente para manejar la calculadora principal
class Calculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.categories = [];
        this.products = [];
    }

    initializeElements() {
        this.categorySelect = document.getElementById('category');
        this.productSelect = document.getElementById('product');
        this.weightInput = document.getElementById('weight');
        this.quantityInput = document.getElementById('quantity');
        this.profitInput = document.getElementById('profit');
        this.calculateBtn = document.getElementById('calculateBtn');
    }

    bindEvents() {
        this.categorySelect.addEventListener('change', (e) => this.onCategoryChange(e));
        this.productSelect.addEventListener('change', (e) => this.onProductChange(e));
        this.weightInput.addEventListener('input', () => this.onInputChange());
        this.quantityInput.addEventListener('input', () => this.onInputChange());
        this.profitInput.addEventListener('input', () => this.onInputChange());
        this.calculateBtn.addEventListener('click', () => this.calculateFullCost());
    }

    async onCategoryChange(e) {
        const categoryId = e.target.value;
        
        if (categoryId) {
            try {
                this.productSelect.innerHTML = '<option value="">Cargando productos...</option>';
                this.productSelect.disabled = true;
                
                const response = await apiService.getProductsByCategory(categoryId);
                
                if (response.success) {
                    this.products = response.data;
                    this.populateProducts();
                } else {
                    throw new Error(response.error || 'Error al cargar productos');
                }
                
            } catch (error) {
                Helpers.showError('Error al cargar productos: ' + error.message);
                this.productSelect.innerHTML = '<option value="">Error al cargar</option>';
            }
        } else {
            this.productSelect.innerHTML = '<option value="">Primero selecciona una categoría</option>';
            this.productSelect.disabled = true;
        }
        
        this.updateButtonStates();
        Helpers.clearResults();
    }

    populateProducts() {
        this.productSelect.innerHTML = '<option value="">Selecciona un producto...</option>';
        
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            option.dataset.suggestedWeight = product.suggested_weight || '';
            this.productSelect.appendChild(option);
        });
        
        this.productSelect.disabled = false;
    }

    onProductChange(e) {
        const productId = e.target.value;
        
        if (productId) {
            const selectedOption = e.target.selectedOptions[0];
            const suggestedWeight = selectedOption.dataset.suggestedWeight;
            
            // Auto-llenar peso sugerido si está disponible
            if (suggestedWeight && !this.weightInput.value) {
                this.weightInput.value = suggestedWeight;
                this.weightInput.classList.add('animate-pulse');
                setTimeout(() => this.weightInput.classList.remove('animate-pulse'), 1000);
            }
        }
        
        this.updateButtonStates();
        Helpers.clearResults();
    }

    onInputChange() {
        this.updateButtonStates();
        
        // Limpiar resultados cuando cambian los inputs
        if (this.weightInput.value || this.quantityInput.value || this.profitInput.value) {
            Helpers.clearResults();
        }
    }

    updateButtonStates() {
        Helpers.updateButtonStates();
    }

    async calculateFullCost() {
        const formData = Helpers.getFormData();
        const validationErrors = Helpers.validateFormData(formData);

        if (validationErrors.length > 0) {
            Helpers.showError(validationErrors.join(', '));
            return;
        }

        try {
            // Mostrar loading y deshabilitar botón
            Helpers.showLoading(true);
            this.calculateBtn.classList.add('loading');
            this.calculateBtn.disabled = true;
            
            const response = await apiService.getFullCalculation(formData);
            
            if (response.success) {
                this.showResults(response.data);
                Helpers.showSuccess('¡Cálculo realizado exitosamente!');
                
                if (response.isOffline) {
                    Helpers.showError('Resultado calculado en modo offline');
                }
            } else {
                throw new Error(response.error || 'Error en el cálculo');
            }
            
        } catch (error) {
            Helpers.showError('Error al calcular: ' + error.message);
        } finally {
            Helpers.showLoading(false);
            this.calculateBtn.classList.remove('loading');
            this.calculateBtn.disabled = false;
        }
    }

    showResults(data) {
        // Delegar a ResultsManager
        if (window.resultsManager) {
            window.resultsManager.displayResults(data);
        }
    }

    async loadCategories() {
        try {
            const response = await apiService.getCategories();
            
            if (response.success) {
                this.categories = response.data;
                this.populateCategories();
            } else {
                throw new Error(response.error || 'Error al cargar categorías');
            }
            
        } catch (error) {
            Helpers.showError('Error al cargar categorías: ' + error.message);
            console.error('Error detallado:', error);
        }
    }

    populateCategories() {
        this.categorySelect.innerHTML = '<option value="">Selecciona una categoría...</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon || '📦'} ${category.name}`;
            this.categorySelect.appendChild(option);
        });
    }

    // Método para reinicializar el formulario
    reset() {
        this.categorySelect.value = '';
        this.productSelect.innerHTML = '<option value="">Primero selecciona una categoría</option>';
        this.productSelect.disabled = true;
        this.weightInput.value = '';
        this.quantityInput.value = '1';
        this.profitInput.value = '50';
        
        Helpers.clearResults();
        this.updateButtonStates();
    }
}