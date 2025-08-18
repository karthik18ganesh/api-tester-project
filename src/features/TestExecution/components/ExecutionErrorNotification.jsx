// src/features/TestExecution/components/ExecutionErrorNotification.jsx
// Alternative inline notification component for less intrusive error handling

import React, { useState } from 'react';
import {
  FaExclamationTriangle,
  FaPlay,
  FaTimes,
  FaInfoCircle,
} from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Button from '../../../components/UI/Button';

const ExecutionErrorNotification = ({
  isVisible,
  onDismiss,
  errorCode,
  errorMessage,
  testSuiteName,
  currentStrategy,
  onRetryWithSequential,
  onEditConfiguration,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isVisible) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetryWithSequential();
      onDismiss();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={`relative mb-6 ${className}`}>
      {/* Main notification bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="w-4 h-4 text-amber-600" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-amber-900">
                    Execution Strategy Conflict
                  </h4>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-2 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    {isExpanded ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-amber-800 mb-3">
                  <strong>{testSuiteName}</strong> requires Sequential execution
                  due to dynamic variable dependencies.
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={handleRetry}
                    loading={isRetrying}
                    icon={FaPlay}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Run Sequential
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onEditConfiguration}
                    className="text-amber-700 hover:bg-amber-100"
                  >
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 ml-4 text-amber-400 hover:text-amber-600 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t border-amber-200 bg-amber-25 px-4 py-3">
            <div className="space-y-3">
              {/* Error details */}
              <div className="flex items-start">
                <FaInfoCircle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium mb-1">
                    Technical Details:
                  </p>
                  <p className="text-amber-700 text-xs font-mono bg-amber-100 p-2 rounded border">
                    {errorCode}: {errorMessage}
                  </p>
                </div>
              </div>

              {/* Strategy comparison */}
              <div className="flex items-start">
                <FaInfoCircle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium mb-2">
                    Execution Strategies:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-100 border border-green-200 rounded p-2 text-center">
                      <div className="font-medium text-green-800">
                        📋 Sequential
                      </div>
                      <div className="text-green-600">Maintains data flow</div>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded p-2 text-center opacity-60">
                      <div className="font-medium text-gray-700">
                        ⚡ Parallel
                      </div>
                      <div className="text-gray-600">Not supported</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionErrorNotification;

// Usage example in TestExecution.js:

/*
// Add this state to your component
const [showErrorNotification, setShowErrorNotification] = useState(false);

// In your JSX, add this before the test hierarchy section:
{showErrorNotification && (
  <ExecutionErrorNotification
    isVisible={showErrorNotification}
    onDismiss={() => {
      setShowErrorNotification(false);
      setConfigError(null);
      setErrorTestSuite(null);
    }}
    errorCode={configError?.code}
    errorMessage={configError?.message}
    testSuiteName={errorTestSuite?.name || 'Unknown Test Suite'}
    currentStrategy={settings.executionStrategy}
    onRetryWithSequential={handleRetryWithSequential}
    onEditConfiguration={handleEditConfiguration}
  />
)}

// In your error handling, you can choose between modal or notification:
if (errorCode === 'ERR-423') {
  setConfigError({ code: errorCode, message: errorMessage });
  setErrorTestSuite(item);
  
  // For less intrusive experience, use notification:
  setShowErrorNotification(true);
  
  // For more attention-grabbing experience, use modal:
  // setShowConfigErrorModal(true);
  
  setLoading(false);
  return;
}
*/
