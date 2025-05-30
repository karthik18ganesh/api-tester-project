import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  variant = 'primary',
  centered = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'loading-spinner',
    secondary: 'border-gray-200 border-t-gray-600',
    success: 'border-green-200 border-t-green-600',
    warning: 'border-yellow-200 border-t-yellow-600',
    error: 'border-red-200 border-t-red-600'
  };

  const spinnerClasses = [
    sizeClasses[size],
    variantClasses[variant] || variantClasses.primary,
    'animate-spin rounded-full border-2',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = centered 
    ? 'flex flex-col items-center justify-center min-h-[200px] space-y-4'
    : 'flex items-center space-x-3';

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 