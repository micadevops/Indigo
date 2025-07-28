import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Category } from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CategoryService {
  static dataPath = path.join(__dirname, '../data/categories.json');

  static async getAll() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const { categories } = JSON.parse(data);
      return categories
        .filter(cat => cat.active)
        .map(cat => new Category(cat));
    } catch (error) {
      console.error('Error reading categories:', error);
      throw new Error('No se pudieron cargar las categorías');
    }
  }

  static async getById(id) {
    const categories = await this.getAll();
    const category = categories.find(cat => cat.id === id);
    if (!category) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  static async create(categoryData) {
    const validation = Category.validate(categoryData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    const data = await fs.readFile(this.dataPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Check if category already exists
    const exists = jsonData.categories.find(cat => cat.id === categoryData.id);
    if (exists) {
      throw new Error(`Categoría con ID ${categoryData.id} ya existe`);
    }

    const newCategory = new Category({
      ...categoryData,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    jsonData.categories.push(newCategory.toJSON());
    await fs.writeFile(this.dataPath, JSON.stringify(jsonData, null, 2));
    
    return newCategory;
  }
}
