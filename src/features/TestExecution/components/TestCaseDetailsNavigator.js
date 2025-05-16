import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChevronLeft, FaChevronDown, FaChevronRight, FaCode } from 'react-icons/fa';

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

const TestCaseDetailsNavigator = ({ executionId, testCases, currentTestCaseId, onNavigate, onBack }) => {
  const [testCase, setTestCase] = useState(null);
  
  // Find current test case and next/previous test cases
  useEffect(() => {
    if (!testCases || testCases.length === 0) return;
    
    const currentIndex = testCases.findIndex(tc => tc.id === currentTestCaseId);
    if (currentIndex !== -1) {
      setTestCase(testCases[currentIndex]);
    }
  }, [testCases, currentTestCaseId]);

  // Navigate to next or previous test case
  const navigateToTestCase = (direction) => {
    if (!testCases || testCases.length === 0) return;
    
    const currentIndex = testCases.findIndex(tc => tc.id === currentTestCaseId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % testCases.length;
    } else {
      newIndex = (currentIndex - 1 + testCases.length) % testCases.length;
    }
    
    onNavigate(executionId, testCases[newIndex].id);
  };

  // Format JSON for display
  const formatJSON = (json) => {
    return JSON.stringify(json, null, 2);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!testCase?.assertions || testCase.assertions.length === 0) return 0;
    const passedCount = testCase.assertions.filter(a => a.status === 'Passed').length;
    return Math.round((passedCount / testCase.assertions.length) * 100);
  };

  if (!testCase) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 p-10">Test case not found</div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const progressPercentage = calculateProgress();
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FaChevronLeft className="mr-2" />
          Back to Execution
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
            Test {testCases.findIndex(tc => tc.id === currentTestCaseId) + 1} of {testCases.length}
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

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
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
        <div className="mt-6 border rounded-lg shadow-sm overflow-hidden bg-white">
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
    </div>
  );
};

export default TestCaseDetailsNavigator;