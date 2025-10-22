"use client";
import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente que automáticamente aplica el patrón seguro de renderizado
 * a cualquier modal que use el patrón isOpen/onClose
 */
const AutoSafeModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  overlayClassName = "",
  animationDuration = 200,
  ...props 
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Pequeño delay para permitir que el DOM se actualice
      animationTimeoutRef.current = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Delay para permitir que las animaciones terminen antes de desmontar
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, animationDuration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        cancelAnimationFrame(animationTimeoutRef.current);
      }
    };
  }, [isOpen, animationDuration]);

  if (!shouldRender) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-${animationDuration} ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      } ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      <div 
        className={`bg-white rounded-lg transition-all duration-${animationDuration} ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default AutoSafeModal;
