import React, { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaChevronDown, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EnhancedTestHierarchy from '../components/EnhancedTestHierarchy';
import ExecutionResultsCard from './ExecutionResultsCard';
import TestCaseDetailsNavigator from './TestCaseDetailsNavigator';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { api } from '../../../utils/api';

// Remove mockTestHierarchy import; we now use real API data.

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
  const [error, setError] = useState(false);

  // Fetch the hierarchy from the API
  useEffect(() => {
    async function fetchHierarchy() {
      setLoading(true);
      setError(false);
      try {
        const response = await api('/api/v1/packages/hierarchy', 'GET');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        // Map API to tree format
        const mapped = {
          id: 'root',
          type: 'root',
          name: 'All Packages',
          children: (data || []).map(pkg => ({
            id: `package-${pkg.id}`,
            type: 'package',
            name: pkg.packageName,
            children: (pkg.testSuites || []).map(suite => ({
              id: `suite-${suite.id}`,
              type: 'suite',
              name: suite.suiteName,
              children: (suite.testCases || []).map(tc => ({
                id: `case-${tc.id}`,
                type: 'case',
                name: tc.caseName,
                children: []
              }))
            }))
          }))
        };
        setTestHierarchy(mapped);
      } catch (e) {
        setError(true);
        setTestHierarchy(null);
      }
      setLoading(false);
    }
    fetchHierarchy();
  }, []);

  // ...Handlers unchanged...
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

  const handleSelect = (item) => setSelectedItem(item);

  const handleRun = () => {
    if (!selectedItem) return;
    setExecuting(true);
    setExecutionResult(null);

    setTimeout(() => {
      setExecuting(false);
      const executionId = `exec-${Date.now().toString().substring(6)}`;
      // ...Mock executionResult, same as your previous logic...
      const newResult = {
        id: executionId,
        status: Math.random() > 0.7 ? 'Failed' : 'Passed',
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
          // ...other test case results...
        ]
      };
      setExecutionResult(newResult);
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

  // Test Case details view logic
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Loading hierarchy...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400">
              Failed to load hierarchy. Please try again.
            </div>
          ) : testHierarchy ? (
            <EnhancedTestHierarchy
              data={testHierarchy}
              onSelect={handleSelect}
              selectedId={selectedItem?.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data found
            </div>
          )}
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
