import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaChevronDown,
  FaCog,
  FaExclamationTriangle,
  FaSync,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import EnhancedTestHierarchy from '../components/EnhancedTestHierarchy';
import ExecutionResultsCard from './ExecutionResultsCard';
import TestCaseDetailsNavigator from './TestCaseDetailsNavigator';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { api, testExecution, environments } from '../../../utils/api';
import { useAuthStore } from '../../../stores/authStore';
import { useProjectStore } from '../../../stores/projectStore';
import Button from '../../../components/common/Button';
import TestCaseDetailsView from './TestCaseDetailsView';
import {
  getTestCaseDisplayStatus,
  getStatusBadgeClass,
  getAssertionSubtitle,
} from '../../../utils/testStatusUtils';
import ExecutionConfigurationErrorModal from './ExecutionConfigurationErrorModal';
import ExecutionErrorNotification from './ExecutionErrorNotification';
import ConfigurationErrorResultsView from './ConfigurationErrorResultsView';
import '../styles/execution-error-styles.css'; // Optional enhanced styling

const ModernTestExecution = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    environment: 'Staging',
    executionStrategy: 'Sequential',
  });
  const [viewMode, setViewMode] = useState('execution');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [testHierarchy, setTestHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [environments_list, setEnvironmentsList] = useState([]);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const { user } = useAuthStore();
  const { activeProject } = useProjectStore();

  const [showConfigErrorModal, setShowConfigErrorModal] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [errorTestSuite, setErrorTestSuite] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [originalExecutionConfig, setOriginalExecutionConfig] = useState(null);

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
        children: data.map((pkg) => ({
          id: `package-${pkg.id}`,
          type: 'package',
          name: pkg.packageName,
          packageId: pkg.id,
          children: (pkg.testSuites || []).map((suite) => ({
            id: `suite-${suite.id}`,
            type: 'suite',
            name: suite.suiteName,
            suiteId: suite.id,
            children: (suite.testCases || []).map((tc) => ({
              id: `case-${tc.id}`,
              type: 'case',
              name: tc.caseName,
              caseId: tc.id,
              children: [],
            })),
          })),
        })),
      };

      setTestHierarchy(mapped);
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
      setError(err.message || 'Failed to load test hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // Transformation function using backend assertion data
  const transformExecutionResults = (executionResponse) => {
    const testCaseResults = executionResponse.testCaseResult || [];

    const results = testCaseResults.map((testCase) => {
      // Use assertion results directly from backend
      const assertionResults = testCase.assertionResults || [];

      // Use assertion summary directly from backend
      const assertionSummary = testCase.assertionSummary || {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      };

      // Calculate success rate if not provided
      const successRate =
        assertionSummary.total > 0
          ? Math.round((assertionSummary.passed / assertionSummary.total) * 100)
          : 0;

      // Determine overall test case status based on backend assertion summary
      // For test cases with no assertions, check HTTP status code for success
      let overallStatus;
      if (assertionSummary.total === 0) {
        // No assertions - check HTTP status code
        const httpStatus = testCase.statusCode;
        overallStatus =
          httpStatus >= 200 && httpStatus < 400 ? 'Executed' : 'Failed';
      } else {
        // Has assertions - use assertion results
        overallStatus =
          assertionSummary.failed === 0 && assertionSummary.passed > 0
            ? 'Passed'
            : 'Failed';
      }

      return {
        id: `tc-${testCase.testCaseId}`,
        name: testCase.testCaseName || `Test Case ${testCase.testCaseId}`,
        status: overallStatus,
        duration: `${testCase.executionTimeMs}ms`,
        request: {
          method: testCase.httpMethod,
          url: testCase.url,
          headers: testCase.requestHeaders || {},
          body: testCase.requestBody,
        },
        response: {
          status: testCase.statusCode,
          data: testCase.responseBody,
          headers: testCase.responseHeaders || {},
        },
        // Backend assertion support
        assertionResults: assertionResults.map((assertion) => ({
          id: assertion.assertionId,
          name: assertion.assertionName || 'Assertion',
          type: 'custom',
          status: assertion.status === 'PASSED' ? 'Passed' : 'Failed',
          actualValue: assertion.actualValue,
          expectedValue: assertion.expectedValue,
          executionTime: assertion.executionTime || 0,
          ...(assertion.status !== 'PASSED' &&
            assertion.errorMessage && {
              error: assertion.errorMessage,
            }),
        })),
        assertionSummary: {
          ...assertionSummary,
          successRate: successRate,
        },
        // Legacy compatibility
        assertions: assertionResults.map((assertion, index) => ({
          id: assertion.assertionId || index + 1,
          description: assertion.assertionName || 'Assertion',
          status: assertion.status === 'PASSED' ? 'Passed' : 'Failed',
          error: assertion.errorMessage || null,
        })),
        executionId: testCase.resultId,
        testCaseId: testCase.testCaseId,
        executedBy: executionResponse.executedBy,
        executionDate: formatExecutionDate(executionResponse.executionDate),
        testSuiteId: testCase.testSuiteId,
        testSuiteName: testCase.testSuiteName,
        environment:
          testCase.environmentName || executionResponse.environmentName,
      };
    });

    // Recalculate summary based on assertion results
    const totalAssertions = results.reduce(
      (acc, result) => acc + result.assertionSummary.total,
      0
    );
    const passedAssertions = results.reduce(
      (acc, result) => acc + result.assertionSummary.passed,
      0
    );
    const failedAssertions = results.reduce(
      (acc, result) => acc + result.assertionSummary.failed,
      0
    );

    return {
      results,
      passedCount: results.filter((r) => r.status === 'Passed').length,
      failedCount: results.filter((r) => r.status === 'Failed').length,
      executedCount: results.filter((r) => r.status === 'Executed').length,
      errorCount: 0, // Will be calculated based on assertion errors
      totalTests: results.length,
      executionTime: executionResponse.executionTimeMs,
      successRate:
        results.length > 0
          ? Math.round(
              (results.filter(
                (r) => r.status === 'Passed' || r.status === 'Executed'
              ).length /
                results.length) *
                100
            )
          : 0,
      environmentName: executionResponse.environmentName,
      executionStatus: executionResponse.executionStatus,
      assertionSummary: {
        total: totalAssertions,
        passed: passedAssertions,
        failed: failedAssertions,
        skipped: 0,
        successRate:
          totalAssertions > 0
            ? Math.round((passedAssertions / totalAssertions) * 100)
            : 0,
      },
    };
  };

  // Helper function to format execution date
  const formatExecutionDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString();

    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return new Date().toLocaleString();
    }
  };

  // Get execution method and ID based on selected item type
  const getExecutionConfig = (selectedItem) => {
    switch (selectedItem.type) {
      case 'package':
        return {
          method: testExecution.executePackage,
          id: selectedItem.packageId,
          name: 'Package',
        };
      case 'suite':
        return {
          method: testExecution.executeSuite,
          id: selectedItem.suiteId,
          name: 'Suite',
        };
      case 'case':
        return {
          method: testExecution.executeTestCase,
          id: selectedItem.caseId,
          name: 'Test Case',
        };
      default:
        throw new Error('Invalid selection type for execution');
    }
  };

  // Fetch environments for the active project
  const fetchEnvironments = async () => {
    if (!activeProject?.id) {
      console.warn('No active project found');
      return;
    }

    setEnvironmentsLoading(true);
    try {
      const response = await environments.getByProject(activeProject.id);

      if (response && response.result && response.result.data) {
        const envList = response.result.data.content || response.result.data;

        // Map to a simple format for the dropdown
        const mappedEnvs = envList.map((env) => ({
          id: env.environmentId,
          name: env.environmentName,
          value: env.environmentName, // Keep value for backward compatibility
        }));

        setEnvironmentsList(mappedEnvs);

        // Set default environment if none selected and environments are available
        if (
          mappedEnvs.length > 0 &&
          (!settings.environment || settings.environment === 'Staging')
        ) {
          setSettings((prev) => ({
            ...prev,
            environment: mappedEnvs[0].value,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching environments:', error);
      toast.error('Failed to load environments for the current project');
    } finally {
      setEnvironmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
    fetchEnvironments();
  }, [activeProject?.id]); // Re-fetch when active project changes

  const getBreadcrumbItems = () => {
    const items = [{ label: 'Test Execution' }];

    if (viewMode === 'execution') {
      items.push({ label: 'Execute Tests' });
    } else if (viewMode === 'testcase' && executionResult) {
      items.push(
        { label: 'Execute Tests', path: '/test-execution' },
        { label: `Execution ${executionResult.id}` },
        { label: 'Test Case Details' }
      );
    }

    return items;
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    // Check execution compatibility when selecting a test suite
    checkExecutionCompatibility(item);
  };

  const handleRun = async () => {
    if (!selectedItem) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      const executedBy =
        user?.username || localStorage.getItem('userId') || 'current.user';
      const execConfig = getExecutionConfig(selectedItem);

      // Prepare execution settings
      const executionSettings = {
        executionStrategy: settings.executionStrategy,
        environment: settings.environment,
      };

      // Log execution details for debugging
      console.log(`Executing ${execConfig.name} with settings:`, {
        id: execConfig.id,
        executedBy,
        executionSettings,
      });

      // Execute using the appropriate method
      const executionResponse = await execConfig.method(
        execConfig.id,
        executedBy,
        executionSettings
      );

      // Check for ERR-422 and ERR-423 errors before processing success
      if (executionResponse.result && executionResponse.result.code) {
        const errorCode = executionResponse.result.code;
        const errorMessage = executionResponse.result.message;

        // Handle ERR-422 and ERR-423 specifically
        if (errorCode === 'ERR-422' || errorCode === 'ERR-423') {
          const configErrorResult = {
            id: `exec-${Date.now()}-config-error`,
            status: 'Configuration Error',
            errorType: 'CONFIGURATION_ERROR',
            errorCode: errorCode,
            errorMessage: errorMessage,
            instanceId: `exec-${Date.now()}-config-error`,
            executedBy: executedBy,
            environment: settings.environment,
            executedAt: new Date().toLocaleString(),
            selectedItem: selectedItem,
            originalStrategy: settings.executionStrategy,
            totalTests: 0,
            passedCount: 0,
            failedCount: 0,
            results: [],
          };

          setExecutionResult(configErrorResult);
          setErrorType('CONFIGURATION_ERROR');
          setOriginalExecutionConfig({
            item: selectedItem,
            settings: { ...settings },
          });
          setExecuting(false);

          const errorTypeText =
            errorCode === 'ERR-422' ? 'test suite' : 'test case';
          toast.warning(
            `${selectedItem.name} requires Sequential execution for ${errorTypeText} due to dynamic variables`
          );
          return;
        }

        // Handle other error codes
        throw new Error(`${errorCode}: ${errorMessage}`);
      }

      // Use unified transformation for all execution types
      const transformedResults = transformExecutionResults(executionResponse);

      // Create execution result object
      const executionId = `exec-${executionResponse.executionId}`;
      const newResult = {
        id: executionId,
        status:
          transformedResults.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
        executionStatus: transformedResults.executionStatus, // Add backend execution status
        instanceId: executionId,
        executedBy: executedBy,
        environment: transformedResults.environmentName || settings.environment,
        executedAt: formatExecutionDate(executionResponse.executionDate),
        passedCount: transformedResults.passedCount,
        failedCount: transformedResults.failedCount,
        executedCount: transformedResults.executedCount,
        errorCount: transformedResults.errorCount,
        totalTests: transformedResults.totalTests,
        executionTime: transformedResults.executionTime,
        successRate: transformedResults.successRate,
        results: transformedResults.results,
        rawExecution: executionResponse,
        selectedItem: selectedItem,
        actualExecutionId: executionResponse.executionId,
      };

      setExecutionResult(newResult);

      // Store execution data for navigation
      window.mockExecutionData = window.mockExecutionData || {};
      window.mockExecutionData[executionId] = newResult;

      // Show success toast with execution details
      toast.success(
        `${execConfig.name} execution completed (${settings.executionStrategy}, ${settings.environment}): ${transformedResults.passedCount} passed, ${transformedResults.failedCount} failed`
      );
    } catch (error) {
      console.error('Execution error:', error);

      // Convert ERR-422/ERR-423 responses (non-OK HTTP) into configuration error UI
      if (error.code === 'ERR-422' || error.code === 'ERR-423') {
        const configErrorResult = {
          id: `exec-${Date.now()}-config-error`,
          status: 'Configuration Error',
          errorType: 'CONFIGURATION_ERROR',
          errorCode: error.code,
          errorMessage: error.message,
          instanceId: `exec-${Date.now()}-config-error`,
          executedBy:
            user?.username || localStorage.getItem('userId') || 'current.user',
          environment: settings.environment,
          executedAt: new Date().toLocaleString(),
          selectedItem: selectedItem,
          originalStrategy: settings.executionStrategy,
          totalTests: 0,
          passedCount: 0,
          failedCount: 0,
          results: [],
        };

        setExecutionResult(configErrorResult);
        setErrorType('CONFIGURATION_ERROR');
        setOriginalExecutionConfig({
          item: selectedItem,
          settings: { ...settings },
        });

        const errorTypeText =
          error.code === 'ERR-422' ? 'test suite' : 'test case';
        toast.warning(
          `${selectedItem?.name || 'Selection'} requires Sequential execution for ${errorTypeText} due to dynamic variables`
        );
      } else {
        toast.error(`Execution failed: ${error.message}`);

        // Create generic error result
        const executionId = `exec-${Date.now()}-error`;
        const errorResult = {
          id: executionId,
          status: 'Failed',
          executionStatus: 'FAILED',
          instanceId: executionId,
          executedBy:
            user?.username || localStorage.getItem('userId') || 'current.user',
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
                body: {},
              },
              response: {
                status: error.status || 0,
                data: { error: error.message, code: error.code },
                headers: {},
              },
              assertions: [
                {
                  id: 1,
                  description: 'Execution attempt',
                  status: 'Failed',
                  error: error.message,
                },
              ],
            },
          ],
          error: error.message,
        };

        setExecutionResult(errorResult);
      }
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
      [name]: value,
    });
  };

  const handleRetry = () => {
    fetchHierarchy();
  };

  // ERR-423 Error Handling Functions
  const handleRetryWithSequential = async () => {
    if (!originalExecutionConfig) return;

    // Track user action
    handleExecutionError(
      executionResult?.errorCode,
      originalExecutionConfig.item,
      'retry_sequential'
    );

    // Update settings to sequential
    const originalStrategy = settings.executionStrategy;
    setSettings((prev) => ({ ...prev, executionStrategy: 'Sequential' }));

    try {
      // Clear error state
      setExecutionResult(null);
      setErrorType(null);
      setOriginalExecutionConfig(null);

      // Retry execution with sequential strategy
      setSelectedItem(originalExecutionConfig.item);
      await handleRun();

      toast.success(
        `${originalExecutionConfig.item.name} is now running with Sequential execution strategy`
      );
    } catch (error) {
      // Revert strategy if retry fails
      setSettings((prev) => ({ ...prev, executionStrategy: originalStrategy }));
      throw error;
    }
  };

  const handleEditConfiguration = () => {
    // Track user action
    handleExecutionError(
      executionResult?.errorCode,
      originalExecutionConfig?.item,
      'edit_config'
    );

    setExecutionResult(null);
    setErrorType(null);
    setOriginalExecutionConfig(null);
    toast.info('Please update the execution strategy below');
    // Optionally scroll to or highlight the strategy selector
  };

  const handleViewErrorDetails = () => {
    if (executionResult?.errorCode) {
      console.log('Error details:', {
        errorCode: executionResult.errorCode,
        errorMessage: executionResult.errorMessage,
        testSuite: originalExecutionConfig?.item?.name,
      });
      toast.info('Check console for detailed error information');
    }
  };

  const closeErrorDisplays = () => {
    // Track user action if there's an active error
    if (executionResult?.errorCode && originalExecutionConfig?.item) {
      handleExecutionError(
        executionResult.errorCode,
        originalExecutionConfig.item,
        'dismiss'
      );
    }

    setShowConfigErrorModal(false);
    setShowErrorNotification(false);
    setExecutionResult(null);
    setErrorType(null);
    setOriginalExecutionConfig(null);
  };

  // Proactive warning system for execution compatibility
  const checkExecutionCompatibility = async (item) => {
    if (item.type === 'SUITE' && settings.executionStrategy === 'Parallel') {
      try {
        // This would be a real API call in production
        // const compatibility = await api(`/api/v1/test-suite/${item.suiteId}/execution-compatibility`, 'GET');

        // For now, we'll simulate the check based on test suite properties
        // In a real implementation, this would check if the suite has dynamic variables or dependencies
        const hasDynamicVariables =
          item.name?.toLowerCase().includes('dynamic') ||
          item.name?.toLowerCase().includes('variable') ||
          item.name?.toLowerCase().includes('dependent');

        if (hasDynamicVariables) {
          toast.warning(
            `"${item.name}" may require Sequential execution due to dynamic variables`,
            {
              action: {
                label: 'Switch to Sequential',
                onClick: () =>
                  setSettings((prev) => ({
                    ...prev,
                    executionStrategy: 'Sequential',
                  })),
              },
            }
          );
        }
      } catch (error) {
        console.log('Could not check execution compatibility:', error);
      }
    }
  };

  // Analytics tracking for error occurrences
  const handleExecutionError = (errorCode, testSuite, userAction) => {
    // Analytics tracking (in a real app, this would send to your analytics service)
    const errorData = {
      error_code: errorCode,
      test_suite_id: testSuite?.suiteId,
      test_suite_name: testSuite?.name,
      execution_strategy: settings.executionStrategy,
      user_action: userAction, // 'retry_sequential', 'edit_config', 'dismiss'
      timestamp: new Date().toISOString(),
    };

    console.log('Execution error analytics:', errorData);

    // In production, you would send this to your analytics service
    // analytics.track('execution_error', errorData);

    // Error reporting for non-ERR-422/ERR-423 errors
    if (errorCode !== 'ERR-422' && errorCode !== 'ERR-423') {
      console.error('Non-configuration execution error:', errorData);
      // errorReporting.captureException(new Error(`${errorCode}: ${errorMessage}`), {
      //   extra: { testSuite, executionSettings: settings }
      // });
    }
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
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Test Execution
          </h1>
          <p className="text-gray-600">
            Run test packages, suites, or individual cases
          </p>
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
              <FaChevronDown
                className={`ml-1 text-gray-400 transition-transform ${showSettings ? 'rotate-180' : ''}`}
              />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <FaCog className="text-indigo-600 text-sm" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      Execution Settings
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Configure your test execution preferences
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {/* Environment Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      Environment
                    </label>
                    <div className="relative">
                      <select
                        value={settings.environment}
                        onChange={(e) =>
                          handleSettingChange('environment', e.target.value)
                        }
                        disabled={
                          environmentsLoading || environments_list.length === 0
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 
                                 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                                 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {environmentsLoading && (
                          <option value="">Loading environments...</option>
                        )}
                        {!environmentsLoading &&
                          environments_list.length === 0 && (
                            <option value="">
                              No environments found for this project
                            </option>
                          )}
                        {!environmentsLoading &&
                          environments_list.map((env) => (
                            <option key={env.id} value={env.value}>
                              🌍 {env.name}
                            </option>
                          ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-3 text-gray-400 text-xs pointer-events-none" />
                    </div>
                  </div>

                  {/* Execution Strategy */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Execution Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          handleSettingChange('executionStrategy', 'Sequential')
                        }
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 
                                  ${
                                    settings.executionStrategy === 'Sequential'
                                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                                  }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-lg">📋</div>
                          <span>Sequential</span>
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          handleSettingChange('executionStrategy', 'Parallel')
                        }
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 
                                  ${
                                    settings.executionStrategy === 'Parallel'
                                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                                  }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-lg">⚡</div>
                          <span>Parallel</span>
                        </div>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      {settings.executionStrategy === 'Sequential'
                        ? '📋 Tests will run one after another in order'
                        : '⚡ Tests will run simultaneously for faster execution'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Settings will apply to this execution</span>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Done
                    </button>
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
                Run{' '}
                {selectedItem?.type === 'package'
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
              <p className="text-gray-600 font-medium">
                Loading test hierarchy...
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Please wait while we fetch your test structure
              </p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-6 h-full bg-white shadow-sm flex flex-col items-center justify-center text-center">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Test Hierarchy
              </h3>
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
          ) : !testHierarchy ||
            (testHierarchy.children && testHierarchy.children.length === 0) ? (
            <div className="border rounded-md p-6 h-full bg-white shadow-sm flex flex-col items-center justify-center text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <svg
                  className="h-8 w-8 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Test Packages Found
              </h3>
              <p className="text-gray-600 mb-4 max-w-md">
                You don't have any test packages created yet. Create test
                packages, suites, and cases to start running tests.
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
          {executionResult &&
          (executionResult.errorType === 'CONFIGURATION_ERROR' ||
            executionResult.errorCode === 'ERR-422' ||
            executionResult.errorCode === 'ERR-423') ? (
            <div className="h-full overflow-y-auto">
              <ConfigurationErrorResultsView
                execution={executionResult}
                errorCode={executionResult.errorCode}
                errorMessage={executionResult.errorMessage}
              />
            </div>
          ) : (
            <ExecutionResultsCard
              results={executionResult}
              inProgress={executing}
              onViewDetails={handleViewDetails}
              onViewAllResults={handleViewAllResults}
            />
          )}
        </div>
      </div>

      {/* Legacy Error Modal (kept for backward compatibility) */}
      <ExecutionConfigurationErrorModal
        isOpen={showConfigErrorModal}
        onClose={closeErrorDisplays}
        errorCode={configError?.code}
        errorMessage={configError?.message}
        testSuiteName={errorTestSuite?.name || 'Unknown Test Suite'}
        currentStrategy={settings.executionStrategy}
        onRetryWithSequential={handleRetryWithSequential}
        onEditConfiguration={handleEditConfiguration}
        onViewDetails={handleViewErrorDetails}
      />

      {/* Legacy Error Notification (kept for backward compatibility) */}
      {showErrorNotification && (
        <ExecutionErrorNotification
          isVisible={showErrorNotification}
          onDismiss={closeErrorDisplays}
          errorCode={configError?.code}
          errorMessage={configError?.message}
          testSuiteName={errorTestSuite?.name || 'Unknown Test Suite'}
          currentStrategy={settings.executionStrategy}
          onRetryWithSequential={handleRetryWithSequential}
          onEditConfiguration={handleEditConfiguration}
        />
      )}
    </div>
  );
};

export default ModernTestExecution;
