import React from 'react';

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'warning', // 'success', 'warning', 'error', 'info'
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancel = true
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-500',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-500',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300'
        };
      default: // warning
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl border-2 ${styles.borderColor} max-w-md w-full transform transition-all duration-300 scale-100`}>
        {/* Header */}
        <div className={`${styles.bgColor} px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{styles.icon}</span>
            <h3 className={`text-lg font-bold ${styles.textColor}`}>
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className={`${styles.textColor} text-sm leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-6 py-2 ${styles.bgColor} text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
