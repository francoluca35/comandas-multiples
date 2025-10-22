/**
 * Protección inmediata contra errores de DOM
 * Se ejecuta ANTES de que React pueda causar errores
 */

(function() {
  'use strict';
  
  // Solo ejecutar en el navegador
  if (typeof window === 'undefined') return;

  console.log('🛡️ Initializing Immediate DOM Protection...');

  // Interceptar errores ANTES de que React los maneje
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    try {
      // Verificar que el child existe y es realmente un hijo
      if (!child) {
        console.warn('🛡️ DOM Protection: removeChild called with null/undefined child');
        return child;
      }
      
      if (child.parentNode !== this) {
        console.warn('🛡️ DOM Protection: removeChild prevented - child is not a child of this node');
        return child;
      }
      
      return originalRemoveChild.call(this, child);
    } catch (error) {
      console.warn('🛡️ DOM Protection: removeChild error caught and handled:', error.message);
      return child;
    }
  };

  // Interceptar appendChild
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    try {
      if (!child) {
        console.warn('🛡️ DOM Protection: appendChild called with null/undefined child');
        return child;
      }
      return originalAppendChild.call(this, child);
    } catch (error) {
      console.warn('🛡️ DOM Protection: appendChild error caught and handled:', error.message);
      return child;
    }
  };

  // Interceptar insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    try {
      if (!newNode) {
        console.warn('🛡️ DOM Protection: insertBefore called with null/undefined newNode');
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      console.warn('🛡️ DOM Protection: insertBefore error caught and handled:', error.message);
      return newNode;
    }
  };

  // Interceptar replaceChild
  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function(newChild, oldChild) {
    try {
      if (!newChild || !oldChild) {
        console.warn('🛡️ DOM Protection: replaceChild called with null/undefined child');
        return oldChild;
      }
      
      if (oldChild.parentNode !== this) {
        console.warn('🛡️ DOM Protection: replaceChild prevented - oldChild is not a child of this node');
        return oldChild;
      }
      
      return originalReplaceChild.call(this, newChild, oldChild);
    } catch (error) {
      console.warn('🛡️ DOM Protection: replaceChild error caught and handled:', error.message);
      return oldChild;
    }
  };

  // Interceptar errores globales
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && 
        (message.includes('removeChild') || 
         message.includes('NotFoundError') ||
         message.includes('Failed to execute') ||
         message.includes('The node to be removed is not a child'))) {
      console.warn('🛡️ Global Error intercepted and prevented:', message);
      return true; // Prevenir que el error se propague
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Interceptar promesas rechazadas
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('removeChild') ||
         event.reason.message.includes('NotFoundError'))) {
      console.warn('🛡️ Promise Rejection intercepted and prevented:', event.reason);
      event.preventDefault();
    }
  });

  // Interceptar console.error para errores de React
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('removeChild') || 
         message.includes('NotFoundError') ||
         message.includes('Failed to execute') ||
         message.includes('The node to be removed is not a child'))) {
      console.warn('🛡️ Console Error intercepted and prevented:', ...args);
      return; // No mostrar el error
    }
    originalConsoleError.apply(console, args);
  };

  console.log('🛡️ Immediate DOM Protection activated successfully');
})();
