import React, { forwardRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const Input = forwardRef(({
  label,
  error,
  helpText,
  required,
  className = '',
  containerClassName = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  type = 'text',
  ...props
}, ref) => {
  const inputClasses = [
    error ? 'form-input-error' : 'form-input',
    LeftIcon ? 'pl-10' : '',
    RightIcon ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
        
        {RightIcon && (
          <div 
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            }`}
            onClick={onRightIconClick}
          >
            <RightIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiAlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {error && <p className="form-error">{error}</p>}
      {helpText && !error && <p className="form-help">{helpText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 