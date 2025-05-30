import React, { useState } from 'react';
import Modal from '../UI/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import { FiPlay, FiTrash, FiEdit, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const ModalTestDemo = () => {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [largeModalOpen, setLargeModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmAction = async () => {
    setLoading(true);
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setConfirmationModalOpen(false);
    alert('Action confirmed!');
  };

  const handleWarningAction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setWarningModalOpen(false);
    alert('Warning action completed!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Modal Testing Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Modal Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiInfo className="mr-2 text-blue-500" />
            Basic Modal
          </h3>
          <p className="text-gray-600 mb-4">Test the basic modal functionality with title and content.</p>
          <button
            onClick={() => setBasicModalOpen(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Open Basic Modal
          </button>
        </div>

        {/* Confirmation Modal Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrash className="mr-2 text-red-500" />
            Confirmation Modal
          </h3>
          <p className="text-gray-600 mb-4">Test confirmation modal with danger variant and loading state.</p>
          <button
            onClick={() => setConfirmationModalOpen(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Open Confirmation Modal
          </button>
        </div>

        {/* Large Modal Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiEdit className="mr-2 text-green-500" />
            Large Modal
          </h3>
          <p className="text-gray-600 mb-4">Test large modal with more content and forms.</p>
          <button
            onClick={() => setLargeModalOpen(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Open Large Modal
          </button>
        </div>

        {/* Warning Modal Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiAlertTriangle className="mr-2 text-yellow-500" />
            Warning Modal
          </h3>
          <p className="text-gray-600 mb-4">Test warning confirmation modal variant.</p>
          <button
            onClick={() => setWarningModalOpen(true)}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Open Warning Modal
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Test Checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Modal opens correctly</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Modal backdrop works (click to close)</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Close button works</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>ESC key closes modal</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Loading states work properly</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Animations are smooth</span>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <Modal
        isOpen={basicModalOpen}
        onClose={() => setBasicModalOpen(false)}
        title="Basic Modal Test"
        size="md"
      >
        <div className="space-y-4">
          <p>This is a basic modal component test. It should display correctly with proper styling and animations.</p>
          <p>You can close this modal by:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Clicking the X button in the top right</li>
            <li>Clicking outside the modal (on the backdrop)</li>
            <li>Pressing the ESC key</li>
          </ul>
          <div className="flex justify-end">
            <button
              onClick={() => setBasicModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleConfirmAction}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />

      <Modal
        isOpen={largeModalOpen}
        onClose={() => setLargeModalOpen(false)}
        title="Large Modal Test"
        size="xl"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Form Example</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your message"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setLargeModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setLargeModalOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        onConfirm={handleWarningAction}
        title="Warning Action"
        message="This action may have unintended consequences. Do you want to proceed?"
        confirmText="Proceed"
        cancelText="Cancel"
        variant="warning"
        loading={loading}
      />
    </div>
  );
};

export default ModalTestDemo; 