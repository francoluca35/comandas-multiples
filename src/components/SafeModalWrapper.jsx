"use client";
import React, { useState, useEffect, useRef } from 'react';

/**
 * Higher-Order Component que envuelve cualquier modal para prevenir errores de DOM
 * Maneja de forma segura el montaje y desmontaje de componentes
 */
const SafeModalWrapper = (WrappedComponent) => {
  return React.memo((props) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef(null);
    const animationTimeoutRef = useRef(null);

    useEffect(() => {
      if (props.isOpen) {
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
        }, 200);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (animationTimeoutRef.current) {
          cancelAnimationFrame(animationTimeoutRef.current);
        }
      };
    }, [props.isOpen]);

    // Si el componente no debe renderizarse, no renderizar nada
    if (!shouldRender) return null;

    // Pasar las props al componente envuelto
    return <WrappedComponent {...props} isAnimating={isAnimating} />;
  });
};

/**
 * Hook para manejar el estado de renderizado seguro de modales
 */
export const useSafeModalRender = (isOpen) => {
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
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        cancelAnimationFrame(animationTimeoutRef.current);
      }
    };
  }, [isOpen]);

  return { shouldRender, isAnimating };
};

export default SafeModalWrapper;
