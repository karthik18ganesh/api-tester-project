import React, { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaChevronDown, FaCog } from 'react-icons/fa';
import EnhancedTestHierarchy from '../components/EnhancedTestHierarchy';
import ExecutionResultsCard from './ExecutionResultsCard';
import TestCaseDetailsNavigator from './TestCaseDetailsNavigator';
import { testHierarchy as mockTestHierarchy, executionResults as mockExecutionData } from '../data/mockData';

const ModernTestExecution = () => {
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
  const [viewMode, setViewMode] = useState('execution'); // 'execution', 'testcase'
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);

  // Mock data for the component
  const testHierarchy = mockTestHierarchy;

  // On component mount, check if there's a test case ID in the URL
  useEffect(() => {
    // In a real implementation, you would use react-router's useParams() or similar
    // For this demo, we'll simulate it by checking window.location.pathname
    const path = window.location.pathname;
    const matches = path.match(/\/test-execution\/results\/([^\/]+)\/([^\/]+)/);
    
    if (matches && matches.length === 3) {
      const executionId = matches[1];
      const testCaseId = matches[2];
      
      // Find execution data
      if (mockExecutionData[executionId]) {
        setExecutionResult(mockExecutionData[executionId]);
        setSelectedTestCaseId(testCaseId);
        setViewMode('testcase');
      }
    }
  }, []);

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const handleRun = () => {
    if (!selectedItem) return;

    setExecuting(true);
    setExecutionResult(null);
    
    // Simulate execution delay
    setTimeout(() => {
      setExecuting(false);
      
      // Use a random execution ID based on timestamp
      const executionId = `exec-${Date.now().toString().substring(6)}`;
      
      // Mock execution result
      const newResult = {
        id: executionId,
        status: Math.random() > 0.7 ? 'Failed' : 'Passed', // 30% chance of failure
        instanceId: executionId,
        executedBy: 'current.user',
        environment: settings.environment,
        executedAt: new Date().toLocaleString(),
        passedCount: 4,
        failedCount: 1,
        results: [
          {
            id: 'tc-001',
            name: 'Valid Login Test',
            status: 'Passed',
            duration: '0.84s',
            request: {
              method: 'GET',
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
              },
              body: {
                username: 'invalid',
                password: 'wrong'
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
            status: 'Passed',
            duration: '1.15s',
            request: {
              method: 'POST',
              url: 'https://api.example.com/auth/reset-password',
              headers: {
                'Content-Type': 'application/json'
              },
              body: {
                email: 'user@example.com'
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
          },
          {
            id: 'tc-004',
            name: 'Admin Access Test',
            status: 'Passed',
            duration: '0.76s',
            request: {
              method: 'GET',
              url: 'https://api.example.com/admin/dashboard',
              headers: {
                'Authorization': 'Bearer admin_token123'
              }
            },
            response: {
              status: 200,
              data: {
                success: true,
                stats: {
                  users: 1250,
                  activeUsers: 842,
                  revenue: '$12,400'
                }
              }
            },
            assertions: [
              { id: 1, description: 'Status code is 200', status: 'Passed' },
              { id: 2, description: 'Response contains dashboard stats', status: 'Passed' }
            ]
          },
          {
            id: 'tc-005',
            name: 'User Permissions Test',
            status: 'Failed',
            duration: '1.3s',
            request: {
              method: 'GET',
              url: 'https://api.example.com/user/permissions',
              headers: {
                'Authorization': 'Bearer user_token123'
              }
            },
            response: {
              status: 200,
              data: {
                permissions: ['read', 'write'],
                role: 'user'
              }
            },
            assertions: [
              { id: 1, description: 'Status code is 200', status: 'Passed' },
              { id: 2, description: 'User has admin permission', status: 'Failed', error: 'Expected permissions to include "admin" but it was not found' },
              { id: 3, description: 'Response time is less than 500ms', status: 'Failed', error: 'Response time was 1300ms which exceeds the limit of 500ms' }
            ]
          }
        ]
      };
      
      setExecutionResult(newResult);
      
      // In a real app, you would update localStorage or a state management store
      // to keep track of executions
      window.mockExecutionData = window.mockExecutionData || {};
      window.mockExecutionData[executionId] = newResult;
      
      // Update URL without full page refresh (in a real app)
      // history.pushState(null, '', `/test-execution/results/${executionId}`);
    }, 3000);
  };

  const handleViewDetails = (testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setViewMode('testcase');
    
    // In a real implementation with react-router, you would use:
    // navigate(`/test-execution/results/${executionResult.id}/${testCaseId}`);
    
    // For this demo, we'll just update the browser URL without navigation
    if (executionResult) {
      window.history.pushState(
        null, 
        '', 
        `/test-execution/results/${executionResult.id}/${testCaseId}`
      );
    }
  };

  const handleViewAllResults = () => {
    // In a real implementation, navigate to results page
    // navigate(`/test-execution/results/${executionResult.id}`);
    console.log('View all results for execution:', executionResult?.id);
  };

  const handleNavigateTestCase = (executionId, testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    
    // In a real implementation with react-router, you would use:
    // navigate(`/test-execution/results/${executionId}/${testCaseId}`);
    
    // For this demo, we'll just update the browser URL without navigation
    window.history.pushState(
      null, 
      '', 
      `/test-execution/results/${executionId}/${testCaseId}`
    );
  };

  const handleBackToExecution = () => {
    setViewMode('execution');
    setSelectedTestCaseId(null);
    
    // In a real implementation with react-router, you would use:
    // navigate(`/test-execution`);
    
    // For this demo, we'll just update the browser URL without navigation
    window.history.pushState(null, '', '/test-execution');
  };

  const handleSettingChange = (name, value) => {
    setSettings({
      ...settings,
      [name]: value
    });
  };

  // If showing test case details view
  if (viewMode === 'testcase' && executionResult) {
    return (
      <TestCaseDetailsNavigator
        executionId={executionResult.id}
        testCases={executionResult.results}
        currentTestCaseId={selectedTestCaseId}
        onNavigate={handleNavigateTestCase}
        onBack={handleBackToExecution}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Test Execution</h1>
          <p className="text-gray-600">Run test packages, suites, or individual cases</p>
        </div>
        
        <div className="flex items-center gap-2">
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
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Execution Settings</h3>
                </div>
                
                <div className="p-3">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <select 
                      value={settings.environment}
                      onChange={(e) => handleSettingChange('environment', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
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
                      className="w-20 border border-gray-300 rounded-md px-3 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={executing ? null : handleRun}
            disabled={!selectedItem || executing}
            className={`flex items-center px-4 py-2 rounded-md text-white shadow-sm ${
              !selectedItem || executing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors`}
          >
            {executing ? (
              <>
                <FaStop className="mr-2" />
                Running...
              </>
            ) : (
              <>
                <FaPlay className="mr-2" />
                Run {selectedItem?.type === 'package' 
                  ? 'Package' 
                  : selectedItem?.type === 'suite' 
                    ? 'Suite' 
                    : 'Case'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[calc(100vh-200px)]">
          <EnhancedTestHierarchy 
            data={testHierarchy} 
            onSelect={handleSelect} 
            selectedId={selectedItem?.id}
          />
        </div>
        
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