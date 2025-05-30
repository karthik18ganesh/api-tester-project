import React from 'react';
import { FiArrowLeft, FiMoreHorizontal } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Button } from './index';
import Breadcrumb from '../common/Breadcrumb';

const PageLayout = ({ 
  children,
  title,
  subtitle,
  backButton = false,
  backTo,
  actions,
  breadcrumb = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  ...props
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`page-container ${className}`} {...props}>
      {/* Breadcrumb Navigation */}
      {breadcrumb && <Breadcrumb />}
      
      {/* Page Header */}
      {(title || actions || backButton) && (
        <div className={`page-header ${headerClassName}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {backButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              {title && (
                <div>
                  <h1 className="page-title">{title}</h1>
                  {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Page Content */}
      <div className={`flex-1 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Sub-components for common page patterns
PageLayout.Header = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  actions, 
  className = '',
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-white border-b border-gray-200',
    gradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white',
    subtle: 'bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200'
  };

  return (
    <div className={`p-6 ${variants[variant]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-3 rounded-xl ${
              variant === 'gradient' 
                ? 'bg-white/20 text-white' 
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className={`text-2xl font-bold ${
              variant === 'gradient' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-lg ${
                variant === 'gradient' ? 'text-indigo-100' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageLayout.Section = ({ 
  title, 
  subtitle, 
  children, 
  actions,
  className = '',
  headerClassName = '',
  contentClassName = '',
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={`mb-8 ${className}`}>
      {(title || actions) && (
        <div className={`flex items-center justify-between mb-6 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsed ? 'Expand' : 'Collapse'}
              </Button>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {(!collapsible || !collapsed) && (
        <div className={contentClassName}>
          {children}
        </div>
      )}
    </div>
  );
};

PageLayout.Grid = ({ 
  children, 
  columns = 'auto-fit',
  minWidth = '300px',
  gap = '6',
  className = '' 
}) => {
  const gridClasses = typeof columns === 'number'
    ? `grid-cols-${columns}`
    : `grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))]`;

  return (
    <div className={`grid ${gridClasses} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

PageLayout.Split = ({ 
  left, 
  right, 
  leftWidth = '2/3',
  rightWidth = '1/3',
  gap = '8',
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-${gap} ${className}`}>
      <div className={`lg:col-span-2`}>
        {left}
      </div>
      <div className="lg:col-span-1">
        {right}
      </div>
    </div>
  );
};

PageLayout.Card = ({ 
  title, 
  subtitle, 
  children, 
  actions,
  icon: Icon,
  headerless = false,
  className = '',
  bodyClassName = '' 
}) => {
  return (
    <div className={`card ${className}`}>
      {!headerless && (title || actions || Icon) && (
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div>
                {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

PageLayout.Empty = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <Icon className="h-8 w-8" />
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

PageLayout.LoadingState = ({ 
  variant = 'default',
  title = 'Loading...', 
  subtitle,
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
};

PageLayout.ErrorState = ({ 
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content.',
  retry,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
        <FiMoreHorizontal className="h-8 w-8" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      
      {retry && (
        <Button onClick={retry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default PageLayout; 