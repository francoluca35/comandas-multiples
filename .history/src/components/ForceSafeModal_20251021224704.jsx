"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Componente que fuerza el renderizado seguro de modales
 * Reemplaza completamente el renderizado de modales problemáticos
 */
const ForceSafeModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  overlayClassName = "",
  ...props 
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const animationRef = useRef(null);
  const modalRef = useRef(null);

  // Función segura para cerrar el modal
  const safeClose = useCallback(() => {
    setIsVisible(false);
    // Delay antes de desmontar completamente
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 300);
  }, []);

  // Manejar cambios en isOpen
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Pequeño delay para asegurar que el DOM esté listo
      animationRef.current = requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      safeClose();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, safeClose]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Manejar clic en overlay
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  // Manejar tecla Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  // Agregar event listeners
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isVisible, handleKeyDown]);

  if (!shouldRender) return null;

  return (
    <div 
      ref={modalRef}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${overlayClassName}`}
      onClick={handleOverlayClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default ForceSafeModal;
