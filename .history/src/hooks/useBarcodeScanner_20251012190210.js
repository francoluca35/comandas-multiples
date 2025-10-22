import { useState, useCallback } from 'react';

export const useBarcodeScanner = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scannerHistory, setScannerHistory] = useState([]);

  const openScanner = useCallback(() => {
    setIsScannerOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  const handleScanSuccess = useCallback((decodedText, decodedResult) => {
    console.log('✅ Código escaneado exitosamente:', decodedText);
    
    // Guardar el último código escaneado
    setLastScannedCode({
      code: decodedText,
      format: decodedResult?.format || 'UNKNOWN',
      timestamp: new Date().toISOString()
    });

    // Agregar al historial (mantener solo los últimos 10)
    setScannerHistory(prev => [
      {
        id: Date.now(),
        code: decodedText,
        format: decodedResult?.format || 'UNKNOWN',
        timestamp: new Date().toISOString()
      },
      ...prev.slice(0, 9)
    ]);

    // Cerrar el scanner
    setIsScannerOpen(false);

    return { code: decodedText, format: decodedResult?.format };
  }, []);

  const handleScanError = useCallback((error) => {
    console.error('❌ Error en el escáner:', error);
    // No cerrar el scanner en caso de error, permitir reintento
  }, []);

  const clearHistory = useCallback(() => {
    setScannerHistory([]);
    setLastScannedCode(null);
  }, []);

  const removeFromHistory = useCallback((id) => {
    setScannerHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    isScannerOpen,
    lastScannedCode,
    scannerHistory,
    openScanner,
    closeScanner,
    handleScanSuccess,
    handleScanError,
    clearHistory,
    removeFromHistory
  };
};
