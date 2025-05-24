import React, { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaChevronDown, FaCog, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import EnhancedTestHierarchy from '../components/EnhancedTestHierarchy';
import ExecutionResultsCard from './ExecutionResultsCard';
import TestCaseDetailsNavigator from './TestCaseDetailsNavigator';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { api, testExecution } from '../../../utils/api';

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
  const [executionDetails, setExecutionDetails] = useState({});

  // Fetch the hierarchy from the API
  const fetchHierarchy = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api('/api/v1/packages/hierarchy', 'GET');
      
      // Handle different response formats
      let data;
      if (Array.isArray(response)) {
        data = response;
      } else if (response && response.result && response.result.data) {
        data = response.result.data;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      } else {
        console.warn('Unexpected API response format:', response);
        setError('Invalid response format from server');
        return;
      }
      
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

  // Fetch execution details for all execution IDs (for package execution)
  const fetchExecutionDetails = async (executionIds) => {
    const details = {};
    
    // Validate that executionIds is an array
    if (!Array.isArray(executionIds)) {
      console.error('executionIds is not an array:', executionIds);
      throw new Error('Invalid execution IDs format - expected array');
    }
    
    if (executionIds.length === 0) {
      console.warn('Empty executionIds array provided');
      return details;
    }
    
    try {
      const promises = executionIds.map(async (executionId) => {
        try {
          const response = await testExecution.getExecutionDetails(executionId);
          return { executionId, data: response };
        } catch (error) {
          console.error(`Error fetching details for execution ${executionId}:`, error);
          return { executionId, error: error.message };
        }
      });
      
      const results = await Promise.all(promises);
      
      results.forEach(({ executionId, data, error }) => {
        if (data) {
          details[executionId] = data;
        } else {
          details[executionId] = { error };
        }
      });
      
    } catch (error) {
      console.error('Error fetching execution details:', error);
    }
    
    return details;
  };

  // Transform API execution details to component format (for package execution)
  const transformExecutionDetails = (executionIds, details) => {
    const results = [];
    let totalPassed = 0;
    let totalFailed = 0;

    // Validate that executionIds is an array
    if (!Array.isArray(executionIds)) {
      console.error('executionIds is not an array:', executionIds);
      throw new Error('Invalid execution IDs format - expected array');
    }

    executionIds.forEach((executionId, index) => {
      const detail = details[executionId];
      
      if (detail && !detail.error) {
        const testCase = {
          id: `tc-${executionId}`,
          name: detail.testCase?.name || `Test Case ${index + 1}`,
          status: detail.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
          duration: `${detail.executionTimeMs}ms`,
          request: {
            method: detail.httpMethod,
            url: detail.url,
            headers: detail.requestHeaders || {},
            body: detail.requestBody
          },
          response: {
            status: detail.statusCode,
            data: detail.responseBody,
            headers: {}
          },
          assertions: [
            {
              id: 1,
              description: `Status code validation`,
              status: detail.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
              ...(detail.executionStatus !== 'PASSED' && { 
                error: `Expected successful response but got status ${detail.statusCode}` 
              })
            }
          ],
          executionId: executionId,
          executedBy: detail.executedBy,
          executionDate: detail.executionDate
        };
        
        results.push(testCase);
        
        if (detail.executionStatus === 'PASSED') {
          totalPassed++;
        } else {
          totalFailed++;
        }
      } else {
        // Handle error case
        const testCase = {
          id: `tc-${executionId}`,
          name: `Test Case ${index + 1} (Error)`,
          status: 'Failed',
          duration: '0ms',
          request: {
            method: 'UNKNOWN',
            url: 'Error fetching details',
            headers: {},
            body: {}
          },
          response: {
            status: 0,
            data: { error: detail?.error || 'Failed to fetch execution details' },
            headers: {}
          },
          assertions: [
            {
              id: 1,
              description: 'Execution details fetch',
              status: 'Failed',
              error: detail?.error || 'Failed to fetch execution details'
            }
          ],
          executionId: executionId
        };
        
        results.push(testCase);
        totalFailed++;
      }
    });

    return {
      results,
      passedCount: totalPassed,
      failedCount: totalFailed
    };
  };

  // Transform suite execution results to component format
  const transformSuiteExecutionResults = (suiteResponse) => {
    const testCaseResults = suiteResponse.testCaseResult || [];
    let totalPassed = 0;
    let totalFailed = 0;

    const results = testCaseResults
      .filter(testCase => {
        // Filter out non-object items (like standalone numbers)
        return testCase && typeof testCase === 'object' && testCase.testCaseId;
      })
      .map((testCase) => {
        const isSuccessful = testCase.executionStatus === 'PASSED';
        
        if (isSuccessful) {
          totalPassed++;
        } else {
          totalFailed++;
        }

        return {
          id: `tc-${testCase.testCaseId}`,
          name: testCase.testCaseName || `Test Case ${testCase.testCaseId}`,
          status: isSuccessful ? 'Passed' : 'Failed',
          duration: `${testCase.executionTimeMs}ms`,
          request: {
            method: testCase.httpMethod,
            url: testCase.url,
            headers: testCase.requestHeaders || {},
            body: testCase.requestBody
          },
          response: {
            status: testCase.statusCode,
            data: testCase.responseBody,
            headers: testCase.responseHeaders || {}
          },
          assertions: [
            {
              id: 1,
              description: `HTTP ${testCase.httpMethod} request validation`,
              status: isSuccessful ? 'Passed' : 'Failed',
              ...(testCase.errorMessage && { 
                error: testCase.errorMessage 
              })
            },
            {
              id: 2,
              description: 'Response status validation',
              status: (testCase.statusCode >= 200 && testCase.statusCode < 300) ? 'Passed' : 'Failed',
              ...(testCase.statusCode >= 400 && { 
                error: `HTTP ${testCase.statusCode} error response` 
              })
            }
          ],
          executionId: testCase.id,
          executedBy: suiteResponse.executedBy,
          executionDate: formatExecutionDate(suiteResponse.executionDate),
          testSuiteId: testCase.testSuiteId,
          testSuiteName: testCase.testSuiteName
        };
      });

    // Check if we have execution summary data and use it for counts
    if (suiteResponse.testExecution && suiteResponse.testExecution.executionSummary) {
      const summary = suiteResponse.testExecution.executionSummary;
      totalPassed = summary.passedTests || totalPassed;
      totalFailed = summary.failedTests || totalFailed;
    } else {
      // Use the top-level counts if available
      totalPassed = suiteResponse.passed || totalPassed;
      totalFailed = suiteResponse.failed || totalFailed;
    }

    return {
      results,
      passedCount: totalPassed,
      failedCount: totalFailed,
      totalTests: suiteResponse.totalTests || results.length
    };
  };

  // Transform single test case execution results to component format
  const transformSingleTestCaseExecution = (testCaseResponse) => {
    const isSuccessful = testCaseResponse.executionStatus === 'PASSED';
    
    const result = {
      id: `tc-${testCaseResponse.testCaseId}`,
      name: testCaseResponse.testCaseName || `Test Case ${testCaseResponse.testCaseId}`,
      status: isSuccessful ? 'Passed' : 'Failed',
      duration: `${testCaseResponse.executionTimeMs}ms`,
      request: {
        method: testCaseResponse.httpMethod,
        url: testCaseResponse.url,
        headers: testCaseResponse.requestHeaders || {},
        body: testCaseResponse.requestBody
      },
      response: {
        status: testCaseResponse.statusCode,
        data: testCaseResponse.responseBody,
        headers: testCaseResponse.responseHeaders || {}
      },
      assertions: [
        {
          id: 1,
          description: `HTTP ${testCaseResponse.httpMethod} request validation`,
          status: isSuccessful ? 'Passed' : 'Failed',
          ...(testCaseResponse.errorMessage && { 
            error: testCaseResponse.errorMessage 
          })
        },
        {
          id: 2,
          description: 'Response status validation',
          status: (testCaseResponse.statusCode >= 200 && testCaseResponse.statusCode < 300) ? 'Passed' : 'Failed',
          ...(testCaseResponse.statusCode >= 400 && { 
            error: `HTTP ${testCaseResponse.statusCode} error response` 
          })
        }
      ],
      executionId: testCaseResponse.id,
      executedBy: testCaseResponse.executedBy,
      executionDate: formatExecutionDate(testCaseResponse.executionDate)
    };

    return {
      results: [result],
      passedCount: isSuccessful ? 1 : 0,
      failedCount: isSuccessful ? 0 : 1,
      totalTests: 1
    };
  };

  // Helper function to format execution date
  const formatExecutionDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString();
    
    try {
      // Handle timestamp in milliseconds
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return new Date().toLocaleString();
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

  const handleRun = async () => {
    if (!selectedItem) return;
    
    setExecuting(true);
    setExecutionResult(null);

    try {
      let executionResponse;
      const executedBy = localStorage.getItem('userId') || 'current.user';

      // Call appropriate execution API based on selected item type
      if (selectedItem.type === 'package') {
        executionResponse = await testExecution.executePackage(selectedItem.packageId, executedBy);
        
        console.log('Package execution response:', executionResponse);
        console.log('Response type:', typeof executionResponse);
        console.log('Response keys:', Object.keys(executionResponse || {}));
        
        // Handle different possible response formats for packages
        let executionIds = [];
        
        if (Array.isArray(executionResponse.executionId)) {
          // If executionId is already an array
          executionIds = executionResponse.executionId;
          console.log('Using executionId array:', executionIds);
        } else if (executionResponse.executionId) {
          // If executionId is a single value, convert to array
          executionIds = [executionResponse.executionId];
          console.log('Converting single executionId to array:', executionIds);
        } else if (executionResponse.testCaseResult && Array.isArray(executionResponse.testCaseResult)) {
          // If response has testCaseResult like suite execution, handle it differently
          console.log('Package response has testCaseResult format, treating as suite-like response');
          
          // For package execution, we might need to extract additional test case results
          // from the nested testExecution.testCaseResults if available
          let allTestCaseResults = [...executionResponse.testCaseResult];
          
          // Check if there are additional test case results in the nested structure
          if (executionResponse.testCaseResult.length > 0 && 
              executionResponse.testCaseResult[0].testExecution &&
              executionResponse.testCaseResult[0].testExecution.testCaseResults) {
            
            const nestedResults = executionResponse.testCaseResult[0].testExecution.testCaseResults;
            console.log('Found nested testCaseResults:', nestedResults);
            
            // Add any additional test case results that are objects
            nestedResults.forEach(result => {
              if (result && typeof result === 'object' && result.testCaseId) {
                // Check if this test case is not already in our results
                const existsInMain = allTestCaseResults.some(mainResult => 
                  mainResult && mainResult.testCaseId === result.testCaseId
                );
                
                if (!existsInMain) {
                  allTestCaseResults.push(result);
                }
              }
            });
          }
          
          // Create a modified response object with all test case results
          const modifiedResponse = {
            ...executionResponse,
            testCaseResult: allTestCaseResults
          };
          
          console.log('Modified response with all test cases:', modifiedResponse);
          
          const transformedResults = transformSuiteExecutionResults(modifiedResponse);
          
          const executionId = `exec-${Date.now()}`;
          const newResult = {
            id: executionId,
            status: transformedResults.failedCount > 0 ? 'Failed' : 'Passed',
            instanceId: executionId,
            executedBy: executedBy,
            environment: settings.environment,
            executedAt: new Date().toLocaleString(),
            passedCount: transformedResults.passedCount,
            failedCount: transformedResults.failedCount,
            totalTests: transformedResults.totalTests,
            results: transformedResults.results,
            rawPackageExecution: executionResponse,
            selectedItem: selectedItem
          };
          
          setExecutionResult(newResult);
          
          // Store execution data for navigation
          window.mockExecutionData = window.mockExecutionData || {};
          window.mockExecutionData[executionId] = newResult;

          // Show success toast
          toast.success(
            `Package execution completed: ${transformedResults.passedCount} passed, ${transformedResults.failedCount} failed`
          );
          
          return; // Exit early for this case
        } else {
          console.error('Unexpected package execution response format:', executionResponse);
          throw new Error('Invalid package execution response format - no executionId or testCaseResult found');
        }
        
        if (executionIds.length === 0) {
          throw new Error('No execution IDs returned from the API');
        }

        console.log('Proceeding with executionIds:', executionIds);

        // Fetch detailed execution information for each execution ID
        const details = await fetchExecutionDetails(executionIds);
        setExecutionDetails(details);

        // Transform the execution details into the expected format
        const { results, passedCount, failedCount } = transformExecutionDetails(executionIds, details);

        // Create execution result object
        const executionId = `exec-${Date.now()}`;
        const newResult = {
          id: executionId,
          status: failedCount > 0 ? 'Failed' : 'Passed',
          instanceId: executionId,
          executedBy: executedBy,
          environment: settings.environment,
          executedAt: new Date().toLocaleString(),
          passedCount: passedCount,
          failedCount: failedCount,
          totalTests: executionResponse.totalTests || results.length,
          results: results,
          rawExecutionIds: executionIds,
          selectedItem: selectedItem
        };
        
        setExecutionResult(newResult);
        
        // Store execution data for navigation
        window.mockExecutionData = window.mockExecutionData || {};
        window.mockExecutionData[executionId] = newResult;

        // Show success toast
        toast.success(
          `Package execution completed: ${passedCount} passed, ${failedCount} failed`
        );

      } else if (selectedItem.type === 'suite') {
        executionResponse = await testExecution.executeSuite(selectedItem.suiteId, executedBy);
        
        // Handle suite execution response (returns detailed test case results)
        const transformedResults = transformSuiteExecutionResults(executionResponse);
        
        // Create execution result object
        const executionId = `exec-${Date.now()}`;
        const newResult = {
          id: executionId,
          status: transformedResults.failedCount > 0 ? 'Failed' : 'Passed',
          instanceId: executionId,
          executedBy: executedBy,
          environment: settings.environment,
          executedAt: new Date().toLocaleString(),
          passedCount: transformedResults.passedCount,
          failedCount: transformedResults.failedCount,
          totalTests: transformedResults.totalTests,
          results: transformedResults.results,
          rawSuiteExecution: executionResponse,
          selectedItem: selectedItem
        };
        
        setExecutionResult(newResult);
        
        // Store execution data for navigation
        window.mockExecutionData = window.mockExecutionData || {};
        window.mockExecutionData[executionId] = newResult;

        // Show success toast
        toast.success(
          `Suite execution completed: ${transformedResults.passedCount} passed, ${transformedResults.failedCount} failed`
        );

      } else if (selectedItem.type === 'case') {
        executionResponse = await testExecution.executeTestCase(selectedItem.caseId, executedBy);
        
        // Handle single test case execution
        const transformedResults = transformSingleTestCaseExecution(executionResponse);
        
        // Create execution result object
        const executionId = `exec-${Date.now()}`;
        const newResult = {
          id: executionId,
          status: transformedResults.failedCount > 0 ? 'Failed' : 'Passed',
          instanceId: executionId,
          executedBy: executedBy,
          environment: settings.environment,
          executedAt: new Date().toLocaleString(),
          passedCount: transformedResults.passedCount,
          failedCount: transformedResults.failedCount,
          totalTests: 1,
          results: transformedResults.results,
          rawTestCaseExecution: executionResponse,
          selectedItem: selectedItem
        };
        
        setExecutionResult(newResult);
        
        // Store execution data for navigation
        window.mockExecutionData = window.mockExecutionData || {};
        window.mockExecutionData[executionId] = newResult;

        // Show success toast
        toast.success(
          `Test case execution completed: ${transformedResults.passedCount} passed, ${transformedResults.failedCount} failed`
        );

      } else {
        throw new Error('Invalid selection type for execution');
      }

    } catch (error) {
      console.error('Execution error:', error);
      toast.error(`Execution failed: ${error.message}`);
      
      // Create error result
      const executionId = `exec-${Date.now()}-error`;
      const errorResult = {
        id: executionId,
        status: 'Failed',
        instanceId: executionId,
        executedBy: localStorage.getItem('userId') || 'current.user',
        environment: settings.environment,
        executedAt: new Date().toLocaleString(),
        passedCount: 0,
        failedCount: 1,
        totalTests: 1,
        results: [
          {
            id: 'error-case',
            name: 'Execution Error',
            status: 'Failed',
            duration: '0ms',
            request: {
              method: 'UNKNOWN',
              url: selectedItem?.name || 'Unknown',
              headers: {},
              body: {}
            },
            response: {
              status: 0,
              data: { error: error.message },
              headers: {}
            },
            assertions: [
              {
                id: 1,
                description: 'Execution attempt',
                status: 'Failed',
                error: error.message
              }
            ]
          }
        ],
        error: error.message
      };
      
      setExecutionResult(errorResult);
    } finally {
      setExecuting(false);
    }
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