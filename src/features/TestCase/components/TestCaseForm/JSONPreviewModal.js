import React from 'react';

const JSONPreviewModal = ({ title, content, onClose }) => {
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm whitespace-pre-wrap">
          {content}
        </pre>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 w-6 h-6 flex items-center justify-center"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default JSONPreviewModal; 