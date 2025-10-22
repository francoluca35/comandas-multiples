"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Escáner de códigos de barras nativo usando la API del navegador
 * Sin librerías externas problemáticas
 */
const NativeBarcodeScanner = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  onScanError,
  title = "Escanear Código de Barra"
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);

  // Verificar soporte para detección de códigos de barras
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      setIsSupported(true);
    } else {
      console.warn('BarcodeDetector no soportado, usando modo manual');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Iniciar detección después de que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          startBarcodeDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsScanning(false);
    }
  }, []);

  const startBarcodeDetection = useCallback(() => {
    if (!isSupported || !videoRef.current || !canvasRef.current) return;

    const detectBarcodes = async () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        // Configurar canvas con el tamaño del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dibujar frame del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Crear BarcodeDetector si está disponible
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
          });
          
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const barcode = barcodes[0];
            console.log('Código detectado:', barcode.rawValue);
            onScanSuccess?.(barcode.rawValue, { format: barcode.format });
            stopCamera();
          }
        }
      } catch (err) {
        console.warn('Error en detección:', err);
      }
    };

    // Detectar códigos cada 100ms
    scanIntervalRef.current = setInterval(detectBarcodes, 100);
  }, [isSupported, isScanning, onScanSuccess]);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess?.(manualCode.trim(), { format: 'MANUAL' });
      setManualCode('');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Aquí podrías implementar lógica adicional de procesamiento
    console.log('Captura realizada');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

        {/* Camera View */}
        <div className="mb-6">
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                {/* Canvas oculto para detección */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Overlay de escaneo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-32 border-2 border-blue-500 rounded-lg flex items-center justify-center bg-blue-500 bg-opacity-10">
                    <div className="text-blue-600 font-semibold text-center">
                      <div className="text-sm">Apunta aquí</div>
                      <div className="text-xs mt-1">Código de barras</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg font-medium">Cámara no iniciada</p>
                <p className="text-sm">Presiona "Iniciar Cámara" para comenzar</p>
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

        {/* Manual Input */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Ingreso Manual</h4>
          <form onSubmit={handleManualSubmit} className="flex space-x-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ingresa el código de barra manualmente"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Agregar
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Permite el acceso a la cámara cuando se solicite</li>
            <li>• Apunta la cámara al código de barra</li>
            <li>• Mantén el código centrado y bien iluminado</li>
            <li>• El escáner detectará automáticamente el código</li>
            <li>• O usa el ingreso manual si prefieres</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={isScanning ? stopCamera : startCamera}
            className={`flex-1 ${
              isScanning 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2`}
          >
            {isScanning ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Detener Cámara</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Iniciar Cámara</span>
              </>
            )}
          </button>

          <button
            onClick={handleClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NativeBarcodeScanner;
