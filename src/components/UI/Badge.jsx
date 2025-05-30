import React from 'react';

const Badge = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseClasses = 'badge';
  
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gray: 'badge-gray'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.gray,
    sizeClasses[size] || sizeClasses.md,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

export default Badge; 