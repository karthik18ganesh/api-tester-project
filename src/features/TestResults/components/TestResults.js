import React, { useState, useMemo, useEffect } from 'react';
import { FaChevronDown, FaFilter, FaDownload, FaCalendarAlt, FaSync, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import TestResultsTable from './TestResultsTable';
import ExecutionDetailsView from './ExecutionDetailsView';
import TestCaseDetailsView from '../../TestExecution/components/TestCaseDetailsView';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { testExecution } from '../../../utils/api';

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
  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Fetch execution history from API
  const fetchExecutionHistory = async (pageNo = 0, additionalFilters = {}) => {
    setLoading(true);
    try {
      const response = await testExecution.getExecutionHistory(
        pageNo, 
        pagination.pageSize, 
        'executionDate', 
        'DESC'
      );
      
      console.log('Execution history response:', response);
      
      // Handle different response formats
      let data = [];
      let totalElements = 0;
      let totalPages = 0;
      
      if (response && Array.isArray(response)) {
        // Direct array response
        data = response;
        totalElements = response.length;
        totalPages = Math.ceil(totalElements / pagination.pageSize);
      } else if (response && response.result && response.result.data) {
        // Nested response format
        if (Array.isArray(response.result.data)) {
          data = response.result.data;
          totalElements = data.length;
          totalPages = Math.ceil(totalElements / pagination.pageSize);
        } else if (response.result.data.content) {
          // Paginated response
          data = response.result.data.content;
          totalElements = response.result.data.totalElements || 0;
          totalPages = response.result.data.totalPages || 0;
        }
      } else if (response && response.data) {
        // Response with data property
        if (Array.isArray(response.data)) {
          data = response.data;
          totalElements = data.length;
          totalPages = Math.ceil(totalElements / pagination.pageSize);
        } else if (response.data.content) {
          data = response.data.content;
          totalElements = response.data.totalElements || 0;
          totalPages = response.data.totalPages || 0;
        }
      }
      
      // Transform API data to the expected format
      const formattedHistory = data.map(execution => ({
        id: `exec-${execution.executionId}`,
        status: execution.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
        passedFailed: `${execution.passed || 0}/${execution.failed || 0}`,
        executedAt: formatExecutionDate(execution.executionDate),
        executedBy: execution.executedBy || 'Unknown',
        date: execution.executionDate ? new Date(execution.executionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        rawData: execution, // Store raw data for detailed view
        executionId: execution.executionId, // Store the actual execution ID
        totalTests: execution.totalTests || 0,
        successRate: execution.successRate || 0,
        environmentName: execution.environmentName
      }));
      
      setExecutionHistory(formattedHistory);
      setPagination(prev => ({
        ...prev,
        pageNo: pageNo,
        totalElements: totalElements,
        totalPages: totalPages
      }));
      
    } catch (error) {
      console.error('Error fetching execution history:', error);
      toast.error('Failed to load execution history');
      
      // Fallback to mock data if API fails
      const fallbackData = generateMockExecutionHistory();
      setExecutionHistory(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Format execution date for display
  const formatExecutionDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      // Handle different date formats - timestamp (number) or date string
      const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString.replace(' ', 'T'));
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

  // Generate mock data as fallback
  const generateMockExecutionHistory = () => {
    return [
      {
        id: 'exec-202505091',
        status: 'Passed',
        passedFailed: '5/0',
        executedAt: 'May 9, 2025 - 11:15 AM',
        executedBy: 'john.smith',
        date: '2025-05-09',
        executionId: 91
      },
      {
        id: 'exec-202505092',
        status: 'Passed',
        passedFailed: '5/0',
        executedAt: 'May 9, 2025 - 10:30 AM',
        executedBy: 'john.smith',
        date: '2025-05-09',
        executionId: 92
      },
      {
        id: 'exec-202505093',
        status: 'Failed',
        passedFailed: '3/2',
        executedAt: 'May 8, 2025 - 04:45 PM',
        executedBy: 'jane.doe',
        date: '2025-05-08',
        executionId: 93
      }
    ];
  };

  // Load data on component mount
  useEffect(() => {
    fetchExecutionHistory();
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

  // Create detailed execution data from API response with updated format
  const createDetailedExecutionData = async (execution) => {
    const isFromAPI = execution.rawData;
    
    if (isFromAPI && execution.executionId) {
      try {
        // Fetch full execution details using the actual execution ID
        const detailedResponse = await testExecution.getExecutionDetails(execution.executionId);
        
        console.log('Detailed execution response:', detailedResponse);
        
        // Handle the new unified response format with testCaseResult array
        const testCaseResults = detailedResponse.testCaseResult || [];
        
        const results = testCaseResults.map((testCase) => ({
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
          status: detailedResponse.executionStatus === 'PASSED' ? 'Passed' : 'Failed',
          instanceId: execution.id,
          executedBy: detailedResponse.executedBy,
          environment: detailedResponse.environmentName || 'API Environment',
          executedAt: execution.executedAt,
          passedCount: detailedResponse.passed || 0,
          failedCount: detailedResponse.failed || 0,
          errorCount: detailedResponse.error || 0,
          totalTests: detailedResponse.totalTests || results.length,
          executionTime: detailedResponse.executionTimeMs,
          successRate: detailedResponse.successRate,
          results: results,
          rawExecutionId: execution.executionId,
          actualExecutionId: detailedResponse.executionId
        };
        
      } catch (error) {
        console.error('Error fetching detailed execution data:', error);
        // Fallback to basic data if detailed fetch fails
        return createFallbackExecutionData(execution);
      }
    } else {
      // Use mock data structure for fallback
      return window.mockExecutionData?.[execution.id] || createFallbackExecutionData(execution);
    }
  };

  // Create fallback execution data when detailed API call fails
  const createFallbackExecutionData = (execution) => {
    const passedCount = parseInt(execution.passedFailed.split('/')[0]) || 0;
    const failedCount = parseInt(execution.passedFailed.split('/')[1]) || 0;
    
    return {
      id: execution.id,
      status: execution.status,
      instanceId: execution.id,
      executedBy: execution.executedBy,
      environment: execution.environmentName || 'Unknown Environment',
      executedAt: execution.executedAt,
      passedCount: passedCount,
      failedCount: failedCount,
      totalTests: passedCount + failedCount,
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
    fetchExecutionHistory(pagination.pageNo);
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
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading test results...</p>
        </div>
      ) : (
        <TestResultsTable 
          results={filteredResults}
          totalResults={filteredResults.length}
          onViewExecution={handleViewExecution}
          onFilter={(status) => handleFilterChange('status', status)}
          currentPage={pagination.pageNo + 1}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  );
};

export default ModernTestResults;