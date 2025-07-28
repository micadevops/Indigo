  
  // ===== models/CalculationRule.js =====
  export class CalculationRule {
    constructor(data) {
      this.id = data.id;
      this.category_id = data.category_id;
      this.material_id = data.material_id;
      this.calculation_type = data.calculation_type;
      this.parameters = data.parameters;
      this.description = data.description;
      this.active = data.active;
    }
  
    static CALCULATION_TYPES = {
      PERCENTAGE_WEIGHT: 'percentage_weight',
      FIXED_QUANTITY: 'fixed_quantity',
      VARIABLE_BY_PRODUCT: 'variable_by_product'
    };
  
    toJSON() {
      return {
        id: this.id,
        category_id: this.category_id,
        material_id: this.material_id,
        calculation_type: this.calculation_type,
        parameters: this.parameters,
        description: this.description,
        active: this.active
      };
    }
  }