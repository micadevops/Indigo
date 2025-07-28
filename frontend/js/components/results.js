// Componente para mostrar resultados del cálculo completo
class ResultsManager {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        this.results = document.getElementById('results');
        this.costSummary = document.getElementById('costSummary');
        this.breakdownBody = document.getElementById('breakdownBody');
    }

    displayResults(data) {
        this.showCostSummary(data.costs);
        this.showBreakdown(data.breakdown);
        this.showResultsSection();
    }

    showCostSummary(costs) {
        this.costSummary.innerHTML = `
            <div class="cost-item hover-lift">
                <div class="cost-label">Costo Unitario</div>
                <div class="cost-value">${Helpers.formatPrice(costs.unit_cost)}</div>
            </div>
            <div class="cost-item hover-lift">
                <div class="cost-label">Precio de Venta</div>
                <div class="cost-value highlight">${Helpers.formatPrice(costs.sale_price_per_unit)}</div>
            </div>
            <div class="cost-item hover-lift">
                <div class="cost-label">Ganancia por Unidad</div>
                <div class="cost-value">${Helpers.formatPrice(costs.profit_per_unit)}</div>
            </div>
            <div class="cost-item hover-lift">
                <div class="cost-label">Costo Total</div>
                <div class="cost-value">${Helpers.formatPrice(costs.total_cost)}</div>
            </div>
            <div class="cost-item hover-lift">
                <div class="cost-label">Precio Total</div>
                <div class="cost-value highlight">${Helpers.formatPrice(costs.total_sale_price)}</div>
            </div>
            <div class="cost-item hover-lift">
                <div class="cost-label">Ganancia Total</div>
                <div class="cost-value">${Helpers.formatPrice(costs.total_profit)}</div>
            </div>
        `;

        // Agregar eventos de click para copiar valores
        this.costSummary.querySelectorAll('.cost-item').forEach((item, index) => {
            item.style.cursor = 'pointer';
            item.title = 'Click para copiar';
            item.addEventListener('click', () => {
                const value = item.querySelector('.cost-value').textContent;
                Helpers.copyToClipboard(value);
            });
        });
    }

    showBreakdown(breakdown) {
        this.breakdownBody.innerHTML = '';
        
        if (!breakdown || breakdown.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; color: #666; font-style: italic;">
                    No hay desglose disponible
                </td>
            `;
            this.breakdownBody.appendChild(row);
            return;
        }

        breakdown.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'animate-fadeIn';
            row.style.animationDelay = `${index * 0.1}s`;
            
            row.innerHTML = `
                <td><strong>${item.material_name || 'Material'}</strong></td>
                <td>${item.description || '-'}</td>
                <td>${Helpers.formatNumber(item.quantity_used || 0)} ${item.unit || 'unidad'}</td>
                <td>${Helpers.formatPrice(item.unit_cost || 0)}</td>
                <td><strong>${Helpers.formatPrice(item.total_cost || 0)}</strong></td>
            `;
            
            // Agregar efecto hover mejorado
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'scale(1.02)';
                row.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.transform = 'scale(1)';
                row.style.boxShadow = 'none';
            });
            
            this.breakdownBody.appendChild(row);
        });
    }

    showResultsSection() {
        this.results.classList.remove('hidden');
        this.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Agregar animación de entrada
        this.results.style.animation = 'slideUp 0.5s ease forwards';
    }

    hideResults() {
        this.results.classList.add('hidden');
    }

    // Exportar resultados como texto
    exportAsText(data) {
        let text = '=== CALCULADORA DE COSTOS ===\n\n';
        text += '--- RESUMEN DE COSTOS ---\n';
        text += `Costo Unitario: ${Helpers.formatPrice(data.costs.unit_cost)}\n`;
        text += `Precio de Venta: ${Helpers.formatPrice(data.costs.sale_price_per_unit)}\n`;
        text += `Ganancia por Unidad: ${Helpers.formatPrice(data.costs.profit_per_unit)}\n`;
        text += `Costo Total: ${Helpers.formatPrice(data.costs.total_cost)}\n`;
        text += `Precio Total: ${Helpers.formatPrice(data.costs.total_sale_price)}\n`;
        text += `Ganancia Total: ${Helpers.formatPrice(data.costs.total_profit)}\n\n`;
        
        text += '--- DESGLOSE POR MATERIAL ---\n';
        data.breakdown.forEach(item => {
            text += `${item.material_name}: ${item.quantity_used} ${item.unit} × ${Helpers.formatPrice(item.unit_cost)} = ${Helpers.formatPrice(item.total_cost)}\n`;
        });
        
        text += `\nGenerado el: ${new Date().toLocaleString('es-UY')}`;
        
        return text;
    }

    // Copiar todos los resultados
    async copyAllResults(data) {
        const text = this.exportAsText(data);
        await Helpers.copyToClipboard(text);
    }

    // Generar PDF simple (usando ventana de impresión)
    printResults() {
        const printWindow = window.open('', '_blank');
        const resultsHTML = this.results.innerHTML;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Calculadora de Costos - Resultados</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .cost-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
                        .cost-item { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
                        .cost-label { font-size: 0.9em; color: #666; margin-bottom: 5px; }
                        .cost-value { font-size: 1.2em; font-weight: bold; }
                        .cost-value.highlight { color: #28a745; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f8f9fa; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <h1>📊 Resultados del Cálculo de Costos</h1>
                    ${resultsHTML}
                    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                        Generado el: ${new Date().toLocaleString('es-UY')}
                    </p>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}