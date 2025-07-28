export class Category {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.icon = data.icon;
      this.description = data.description;
      this.active = data.active;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
    }
  
    static validate(data) {
      const errors = [];
      
      if (!data.id || typeof data.id !== 'string') {
        errors.push('ID es requerido y debe ser string');
      }
      
      if (!data.name || typeof data.name !== 'string') {
        errors.push('Nombre es requerido y debe ser string');
      }
      
      if (!data.icon || typeof data.icon !== 'string') {
        errors.push('Icono es requerido y debe ser string');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        icon: this.icon,
        description: this.description,
        active: this.active,
        created_at: this.created_at,
        updated_at: this.updated_at
      };
    }
  }
  