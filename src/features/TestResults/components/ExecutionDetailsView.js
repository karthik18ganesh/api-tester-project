import React from 'react';
import { FaCheck, FaTimes, FaChevronLeft, FaUserCircle, FaClock, FaServer, FaCalendarAlt, FaFileAlt, FaDownload, FaShare } from 'react-icons/fa';

// Status Badge component
const StatusBadge = ({ status }) => (
  <span 
    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium shadow-sm ${
      status === 'Passed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}
  >
    {status === 'Passed' ? (
      <FaCheck className="mr-1" />
    ) : (
      <FaTimes className="mr-1" />
    )}
    {status}
  </span>
);

const ExecutionDetailsView = ({ execution, onBack, onViewTestCase }) => {
  const handleViewTestCase = (testCaseId) => {
    // Navigate to test case details view
    if (onViewTestCase) {
      onViewTestCase(testCaseId);
    } else {
      // Fallback navigation using URL manipulation
      window.history.pushState(
        null, 
        '', 
        `/test-execution/results/${execution.id}/${testCaseId}`
      );
      // Trigger a page reload to show the test case details
      window.location.reload();
    }
  };

  if (!execution) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 p-10">Execution details not found</div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Calculate summary statistics
  const totalTests = execution.results.length;
  const passedTests = execution.results.filter(r => r.status === 'Passed').length;
  const failedTests = totalTests - passedTests;
  const successRate = totalTests ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FaChevronLeft className="mr-2" />
          Back to Results
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Execution Details</h1>
          <p className="text-gray-600">Execution ID: {execution.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
            <FaDownload className="text-gray-500" size={14} />
            Export
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
            <FaShare className="text-gray-500" size={14} />
            Share
          </button>
          <StatusBadge status={execution.failedCount > 0 ? 'Failed' : 'Passed'} />
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-700 mb-4">Execution Summary</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <FaFileAlt className="mr-1" size={12} /> Instance ID
              </div>
              <div className="font-medium text-sm">{execution.instanceId}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <FaUserCircle className="mr-1" size={12} /> Executed By
              </div>
              <div className="font-medium text-sm">{execution.executedBy}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <FaServer className="mr-1" size={12} /> Environment
              </div>
              <div className="font-medium text-sm">{execution.environment}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <FaCalendarAlt className="mr-1" size={12} /> Executed At
              </div>
              <div className="font-medium text-sm">{execution.executedAt}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-700 mb-4">Test Results</h2>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalTests}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-gray-500">Passed</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-700 mb-4">Success Rate</h2>
          
          <div className="flex items-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={successRate >= 80 ? "#10B981" : successRate >= 50 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="3"
                  strokeDasharray={`${successRate}, 100`}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-3xl font-bold">{successRate}%</div>
              </div>
            </div>
            
            <div className="ml-4">
              <div className="text-sm text-gray-600 mb-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Passed: {passedTests} tests
              </div>
              <div className="text-sm text-gray-600">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Failed: {failedTests} tests
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Test Results Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Test Cases</h2>
          
          <div className="text-sm text-gray-500">
            <span className="text-green-600 font-medium">{passedTests}</span> passed / 
            <span className="text-red-600 font-medium ml-1">{failedTests}</span> failed
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {execution.results.map((result) => (
            <div 
              key={result.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
              onClick={() => handleViewTestCase(result.id)}
            >
              <div>
                <div className="font-medium">{result.name}</div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <FaClock className="mr-1 h-3 w-3" /> {result.duration}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  result.status === 'Passed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status === 'Passed' ? (
                    <span className="flex items-center">
                      <FaCheck className="mr-1 h-3 w-3" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaTimes className="mr-1 h-3 w-3" /> Failed
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the row click
                    handleViewTestCase(result.id);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetailsView;