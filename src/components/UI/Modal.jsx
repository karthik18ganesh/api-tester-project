import React, { useEffect, useRef } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

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
    '2xl': 'max-w-2xl'
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
    <div className="modal-container" onClick={handleOverlayClick}>
      <div className="modal-backdrop" />
      <div 
        ref={modalRef}
        className={`modal-content ${sizeClasses[size]} ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h3 id="modal-title" className="modal-title">{title}</h3>
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
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
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