import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChevronLeft, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { testExecution } from '../../../utils/api';

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
          // Extract execution ID from the executionId string if it contains 'exec-'
          const numericExecutionId = executionId.replace('exec-', '');
          
          try {
            // Fetch real execution data from API
            const executionData = await testExecution.getExecutionDetails(numericExecutionId);
            
            // Transform API data to component format
            const transformedExecution = {
              id: executionId,
              status: executionData.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
              instanceId: executionId,
              executedBy: executionData.executedBy,
              environment: 'API Environment',
              executedAt: formatExecutionDate(executionData.executionDate),
              passedCount: executionData.executionStatus === 'PASSED' ? 1 : 0,
              failedCount: executionData.executionStatus === 'FAILED' ? 1 : 0,
              results: [
                {
                  id: testCaseId,
                  name: executionData.testCase?.name || 'API Test Case',
                  status: executionData.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
                  duration: `${executionData.executionTimeMs || 0}ms`,
                  request: {
                    method: executionData.httpMethod,
                    url: executionData.url,
                    headers: executionData.requestHeaders || {},
                    body: executionData.requestBody
                  },
                  response: {
                    status: executionData.statusCode,
                    data: executionData.responseBody,
                    headers: {}
                  },
                  assertions: [
                    {
                      id: 1,
                      description: 'API Response Status Validation',
                      status: executionData.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
                      ...(executionData.executionStatus === 'FAILED' && {
                        error: `Expected successful response but got status ${executionData.statusCode}`
                      })
                    },
                    {
                      id: 2,
                      description: 'Response Time Validation',
                      status: (executionData.executionTimeMs <= 5000) ? 'Passed' : 'Failed',
                      ...(executionData.executionTimeMs > 5000 && {
                        error: `Response time ${executionData.executionTimeMs}ms exceeded 5000ms limit`
                      })
                    }
                  ]
                }
              ]
            };
            
            setExecution(transformedExecution);
            
            // Find the test case
            const testCaseData = transformedExecution.results.find(tc => tc.id === testCaseId);
            if (testCaseData) {
              setTestCase(testCaseData);
              setCurrentTestCaseIndex(0);
            } else {
              setError('Test case not found');
            }
            
          } catch (apiError) {
            console.error('Error fetching from API:', apiError);
            // Fall back to mock data if API fails
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
    
    // Update state and URL
    setTestCase(newTestCase);
    setCurrentTestCaseIndex(newIndex);
    
    window.history.pushState(
      null, 
      '', 
      `/test-execution/results/${executionId}/${newTestCase.id}`
    );
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
    if (!testCase?.assertions || testCase.assertions.length === 0) return 0;
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
    <div className="bg-gray-50 min-h-screen">
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
        </div>
        <div className={`px-3 py-1 rounded-md text-white ${testCase.status === 'Passed' ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}>
          {testCase.status}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full ${testCase.status === 'Passed' ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500 ease-in-out`}
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
          <h2 className="font-semibold text-lg text-gray-800">Assertions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {testCase.assertions && testCase.assertions.map((assertion) => (
            <div key={assertion.id} className="p-4 hover:bg-gray-50">
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

          {(!testCase.assertions || testCase.assertions.length === 0) && (
            <div className="p-4 text-center text-gray-500">
              No assertions found for this test case
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
                <div className="font-medium">{testCase.executionDate}</div>
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