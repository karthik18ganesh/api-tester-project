// src/features/TestExecution/components/ExecutionConfigurationErrorModal.jsx
import React, { useState } from 'react';
import {
  FaExclamationTriangle,
  FaSync,
  FaCog,
  FaInfoCircle,
} from 'react-icons/fa';
import { FiAlertTriangle, FiSettings, FiPlay, FiX } from 'react-icons/fi';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';

const ExecutionConfigurationErrorModal = ({
  isOpen,
  onClose,
  errorCode,
  errorMessage,
  testSuiteName,
  currentStrategy = 'Parallel',
  onRetryWithSequential,
  onEditConfiguration,
  onViewDetails,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  // Handle retry with sequential execution
  const handleRetrySequential = async () => {
    setIsRetrying(true);
    try {
      await onRetryWithSequential();
      onClose();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Error-specific configuration
  const getErrorConfig = (code) => {
    switch (code) {
      case 'ERR-423':
        return {
          title: 'Execution Strategy Conflict',
          icon: <FiAlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-100',
          explanation:
            'This test suite contains dynamic variable configurations that require sequential execution to maintain data dependencies between test cases.',
          recommendation:
            'Switch to Sequential execution to run this test suite properly.',
          technicalDetails:
            'Test cases with dynamic variables need to run in order to pass data between tests.',
        };
      default:
        return {
          title: 'Execution Configuration Error',
          icon: <FiAlertTriangle className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-100',
          explanation:
            'There was a configuration conflict with the selected execution strategy.',
          recommendation:
            'Please review your execution settings and try again.',
          technicalDetails: errorMessage,
        };
    }
  };

  const errorConfig = getErrorConfig(errorCode);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center mb-6">
          <div
            className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full ${errorConfig.iconBg} mb-4`}
          >
            {errorConfig.icon}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {errorConfig.title}
          </h3>

          <div className="bg-gray-50 rounded-lg p-3 inline-flex items-center">
            <span className="text-sm text-gray-600">Test Suite:</span>
            <span className="ml-2 font-medium text-gray-900">
              {testSuiteName}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-600">Current Strategy:</span>
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
              {currentStrategy}
            </span>
          </div>
        </div>

        {/* Error Code Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span className="mr-1">Error Code:</span>
            <code className="font-mono">{errorCode}</code>
          </div>
        </div>

        {/* Explanation Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                What happened?
              </h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                {errorConfig.explanation}
              </p>
              {errorConfig.technicalDetails && (
                <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-200">
                  <p className="text-xs text-blue-700 font-mono">
                    {errorConfig.technicalDetails}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FaCog className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                Recommended Solution
              </h4>
              <p className="text-green-800 text-sm leading-relaxed">
                {errorConfig.recommendation}
              </p>

              {/* Strategy Comparison */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-white border border-green-200 rounded p-3">
                  <div className="text-center">
                    <div className="text-green-600 text-lg mb-1">📋</div>
                    <div className="font-medium text-green-900 text-sm">
                      Sequential
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Recommended
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-300 rounded p-3 opacity-60">
                  <div className="text-center">
                    <div className="text-gray-500 text-lg mb-1">⚡</div>
                    <div className="font-medium text-gray-700 text-sm">
                      Parallel
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Not supported
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleRetrySequential}
            variant="primary"
            loading={isRetrying}
            className="flex-1 flex items-center justify-center"
            icon={FiPlay}
          >
            {isRetrying
              ? 'Switching to Sequential...'
              : 'Run with Sequential Strategy'}
          </Button>

          <div className="flex gap-3 flex-1">
            <Button
              onClick={onEditConfiguration}
              variant="secondary"
              className="flex-1 flex items-center justify-center"
              icon={FiSettings}
            >
              Edit Configuration
            </Button>

            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                variant="ghost"
                className="flex-1"
              >
                View Details
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? Check the{' '}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              documentation
            </a>{' '}
            or contact support.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ExecutionConfigurationErrorModal;
