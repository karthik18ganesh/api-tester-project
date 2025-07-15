import React from 'react';

const MetricCard = ({
  title,
  value,
  icon: Icon,
  variant = 'purple',
  className = '',
  onClick,
  ...props
}) => {
  const variantClasses = {
    purple: 'bg-gradient-primary text-white',
    success: 'bg-gradient-success text-white',
    warning: 'bg-gradient-warning text-white',
    info: 'bg-gradient-info text-white',
    pink: 'bg-gradient-pink text-white',
    cyan: 'bg-gradient-cyan text-white',
    orange: 'bg-gradient-orange text-white'
  };

  const isClickable = typeof onClick === 'function';
  const baseClasses = `
    p-6 rounded-xl border-0 shadow-card transition-all duration-200 hover:scale-105 hover:shadow-elegant
    ${variantClasses[variant]}
    ${isClickable ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {Icon && (
        <div className="ml-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <div className={baseClasses} onClick={onClick} {...props}>
        {cardContent}
      </div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {cardContent}
    </div>
  );
};

export default MetricCard; 