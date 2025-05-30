import React from 'react';
import { FiLoader } from 'react-icons/fi';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-semibold text-sm leading-none border-2 border-transparent cursor-pointer transition-all duration-200 whitespace-nowrap overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:ring-indigo-500',
    secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5 focus:ring-indigo-500',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:ring-yellow-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-md',
    md: 'px-6 py-3 text-sm rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none';

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    (disabled || loading) ? disabledClasses : '',
    className
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (loading) {
      return <FiLoader className="animate-spin" />;
    }
    if (Icon) {
      return <Icon />;
    }
    return null;
  };

  const iconElement = renderIcon();

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>{iconElement}</span>
      )}
      {children}
      {iconElement && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>{iconElement}</span>
      )}
    </button>
  );
};

export default Button; 