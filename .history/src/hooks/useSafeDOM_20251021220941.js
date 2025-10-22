import { useRef, useCallback } from 'react';

/**
 * Hook para operaciones seguras de DOM que previenen errores de removeChild
 */
export const useSafeDOM = () => {
  const mountedRef = useRef(true);

  // Verificar si el componente está montado
  const isMounted = useCallback(() => {
    return mountedRef.current;
  }, []);

  // Ejecutar operación DOM de forma segura
  const safeDOMOperation = useCallback((operation) => {
    if (!isMounted()) {
      console.warn('Component unmounted, skipping DOM operation');
      return false;
    }

    try {
      return operation();
    } catch (error) {
      if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
        console.warn('DOM node already removed, skipping operation:', error);
        return false;
      }
      throw error;
    }
  }, [isMounted]);

  // Limpiar elemento de forma segura
  const safeRemoveElement = useCallback((elementId) => {
    return safeDOMOperation(() => {
      const element = document.getElementById(elementId);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
        return true;
      }
      return false;
    });
  }, [safeDOMOperation]);

  // Limpiar todos los elementos de un contenedor de forma segura
  const safeClearContainer = useCallback((containerId) => {
    return safeDOMOperation(() => {
      const container = document.getElementById(containerId);
      if (container) {
        // Usar innerHTML en lugar de removeChild para evitar errores
        container.innerHTML = '';
        return true;
      }
      return false;
    });
  }, [safeDOMOperation]);

  // Verificar si un elemento existe en el DOM
  const elementExists = useCallback((elementId) => {
    if (!isMounted()) return false;
    
    try {
      const element = document.getElementById(elementId);
      return element && element.parentNode !== null;
    } catch (error) {
      return false;
    }
  }, [isMounted]);

  // Cleanup al desmontar
  const cleanup = useCallback(() => {
    mountedRef.current = false;
  }, []);

  return {
    isMounted,
    safeDOMOperation,
    safeRemoveElement,
    safeClearContainer,
    elementExists,
    cleanup
  };
};
