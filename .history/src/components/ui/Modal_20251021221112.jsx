import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import SafeModal from "../SafeModal";

// Componente de modal optimizado que previene errores de DOM
const Modal = React.memo(
  ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    variant = "default",
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className = "",
    useSafeModal = true, // Flag para usar SafeModal por defecto
    ...props
  }) => {
    // Configuraciones de tamaño
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-full mx-4",
    };

    // Configuraciones de variante
    const variantClasses = {
      default: "bg-slate-800/95 border-slate-700/50",
      success: "bg-green-900/95 border-green-700/50",
      warning: "bg-yellow-900/95 border-yellow-700/50",
      danger: "bg-red-900/95 border-red-700/50",
      info: "bg-blue-900/95 border-blue-700/50",
    };

    // Si se solicita usar SafeModal, usar la implementación segura
    if (useSafeModal) {
      return (
        <SafeModal
          isOpen={isOpen}
          onClose={onClose}
          className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-slate-200"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                  p-2 rounded-lg text-slate-400 hover:text-slate-200
                  hover:bg-slate-700/50 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                "
                  aria-label="Cerrar modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </SafeModal>
      );
    }

    // Implementación legacy para casos especiales
    return <ModalLegacy {...props} />;
  }
);

// Implementación legacy para casos que requieren control total del DOM
const ModalLegacy = React.memo(
  ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    variant = "default",
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className = "",
    ...props
  }) => {
    // Manejar escape key
    const handleEscape = useCallback(
      (event) => {
        if (event.key === "Escape" && closeOnEscape) {
          onClose();
        }
      },
      [onClose, closeOnEscape]
    );

    // Manejar overlay click
    const handleOverlayClick = useCallback(
      (event) => {
        if (event.target === event.currentTarget && closeOnOverlayClick) {
          onClose();
        }
      },
      [onClose, closeOnOverlayClick]
    );

    // Configurar event listeners
    useEffect(() => {
      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
          document.removeEventListener("keydown", handleEscape);
          document.body.style.overflow = "unset";
        };
      }
    }, [isOpen, handleEscape]);

    // Configuraciones de tamaño
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-full mx-4",
    };

    // Configuraciones de variante
    const variantClasses = {
      default: "bg-slate-800/95 border-slate-700/50",
      success: "bg-green-900/95 border-green-700/50",
      warning: "bg-yellow-900/95 border-yellow-700/50",
      danger: "bg-red-900/95 border-red-700/50",
      info: "bg-blue-900/95 border-blue-700/50",
    };

    if (!isOpen) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

        {/* Modal */}
        <div
          className={`
          relative w-full ${sizeClasses[size]}
          bg-slate-800/95 backdrop-blur-sm
          border border-slate-700/50 rounded-2xl
          shadow-2xl shadow-slate-900/50
          transform transition-all duration-300 ease-out
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          ${className}
        `}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-slate-200"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                  p-2 rounded-lg text-slate-400 hover:text-slate-200
                  hover:bg-slate-700/50 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                "
                  aria-label="Cerrar modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = "Modal";
ModalLegacy.displayName = "ModalLegacy";

export default Modal;
export { ModalLegacy };