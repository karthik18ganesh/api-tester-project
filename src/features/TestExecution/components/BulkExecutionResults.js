import React, { useState } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiEye,
  FiLayers,
  FiClock,
  FiActivity,
  FiX,
} from 'react-icons/fi';
import { bulkExecutionService } from '../services/bulkExecutionService';
import Badge from '../../../components/UI/Badge';

const BulkExecutionResults = ({ results, onClose, onViewInTestResults }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'details'

  const getStatusIcon = (status) => {
    return status === 'PASSED' ? (
      <FiCheckCircle className="text-green-600" />
    ) : (
      <FiXCircle className="text-red-600" />
    );
  };

  const getStatusColor = (status) => {
    return status === 'PASSED'
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';
  };

  const handleDownloadResults = () => {
    bulkExecutionService.downloadBulkResults(results, 'excel');
  };

  const handleViewInTestResults = () => {
    // Store the bulk execution data in session storage for Test Results module
    sessionStorage.setItem(
      `bulk-execution-${results.executionId}`,
      JSON.stringify(results)
    );
    onViewInTestResults(results.executionId);
  };

  const successRate = ((results.passed / results.totalTests) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with Bulk Indicator */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FiLayers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Bulk Execution Complete
              </h3>
              <p className="text-blue-100 text-sm">
                Test Case: {results.testCaseId} | {results.totalTests}{' '}
                iterations
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            <FiLayers className="h-3 w-3 mr-1" />
            Bulk Mode
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FiActivity className="h-5 w-5 text-gray-400" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {results.totalTests}
            </div>
            <div className="text-xs text-gray-600 mt-1">Test Iterations</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <FiCheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-xs text-gray-500">Passed</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {results.passed}
            </div>
            <div className="text-xs text-gray-600 mt-1">Successful</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <FiXCircle className="h-5 w-5 text-red-500" />
              <span className="text-xs text-gray-500">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {results.failed}
            </div>
            <div className="text-xs text-gray-600 mt-1">Failed</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <FiClock className="h-5 w-5 text-blue-500" />
              <span className="text-xs text-gray-500">Duration</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {(results.totalDuration / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Time</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <div
                className={`text-2xl font-bold ${successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}
              >
                {successRate}%
              </div>
            </div>
            <div className="text-xs text-gray-600">Success Rate</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${successRate >= 80 ? 'bg-green-500' : successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDownloadResults}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiDownload className="h-4 w-4" />
            Download Results
          </button>
          <button
            onClick={handleViewInTestResults}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FiEye className="h-4 w-4" />
            View in Test Results
          </button>
        </div>

        {/* Toggle View Mode */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'summary'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Summary View
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'details'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Detailed View
          </button>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Row ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                {viewMode === 'details' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assertions
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.results.map((result, index) => (
                <tr
                  key={result.rowId}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{result.rowId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {result.testName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}
                    >
                      {getStatusIcon(result.status)}
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {result.method}
                    </span>
                  </td>
                  {viewMode === 'details' && (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        <span className="font-mono text-xs" title={result.url}>
                          {result.url}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {result.statusCode || 'N/A'}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {result.executionTime}ms
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {result.assertionSummary &&
                    result.assertionSummary.total > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xs">
                          {result.assertionSummary.passed}✓
                        </span>
                        {result.assertionSummary.failed > 0 && (
                          <span className="text-red-600 text-xs">
                            {result.assertionSummary.failed}✗
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No assertions
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">
                  Test Details: {selectedResult.testName}
                </h4>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(selectedResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkExecutionResults;

