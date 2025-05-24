import React from 'react';
import { FaCheck, FaTimes, FaFileAlt, FaClock, FaUser, FaServer, FaCalendarAlt, FaExternalLinkAlt, FaLayerGroup, FaVial } from 'react-icons/fa';

const ExecutionResultsCard = ({ results, inProgress, onViewDetails, onViewAllResults }) => {
  if (!results && !inProgress) {
    return (
      <div className="border rounded-md bg-white shadow-sm p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <FaFileAlt className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Select and run a test to see results</p>
        <p className="text-gray-400 text-sm mt-2">Results will appear here after execution</p>
      </div>
    );
  }

  const executionInfo = results || { 
    instanceId: 'In Progress', 
    executedBy: '-', 
    environment: '-', 
    executedAt: '-',
    passedCount: 0,
    failedCount: 0,
    totalTests: 0,
    results: []
  };

  // Calculate additional statistics
  const totalTests = executionInfo.totalTests || executionInfo.results.length;
  const successRate = totalTests > 0 ? Math.round((executionInfo.passedCount / totalTests) * 100) : 0;
  const avgDuration = executionInfo.results.length > 0 
    ? Math.round(executionInfo.results.reduce((sum, result) => {
        const duration = parseFloat(result.duration?.replace('ms', '') || '0');
        return sum + duration;
      }, 0) / executionInfo.results.length)
    : 0;

  return (
    <div className="border rounded-md p-5 h-full overflow-auto bg-white shadow-sm">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-lg text-gray-800">Execution Details</h2>
          <div className={`px-3 py-1 rounded-md text-white text-sm font-medium shadow-sm ${
            inProgress 
              ? 'bg-yellow-500' 
              : executionInfo.failedCount > 0 
                ? 'bg-red-500' 
                : 'bg-green-500'
          }`}>
            {inProgress ? 'In Progress' : executionInfo.failedCount > 0 ? 'Failed' : 'Passed'}
          </div>
        </div>
        
        {/* Execution summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <FaFileAlt className="mr-1" /> Instance ID
            </div>
            <div className="font-medium text-sm truncate">{executionInfo.instanceId}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <FaUser className="mr-1" /> Executed By
            </div>
            <div className="font-medium text-sm truncate">{executionInfo.executedBy}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <FaServer className="mr-1" /> Environment
            </div>
            <div className="font-medium text-sm truncate">{executionInfo.environment}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <FaCalendarAlt className="mr-1" /> Executed At
            </div>
            <div className="font-medium text-sm truncate">{executionInfo.executedAt}</div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Tests</div>
              <div className="text-2xl font-bold text-indigo-700">
                {totalTests}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Passed</div>
              <div className="text-2xl font-bold text-green-600">{executionInfo.passedCount}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-600">{executionInfo.failedCount}</div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Success Rate</div>
              <div className={`text-2xl font-bold ${
                successRate >= 80 ? 'text-green-600' : 
                successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {successRate}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalTests > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{executionInfo.passedCount + executionInfo.failedCount} / {totalTests}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${(executionInfo.passedCount / totalTests) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${(executionInfo.failedCount / totalTests) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Statistics */}
        {!inProgress && executionInfo.results.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center text-xs text-blue-600 mb-1">
                <FaClock className="mr-1" /> Avg Duration
              </div>
              <div className="font-medium text-sm text-blue-700">{avgDuration}ms</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center text-xs text-purple-600 mb-1">
                <FaLayerGroup className="mr-1" /> Test Type
              </div>
              <div className="font-medium text-sm text-purple-700">
                {executionInfo.selectedItem?.type === 'package' ? 'Package' :
                 executionInfo.selectedItem?.type === 'suite' ? 'Suite' :
                 executionInfo.selectedItem?.type === 'case' ? 'Test Case' : 'Mixed'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-md text-gray-700">Test Cases</h3>
          
          {!inProgress && results?.results.length > 0 && (
            <button 
              onClick={onViewAllResults}
              className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md transition-colors flex items-center"
            >
              <span>View All Results</span>
              <FaExternalLinkAlt className="ml-1 h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          {inProgress ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-gray-600">Running tests...</p>
              <p className="text-gray-400 text-xs mt-1">This may take a few moments</p>
            </div>
          ) : results?.results.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {results.results.map((result) => (
                <div 
                  key={result.id}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="font-medium">{result.name}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                        <div className="flex items-center">
                          <FaClock className="mr-1 h-3 w-3" /> 
                          {result.duration}
                        </div>
                        {result.executedBy && (
                          <div className="flex items-center">
                            <FaUser className="mr-1 h-3 w-3" /> 
                            {result.executedBy}
                          </div>
                        )}
                        {result.request?.method && (
                          <div className="flex items-center">
                            <FaVial className="mr-1 h-3 w-3" /> 
                            {result.request.method}
                          </div>
                        )}
                      </div>
                      
                      {/* Show execution details */}
                      {result.executionDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          Executed: {result.executionDate}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                        result.status === 'Passed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'Passed' ? (
                          <FaCheck className="mr-1 h-3 w-3" />
                        ) : (
                          <FaTimes className="mr-1 h-3 w-3" />
                        )}
                        {result.status}
                      </span>
                      <button
                        onClick={() => onViewDetails(result.id)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Show failed assertions count */}
                  {result.assertions && result.status === 'Failed' && (
                    <div className="mt-2 text-xs text-red-600">
                      {result.assertions.filter(a => a.status === 'Failed').length} assertion(s) failed
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : results?.error ? (
            <div className="p-6 text-center text-red-600">
              <FaTimes className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Execution Error</div>
              <div className="text-sm mt-1">{results.error}</div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FaVial className="h-8 w-8 mx-auto mb-2" />
              No test results available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionResultsCard;