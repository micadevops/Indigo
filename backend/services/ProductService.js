import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductService {
  static dataPath = path.join(__dirname, '../data/products.json');

  static async getAll() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const { products } = JSON.parse(data);
      return products
        .filter(product => product.active)
        .map(product => new Product(product));
    } catch (error) {
      console.error('Error reading products:', error);
      throw new Error('No se pudieron cargar los productos');
    }
  }

  static async getByCategory(categoryId) {
    const products = await this.getAll();
    return products.filter(product => product.category_id === categoryId);
  }

  static async getById(id) {
    const products = await this.getAll();
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  static async create(productData) {
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    const data = await fs.readFile(this.dataPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    const exists = jsonData.products.find(p => p.id === productData.id);
    if (exists) {
      throw new Error(`Producto con ID ${productData.id} ya existe`);
    }

    const newProduct = new Product({
      ...productData,
      active: true,
      created_at: new Date().toISOString()
    });

    jsonData.products.push(newProduct.toJSON());
    await fs.writeFile(this.dataPath, JSON.stringify(jsonData, null, 2));
    
    return newProduct;
  }
}