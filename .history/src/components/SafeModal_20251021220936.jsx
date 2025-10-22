"use client";
import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente SafeModal que previene errores de DOM removeChild
 * Maneja de forma segura el montaje y desmontaje de modales
 */
const SafeModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  overlayClassName = "",
  ...props 
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Pequeño delay para permitir que el DOM se actualice
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Delay para permitir que las animaciones terminen antes de desmontar
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!shouldRender) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      } ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default SafeModal;
