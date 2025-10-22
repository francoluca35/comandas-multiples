/**
 * Protección agresiva contra errores de DOM
 * Intercepta TODOS los errores de manipulación DOM y los maneja de forma segura
 */

let isProtectionActive = false;

// Backup de métodos originales
const originalMethods = {};

/**
 * Intercepta y protege todos los métodos de manipulación DOM
 */
const protectDOMMethods = () => {
  if (isProtectionActive) return;

  // Proteger removeChild
  originalMethods.removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    try {
      if (!child) return child;
      if (child.parentNode !== this) {
        console.warn('🛡️ DOM Protection: removeChild prevented - child not a child of parent');
        return child;
      }
      return originalMethods.removeChild.call(this, child);
    } catch (error) {
      console.warn('🛡️ DOM Protection: removeChild error caught and handled:', error.message);
      return child;
    }
  };

  // Proteger appendChild
  originalMethods.appendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    try {
      if (!child) return child;
      return originalMethods.appendChild.call(this, child);
    } catch (error) {
      console.warn('🛡️ DOM Protection: appendChild error caught and handled:', error.message);
      return child;
    }
  };

  // Proteger insertBefore
  originalMethods.insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    try {
      if (!newNode) return newNode;
      return originalMethods.insertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      console.warn('🛡️ DOM Protection: insertBefore error caught and handled:', error.message);
      return newNode;
    }
  };

  // Proteger replaceChild
  originalMethods.replaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function(newChild, oldChild) {
    try {
      if (!newChild || !oldChild) return oldChild;
      if (oldChild.parentNode !== this) {
        console.warn('🛡️ DOM Protection: replaceChild prevented - oldChild not a child of parent');
        return oldChild;
      }
      return originalMethods.replaceChild.call(this, newChild, oldChild);
    } catch (error) {
      console.warn('🛡️ DOM Protection: replaceChild error caught and handled:', error.message);
      return oldChild;
    }
  };

  isProtectionActive = true;
  console.log('🛡️ Aggressive DOM Protection activated');
};

/**
 * Intercepta errores de React DOM
 */
const protectReactDOM = () => {
  // Interceptar console.error para errores de React DOM
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string') {
      // Interceptar errores específicos de React DOM
      if (message.includes('removeChild') || 
          message.includes('NotFoundError') ||
          message.includes('Failed to execute') ||
          message.includes('The node to be removed is not a child')) {
        console.warn('🛡️ React DOM Error intercepted and prevented:', ...args);
        return; // No mostrar el error
      }
    }
    originalConsoleError.apply(console, args);
  };

  // Interceptar window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && 
        (message.includes('removeChild') || 
         message.includes('NotFoundError') ||
         message.includes('Failed to execute'))) {
      console.warn('🛡️ Window Error intercepted and prevented:', message);
      return true; // Prevenir que el error se propague
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Interceptar unhandledrejection
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('removeChild')) {
      console.warn('🛡️ Promise Rejection intercepted and prevented:', event.reason);
      event.preventDefault(); // Prevenir que la promesa se rechace
    }
  });
};

/**
 * Intercepta errores específicos de React
 */
const protectReactErrors = () => {
  // Interceptar errores de React en el objeto global
  if (typeof window !== 'undefined') {
    const originalReactError = window.React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    
    // Interceptar el error handler de React
    const originalInvokeGuardedCallback = window.React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher;
    
    // Interceptar errores de React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const originalOnCommitFiberRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot;
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function(...args) {
        try {
          return originalOnCommitFiberRoot?.apply(this, args);
        } catch (error) {
          if (error.message && error.message.includes('removeChild')) {
            console.warn('🛡️ React DevTools Error intercepted:', error);
            return;
          }
          throw error;
        }
      };
    }
  }
};

/**
 * Inicializar toda la protección
 */
export const initializeAggressiveProtection = () => {
  if (typeof window === 'undefined') return;

  console.log('🛡️ Initializing Aggressive DOM Protection...');
  
  protectDOMMethods();
  protectReactDOM();
  protectReactErrors();
  
  console.log('🛡️ Aggressive DOM Protection fully activated');
};

/**
 * Restaurar métodos originales (para testing)
 */
export const restoreOriginalMethods = () => {
  if (!isProtectionActive) return;

  Object.keys(originalMethods).forEach(method => {
    Node.prototype[method] = originalMethods[method];
  });

  isProtectionActive = false;
  console.log('🛡️ DOM Protection restored to original state');
};
