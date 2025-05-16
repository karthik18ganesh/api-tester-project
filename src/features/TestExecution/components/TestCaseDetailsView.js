import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChevronLeft, FaChevronDown, FaChevronRight, FaCode, FaExternalLinkAlt } from 'react-icons/fa';
import { executionResults as mockExecutionData } from '../data/mockData';

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
  
  // Fetch execution data and find the test case
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Get execution data from mock or window data
      const executionData = mockExecutionData[executionId] || 
                          (window.mockExecutionData && window.mockExecutionData[executionId]);
      
      if (executionData) {
        setExecution(executionData);
        
        // Find the test case and its index
        const testCaseIndex = executionData.results.findIndex(tc => tc.id === testCaseId);
        if (testCaseIndex !== -1) {
          setTestCase(executionData.results[testCaseIndex]);
          setCurrentTestCaseIndex(testCaseIndex);
        }
      }
      
      setLoading(false);
    }, 500);
  }, [executionId, testCaseId]);

  // Navigate to next or previous test case
  const navigateToTestCase = (direction) => {
    if (!execution || !execution.results || execution.results.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentTestCaseIndex + 1) % execution.results.length;
    } else {
      newIndex = (currentTestCaseIndex - 1 + execution.results.length) % execution.results.length;
    }
    
    const newTestCaseId = execution.results[newIndex].id;
    
    // In a real app with react-router, you would use:
    // navigate(`/test-execution/results/${executionId}/${newTestCaseId}`);
    
    // For this demo, update state and URL
    setTestCase(execution.results[newIndex]);
    setCurrentTestCaseIndex(newIndex);
    
    window.history.pushState(
      null, 
      '', 
      `/test-execution/results/${executionId}/${newTestCaseId}`
    );
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback if no onBack prop
      window.history.pushState(
        null, 
        '', 
        `/test-execution/results/${executionId}`
      );
      window.location.reload(); // In a real app with react-router, this wouldn't be needed
    }
  };

  // Format JSON for display
  const formatJSON = (json) => {
    return JSON.stringify(json, null, 2);
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

  if (!testCase || !execution) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaChevronLeft className="mr-2" />
            Back to Execution Results
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Test case not found</h3>
          <p className="text-gray-500 mb-4">The test case you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBack}
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
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FaChevronLeft className="mr-2" />
          Back to Execution Results
        </button>
        
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
          
          {testCase.request?.headers && (
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
          
          {testCase.response?.headers && (
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
      
      {testCase.snippets && (
        <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
          <div className="bg-gray-50 p-4 border-b flex items-center">
            <FaCode className="text-gray-500 mr-2" />
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
      
      {/* Actions footer */}
      <div className="mt-8 flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            onClick={() => navigateToTestCase('prev')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 flex items-center"
          >
            <FaChevronLeft className="mr-2" />
            Previous Test
          </button>
          <button 
            onClick={() => navigateToTestCase('next')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 flex items-center"
          >
            Next Test
            <FaChevronRight className="ml-2" />
          </button>
        </div>
        
        <div>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            View All Results
            <FaExternalLinkAlt className="ml-2 h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetailsView;