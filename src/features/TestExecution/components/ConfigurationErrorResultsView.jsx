import React from 'react';
import {
  FaCog,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfigurationErrorResultsView = ({
  execution,
  errorCode,
  errorMessage,
}) => {
  const getCustomMessage = (item, errorCode) => {
    if (!item) {
      return errorCode === 'ERR-422'
        ? 'This test suite cannot be executed in parallel due to dependency variables.'
        : 'This test case requires Sequential execution due to dynamic variables.';
    }

    if (errorCode === 'ERR-422') {
      // ERR-422: Test Suite parallel execution with dependencies
      if (item.name?.toLowerCase().includes('api')) {
        return 'API test suites require Sequential execution for proper request chaining and data flow.';
      }
      if (item.name?.toLowerCase().includes('data')) {
        return 'Data-driven test suites need Sequential execution to maintain variable dependencies between test cases.';
      }
      if (item.name?.toLowerCase().includes('workflow')) {
        return 'Workflow test suites require Sequential execution to maintain state and data flow between test cases.';
      }
      return 'This test suite contains dependency variables that prevent parallel execution.';
    } else {
      // ERR-423: Single test case with dependencies
      if (item.name?.toLowerCase().includes('api')) {
        return 'This API test case requires Sequential execution for proper request chaining.';
      }
      if (item.name?.toLowerCase().includes('data')) {
        return 'This data-driven test case needs Sequential execution for variable dependencies.';
      }
      if (item.name?.toLowerCase().includes('workflow')) {
        return 'This workflow test case requires Sequential execution to maintain state.';
      }
      return 'This test case requires Sequential execution due to dynamic variables.';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">
                Configuration Error
              </h3>
              <p className="text-sm text-amber-700">
                {execution?.selectedItem?.name || 'Test Suite'} requires
                different execution settings
                {errorCode === 'ERR-422' ? ' (Test Suite)' : ' (Test Case)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              {errorCode}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Error Summary */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaTimesCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">
                Execution Failed
              </h4>
              <p className="text-red-800 text-sm mb-3">
                {getCustomMessage(execution?.selectedItem, errorCode)}
              </p>
              <div className="bg-red-100 border border-red-200 rounded p-3">
                <p className="text-xs text-red-700 font-mono">
                  {errorCode}: {errorMessage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FaCog className="w-4 h-4 text-gray-500" />
              Current Settings
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Strategy:</span>
                <span className="font-medium text-red-600">Parallel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium text-gray-900">
                  {execution?.environment || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Executed By:</span>
                <span className="font-medium text-gray-900">
                  {execution?.executedBy || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Executed At:</span>
                <span className="font-medium text-gray-900">
                  {execution?.executedAt || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <FaCheckCircle className="w-4 h-4 text-green-500" />
              Recommended Solution
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📋</span>
                </div>
                <span className="text-sm font-medium text-green-800">
                  Switch to Sequential Execution
                </span>
              </div>
              <p className="text-xs text-green-700">
                {errorCode === 'ERR-422'
                  ? 'Sequential execution maintains data dependencies between test cases and ensures proper variable flow across the entire test suite.'
                  : 'Sequential execution maintains data dependencies and ensures proper variable flow for this test case.'}
              </p>
            </div>
          </div>
        </div>

        {/* Strategy Comparison */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <FaInfoCircle className="w-4 h-4 text-blue-500" />
            {errorCode === 'ERR-422'
              ? 'Test Suite Execution Strategy Comparison'
              : 'Test Case Execution Strategy Comparison'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="text-center mb-3">
                <div className="text-2xl mb-2">📋</div>
                <h5 className="font-semibold text-green-900">Sequential</h5>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Recommended
                </span>
              </div>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Tests run one after another</li>
                <li>• Maintains data dependencies</li>
                <li>• Supports dynamic variables</li>
                <li>
                  •{' '}
                  {errorCode === 'ERR-422'
                    ? 'Ensures test suite integrity'
                    : 'Ensures test case reliability'}
                </li>
              </ul>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4 opacity-60">
              <div className="text-center mb-3">
                <div className="text-2xl mb-2">⚡</div>
                <h5 className="font-semibold text-red-900">Parallel</h5>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  Not Supported
                </span>
              </div>
              <ul className="text-xs text-red-800 space-y-1">
                <li>• Tests run simultaneously</li>
                <li>• Breaks data dependencies</li>
                <li>• No dynamic variable support</li>
                <li>
                  •{' '}
                  {errorCode === 'ERR-422'
                    ? 'Causes test suite failures'
                    : 'Causes test case failures'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Users can retry execution with Sequential strategy from the settings
            above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationErrorResultsView;
