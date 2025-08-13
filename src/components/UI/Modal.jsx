import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

// Portal component to render modal at document.body level
const Portal = ({ children }) => {
  return createPortal(children, document.body);
};

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const modalRef = useRef(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-[95vw]'
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Focus the modal for better accessibility
      if (modalRef.current) {
        modalRef.current.focus();
      }
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <div 
          ref={modalRef}
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${className}`}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          style={{
            animation: 'scaleIn 0.3s ease-out'
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="relative px-6 py-6 border-b border-gray-200">
              {title && (
                <h3 id="modal-title" className="text-xl font-bold text-gray-900 pr-8">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-6 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <FiAlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <FiAlertTriangle className="w-6 h-6 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {getIcon() && (
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            {getIcon()}
          </div>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        {message && (
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
        )}
        
        <div className="flex justify-center gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={getConfirmVariant()}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Attach ConfirmationModal as a sub-component
Modal.Confirmation = ConfirmationModal;

export default Modal; 