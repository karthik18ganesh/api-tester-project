import React from 'react';

/**
 * Component to display the difference between API template parameters and test case values
 * 
 * @param {Object} props
 * @param {string} props.template - The original template string with parameters
 * @param {Object} props.values - Object with parameter values { paramName: value }
 * @param {string} props.title - Optional title for the component
 * @param {boolean} props.showOriginal - Whether to show the original template
 */
const ParameterDiff = ({ template, values, title, showOriginal = true }) => {
  if (!template) return null;
  
  // Helper function to replace parameters with their values
  const replaceParameters = (text, values) => {
    if (!text || !values) return text;
    
    let result = text;
    Object.entries(values).forEach(([param, value]) => {
      const regex = new RegExp(`\\$\\{${param}\\}`, 'g');
      result = result.replace(regex, value);
    });
    
    return result;
  };
  
  // Replace parameters with their values
  const resolvedTemplate = replaceParameters(template, values);
  
  // Highlight the parameters in the original template
  const renderHighlightedTemplate = (text) => {
    if (!text) return null;
    
    // Match ${paramName} pattern
    const parts = text.split(/(\$\{[^}]+\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\$\{[^}]+\}$/)) {
        const paramName = part.slice(2, -1);
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  
  // Render the component
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
      {title && (
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
      )}
      
      <div className="p-3">
        {showOriginal && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-500 mb-1">Template:</div>
            <div className="text-sm bg-gray-50 p-2 rounded">
              {renderHighlightedTemplate(template)}
            </div>
          </div>
        )}
        
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">With values:</div>
          <div className="text-sm bg-green-50 p-2 rounded font-medium">
            {resolvedTemplate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterDiff; 