import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  status = null,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  const statusClasses = {
    'Passed': 'bg-green-100 text-green-800 border border-green-200',
    'Failed': 'bg-red-100 text-red-800 border border-red-200',
    'Error': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Skipped': 'bg-gray-100 text-gray-800 border border-gray-200',
    'PASSED': 'bg-green-100 text-green-800 border border-green-200',
    'FAILED': 'bg-red-100 text-red-800 border border-red-200',
    'ERROR': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'SKIPPED': 'bg-gray-100 text-gray-800 border border-gray-200'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800'
  };

  const colorClasses = status && statusClasses[status] 
    ? statusClasses[status] 
    : variantClasses[variant];

  const classes = `${baseClasses} ${sizeClasses[size]} ${colorClasses} ${className}`;

  return (
    <span className={classes} {...props}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

export default Badge; 