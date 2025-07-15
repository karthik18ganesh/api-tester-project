import React from 'react';

const QuickActionCard = ({
  title,
  subtitle,
  icon: Icon,
  variant = 'purple',
  onClick,
  className = '',
  ...props
}) => {
  const variantClasses = {
    purple: 'bg-gradient-primary',
    success: 'bg-gradient-success',
    warning: 'bg-gradient-warning',
    info: 'bg-gradient-info',
    pink: 'bg-gradient-pink',
    cyan: 'bg-gradient-cyan',
    orange: 'bg-gradient-orange'
  };

  const baseClasses = `
    p-6 rounded-xl border-0 text-white cursor-pointer transition-transform duration-200 
    shadow-elegant hover:scale-105 
    ${variantClasses[variant]} 
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          {Icon && <Icon className="w-8 h-8" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard; 