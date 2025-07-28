export class Material {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.category_id = data.category_id;
      this.unit = data.unit;
      this.cost_per_unit = data.cost_per_unit;
      this.supplier = data.supplier;
      this.description = data.description;
      this.variable_cost = data.variable_cost || false;
      this.cost_by_product = data.cost_by_product || {};
      this.active = data.active;
      this.last_updated = data.last_updated;
    }
  
    getCostForProduct(productId) {
      if (this.variable_cost && this.cost_by_product[productId]) {
        return this.cost_by_product[productId];
      }
      return this.cost_per_unit;
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        category_id: this.category_id,
        unit: this.unit,
        cost_per_unit: this.cost_per_unit,
        supplier: this.supplier,
        description: this.description,
        variable_cost: this.variable_cost,
        cost_by_product: this.cost_by_product,
        active: this.active,
        last_updated: this.last_updated
      };
    }
  }
