import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Material } from '../models/Material.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MaterialService {
  static dataPath = path.join(__dirname, '../data/materials.json');

  static async getAll() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const { materials } = JSON.parse(data);
      return materials
        .filter(material => material.active)
        .map(material => new Material(material));
    } catch (error) {
      console.error('Error reading materials:', error);
      throw new Error('No se pudieron cargar los materiales');
    }
  }

  static async getByCategory(categoryId) {
    const materials = await this.getAll();
    return materials.filter(material => material.category_id === categoryId);
  }

  static async getById(id) {
    const materials = await this.getAll();
    const material = materials.find(m => m.id === id);
    if (!material) {
      throw new Error(`Material con ID ${id} no encontrado`);
    }
    return material;
  }
}
