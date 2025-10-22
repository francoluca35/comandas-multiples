"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const BarcodeScanner = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  onScanError,
  title = "Escanear Código de Barra",
  formats = [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E]
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    } else if (!isOpen && isScanning) {
      stopScanning();
    }

    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isOpen]);

  const startScanning = () => {
    if (!scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: formats,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    try {
      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        scannerRef.current.id,
        config,
        false
      );

      html5QrcodeScannerRef.current.render(
        (decodedText, decodedResult) => {
          console.log('✅ Código escaneado:', decodedText);
          setIsScanning(false);
          onScanSuccess?.(decodedText, decodedResult);
        },
        (errorMessage) => {
          // No mostrar errores de parsing como errores críticos
          if (!errorMessage.includes('No MultiFormat Readers')) {
            console.log('⚠️ Error de escaneo:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('❌ Error iniciando scanner:', err);
      setError('Error al iniciar la cámara. Verifica los permisos.');
    }
  };

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
      html5QrcodeScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose?.();
  };

  const handleManualInput = () => {
    const manualCode = prompt('Ingresa el código de barra manualmente:');
    if (manualCode && manualCode.trim()) {
      onScanSuccess?.(manualCode.trim(), { format: 'MANUAL' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
            </svg>
            <span className="text-gray-800 font-bold text-lg">{title}</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Area */}
        <div className="mb-6">
          <div 
            ref={scannerRef}
            id="barcode-scanner"
            className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
          >
            {!isScanning && (
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg font-medium">Iniciando escáner...</p>
                <p className="text-sm">Apunta la cámara al código de barra</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Permite el acceso a la cámara cuando se solicite</li>
            <li>• Apunta la cámara al código de barra</li>
            <li>• Mantén el código centrado y bien iluminado</li>
            <li>• El escáner detectará automáticamente el código</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleManualInput}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Ingreso Manual</span>
          </button>

          <button
            onClick={handleClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
