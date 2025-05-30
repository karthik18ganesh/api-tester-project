import React from 'react';

const Card = ({ 
  children, 
  className = '',
  padding = true,
  hover = false,
  ...props 
}) => {
  const classes = [
    'card',
    hover ? 'hover:shadow-md transition-shadow duration-200' : '',
    !padding ? 'p-0' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ 
  children, 
  className = '',
  as: Component = 'h3',
  ...props 
}) => {
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </Component>
  );
};

const CardDescription = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Attach sub-components to main Card component
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card; 