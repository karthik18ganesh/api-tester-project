import React from 'react';

const ParameterPreview = ({ parameters }) => {
  if (parameters.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-900 mb-2">Detected Parameters</h3>
      <div className="flex flex-wrap gap-2">
        {parameters.map((param, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-300"
          >
            ${"{" + param + "}"}
          </span>
        ))}
      </div>
      <p className="text-xs text-blue-700 mt-2">
        💡 These parameters will be available for variable configuration after saving
      </p>
    </div>
  );
};

export default ParameterPreview; 