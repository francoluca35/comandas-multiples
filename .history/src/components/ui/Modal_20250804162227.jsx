import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Componente de modal optimizado
const Modal = React.memo(({
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
  const handleEscape = useCallback((event) => {
    if (event.key === "Escape" && closeOnEscape) {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  // Manejar overlay click
  const handleOverlayClick = useCallback((event) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  }, [onClose, closeOnOverlayClick]);

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

  // Renderizar en portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
});

// Componente de confirmación
const ConfirmModal = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}) => {
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // El error se maneja en el componente padre
    }
  }, [onConfirm, onClose]);

  const variantConfig = {
    danger: {
      buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    warning: {
      buttonClass: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    info: {
      buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>
        
        <p className="text-slate-300 mb-6">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-6 py-2 rounded-xl font-semibold
              bg-slate-700/50 text-slate-200
              hover:bg-slate-600/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-slate-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`
              px-6 py-2 rounded-xl font-semibold text-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
              disabled:opacity-50 disabled:cursor-not-allowed
              ${config.buttonClass}
            `}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
});

// Componente de modal con formulario
const FormModal = React.memo(({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Guardar",
  cancelText = "Cancelar",
  loading = false,
  size = "lg",
}) => {
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await onSubmit(e);
      onClose();
    } catch (error) {
      // El error se maneja en el componente padre
    }
  }, [onSubmit, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              px-6 py-2 rounded-xl font-semibold
              bg-slate-700/50 text-slate-200
              hover:bg-slate-600/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-slate-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {cancelText}
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="
              px-6 py-2 rounded-xl font-semibold text-white
              bg-blue-600 hover:bg-blue-700 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </div>
            ) : (
              submitText
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
});

// Hook para manejar modales
const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

export {
  Modal,
  ConfirmModal,
  FormModal,
  useModal,
}; 