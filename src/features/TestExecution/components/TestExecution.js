import React, { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaChevronDown, FaCog, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EnhancedTestHierarchy from '../components/EnhancedTestHierarchy';
import ExecutionResultsCard from './ExecutionResultsCard';
import TestCaseDetailsNavigator from './TestCaseDetailsNavigator';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { api } from '../../../utils/api';

const ModernTestExecution = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    environment: 'Staging',
    stopOnFailure: false,
    notifyOnCompletion: true,
    retryCount: 1
  });
  const [viewMode, setViewMode] = useState('execution');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [testHierarchy, setTestHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the hierarchy from the API
  const fetchHierarchy = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api('/api/v1/packages/hierarchy', 'GET');
      
      // Handle different response formats
      let data;
      if (Array.isArray(response)) {
        // Direct array response
        data = response;
      } else if (response && response.result && response.result.data) {
        // Nested response format
        data = response.result.data;
      } else if (response && Array.isArray(response.data)) {
        // Response with data property
        data = response.data;
      } else {
        console.warn('Unexpected API response format:', response);
        setError('Invalid response format from server');
        return;
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Expected array but received:', data);
        setError('Invalid data format - expected array of packages');
        return;
      }
      
      // Map API response to tree format
      const mapped = {
        id: 'root',
        type: 'root',
        name: 'All Test Packages',
        children: data.map(pkg => ({
          id: `package-${pkg.id}`,
          type: 'package',
          name: pkg.packageName,
          packageId: pkg.id,
          children: (pkg.testSuites || []).map(suite => ({
            id: `suite-${suite.id}`,
            type: 'suite',
            name: suite.suiteName,
            suiteId: suite.id,
            children: (suite.testCases || []).map(tc => ({
              id: `case-${tc.id}`,
              type: 'case',
              name: tc.caseName,
              caseId: tc.id,
              children: []
            }))
          }))
        }))
      };
      
      setTestHierarchy(mapped);
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
      setError(err.message || 'Failed to load test hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const getBreadcrumbItems = () => {
    const items = [{ label: "Test Execution" }];
    
    if (viewMode === 'execution') {
      items.push({ label: "Execute Tests" });
    } else if (viewMode === 'testcase' && executionResult) {
      items.push(
        { label: "Execute Tests", path: "/test-execution" },
        { label: `Execution ${executionResult.id}` },
        { label: "Test Case Details" }
      );
    }
    
    return items;
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const handleRun = () => {
    if (!selectedItem) return;
    
    setExecuting(true);
    setExecutionResult(null);

    // Simulate API call for test execution
    setTimeout(() => {
      setExecuting(false);
      const executionId = `exec-${Date.now().toString().substring(6)}`;
      
      // Create mock execution result based on selected item
      const newResult = {
        id: executionId,
        status: Math.random() > 0.7 ? 'Failed' : 'Passed',
        instanceId: executionId,
        executedBy: 'current.user',
        environment: settings.environment,
        executedAt: new Date().toLocaleString(),
        passedCount: Math.floor(Math.random() * 5) + 1,
        failedCount: Math.floor(Math.random() * 2),
        results: [
          {
            id: 'tc-001',
            name: 'Valid Login Test',
            status: 'Passed',
            duration: '0.84s',
            request: {
              method: 'POST',
              url: 'https://api.example.com/auth/login',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token123'
              }
            },
            response: {
              status: 200,
              data: {
                success: true,
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                  id: 1,
                  username: 'testuser'
                }
              }
            },
            assertions: [
              { id: 1, description: 'Status code is 200', status: 'Passed' },
              { id: 2, description: 'Response has token property', status: 'Passed' },
              { id: 3, description: 'Response time is less than 1000ms', status: 'Passed' }
            ]
          },
          {
            id: 'tc-002',
            name: 'Invalid Credentials Test',
            status: 'Passed',
            duration: '0.92s',
            request: {
              method: 'POST',
              url: 'https://api.example.com/auth/login',
              headers: {
                'Content-Type': 'application/json'
              }
            },
            response: {
              status: 401,
              data: {
                success: false,
                message: 'Invalid credentials'
              }
            },
            assertions: [
              { id: 1, description: 'Status code is 401', status: 'Passed' },
              { id: 2, description: 'Response contains error message', status: 'Passed' }
            ]
          },
          {
            id: 'tc-003',
            name: 'Password Reset Test',
            status: Math.random() > 0.5 ? 'Passed' : 'Failed',
            duration: '1.15s',
            request: {
              method: 'POST',
              url: 'https://api.example.com/auth/reset-password',
              headers: {
                'Content-Type': 'application/json'
              }
            },
            response: {
              status: 200,
              data: {
                success: true,
                message: 'Password reset email sent'
              }
            },
            assertions: [
              { id: 1, description: 'Status code is 200', status: 'Passed' },
              { id: 2, description: 'Response confirms email sent', status: 'Passed' }
            ]
          }
        ]
      };
      
      setExecutionResult(newResult);
      
      // Store in global object for navigation
      window.mockExecutionData = window.mockExecutionData || {};
      window.mockExecutionData[executionId] = newResult;
    }, 3000);
  };

  const handleViewDetails = (testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setViewMode('testcase');
    
    if (executionResult) {
      window.history.pushState(
        null,
        '',
        `/test-execution/results/${executionResult.id}/${testCaseId}`
      );
    }
  };

  const handleViewAllResults = () => {
    if (executionResult) {
      // Store execution data globally for the results page
      window.mockExecutionData = window.mockExecutionData || {};
      window.mockExecutionData[executionResult.id] = executionResult;
      navigate('/test-results');
    }
  };

  const handleNavigateTestCase = (executionId, testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    window.history.pushState(
      null,
      '',
      `/test-execution/results/${executionId}/${testCaseId}`
    );
  };

  const handleBackToExecution = () => {
    setViewMode('execution');
    setSelectedTestCaseId(null);
    window.history.pushState(null, '', '/test-execution');
  };

  const handleSettingChange = (name, value) => {
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleRetry = () => {
    fetchHierarchy();
  };

  // Test Case details view
  if (viewMode === 'testcase' && executionResult) {
    return (
      <div className="p-6 font-inter text-gray-800">
        <Breadcrumb items={getBreadcrumbItems()} />
        <TestCaseDetailsNavigator
          executionId={executionResult.id}
          testCases={executionResult.results}
          currentTestCaseId={selectedTestCaseId}
          onNavigate={handleNavigateTestCase}
          onBack={handleBackToExecution}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb items={getBreadcrumbItems()} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Test Execution</h1>
          <p className="text-gray-600">Run test packages, suites, or individual cases</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FaCog className="text-gray-500" />
              <span>Settings</span>
              <FaChevronDown className={`ml-1 text-gray-400 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10 animate-fade-in">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Execution Settings</h3>
                </div>
                <div className="p-3">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <select
                      value={settings.environment}
                      onChange={(e) => handleSettingChange('environment', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Development">Development</option>
                      <option value="Staging">Staging</option>
                      <option value="Production">Production</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="stopOnFailure"
                      checked={settings.stopOnFailure}
                      onChange={(e) => handleSettingChange('stopOnFailure', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="stopOnFailure" className="ml-2 block text-sm text-gray-700">
                      Stop on first failure
                    </label>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="notifyOnCompletion"
                      checked={settings.notifyOnCompletion}
                      onChange={(e) => handleSettingChange('notifyOnCompletion', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnCompletion" className="ml-2 block text-sm text-gray-700">
                      Notify on completion
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retry Count</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={settings.retryCount}
                      onChange={(e) => handleSettingChange('retryCount', parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={executing ? null : handleRun}
            disabled={!selectedItem || executing}
            className={`flex items-center px-4 py-2 rounded-md text-white shadow-sm transition-colors ${
              !selectedItem || executing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {executing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <FaPlay className="mr-2" />
                Run {selectedItem?.type === 'package'
                  ? 'Package'
                  : selectedItem?.type === 'suite'
                    ? 'Suite'
                    : selectedItem?.type === 'case'
                      ? 'Test Case'
                      : 'Selection'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Hierarchy Panel */}
        <div className="h-[calc(100vh-200px)]">
          {loading ? (
            <div className="border rounded-md p-4 h-full bg-white shadow-sm flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading test hierarchy...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your test structure</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-6 h-full bg-white shadow-sm flex flex-col items-center justify-center text-center">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Test Hierarchy</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                {error === 'Invalid response format from server' 
                  ? 'The server returned an unexpected response format. Please contact your administrator.'
                  : error}
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaSync className="mr-2 h-4 w-4" />
                Retry
              </button>
            </div>
          ) : !testHierarchy || (testHierarchy.children && testHierarchy.children.length === 0) ? (
            <div className="border rounded-md p-6 h-full bg-white shadow-sm flex flex-col items-center justify-center text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Packages Found</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                You don't have any test packages created yet. Create test packages, suites, and cases to start running tests.
              </p>
              <button
                onClick={() => navigate('/test-design/test-package')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Test Package
              </button>
            </div>
          ) : (
            <EnhancedTestHierarchy
              data={testHierarchy}
              onSelect={handleSelect}
              selectedId={selectedItem?.id}
            />
          )}
        </div>

        {/* Execution Results Panel */}
        <div className="h-[calc(100vh-200px)]">
          <ExecutionResultsCard
            results={executionResult}
            inProgress={executing}
            onViewDetails={handleViewDetails}
            onViewAllResults={handleViewAllResults}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernTestExecution;