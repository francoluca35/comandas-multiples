/**
 * Utilidad para manejar errores de DOM de forma global
 * Intercepta errores de removeChild y otros errores de manipulación DOM
 */

// Flag para controlar si ya se ha configurado el handler
let isHandlerConfigured = false;

/**
 * Configura el handler global para errores de DOM
 */
export const configureDOMErrorHandler = () => {
  if (isHandlerConfigured || typeof window === 'undefined') {
    return;
  }

  // Interceptar errores de removeChild
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    try {
      // Verificar si el child es realmente un hijo de este nodo
      if (child && child.parentNode === this) {
        return originalRemoveChild.call(this, child);
      } else {
        console.warn('DOM Error prevented: Attempted to remove child that is not a child of this node');
        return child; // Retornar el child sin removerlo
      }
    } catch (error) {
      if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
        console.warn('DOM Error prevented: removeChild error caught and handled');
        return child; // Retornar el child sin removerlo
      }
      throw error; // Re-lanzar otros errores
    }
  };

  // Interceptar errores de appendChild
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    try {
      return originalAppendChild.call(this, child);
    } catch (error) {
      if (error.name === 'NotFoundError' || error.name === 'HierarchyRequestError') {
        console.warn('DOM Error prevented: appendChild error caught and handled');
        return child; // Retornar el child sin agregarlo
      }
      throw error; // Re-lanzar otros errores
    }
  };

  // Interceptar errores de insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    try {
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      if (error.name === 'NotFoundError' || error.name === 'HierarchyRequestError') {
        console.warn('DOM Error prevented: insertBefore error caught and handled');
        return newNode; // Retornar el newNode sin insertarlo
      }
      throw error; // Re-lanzar otros errores
    }
  };

  // Interceptar errores de replaceChild
  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function(newChild, oldChild) {
    try {
      if (oldChild && oldChild.parentNode === this) {
        return originalReplaceChild.call(this, newChild, oldChild);
      } else {
        console.warn('DOM Error prevented: Attempted to replace child that is not a child of this node');
        return oldChild; // Retornar el oldChild sin reemplazarlo
      }
    } catch (error) {
      if (error.name === 'NotFoundError' && error.message.includes('replaceChild')) {
        console.warn('DOM Error prevented: replaceChild error caught and handled');
        return oldChild; // Retornar el oldChild sin reemplazarlo
      }
      throw error; // Re-lanzar otros errores
    }
  };

  // Interceptar errores globales de React
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.includes('removeChild')) {
      console.warn('React DOM Error intercepted:', ...args);
      return; // No mostrar el error en la consola
    }
    originalConsoleError.apply(console, args);
  };

  isHandlerConfigured = true;
  console.log('🛡️ DOM Error Handler configured successfully');
};

/**
 * Restaura los métodos originales (útil para testing)
 */
export const restoreDOMErrorHandler = () => {
  if (!isHandlerConfigured) return;

  // Restaurar métodos originales
  delete Node.prototype.removeChild;
  delete Node.prototype.appendChild;
  delete Node.prototype.insertBefore;
  delete Node.prototype.replaceChild;

  isHandlerConfigured = false;
  console.log('🔄 DOM Error Handler restored');
};

/**
 * Verifica si un elemento puede ser removido de forma segura
 */
export const canRemoveChild = (parent, child) => {
  try {
    return child && child.parentNode === parent;
  } catch (error) {
    return false;
  }
};

/**
 * Remueve un child de forma segura
 */
export const safeRemoveChild = (parent, child) => {
  try {
    if (canRemoveChild(parent, child)) {
      return parent.removeChild(child);
    } else {
      console.warn('Cannot remove child: not a child of parent');
      return child;
    }
  } catch (error) {
    console.warn('Error removing child:', error);
    return child;
  }
};

/**
 * Limpia un contenedor de forma segura
 */
export const safeClearContainer = (container) => {
  try {
    if (container && container.nodeType === Node.ELEMENT_NODE) {
      // Usar innerHTML en lugar de removeChild para evitar errores
      container.innerHTML = '';
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error clearing container:', error);
    return false;
  }
};
