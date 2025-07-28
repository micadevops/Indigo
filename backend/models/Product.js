export class Product {
    constructor(data) {
      this.id = data.id;
      this.category_id = data.category_id;
      this.name = data.name;
      this.description = data.description;
      this.suggested_weight = data.suggested_weight;
      this.unit = data.unit;
      this.materials = data.materials || [];
      this.active = data.active;
      this.created_at = data.created_at;
    }
  
    static validate(data) {
      const errors = [];
      
      if (!data.id || typeof data.id !== 'string') {
        errors.push('ID es requerido y debe ser string');
      }
      
      if (!data.category_id || typeof data.category_id !== 'string') {
        errors.push('Category_id es requerido y debe ser string');
      }
      
      if (!data.name || typeof data.name !== 'string') {
        errors.push('Nombre es requerido y debe ser string');
      }
      
      if (!data.suggested_weight || typeof data.suggested_weight !== 'number') {
        errors.push('Peso sugerido es requerido y debe ser número');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    toJSON() {
      return {
        id: this.id,
        category_id: this.category_id,
        name: this.name,
        description: this.description,
        suggested_weight: this.suggested_weight,
        unit: this.unit,
        materials: this.materials,
        active: this.active,
        created_at: this.created_at
      };
    }
  }