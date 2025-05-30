import React from 'react';
import Modal from '../../../../components/UI/Modal';

const JSONPreviewModal = ({ title, content, onClose }) => {
  if (!content) return null;

  return (
    <Modal 
      isOpen={!!content} 
      onClose={onClose} 
      title={title}
      size="2xl"
    >
      <div className="space-y-4">
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap font-mono border">
          {content}
        </pre>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default JSONPreviewModal; 