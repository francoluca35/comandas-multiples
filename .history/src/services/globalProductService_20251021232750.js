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
      console.log(`🔍 Buscando en OpenFoodFacts: ${barcode}`);
      const response = await fetch(`${this.apis[0].baseUrl}/${barcode}.json`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ComandasApp/1.0'
        }
      });
      
      if (!response.ok) {
        console.warn(`OpenFoodFacts: HTTP ${response.status}`);
        return { success: false };
      }
      
      const data = await response.json();
      console.log('OpenFoodFacts response:', data);
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        console.log('✅ Producto encontrado en OpenFoodFacts:', product.product_name);
        
        return {
          success: true,
          data: {
            nombre: product.product_name || product.product_name_es || product.product_name_en || 'Producto encontrado',
            marca: product.brands || product.brand || '',
            categoria: product.categories || product.category || '',
            descripcion: product.ingredients_text || product.ingredients_text_es || product.ingredients_text_en || product.generic_name || '',
            imagen: product.image_url || product.image_front_url || product.image_front_small_url || '',
            codigoBarras: barcode,
            precio: 0, // OpenFoodFacts no tiene precios
            stock: 0,
            proveedor: product.manufacturers || product.manufacturing_places || '',
            costo: 0,
            nutrientes: product.nutriments || {},
            alérgenos: product.allergens || product.allergens_tags || '',
            origen: product.countries || product.countries_tags || '',
            etiquetas: product.labels || product.labels_tags || '',
            ecoscore: product.ecoscore_grade || '',
            nutriscore: product.nutriscore_grade || '',
            cantidad: product.quantity || '',
            envase: product.packaging || '',
            conservacion: product.conservation_conditions || ''
          },
          metadata: {
            fuente: 'OpenFoodFacts',
            confiabilidad: 'Alta',
            ultimaActualizacion: product.last_modified_t || null,
            completitud: product.completeness || 0
          }
        };
      }
      
      console.log('❌ Producto no encontrado en OpenFoodFacts');
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
