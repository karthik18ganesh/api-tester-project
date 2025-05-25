import React, { useState, useMemo, useEffect } from 'react';
import { FaChevronDown, FaFilter, FaDownload, FaCalendarAlt, FaSync, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import TestResultsTable from './TestResultsTable';
import ExecutionDetailsView from './ExecutionDetailsView';
import TestCaseDetailsView from '../../TestExecution/components/TestCaseDetailsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
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
    endDate: ''
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
    last: false
  });

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
      
      console.log('Execution history response:', response);
      
      // Handle the response format based on the sample provided
      if (response && response.result && response.result.code === "200") {
        const { data } = response.result;
        const executions = data.content || [];
        
        // Transform API data to the expected format
        const formattedHistory = executions.map(execution => ({
          id: `exec-${execution.executionId}`,
          executionId: execution.executionId,
          status: execution.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
          passedFailed: `${execution.executionSummary?.passedTests || 0}/${execution.executionSummary?.failedTests || 0}`,
          executedAt: formatExecutionDate(execution.executionDate),
          executedBy: execution.executedBy || 'Unknown',
          date: execution.executionDate ? new Date(execution.executionDate.replace(' ', 'T')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          rawData: execution, // Store raw data for detailed view
          totalTests: execution.executionSummary?.totalTests || 0,
          passedTests: execution.executionSummary?.passedTests || 0,
          failedTests: execution.executionSummary?.failedTests || 0,
          errorTests: execution.executionSummary?.errorTests || 0,
          successRate: execution.executionSummary?.successRate || 0,
          executionTime: execution.executionTimeMs || 0,
          environmentName: execution.environmentName || 'Unknown',
          testCaseResults: execution.testCaseResults || []
        }));
        
        setExecutionHistory(formattedHistory);
        setPagination({
          pageNumber: data.pageable?.pageNumber || 0,
          pageSize: data.pageable?.pageSize || pageSize,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          first: data.first || false,
          last: data.last || false
        });
        
        setCurrentPage(pageNo + 1); // Convert 0-based to 1-based for UI
        
      } else {
        throw new Error(response?.result?.message || 'Failed to fetch execution history');
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
        last: true
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
        hour12: true
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchExecutionHistory(0);
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
    return executionHistory.filter(execution => {
      // Date range filter
      const matchesDateRange = isDateInRange(execution.date, dateRange);
      
      // Status filter
      const matchesStatus = filters.status === 'all' || 
        execution.status.toLowerCase() === filters.status.toLowerCase();
      
      // Executed by filter
      const matchesExecutedBy = !filters.executedBy || 
        execution.executedBy.toLowerCase().includes(filters.executedBy.toLowerCase());
      
      return matchesDateRange && matchesStatus && matchesExecutedBy;
    });
  }, [executionHistory, dateRange, filters, customDateRange]);

  // Create detailed execution data from API response
  const createDetailedExecutionData = async (execution) => {
    try {
      // Check if we have detailed test case results in the current data
      if (execution.testCaseResults && execution.testCaseResults.length > 0) {
        // Transform the existing testCaseResults
        const results = execution.testCaseResults.map((testCase) => ({
          id: `tc-${testCase.testCaseId}`,
          name: testCase.testCaseName || 'API Test Case',
          status: testCase.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
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
              description: 'HTTP Status Code Validation',
              status: testCase.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
              ...(testCase.executionStatus !== 'PASSED' && {
                error: testCase.errorMessage || `Expected successful response but got status ${testCase.statusCode}`
              })
            },
            {
              id: 2,
              description: 'Response Time Validation',
              status: testCase.executionTimeMs <= 5000 ? 'Passed' : 'Failed',
              ...(testCase.executionTimeMs > 5000 && {
                error: `Response time ${testCase.executionTimeMs}ms exceeded 5000ms limit`
              })
            }
          ],
          testSuiteId: testCase.testSuiteId,
          testSuiteName: testCase.testSuiteName,
          testCaseId: testCase.testCaseId,
          resultId: testCase.resultId
        }));

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
          results: results,
          rawExecutionId: execution.executionId
        };
      } else {
        // If no detailed results, try to fetch from the details endpoint
        const detailedResponse = await testExecution.getExecutionDetails(execution.executionId);
        
        if (detailedResponse && detailedResponse.testCaseResult) {
          const results = detailedResponse.testCaseResult.map((testCase) => ({
            id: `tc-${testCase.testCaseId}`,
            name: testCase.testCaseName || 'API Test Case',
            status: testCase.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
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
                description: 'HTTP Status Code Validation',
                status: testCase.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
                ...(testCase.executionStatus !== 'PASSED' && {
                  error: testCase.errorMessage || `Expected successful response but got status ${testCase.statusCode}`
                })
              }
            ],
            testSuiteId: testCase.testSuiteId,
            testSuiteName: testCase.testSuiteName,
            testCaseId: testCase.testCaseId,
            resultId: testCase.resultId
          }));

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
            results: results,
            rawExecutionId: execution.executionId
          };
        } else {
          // Fallback to basic data
          return createFallbackExecutionData(execution);
        }
      }
      
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
      results: []
    };
  };

  const handleViewExecution = async (executionId) => {
    setLoading(true);
    
    try {
      // Find the execution in our history
      const execution = executionHistory.find(e => e.id === executionId);
      
      if (!execution) {
        toast.error('Execution not found');
        return;
      }

      const detailedExecution = await createDetailedExecutionData(execution);
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
      [name]: value
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
    console.log(`Export as ${format}`);
  };

  const clearAllFilters = () => {
    setFilters({ status: 'all', executedBy: '' });
    setDateRange('all');
    setCustomDateRange({ startDate: '', endDate: '' });
    setShowCustomDatePicker(false);
  };

  const hasActiveFilters = filters.status !== 'all' || filters.executedBy !== '' || dateRange !== 'all';

  // Pagination handlers
  const handlePageChange = (page) => {
    const pageNo = page - 1; // Convert 1-based to 0-based
    setCurrentPage(page);
    fetchExecutionHistory(pageNo);
  };

  const getPaginationRange = () => {
    const range = [];
    const dots = "...";
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

    if (currentPage + visiblePages < pagination.totalPages - 1) range.push(dots);
    if (pagination.totalPages > 1) range.push(pagination.totalPages);

    return range;
  };

  // Get breadcrumb items based on view mode
  const getBreadcrumbItems = () => {
    const items = [{ label: "Test Execution" }];
    
    if (viewMode === 'results') {
      items.push({ label: "Test Results" });
    } else if (viewMode === 'execution') {
      items.push(
        { label: "Test Results", path: "/test-results" },
        { label: `Execution ${selectedExecution?.id || ''}` }
      );
    } else if (viewMode === 'testcase') {
      items.push(
        { label: "Test Results", path: "/test-results" },
        { label: `Execution ${selectedExecution?.id || ''}`, path: `/test-execution/results/${selectedExecution?.id}` },
        { label: "Test Case Details" }
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
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Test Results</h1>
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
                  {Object.values(filters).filter(v => v && v !== 'all').length + (dateRange !== 'all' ? 1 : 0)}
                </span>
              )}
              <FaChevronDown className={`ml-1 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-10 animate-fade-in">
                <div className="p-3 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Filter Options</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="passed">Passed Only</option>
                      <option value="failed">Failed Only</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Executed By</label>
                    <input
                      type="text"
                      value={filters.executedBy}
                      onChange={(e) => handleFilterChange('executedBy', e.target.value)}
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
            <FaSync className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
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
              <h3 className="text-lg font-semibold mb-4">Select Custom Date Range</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
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
                  disabled={!customDateRange.startDate || !customDateRange.endDate}
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
                Date: {dateRange === 'custom' ? `${customDateRange.startDate} to ${customDateRange.endDate}` : dateRange}
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">No test results found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {hasActiveFilters 
                ? "No executions match your current filters"
                : "No test executions have been run yet"}
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
              pageSize={pageSize}
            />
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, pagination.totalElements)} to{" "}
                {Math.min(currentPage * pageSize, pagination.totalElements)} of {pagination.totalElements} items
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
                    disabled={item === "..."}
                    onClick={() => item !== "..." && handlePageChange(item)}
                    className={`px-3 py-1 border rounded-md ${
                      item === currentPage
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-100 text-gray-600"
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