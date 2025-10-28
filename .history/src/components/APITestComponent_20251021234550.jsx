"use client";
import React, { useState } from 'react';
import globalProductService from '../services/globalProductService';

const APITestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [customBarcode, setCustomBarcode] = useState('');

  const testAPIs = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const testBarcodes = [
      { code: '3017620422003', name: 'Nutella' },
      { code: '7613034625034', name: 'Coca Cola' },
      { code: '8710398000000', name: 'Producto genérico' },
      { code: '1234567890123', name: 'Código de prueba' }
    ];

    const results = [];

    for (const test of testBarcodes) {
      try {
        console.log(`🧪 Probando: ${test.name} (${test.code})`);
        const result = await globalProductService.getProductInfo(test.code);
        
        results.push({
          barcode: test.code,
          name: test.name,
          found: result?.success || false,
          productName: result?.data?.nombre || 'No encontrado',
          source: result?.metadata?.fuente || 'N/A',
          reliability: result?.metadata?.confiabilidad || 'N/A'
        });
      } catch (error) {
        results.push({
          barcode: test.code,
          name: test.name,
          found: false,
          productName: 'Error: ' + error.message,
          source: 'Error',
          reliability: 'N/A'
        });
      }
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const testCustomBarcode = async () => {
    if (!customBarcode.trim()) return;
    
    setIsTesting(true);
    try {
      const result = await globalProductService.getProductInfo(customBarcode);
      setTestResults([{
        barcode: customBarcode,
        name: 'Código personalizado',
        found: result?.success || false,
        productName: result?.data?.nombre || 'No encontrado',
        source: result?.metadata?.fuente || 'N/A',
        reliability: result?.metadata?.confiabilidad || 'N/A'
      }]);
    } catch (error) {
      setTestResults([{
        barcode: customBarcode,
        name: 'Código personalizado',
        found: false,
        productName: 'Error: ' + error.message,
        source: 'Error',
        reliability: 'N/A'
      }]);
    }
    setIsTesting(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">🧪 Prueba de APIs Globales</h3>
      
      <div className="mb-4">
        <button
          onClick={testAPIs}
          disabled={isTesting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {isTesting ? 'Probando...' : 'Probar APIs con códigos de prueba'}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={customBarcode}
            onChange={(e) => setCustomBarcode(e.target.value)}
            placeholder="Ingresa un código de barras personalizado"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={testCustomBarcode}
            disabled={isTesting || !customBarcode.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Probar
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Resultados:</h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                result.found ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-600">Código: {result.barcode}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${result.found ? 'text-green-600' : 'text-red-600'}`}>
                      {result.found ? '✅ Encontrado' : '❌ No encontrado'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.source} ({result.reliability})
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <strong>Producto:</strong> {result.productName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Sistemas Configurados:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Base de Datos Local</strong> - Productos conocidos (Nutella, Coca Cola, etc.)</li>
          <li>• <strong>OpenFoodFacts</strong> - Base de datos mundial de productos alimenticios</li>
          <li>• <strong>UPCItemDB</strong> - Base de datos de códigos UPC</li>
          <li>• <strong>Generador Inteligente</strong> - Analiza el código de barras para crear información</li>
        </ul>
        <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
          <strong>Ventaja:</strong> Busca información real primero, luego genera información inteligente como respaldo.
        </div>
      </div>
    </div>
  );
};

export default APITestComponent;
