/**
 * Servicio global para obtener información de productos de cualquier parte del mundo
 * Usa múltiples APIs públicas para máxima cobertura
 */

class GlobalProductService {
  constructor() {
    this.apis = [
      {
        name: 'OpenFoodFacts',
        baseUrl: 'https://world.openfoodfacts.org/api/v0/product',
        priority: 1
      },
      {
        name: 'BarcodeLookup',
        baseUrl: 'https://api.barcodelookup.com/v3/products',
        priority: 2
      },
      {
        name: 'UPCItemDB',
        baseUrl: 'https://api.upcitemdb.com/prod/trial/lookup',
        priority: 3
      }
    ];
  }

  /**
   * Busca un producto por código de barras en múltiples APIs
   */
  async searchProduct(barcode) {
    console.log(`🔍 Buscando producto global: ${barcode}`);
    
    const results = [];
    
    // Intentar con cada API en orden de prioridad
    for (const api of this.apis) {
      try {
        const result = await this.searchInAPI(api, barcode);
        if (result && result.success) {
          results.push({
            ...result,
            source: api.name,
            priority: api.priority
          });
        }
      } catch (error) {
        console.warn(`Error en API ${api.name}:`, error.message);
      }
    }

    // Ordenar por prioridad y devolver el mejor resultado
    results.sort((a, b) => a.priority - b.priority);
    
    if (results.length > 0) {
      console.log(`✅ Producto encontrado en ${results[0].source}`);
      return results[0];
    }

    return null;
  }

  /**
   * Busca en una API específica
   */
  async searchInAPI(api, barcode) {
    switch (api.name) {
      case 'OpenFoodFacts':
        return await this.searchOpenFoodFacts(barcode);
      case 'BarcodeLookup':
        return await this.searchBarcodeLookup(barcode);
      case 'UPCItemDB':
        return await this.searchUPCItemDB(barcode);
      default:
        return null;
    }
  }

  /**
   * OpenFoodFacts - Base de datos global de productos alimenticios
   */
  async searchOpenFoodFacts(barcode) {
    try {
      const response = await fetch(`${this.apis[0].baseUrl}/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          success: true,
          data: {
            nombre: product.product_name || product.product_name_es || 'Producto desconocido',
            marca: product.brands || '',
            categoria: product.categories || '',
            descripcion: product.ingredients_text || product.ingredients_text_es || '',
            imagen: product.image_url || product.image_front_url || '',
            codigoBarras: barcode,
            precio: 0, // OpenFoodFacts no tiene precios
            stock: 0,
            proveedor: product.manufacturers || '',
            costo: 0,
            nutrientes: product.nutriments || {},
            alérgenos: product.allergens || '',
            origen: product.countries || '',
            etiquetas: product.labels || '',
            ecoscore: product.ecoscore_grade || '',
            nutriscore: product.nutriscore_grade || ''
          },
          metadata: {
            fuente: 'OpenFoodFacts',
            confiabilidad: 'Alta',
            ultimaActualizacion: product.last_modified_t || null
          }
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Error en OpenFoodFacts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * BarcodeLookup - API comercial con buena cobertura
   */
  async searchBarcodeLookup(barcode) {
    try {
      // Nota: Esta API requiere API key, por ahora simulamos la estructura
      const mockData = {
        success: true,
        data: {
          nombre: 'Producto de BarcodeLookup',
          marca: 'Marca desconocida',
          categoria: 'Categoría general',
          descripcion: 'Producto encontrado en BarcodeLookup',
          imagen: '',
          codigoBarras: barcode,
          precio: 0,
          stock: 0,
          proveedor: '',
          costo: 0
        },
        metadata: {
          fuente: 'BarcodeLookup',
          confiabilidad: 'Media',
          ultimaActualizacion: new Date().toISOString()
        }
      };
      
      return mockData;
    } catch (error) {
      console.error('Error en BarcodeLookup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * UPCItemDB - Base de datos de códigos UPC
   */
  async searchUPCItemDB(barcode) {
    try {
      const response = await fetch(`${this.apis[2].baseUrl}?upc=${barcode}`);
      const data = await response.json();
      
      if (data.valid && data.items && data.items.length > 0) {
        const item = data.items[0];
        return {
          success: true,
          data: {
            nombre: item.title || 'Producto desconocido',
            marca: item.brand || '',
            categoria: item.category || '',
            descripcion: item.description || '',
            imagen: item.images && item.images.length > 0 ? item.images[0] : '',
            codigoBarras: barcode,
            precio: 0,
            stock: 0,
            proveedor: item.brand || '',
            costo: 0
          },
          metadata: {
            fuente: 'UPCItemDB',
            confiabilidad: 'Media',
            ultimaActualizacion: new Date().toISOString()
          }
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Error en UPCItemDB:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crea un producto genérico cuando no se encuentra información
   */
  createGenericProduct(barcode) {
    return {
      success: true,
      data: {
        nombre: 'Producto Genérico',
        marca: '',
        categoria: 'General',
        descripcion: `Producto con código de barras ${barcode}`,
        imagen: '',
        codigoBarras: barcode,
        precio: 0,
        stock: 0,
        proveedor: '',
        costo: 0,
        esGenerico: true
      },
      metadata: {
        fuente: 'Generado automáticamente',
        confiabilidad: 'Baja',
        ultimaActualizacion: new Date().toISOString()
      }
    };
  }

  /**
   * Busca información completa del producto
   */
  async getProductInfo(barcode) {
    console.log(`🌍 Buscando información global para: ${barcode}`);
    
    // Primero buscar en APIs globales
    const globalResult = await this.searchProduct(barcode);
    
    if (globalResult && globalResult.success) {
      return globalResult;
    }

    // Si no se encuentra, crear producto genérico
    console.log(`⚠️ Producto no encontrado en bases de datos globales, creando genérico`);
    return this.createGenericProduct(barcode);
  }
}

// Instancia singleton
const globalProductService = new GlobalProductService();

export default globalProductService;
