import React, { Suspense, useState, useEffect } from 'react';

// Componente de loading inteligente
const SmartLoading = ({ moduleName, retryCount = 0 }) => {
  const [dots, setDots] = useState('');
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Mostrar botón de retry después de 10 segundos
    const retryTimer = setTimeout(() => {
      setShowRetry(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(retryTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Spinner animado */}
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Indicador de progreso */}
          <div className="w-32 h-2 bg-slate-700 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{
              width: `${Math.min(90, 30 + (retryCount * 20))}%`
            }}></div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Cargando {moduleName}
        </h2>
        <p className="text-slate-400 mb-4">
          Preparando módulo{dots}
        </p>

        {showRetry && (
          <div className="space-y-2">
            <p className="text-orange-400 text-sm">
              La carga está tardando más de lo esperado
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tips de optimización */}
        <div className="mt-6 text-xs text-slate-500 max-w-sm">
          <p>💡 Tip: Asegúrate de tener una conexión estable</p>
        </div>
      </div>
    </div>
  );
};

// Componente principal de lazy loading
const LazyModule = ({ 
  module, 
  moduleName = "Módulo",
  fallback = null,
  onLoad = null,
  onError = null 
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  const handleError = (error) => {
    console.error(`Error cargando módulo ${moduleName}:`, error);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Error al cargar {moduleName}
          </h2>
          <p className="text-slate-400 mb-4">
            No se pudo cargar el módulo. Inténtalo de nuevo.
          </p>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      fallback || <SmartLoading moduleName={moduleName} retryCount={retryCount} />
    }>
      <ErrorBoundary onError={handleError}>
        {module}
      </ErrorBoundary>
    </Suspense>
  );
};

// Error Boundary para capturar errores
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary capturó un error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Error en el módulo
            </h2>
            <p className="text-slate-400 mb-4">
              Algo salió mal. Intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyModule;
