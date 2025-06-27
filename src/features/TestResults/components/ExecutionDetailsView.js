import React, { useState } from 'react';
import { FaCheck, FaTimes, FaChevronLeft, FaUserCircle, FaClock, FaServer, FaCalendarAlt, FaFileAlt, FaDownload, FaShare, FaBullseye } from 'react-icons/fa';
import AssertionSummaryCard from './AssertionSummaryCard';
import AssertionResultsList from './AssertionResultsList';

// Status Badge component
const StatusBadge = ({ status }) => {
  const getStatusStyling = (status) => {
    if (status === 'PASSED' || status === 'Passed') {
      return 'bg-green-500 text-white';
    } else if (status === 'EXECUTED' || status === 'Executed') {
      return 'bg-blue-500 text-white';
    } else {
      return 'bg-red-500 text-white';
    }
  };

  const getDisplayText = (status) => {
    if (status === 'PASSED') return 'Passed';
    if (status === 'EXECUTED') return 'Executed';
    if (status === 'FAILED') return 'Failed';
    return status; // fallback for already processed statuses
  };

  const displayText = getDisplayText(status);
  
  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium shadow-sm ${getStatusStyling(status)}`}
    >
      {(status === 'PASSED' || status === 'Passed' || status === 'EXECUTED' || status === 'Executed') ? (
        <FaCheck className="mr-1" />
      ) : (
        <FaTimes className="mr-1" />
      )}
      {displayText}
    </span>
  );
};

const ExecutionDetailsView = ({ execution, onBack, onViewTestCase }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Debug: Log the execution data to see what we're receiving
  console.log('ExecutionDetailsView received execution data:', execution);

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

  // Calculate summary statistics including "Executed" status for test cases with no assertions
  const totalTests = execution.results.length;
  const passedTests = execution.results.filter(r => r.status === 'Passed').length;
  const executedTests = execution.results.filter(r => r.status === 'Executed').length;
  const failedTests = execution.results.filter(r => r.status === 'Failed').length;
  const successfulTests = passedTests + executedTests; // Both passed and executed are successful
  const successRate = totalTests ? Math.round((successfulTests / totalTests) * 100) : 0;

  // Calculate assertion summary
  const assertionSummary = execution.assertionSummary || 
    (execution.results && execution.results.length > 0 ? {
      total: execution.results.reduce((sum, result) => sum + (result.assertionSummary?.total || 0), 0),
      passed: execution.results.reduce((sum, result) => sum + (result.assertionSummary?.passed || 0), 0),
      failed: execution.results.reduce((sum, result) => sum + (result.assertionSummary?.failed || 0), 0),
      skipped: execution.results.reduce((sum, result) => sum + (result.assertionSummary?.skipped || 0), 0)
    } : null);

  // Collect all assertion results
  const allAssertionResults = execution.results.flatMap(result => 
    (result.assertionResults || []).map(assertion => ({
      ...assertion,
      testCaseId: result.id,
      testCaseName: result.name
    }))
  );

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
          <StatusBadge status={execution.executionStatus || execution.status || 'FAILED'} />
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('testcases')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'testcases'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Test Cases
        </button>
        {assertionSummary && assertionSummary.total > 0 && (
          <button
            onClick={() => setActiveTab('assertions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'assertions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
                         <FaBullseye className="w-3 h-3" />
            Assertions
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {assertionSummary.total}
            </span>
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Assertion Summary Card */}
          {assertionSummary && assertionSummary.total > 0 && (
            <div className="mb-6">
              <AssertionSummaryCard 
                summary={assertionSummary}
                showDetails={false}
                compact={false}
              />
            </div>
          )}

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
          
          <div className={`flex items-center ${executedTests > 0 ? 'gap-6' : 'gap-8'}`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalTests}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-gray-500">Passed</div>
            </div>
            
            {executedTests > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{executedTests}</div>
                <div className="text-sm text-gray-500">Executed</div>
              </div>
            )}
            
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
              {executedTests > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Executed: {executedTests} tests
                </div>
              )}
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
                <span className="text-green-600 font-medium">{passedTests}</span> passed
                {executedTests > 0 && (
                  <>
                    {' / '}
                    <span className="text-blue-600 font-medium">{executedTests}</span> executed
                  </>
                )}
                {' / '}
                <span className="text-red-600 font-medium">{failedTests}</span> failed
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
                      
                      {/* Show assertion info */}
                      {result.assertionSummary && result.assertionSummary.total > 0 && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <FaBullseye className="mr-1 h-3 w-3" />
                          <span className="text-green-600">{result.assertionSummary.passed}</span>
                          {result.assertionSummary.failed > 0 && (
                            <>
                              <span className="text-gray-400">/</span>
                              <span className="text-red-600">{result.assertionSummary.failed}</span>
                            </>
                          )}
                          <span className="text-gray-400 ml-1">assertions</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      result.status === 'Passed' 
                        ? 'bg-green-100 text-green-800' 
                        : result.status === 'Executed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status === 'Passed' ? (
                        <span className="flex items-center">
                          <FaCheck className="mr-1 h-3 w-3" /> Passed
                        </span>
                      ) : result.status === 'Executed' ? (
                        <span className="flex items-center">
                          <FaCheck className="mr-1 h-3 w-3" /> Executed
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
        </>
      )}

      {/* Test Cases Tab */}
      {activeTab === 'testcases' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Test Cases</h2>
            
            <div className="text-sm text-gray-500">
              <span className="text-green-600 font-medium">{passedTests}</span> passed
              {executedTests > 0 && (
                <>
                  {' / '}
                  <span className="text-blue-600 font-medium">{executedTests}</span> executed
                </>
              )}
              {' / '}
              <span className="text-red-600 font-medium">{failedTests}</span> failed
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
                    
                    {/* Show assertion info */}
                    {result.assertionSummary && result.assertionSummary.total > 0 && (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <FaBullseye className="mr-1 h-3 w-3" />
                        <span className="text-green-600">{result.assertionSummary.passed}</span>
                        {result.assertionSummary.failed > 0 && (
                          <>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-600">{result.assertionSummary.failed}</span>
                          </>
                        )}
                        <span className="text-gray-400 ml-1">assertions</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.status === 'Passed' 
                      ? 'bg-green-100 text-green-800' 
                      : result.status === 'Executed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status === 'Passed' ? (
                      <span className="flex items-center">
                        <FaCheck className="mr-1 h-3 w-3" /> Passed
                      </span>
                    ) : result.status === 'Executed' ? (
                      <span className="flex items-center">
                        <FaCheck className="mr-1 h-3 w-3" /> Executed
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
      )}

      {/* Assertions Tab */}
      {activeTab === 'assertions' && assertionSummary && assertionSummary.total > 0 && (
        <div className="space-y-6">
          <AssertionSummaryCard 
            summary={assertionSummary}
            showDetails={true}
            compact={false}
          />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">All Assertion Results</h2>
            </div>
            <div className="p-4">
              <AssertionResultsList 
                results={allAssertionResults}
                groupBy="testCase"
                showExecutionTime={true}
                compact={false}
                searchable={true}
                filterable={true}
                sortable={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionDetailsView;