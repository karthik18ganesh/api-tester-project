import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChevronLeft, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AssertionResultsView from '../../TestResults/components/AssertionResultsView';
import { testExecution } from '../../../utils/api';
import { getTestCaseDisplayStatus, getStatusBadgeClass } from '../../../utils/testStatusUtils';

// Collapsible component for sections
const Collapsible = ({ children, title, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border rounded">
      <button
        className="w-full flex items-center justify-between p-3 text-left text-sm font-medium bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? (
          <FaChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <FaChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 border-t">
          {children}
        </div>
      )}
    </div>
  );
};

const TestCaseDetailsView = ({ executionId, testCaseId, onBack }) => {
  const [execution, setExecution] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTestCaseIndex, setCurrentTestCaseIndex] = useState(0);
  const [error, setError] = useState(null);
  
  // Get breadcrumb items
  const getBreadcrumbItems = () => {
    return [
      { label: "Test Execution" },
      { label: "Test Results", path: "/test-results" },
      { label: `Execution ${executionId}`, path: `/test-execution/results/${executionId}` },
      { label: "Test Case Details" }
    ];
  };

  // Fetch execution data and test case details
  useEffect(() => {
    const fetchExecutionData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, try to get data from global storage (for mock data compatibility)
        const globalData = window.mockExecutionData?.[executionId];
        
        if (globalData) {
          // Use global mock data
          setExecution(globalData);
          
          const testCaseIndex = globalData.results.findIndex(tc => tc.id === testCaseId);
          if (testCaseIndex !== -1) {
            setTestCase(globalData.results[testCaseIndex]);
            setCurrentTestCaseIndex(testCaseIndex);
          } else {
            setError('Test case not found in execution results');
          }
        } else {
          // Extract the actual execution ID from the client execution ID
          const actualExecutionId = executionId.replace('exec-', '');
          
          try {
            // Fetch real execution data from API
            const executionData = await testExecution.getExecutionDetails(actualExecutionId);
            
            // Transform API data to component format
            const testCaseResults = executionData.testCaseResults || [];
            
            // Find the specific test case by matching testCaseId
            const targetTestCase = testCaseResults.find(tc => `tc-${tc.testCaseId}` === testCaseId);
            
            if (!targetTestCase) {
              setError('Test case not found in execution results');
              return;
            }
            
                          // Create the test case details with enhanced assertion support
              const testCaseDetails = {
                id: testCaseId,
                name: targetTestCase.testCaseName || 'API Test Case',
                status: targetTestCase.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
                duration: `${targetTestCase.executionTimeMs || 0}ms`,
                request: {
                  method: targetTestCase.httpMethod,
                  url: targetTestCase.url,
                  headers: targetTestCase.requestHeaders || {},
                  body: targetTestCase.requestBody
                },
                response: {
                  status: targetTestCase.statusCode,
                  data: targetTestCase.responseBody,
                  headers: targetTestCase.responseHeaders || {}
                },
                // Backend assertion results - use directly when available
                assertionResults: targetTestCase.assertionResults && Array.isArray(targetTestCase.assertionResults) 
                  ? targetTestCase.assertionResults
                  : [], // Empty array when no assertions available
                assertionSummary: targetTestCase.assertionSummary || {
                  total: 0,
                  passed: 0,
                  failed: 0,
                  skipped: 0
                },
                // Legacy compatibility - use backend data or fallback to execution status
                assertions: targetTestCase.assertionResults && Array.isArray(targetTestCase.assertionResults)
                  ? targetTestCase.assertionResults.map((assertion, index) => ({
                      id: assertion.assertionId || index + 1,
                      description: assertion.assertionName || 'Assertion',
                      status: assertion.status === 'PASSED' ? 'Passed' : 'Failed',
                      ...(assertion.status !== 'PASSED' && assertion.errorMessage && {
                        error: assertion.errorMessage
                      })
                    }))
                  : [], // Empty array when no assertions available
                executedBy: executionData.executedBy,
                executionDate: executionData.executionDate,
                testSuiteId: targetTestCase.testSuiteId,
                testSuiteName: targetTestCase.testSuiteName
              };
            
            // Create execution summary
            const transformedExecution = {
              id: executionId,
              status: executionData.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
              instanceId: executionId,
              executedBy: executionData.executedBy,
              environment: executionData.environmentName || 'API Environment',
              executedAt: formatExecutionDate(executionData.executionDate),
              passedCount: executionData.executionSummary?.passedTests || 0,
              failedCount: executionData.executionSummary?.failedTests || 0,
              results: testCaseResults.map((tc, index) => ({
                id: `tc-${tc.testCaseId}`,
                name: tc.testCaseName || `Test Case ${index + 1}`,
                status: tc.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
                duration: `${tc.executionTimeMs || 0}ms`
              }))
            };
            
            setExecution(transformedExecution);
            setTestCase(testCaseDetails);
            
            // Find the index of current test case
            const testCaseIndex = transformedExecution.results.findIndex(tc => tc.id === testCaseId);
            setCurrentTestCaseIndex(testCaseIndex !== -1 ? testCaseIndex : 0);
            
          } catch (apiError) {
            console.error('Error fetching from API:', apiError);
            setError('Failed to load test case details from API');
          }
        }
        
      } catch (error) {
        console.error('Error loading execution data:', error);
        setError('Failed to load test case details');
      } finally {
        setLoading(false);
      }
    };

    if (executionId && testCaseId) {
      fetchExecutionData();
    }
  }, [executionId, testCaseId]);

  // Format execution date
  const formatExecutionDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  // Navigate to next or previous test case
  const navigateToTestCase = (direction) => {
    if (!execution || !execution.results || execution.results.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentTestCaseIndex + 1) % execution.results.length;
    } else {
      newIndex = (currentTestCaseIndex - 1 + execution.results.length) % execution.results.length;
    }
    
    const newTestCase = execution.results[newIndex];
    
    // Update URL and reload the component with new test case
    window.history.pushState(
      null, 
      '', 
      `/test-execution/results/${executionId}/${newTestCase.id}`
    );
    
    // Trigger a reload to fetch the new test case details
    window.location.reload();
  };

  // Format JSON for display
  const formatJSON = (json) => {
    try {
      if (typeof json === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(json);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return json; // Return as-is if not valid JSON
        }
      }
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return String(json);
    }
  };

  // Calculate progress percentage for assertions
  const calculateProgress = () => {
    if (!testCase?.assertions || testCase.assertions.length === 0) {
      // For test cases without assertions, check if they executed successfully
      const displayStatus = getTestCaseDisplayStatus(testCase);
      return displayStatus.isExecutedWithoutAssertions ? 100 : 0;
    }
    const passedCount = testCase.assertions.filter(a => a.status === 'Passed').length;
    return Math.round((passedCount / testCase.assertions.length) * 100);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4 inline-block"></div>
          <p className="text-gray-600">Loading test case details...</p>
        </div>
      </div>
    );
  }

  if (error || !testCase || !execution) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Breadcrumb items={getBreadcrumbItems()} />
        
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaChevronLeft className="mr-2" />
            Back to Execution Results
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Test case not found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {error 
              ? 'There was an error loading the test case details.' 
              : 'The test case you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back to Execution Results
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress();
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FaChevronLeft className="mr-2" />
          Back to Execution Results
        </button>
        
        {execution.results && execution.results.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToTestCase('prev')}
              className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
              title="Previous test case"
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="text-sm text-gray-600">
              Test {currentTestCaseIndex + 1} of {execution.results.length}
            </div>
            <button
              onClick={() => navigateToTestCase('next')}
              className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
              title="Next test case"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-800">{testCase.name}</h1>
          <p className="text-gray-600">Execution ID: {executionId}</p>
          {testCase.testSuiteName && (
            <p className="text-gray-500 text-sm">Suite: {testCase.testSuiteName}</p>
          )}
        </div>
        {(() => {
          const displayStatus = getTestCaseDisplayStatus(testCase);
          const badgeClass = getStatusBadgeClass(displayStatus);
          return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
              {displayStatus.displayText}
            </span>
          );
        })()}
      </div>

      {/* Progress bar */}
      <div className="mb-6 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full ${(() => {
            const displayStatus = getTestCaseDisplayStatus(testCase);
            return displayStatus.displayText === 'Passed' ? 'bg-green-500' : 
                   displayStatus.displayText === 'Executed' ? 'bg-blue-500' : 
                   'bg-red-500';
          })()} transition-all duration-500 ease-in-out`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg shadow-sm p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-gray-800">Request</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
              {testCase.request?.method || 'GET'}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">URL</p>
            <div className="bg-gray-50 p-2 rounded border border-gray-100 font-mono text-sm break-all">
              {testCase.request?.url || 'No URL provided'}
            </div>
          </div>
          
          {testCase.request?.headers && Object.keys(testCase.request.headers).length > 0 && (
            <div className="mb-3">
              <Collapsible title="Headers" defaultOpen={false}>
                <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto border border-gray-100 max-h-60">
                  {formatJSON(testCase.request.headers)}
                </pre>
              </Collapsible>
            </div>
          )}
          
          {testCase.request?.body && (
            <div>
              <Collapsible title="Request Body" defaultOpen={false}>
                <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto border border-gray-100 max-h-60">
                  {formatJSON(testCase.request.body)}
                </pre>
              </Collapsible>
            </div>
          )}
        </div>
        
        <div className="border rounded-lg shadow-sm p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-gray-800">Response</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${
              testCase.response?.status >= 200 && testCase.response?.status < 300
                ? 'bg-green-100 text-green-800'
                : testCase.response?.status >= 400
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              Status: {testCase.response?.status || 'Unknown'}
            </span>
          </div>
          
          {testCase.response?.data && (
            <div>
              <Collapsible title="Response Body" defaultOpen={true}>
                <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto border border-gray-100 max-h-60">
                  {formatJSON(testCase.response.data)}
                </pre>
              </Collapsible>
            </div>
          )}
          
          {testCase.response?.headers && Object.keys(testCase.response.headers).length > 0 && (
            <div className="mt-3">
              <Collapsible title="Response Headers" defaultOpen={false}>
                <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto border border-gray-100 max-h-60">
                  {formatJSON(testCase.response.headers)}
                </pre>
              </Collapsible>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white mb-6">
        <div className="bg-gray-50 p-4 border-b">
          <h2 className="font-semibold text-lg text-gray-800">
            Assertions 
            {testCase.assertionSummary && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({testCase.assertionSummary.passed}/{testCase.assertionSummary.total} passed)
              </span>
            )}
          </h2>
        </div>
        <div className="p-4">
          {testCase.assertionResults && testCase.assertionResults.length > 0 ? (
            <AssertionResultsView 
              assertions={testCase.assertionResults}
              summary={testCase.assertionSummary}
              compact={false}
            />
          ) : testCase.assertions && testCase.assertions.length > 0 ? (
            // Fallback to legacy assertions display
            <div className="space-y-3">
              {testCase.assertions.map((assertion) => (
                <div key={assertion.id} className="p-4 hover:bg-gray-50 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`mt-0.5 rounded-full p-1 mr-3 ${
                        assertion.status === 'Passed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {assertion.status === 'Passed' ? (
                          <FaCheck className="h-4 w-4" />
                        ) : (
                          <FaTimes className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium">Assertion #{assertion.id}</div>
                        <div className="text-gray-600 mt-1">{assertion.description}</div>
                        
                        {assertion.status !== 'Passed' && assertion.error && (
                          <div className="mt-2 bg-red-50 text-red-700 p-2 rounded text-sm border border-red-100">
                            {assertion.error}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assertion.status === 'Passed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assertion.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Test Executed Successfully</h3>
                <p className="text-blue-700 mb-4">
                  This test case executed but had no assertions to validate the response.
                </p>
                <div className="text-sm text-blue-800">
                  Consider adding assertions to validate response data, status codes, or performance metrics.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execution Metadata */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white mb-6">
        <div className="bg-gray-50 p-4 border-b">
          <h2 className="font-semibold text-lg text-gray-800">Execution Details</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Duration</div>
              <div className="font-medium">{testCase.duration}</div>
            </div>
            {testCase.executedBy && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Executed By</div>
                <div className="font-medium">{testCase.executedBy}</div>
              </div>
            )}
            {testCase.executionDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Execution Date</div>
                <div className="font-medium">{formatExecutionDate(testCase.executionDate)}</div>
              </div>
            )}
            {execution.environment && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Environment</div>
                <div className="font-medium">{execution.environment}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Code Snippets (if available) */}
      {testCase.snippets && (
        <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
          <div className="bg-gray-50 p-4 border-b flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="font-semibold text-lg text-gray-800">Code Snippets</h2>
          </div>
          <div className="p-4">
            <Collapsible title="Test Code" defaultOpen={false}>
              <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto border border-gray-100">
                {testCase.snippets.testCode || "// No test code available"}
              </pre>
            </Collapsible>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseDetailsView;