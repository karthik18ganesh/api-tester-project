import React, { useState, useMemo, useEffect } from 'react';
import {
  FaChevronDown,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaSync,
  FaSearch,
  FaEye,
  FaTimes,
} from 'react-icons/fa';
import { FiLayers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import TestResultsTable from './TestResultsTable';
import ExecutionDetailsView from './ExecutionDetailsView';
import TestCaseDetailsView from '../../TestExecution/components/TestCaseDetailsView';
import AssertionSummaryCard from './AssertionSummaryCard';
import AssertionResultsList from './AssertionResultsList';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Badge from '../../../components/UI/Badge';
import { testExecution } from '../../../utils/api';

const pageSize = 10; // Match the API default

const ModernTestResults = () => {
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [viewMode, setViewMode] = useState('results'); // 'results', 'execution', 'testcase'
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    executedBy: '',
  });
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: pageSize,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
  });

  // Bulk execution detection function
  const isBulkExecution = (execution) => {
    return (
      execution.executionType === 'BULK' ||
      (execution.executionId &&
        String(execution.executionId).startsWith('bulk-'))
    );
  };

  // Fetch execution history from API
  const fetchExecutionHistory = async (pageNo = 0) => {
    setLoading(true);
    try {
      const response = await testExecution.getExecutionHistory(
        pageNo,
        pageSize,
        'executionDate',
        'DESC'
      );

      // Handle the response format based on the sample provided
      if (response && response.result && response.result.code === '200') {
        const { data } = response.result;
        const executions = data.content || [];

        // Transform API data to the expected format
        const formattedHistory = executions.map((execution) => {
          // Calculate aggregated assertion summary from all test case results
          let totalAssertions = 0;
          let passedAssertions = 0;
          let failedAssertions = 0;
          let skippedAssertions = 0;

          if (
            execution.testCaseResults &&
            execution.testCaseResults.length > 0
          ) {
            execution.testCaseResults.forEach((testCase) => {
              if (testCase.assertionSummary) {
                totalAssertions += testCase.assertionSummary.total || 0;
                passedAssertions += testCase.assertionSummary.passed || 0;
                failedAssertions += testCase.assertionSummary.failed || 0;
                skippedAssertions += testCase.assertionSummary.skipped || 0;
              }
            });
          }

          // Create aggregated assertion summary
          const aggregatedAssertionSummary =
            totalAssertions > 0
              ? {
                  total: totalAssertions,
                  passed: passedAssertions,
                  failed: failedAssertions,
                  skipped: skippedAssertions,
                  successRate: Math.round(
                    (passedAssertions / totalAssertions) * 100
                  ),
                }
              : null;

          // Calculate correct test counts excluding test cases with no assertions
          const testCasesWithAssertions = execution.testCaseResults
            ? execution.testCaseResults.filter(
                (tc) => tc.assertionSummary && tc.assertionSummary.total > 0
              )
            : [];

          const correctedTotalTests =
            totalAssertions > 0 ? testCasesWithAssertions.length : 0;
          const correctedPassedTests =
            totalAssertions > 0
              ? testCasesWithAssertions.filter(
                  (tc) =>
                    tc.assertionSummary &&
                    tc.assertionSummary.failed === 0 &&
                    tc.assertionSummary.passed > 0
                ).length
              : 0;
          const correctedFailedTests =
            correctedTotalTests - correctedPassedTests;

          // Store the raw numeric execution ID for API calls
          // API returns numeric executionId (e.g., 503, 492)
          const rawExecutionId = execution.executionId;
          
          // Format the display ID: for bulk executions with SEQUENTIAL strategy, keep as exec-ID
          // Otherwise format as exec-{id}
          const isBulkLike = execution.executionStrategy === 'SEQUENTIAL' || 
                           execution.executionStrategy === 'SEQUENTIAL' ||
                           (execution.testCaseResults && execution.testCaseResults.length > 0 && 
                            execution.testCaseResults.some(tc => tc.rowId));
          
          return {
            // For display: format as exec-{id} for regular, or keep numeric for bulk
            id: isBulkLike && rawExecutionId?.toString().startsWith('bulk-')
              ? rawExecutionId 
              : `exec-${rawExecutionId}`,
            executionId: rawExecutionId, // Store numeric ID from API (e.g., 503, 492)
            rawExecutionId: rawExecutionId, // Also store as rawExecutionId for API calls
            status: execution.executionStatus || 'FAILED', // Use backend executionStatus directly
            executionStatus: execution.executionStatus, // Store original backend status
            executionStrategy: execution.executionStrategy, // Store execution strategy
            passedFailed: `${correctedPassedTests}/${correctedTotalTests}`,
            executedAt: formatExecutionDate(execution.executionDate),
            executedBy: execution.executedBy || 'Unknown',
            date: execution.executionDate
              ? new Date(execution.executionDate.replace(' ', 'T'))
                  .toISOString()
                  .split('T')[0]
              : new Date().toISOString().split('T')[0],
            rawData: execution, // Store raw data for detailed view
            totalTests: correctedTotalTests,
            passedTests: correctedPassedTests,
            failedTests: correctedFailedTests,
            errorTests: execution.executionSummary?.errorTests || 0,
            successRate: execution.executionSummary?.successRate || 0,
            executionTime: execution.executionTimeMs || 0,
            environmentName: execution.environmentName || 'Unknown',
            testCaseResults: execution.testCaseResults || [],
            // Backend assertion support - use aggregated assertion summary
            assertionSummary: aggregatedAssertionSummary,
          };
        });

        setExecutionHistory(formattedHistory);
        setPagination({
          pageNumber: data.pageable?.pageNumber || 0,
          pageSize: data.pageable?.pageSize || pageSize,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          first: data.first || false,
          last: data.last || false,
        });

        setCurrentPage(pageNo + 1); // Convert 0-based to 1-based for UI
      } else {
        throw new Error(
          response?.result?.message || 'Failed to fetch execution history'
        );
      }
    } catch (error) {
      console.error('Error fetching execution history:', error);
      toast.error('Failed to load execution history');

      // Fallback to empty state if API fails
      setExecutionHistory([]);
      setPagination({
        pageNumber: 0,
        pageSize: pageSize,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Format execution date for display
  const formatExecutionDate = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
      // Handle the format "2025-05-25 14:17:56"
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Load data on component mount
  useEffect(() => {
    // Check for bulk execution from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const executionId = urlParams.get('executionId');
    const type = urlParams.get('type');

    if (executionId && type === 'bulk') {
      // Load bulk execution from session storage
      const bulkExecutionData = sessionStorage.getItem(
        `bulk-execution-${executionId}`
      );
      if (bulkExecutionData) {
        try {
          const bulkResult = JSON.parse(bulkExecutionData);
          // Transform bulk result to match execution format
          const transformedExecution = {
            id: bulkResult.executionId,
            executionId: bulkResult.executionId,
            status: bulkResult.passed > bulkResult.failed ? 'PASSED' : 'FAILED',
            executionStatus:
              bulkResult.passed > bulkResult.failed ? 'PASSED' : 'FAILED',
            executionType: 'BULK',
            executedBy: bulkResult.executedBy,
            environment: bulkResult.environment,
            executedAt: bulkResult.timestamp,
            passedCount: bulkResult.passed,
            failedCount: bulkResult.failed,
            totalTests: bulkResult.totalTests,
            executionTime: bulkResult.totalDuration,
            successRate: Math.round(
              (bulkResult.passed / bulkResult.totalTests) * 100
            ),
            results: bulkResult.results.map((r) => ({
              id: `tc-${r.rowId}`,
              name: r.testName,
              status: r.status,
              duration: `${r.executionTime}ms`,
              request: {
                method: r.method,
                url: r.url,
                headers: {},
                body: {},
              },
              response: {
                status: r.statusCode,
                data: r.response,
                headers: {},
              },
              assertionResults: r.assertionResults || [],
              assertionSummary: r.assertionSummary || {
                total: 0,
                passed: 0,
                failed: 0,
              },
              executionId: bulkResult.executionId,
              testCaseId: r.rowId,
              executedBy: bulkResult.executedBy,
              executionDate: r.timestamp,
              testSuiteId: null,
              testSuiteName: 'Bulk Execution',
              environment: bulkResult.environment,
            })),
            assertionSummary: {
              total: bulkResult.results.reduce(
                (acc, r) => acc + (r.assertionSummary?.total || 0),
                0
              ),
              passed: bulkResult.results.reduce(
                (acc, r) => acc + (r.assertionSummary?.passed || 0),
                0
              ),
              failed: bulkResult.results.reduce(
                (acc, r) => acc + (r.assertionSummary?.failed || 0),
                0
              ),
              skipped: 0,
              successRate: Math.round(
                (bulkResult.passed / bulkResult.totalTests) * 100
              ),
            },
          };

          setExecutionHistory([transformedExecution]);
          setSelectedExecution(transformedExecution);
          setViewMode('execution');
          toast.success('Bulk execution loaded from session storage');
        } catch (error) {
          console.error('Error loading bulk execution:', error);
          toast.error('Failed to load bulk execution data');
          fetchExecutionHistory(0);
        }
      } else {
        toast.error('Bulk execution data not found');
        fetchExecutionHistory(0);
      }
    } else {
      fetchExecutionHistory(0);
    }
  }, []);

  // Helper function to check if a date falls within the selected range
  const isDateInRange = (executionDate, range) => {
    const execDate = new Date(executionDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    switch (range) {
      case 'today':
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        return execDate >= todayStart && execDate <= today;
      case 'yesterday':
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return execDate >= yesterday && execDate <= yesterdayEnd;
      case 'week':
        return execDate >= weekAgo && execDate <= today;
      case 'month':
        return execDate >= monthAgo && execDate <= today;
      case 'custom':
        if (!customDateRange.startDate || !customDateRange.endDate) return true;
        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        return execDate >= startDate && execDate <= endDate;
      default:
        return true;
    }
  };

  // Filter and search results
  const filteredResults = useMemo(() => {
    return executionHistory.filter((execution) => {
      // Date range filter
      const matchesDateRange = isDateInRange(execution.date, dateRange);

      // Status filter
      const matchesStatus =
        filters.status === 'all' ||
        execution.status.toLowerCase() === filters.status.toLowerCase();

      // Executed by filter
      const matchesExecutedBy =
        !filters.executedBy ||
        execution.executedBy
          .toLowerCase()
          .includes(filters.executedBy.toLowerCase());

      return matchesDateRange && matchesStatus && matchesExecutedBy;
    });
  }, [executionHistory, dateRange, filters, customDateRange]);

  // Helper function to extract assertion results from test case data
  // Handles both bulk execution (assertionResults) and regular execution (assertionResultsDto) structures
  const extractAssertionResults = (testCase) => {
    // Check for assertionResults (used in bulk execution responses)
    if (testCase.assertionResults && Array.isArray(testCase.assertionResults)) {
      return testCase.assertionResults.map((assertion) => ({
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
      }));
    }
    
    // Check for assertionResultsDto (used in regular execution responses)
    if (testCase.assertionResultsDto && Array.isArray(testCase.assertionResultsDto)) {
      return testCase.assertionResultsDto.map((assertion) => ({
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
      }));
    }
    
    // Return empty array if no assertions found
    return [];
  };

  // Helper function to extract numeric execution ID from various formats
  const extractNumericExecutionId = (executionId) => {
    if (!executionId) return null;
    
    const idStr = String(executionId).trim();
    
    // If it's already a number, return it
    if (!isNaN(idStr) && !isNaN(parseFloat(idStr))) {
      return idStr;
    }
    
    // For bulk executions: "bulk-exec-503" -> "503"
    if (idStr.includes('bulk-exec-')) {
      const match = idStr.match(/bulk-exec-(\d+)/);
      if (match) return match[1];
      const replaced = idStr.replace(/bulk-exec-/g, '');
      return replaced || null;
    }
    
    // For regular executions: "exec-492" -> "492"
    if (idStr.startsWith('exec-')) {
      const extracted = idStr.replace('exec-', '');
      // Validate it's numeric
      if (!isNaN(extracted) && !isNaN(parseFloat(extracted))) {
        return extracted;
      }
    }
    
    // Try to extract any numeric part
    const numMatch = idStr.match(/(\d+)/);
    if (numMatch) return numMatch[1];
    
    // If nothing matches, return null
    return null;
  };

  // Create detailed execution data from API response using backend assertion data
  const createDetailedExecutionData = async (execution) => {
    try {
      console.log('createDetailedExecutionData called with execution:', {
        id: execution.id,
        executionId: execution.executionId,
        rawExecutionId: execution.rawExecutionId
      });
      
      // Always fetch from details endpoint to get the most up-to-date data
      // Extract the numeric execution ID for the API call
      // Try rawExecutionId first (if available), then executionId, then id
      const executionIdToExtract = execution.rawExecutionId || execution.executionId || execution.id;
      
      console.log('Attempting to extract numeric execution ID from:', {
        rawExecutionId: execution.rawExecutionId,
        executionId: execution.executionId,
        id: execution.id,
        executionIdToExtract
      });
      
      const numericExecutionId = extractNumericExecutionId(executionIdToExtract);
      
      console.log('Extracted numeric execution ID:', {
        original: executionIdToExtract,
        extracted: numericExecutionId
      });
      
      if (!numericExecutionId) {
        console.error('Cannot extract numeric execution ID. Execution object:', execution);
        console.error('Available fields:', Object.keys(execution));
        toast.error(`Cannot extract execution ID from: ${executionIdToExtract}`);
        return createFallbackExecutionData(execution);
      }
      
      console.log('Fetching execution details from API for ID:', numericExecutionId);
      // Fetch execution details from API
      let detailedResponse;
      try {
        detailedResponse = await testExecution.getExecutionDetails(numericExecutionId);
        console.log('API response received:', detailedResponse);
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }
      
      // Handle both response formats: direct response or wrapped in result.data
      let executionData;
      if (detailedResponse && detailedResponse.result && detailedResponse.result.code === '200') {
        // Wrapped format: { result: { code: '200', data: {...} } }
        console.log('Using wrapped response format');
        executionData = detailedResponse.result.data;
      } else if (detailedResponse && (detailedResponse.executionId !== undefined || detailedResponse.testCaseResults !== undefined)) {
        // Direct format: { executionId: 503, testCaseResults: [...], ... }
        console.log('Using direct response format');
        executionData = detailedResponse;
      } else {
        console.error('Unexpected response format:', detailedResponse);
        return createFallbackExecutionData(execution);
      }
      
      console.log('Extracted execution data:', {
        executionId: executionData.executionId,
        testCaseResultsCount: executionData.testCaseResults?.length || executionData.testCaseResult?.length || 0
      });
      
      // Extract test case results from the response
      // Handle both testCaseResults (bulk) and testCaseResult (regular) structures
      const testCaseResults = executionData.testCaseResults || executionData.testCaseResult || [];
      
      if (!testCaseResults || testCaseResults.length === 0) {
        console.warn('No test case results found in execution details');
        return createFallbackExecutionData(execution);
      }

      // Transform test case results using backend assertion data
      const results = testCaseResults.map((testCase) => {
        // Use helper function to extract assertions (handles both structures)
        const assertions = extractAssertionResults(testCase);

        // Use assertion summary directly from backend when available
        const assertionSummary = testCase.assertionSummary || {
          total: assertions.length,
          passed: assertions.filter((a) => a.status === 'Passed').length,
          failed: assertions.filter((a) => a.status === 'Failed').length,
          skipped: 0,
          successRate: 0,
        };

        // Calculate success rate if not provided
        if (assertionSummary.total > 0 && !assertionSummary.successRate) {
          assertionSummary.successRate = Math.round(
            (assertionSummary.passed / assertionSummary.total) * 100
          );
        }

        // Determine overall status based on assertions or HTTP status when no assertions
        let overallStatus;
        if (assertionSummary.total === 0) {
          // No assertions - check HTTP status code for success
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
          id: `tc-${testCase.testCaseId || testCase.resultId || testCase.rowId}`,
          name: testCase.testCaseName || 'API Test Case',
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
          assertions: assertions,
          assertionResults: assertions, // Also set assertionResults for consistency
          assertionSummary: assertionSummary,
          testSuiteId: testCase.testSuiteId,
          testSuiteName: testCase.testSuiteName,
          testCaseId: testCase.testCaseId,
          resultId: testCase.resultId,
          rowId: testCase.rowId, // Include rowId for bulk executions
        };
      });

      // Recalculate counts based on the updated statuses
      const passedCount = results.filter((r) => r.status === 'Passed').length;
      const executedCount = results.filter((r) => r.status === 'Executed').length;
      const failedCount = results.filter((r) => r.status === 'Failed').length;
      const successfulCount = passedCount + executedCount;
      const newSuccessRate =
        results.length > 0
          ? Math.round((successfulCount / results.length) * 100)
          : 0;

      // Calculate overall assertion summary
      const overallAssertionSummary = executionData.executionSummary?.assertionSummary || 
        results.reduce(
          (acc, r) => ({
            total: acc.total + (r.assertionSummary?.total || 0),
            passed: acc.passed + (r.assertionSummary?.passed || 0),
            failed: acc.failed + (r.assertionSummary?.failed || 0),
            skipped: acc.skipped + (r.assertionSummary?.skipped || 0),
          }),
          { total: 0, passed: 0, failed: 0, skipped: 0 }
        );

      return {
        id: execution.id || `exec-${numericExecutionId}`,
        status: executionData.executionStatus === 'PASSED' ? 'PASSED' : 
                executionData.executionStatus === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
        executionStatus: executionData.executionStatus || execution.executionStatus,
        executionType: execution.executionType || (execution.executionId?.toString().startsWith('bulk-') ? 'BULK' : 'REGULAR'),
        instanceId: execution.id || `exec-${numericExecutionId}`,
        executedBy: executionData.executedBy || execution.executedBy,
        environment: executionData.environmentName || execution.environmentName,
        executedAt: executionData.executionDate 
          ? formatExecutionDate(executionData.executionDate)
          : execution.executedAt,
        passedCount: executionData.executionSummary?.passedTests || passedCount,
        failedCount: executionData.executionSummary?.failedTests || failedCount,
        executedCount: executedCount,
        errorCount: executionData.executionSummary?.errorTests || 0,
        totalTests: executionData.executionSummary?.totalTests || results.length,
        executionTime: executionData.executionTimeMs || execution.executionTime,
        successRate: executionData.executionSummary?.successRate || newSuccessRate,
        results: results,
        rawExecutionId: numericExecutionId,
        executionId: numericExecutionId,
        assertionSummary: overallAssertionSummary,
      };
    } catch (error) {
      console.error('Error creating detailed execution data:', error);
      return createFallbackExecutionData(execution);
    }
  };

  // Create fallback execution data when detailed API call fails
  const createFallbackExecutionData = (execution) => {
    return {
      id: execution.id,
      status: execution.status,
      instanceId: execution.id,
      executedBy: execution.executedBy,
      environment: execution.environmentName,
      executedAt: execution.executedAt,
      passedCount: execution.passedTests,
      failedCount: execution.failedTests,
      errorCount: execution.errorTests,
      totalTests: execution.totalTests,
      executionTime: execution.executionTime,
      successRate: execution.successRate,
      results: [],
    };
  };

  const handleViewExecution = async (executionId) => {
    console.log('handleViewExecution called with executionId:', executionId);
    setLoading(true);

    try {
      // Find the execution in our history
      const execution = executionHistory.find((e) => e.id === executionId);

      if (!execution) {
        console.error('Execution not found in history:', {
          executionId,
          executionHistoryIds: executionHistory.map(e => e.id)
        });
        toast.error('Execution not found');
        return;
      }

      console.log('Found execution in history:', {
        id: execution.id,
        executionId: execution.executionId,
        rawExecutionId: execution.rawExecutionId
      });

      console.log('Calling createDetailedExecutionData...');
      const detailedExecution = await createDetailedExecutionData(execution);
      console.log('Received detailed execution:', detailedExecution);
      
      setSelectedExecution(detailedExecution);
      setViewMode('execution');
    } catch (error) {
      console.error('Error loading execution details:', error);
      toast.error('Failed to load execution details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTestCase = (testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setViewMode('testcase');

    // Update URL for direct access
    if (selectedExecution) {
      window.history.pushState(
        null,
        '',
        `/test-execution/results/${selectedExecution.id}/${testCaseId}`
      );
    }
  };

  const handleBackToExecution = () => {
    setViewMode('execution');
    setSelectedTestCaseId(null);

    // Update URL
    if (selectedExecution) {
      window.history.pushState(
        null,
        '',
        `/test-execution/results/${selectedExecution.id}`
      );
    }
  };

  const handleBackToResults = () => {
    setSelectedExecution(null);
    setViewMode('results');
    setSelectedTestCaseId(null);

    // Update URL
    window.history.pushState(null, '', '/test-results');
  };

  const handleRefresh = () => {
    fetchExecutionHistory(pagination.pageNumber);
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setShowCustomDatePicker(false);
    }
  };

  const handleCustomDateCancel = () => {
    setShowCustomDatePicker(false);
    setDateRange('all');
    setCustomDateRange({ startDate: '', endDate: '' });
  };

  const handleExport = (format) => {
    // Export functionality would be implemented here
  };

  const clearAllFilters = () => {
    setFilters({ status: 'all', executedBy: '' });
    setDateRange('all');
    setCustomDateRange({ startDate: '', endDate: '' });
    setShowCustomDatePicker(false);
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.executedBy !== '' ||
    dateRange !== 'all';

  // Pagination handlers
  const handlePageChange = (page) => {
    const pageNo = page - 1; // Convert 1-based to 0-based
    setCurrentPage(page);
    fetchExecutionHistory(pageNo);
  };

  const getPaginationRange = () => {
    const range = [];
    const dots = '...';
    const visiblePages = 2;

    range.push(1);
    if (currentPage > visiblePages + 2) range.push(dots);

    for (
      let i = Math.max(2, currentPage - visiblePages);
      i <= Math.min(pagination.totalPages - 1, currentPage + visiblePages);
      i++
    ) {
      range.push(i);
    }

    if (currentPage + visiblePages < pagination.totalPages - 1)
      range.push(dots);
    if (pagination.totalPages > 1) range.push(pagination.totalPages);

    return range;
  };

  // Get breadcrumb items based on view mode
  const getBreadcrumbItems = () => {
    const items = [{ label: 'Test Execution' }];

    if (viewMode === 'results') {
      items.push({ label: 'Test Results' });
    } else if (viewMode === 'execution') {
      items.push(
        { label: 'Test Results', path: '/test-results' },
        { label: `Execution ${selectedExecution?.id || ''}` }
      );
    } else if (viewMode === 'testcase') {
      items.push(
        { label: 'Test Results', path: '/test-results' },
        {
          label: `Execution ${selectedExecution?.id || ''}`,
          path: `/test-execution/results/${selectedExecution?.id}`,
        },
        { label: 'Test Case Details' }
      );
    }

    return items;
  };

  // Show test case details view
  if (viewMode === 'testcase' && selectedExecution && selectedTestCaseId) {
    return (
      <div className="p-6 font-inter text-gray-800">
        <Breadcrumb items={getBreadcrumbItems()} />
        <TestCaseDetailsView
          executionId={selectedExecution.id}
          testCaseId={selectedTestCaseId}
          onBack={handleBackToExecution}
        />
      </div>
    );
  }

  // Show execution details view
  if (viewMode === 'execution' && selectedExecution) {
    return (
      <div className="p-6 font-inter text-gray-800">
        <Breadcrumb items={getBreadcrumbItems()} />
        <ExecutionDetailsView
          execution={selectedExecution}
          onBack={handleBackToResults}
          onViewTestCase={handleViewTestCase}
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
            Test Results
          </h1>
          <p className="text-gray-600">View history of all test executions</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FaFilter className="text-gray-500" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                  {Object.values(filters).filter((v) => v && v !== 'all')
                    .length + (dateRange !== 'all' ? 1 : 0)}
                </span>
              )}
              <FaChevronDown
                className={`ml-1 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-10 animate-fade-in">
                <div className="p-3 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">
                      Filter Options
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange('status', e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="passed">Passed Only</option>
                      <option value="failed">Failed Only</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Executed By
                    </label>
                    <input
                      type="text"
                      value={filters.executedBy}
                      onChange={(e) =>
                        handleFilterChange('executedBy', e.target.value)
                      }
                      placeholder="Username"
                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <FaSync
              className={`text-gray-500 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>

          <div className="relative">
            <button className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <FaDownload className="text-gray-500" />
              <span>Export</span>
              <FaChevronDown className="ml-1 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-lg p-3 flex flex-wrap gap-2 border border-gray-200 shadow-sm">
          <button
            onClick={() => handleDateRangeChange('all')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              dateRange === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handleDateRangeChange('today')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              dateRange === 'today'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleDateRangeChange('yesterday')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              dateRange === 'yesterday'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => handleDateRangeChange('week')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              dateRange === 'week'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleDateRangeChange('month')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              dateRange === 'month'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <div className="flex-grow"></div>
          <button
            onClick={() => handleDateRangeChange('custom')}
            className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors ${
              dateRange === 'custom'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaCalendarAlt className="mr-1" />
            <span>Custom Range</span>
          </button>
        </div>

        {/* Custom Date Picker Modal */}
        {showCustomDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Select Custom Date Range
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) =>
                      setCustomDateRange({
                        ...customDateRange,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) =>
                      setCustomDateRange({
                        ...customDateRange,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min={customDateRange.startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCustomDateCancel}
                  className="px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomDateSubmit}
                  disabled={
                    !customDateRange.startDate || !customDateRange.endDate
                  }
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>

            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-1 hover:text-blue-600"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.executedBy && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                User: {filters.executedBy}
                <button
                  onClick={() => handleFilterChange('executedBy', '')}
                  className="ml-1 hover:text-green-600"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}

            {dateRange !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Date:{' '}
                {dateRange === 'custom'
                  ? `${customDateRange.startDate} to ${customDateRange.endDate}`
                  : dateRange}
                <button
                  onClick={() => handleDateRangeChange('all')}
                  className="ml-1 hover:text-purple-600"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-800 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading test results...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <FaSearch className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No test results found
            </h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {hasActiveFilters
                ? 'No executions match your current filters'
                : 'No test executions have been run yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <TestResultsTable
              results={filteredResults}
              totalResults={pagination.totalElements}
              onViewExecution={handleViewExecution}
              onFilter={(status) => handleFilterChange('status', status)}
              currentPage={currentPage}
              isBulkExecution={isBulkExecution}
              pageSize={pageSize}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing{' '}
                {Math.min(
                  (currentPage - 1) * pageSize + 1,
                  pagination.totalElements
                )}{' '}
                to {Math.min(currentPage * pageSize, pagination.totalElements)}{' '}
                of {pagination.totalElements} items
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={pagination.first}
                  className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-40 text-gray-600 transition-colors"
                >
                  Previous
                </button>
                {getPaginationRange().map((item, idx) => (
                  <button
                    key={idx}
                    disabled={item === '...'}
                    onClick={() => item !== '...' && handlePageChange(item)}
                    className={`px-3 py-1 border rounded-md ${
                      item === currentPage
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    } transition-colors`}
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={pagination.last}
                  className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-40 text-gray-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModernTestResults;
