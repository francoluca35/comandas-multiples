/**
 * Servicio global para obtener información de productos de cualquier parte del mundo
 * Usa múltiples APIs públicas para máxima cobertura
 */

class GlobalProductService {
  constructor() {
    this.apis = [
      {
        name: 'LocalDatabase',
        priority: 1,
        isLocal: true
      },
      {
        name: 'SmartGenerator',
        priority: 2,
        isSmart: true
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
        console.log(`🔍 Intentando con ${api.name}...`);
        const result = await this.searchInAPI(api, barcode);
        if (result && result.success) {
          console.log(`✅ Éxito en ${api.name}`);
          results.push({
            ...result,
            source: api.name,
            priority: api.priority
          });
          // Si encontramos un resultado bueno, no necesitamos seguir buscando
          if (result.metadata?.confiabilidad === 'Alta') {
            break;
          }
        } else {
          console.log(`❌ Sin resultados en ${api.name}`);
        }
      } catch (error) {
        console.warn(`Error en API ${api.name}:`, error.message);
        // Continuar con la siguiente API
      }
    }

    // Ordenar por prioridad y devolver el mejor resultado
    results.sort((a, b) => a.priority - b.priority);
    
    if (results.length > 0) {
      console.log(`✅ Producto encontrado en ${results[0].source}`);
      return results[0];
    }

    console.log('❌ No se encontró en ninguna API');
    return null;
  }

  /**
   * Busca en una API específica
   */
  async searchInAPI(api, barcode) {
    switch (api.name) {
      case 'OpenFoodFacts':
        return await this.searchOpenFoodFacts(barcode);
      case 'UPCItemDB':
        return await this.searchUPCItemDB(barcode);
      case 'MockAPI':
        return await this.searchMockAPI(barcode);
      default:
        return null;
    }
  }

  /**
   * ProductOpenData - API moderna de productos
   */
  async searchProductOpenData(barcode) {
    try {
      console.log(`🔍 Buscando en ProductOpenData: ${barcode}`);
      
      // Usar proxy CORS para evitar problemas de CORS
      const proxyUrl = `${this.apis[0].corsProxy}${encodeURIComponent(`${this.apis[0].baseUrl}/${barcode}`)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`ProductOpenData: HTTP ${response.status}`);
        return { success: false };
      }
      
      const data = await response.json();
      console.log('ProductOpenData response:', data);
      
      if (data && data.name) {
        console.log('✅ Producto encontrado en ProductOpenData:', data.name);
        
        return {
          success: true,
          data: {
            nombre: data.name || data.title || 'Producto encontrado',
            marca: data.brand || data.manufacturer || '',
            categoria: data.category || data.type || '',
            descripcion: data.description || data.summary || '',
            imagen: data.image || data.thumbnail || '',
            codigoBarras: barcode,
            precio: data.price || 0,
            stock: 0,
            proveedor: data.brand || data.manufacturer || '',
            costo: 0,
            modelo: data.model || '',
            dimensiones: data.dimensions || '',
            peso: data.weight || '',
            origen: data.country || data.origin || '',
            etiquetas: data.tags || '',
            especificaciones: data.specifications || {},
            caracteristicas: data.features || []
          },
          metadata: {
            fuente: 'ProductOpenData',
            confiabilidad: 'Alta',
            ultimaActualizacion: data.updated_at || new Date().toISOString(),
            precio: data.price || null,
            rating: data.rating || null
          }
        };
      }
      
      console.log('❌ Producto no encontrado en ProductOpenData');
      return { success: false };
    } catch (error) {
      console.error('Error en ProductOpenData:', error);
      return { success: false, error: error.message };
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
      console.log(`🔍 Buscando en UPCItemDB: ${barcode}`);
      
      const response = await fetch(`${this.apis[1].baseUrl}?upc=${barcode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ComandasApp/1.0'
        }
      });
      
      if (!response.ok) {
        console.warn(`UPCItemDB: HTTP ${response.status}`);
        return { success: false };
      }
      
      const data = await response.json();
      console.log('UPCItemDB response:', data);
      
      if (data.valid && data.items && data.items.length > 0) {
        const item = data.items[0];
        console.log('✅ Producto encontrado en UPCItemDB:', item.title);
        
        return {
          success: true,
          data: {
            nombre: item.title || item.name || 'Producto encontrado',
            marca: item.brand || item.manufacturer || '',
            categoria: item.category || item.category_name || '',
            descripcion: item.description || item.model || '',
            imagen: (item.images && item.images.length > 0) ? item.images[0] : '',
            codigoBarras: barcode,
            precio: item.price || 0,
            stock: 0,
            proveedor: item.brand || item.manufacturer || '',
            costo: 0,
            modelo: item.model || '',
            dimensiones: item.dimensions || '',
            peso: item.weight || ''
          },
          metadata: {
            fuente: 'UPCItemDB',
            confiabilidad: 'Media',
            ultimaActualizacion: new Date().toISOString(),
            precio: item.price || null
          }
        };
      }
      
      console.log('❌ Producto no encontrado en UPCItemDB');
      return { success: false };
    } catch (error) {
      console.error('Error en UPCItemDB:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MockAPI - API de respaldo que siempre funciona
   */
  async searchMockAPI(barcode) {
    try {
      console.log(`🔍 Usando MockAPI para: ${barcode}`);
      
      // Simular una respuesta exitosa
      const mockProduct = {
        nombre: `Producto ${barcode}`,
        marca: 'Marca Desconocida',
        categoria: 'General',
        descripcion: `Producto con código de barras ${barcode}`,
        imagen: '',
        codigoBarras: barcode,
        precio: 0,
        stock: 0,
        proveedor: 'Proveedor Desconocido',
        costo: 0,
        esGenerico: true
      };

      console.log('✅ Producto mock creado:', mockProduct.nombre);
      
      return {
        success: true,
        data: mockProduct,
        metadata: {
          fuente: 'MockAPI',
          confiabilidad: 'Baja',
          ultimaActualizacion: new Date().toISOString(),
          esMock: true
        }
      };
    } catch (error) {
      console.error('Error en MockAPI:', error);
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
      console.log(`✅ Producto encontrado globalmente: ${globalResult.data.nombre}`);
      return globalResult;
    }

    // Si no se encuentra, crear producto genérico
    console.log(`⚠️ Producto no encontrado en bases de datos globales, creando genérico`);
    return this.createGenericProduct(barcode);
  }

  /**
   * Función de prueba para verificar APIs
   */
  async testAPIs() {
    const testBarcodes = [
      '3017620422003', // Nutella
      '7613034625034', // Coca Cola
      '8710398000000'  // Producto genérico
    ];

    console.log('🧪 Probando APIs con códigos de prueba...');
    
    for (const barcode of testBarcodes) {
      console.log(`\n🔍 Probando código: ${barcode}`);
      const result = await this.getProductInfo(barcode);
      console.log('Resultado:', result?.data?.nombre || 'No encontrado');
    }
  }
}

// Instancia singleton
const globalProductService = new GlobalProductService();

export default globalProductService;
