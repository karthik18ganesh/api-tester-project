import React from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiClock, FiCircle, FiCode } from 'react-icons/fi';

const AssertionResultsView = ({ assertions = [], summary = null, compact = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed':
      case 'PASSED':
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'Failed':
      case 'FAILED':
        return <FiX className="w-4 h-4 text-red-600" />;
      case 'ERROR':
        return <FiAlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed':
      case 'PASSED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Failed':
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'ERROR':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'json_path':
        return <FiCircle className="w-3 h-3" />;
      case 'status_code':
        return <FiCode className="w-3 h-3" />;
      case 'response_time':
        return <FiClock className="w-3 h-3" />;
      default:
        return <FiCheck className="w-3 h-3" />;
    }
  };

  if (compact && summary) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <FiCheck className="w-3 h-3 text-green-600" />
          <span className="text-green-700">{summary.passed}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiX className="w-3 h-3 text-red-600" />
          <span className="text-red-700">{summary.failed}</span>
        </div>
        <span className="text-gray-500">({summary.total} total)</span>
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-green-500 h-1.5 rounded-full" 
            style={{ width: `${summary.successRate}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500">{summary.successRate}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      {summary && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Assertion Summary</h4>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full ${
                summary.successRate === 100 ? 'bg-green-100 text-green-700' : 
                summary.successRate >= 70 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {summary.successRate}% Success Rate
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Assertion Details */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <FiCircle className="w-4 h-4" />
          Assertion Details ({assertions.length})
        </h4>
        
        {assertions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No assertions configured for this test case</p>
          </div>
        ) : (
          assertions.map((assertion, index) => (
            <div 
              key={assertion.id || index} 
              className={`border rounded-lg p-4 ${getStatusColor(assertion.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(assertion.status)}
                    <span className="font-medium text-gray-900">
                      {assertion.name || assertion.description || `Assertion ${index + 1}`}
                    </span>
                    {assertion.type && assertion.type !== 'system' && (
                      <span className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full border">
                        {getTypeIcon(assertion.type)}
                        {assertion.type.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  
                  {assertion.path && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Target:</span> 
                      <code className="ml-1 bg-white px-1 rounded text-xs">{assertion.path}</code>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {assertion.expectedValue !== undefined && (
                      <div>
                        <span className="text-gray-600">Expected:</span>
                        <div className="mt-1 p-2 bg-white rounded border text-xs font-mono break-all">
                          {JSON.stringify(assertion.expectedValue)}
                        </div>
                      </div>
                    )}
                    
                    {assertion.actualValue !== undefined && (
                      <div>
                        <span className="text-gray-600">Actual:</span>
                        <div className="mt-1 p-2 bg-white rounded border text-xs font-mono break-all">
                          {JSON.stringify(assertion.actualValue)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {assertion.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <FiX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-red-900 mb-1">Error Details</div>
                          <div className="text-red-700">{assertion.error}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assertion.status === 'Passed' || assertion.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                    assertion.status === 'Failed' || assertion.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {assertion.status}
                  </span>
                  
                  {assertion.executionTime !== undefined && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {assertion.executionTime}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssertionResultsView; 