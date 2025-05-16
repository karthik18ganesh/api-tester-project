import React, { useState } from 'react';
import { FaChevronDown, FaFilter, FaDownload, FaCalendarAlt, FaSync, FaSearch, FaEye } from 'react-icons/fa';
import TestResultsTable from './TestResultsTable';
import ExecutionDetailsView from './ExecutionDetailsView';

const ModernTestResults = () => {
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    executedBy: '',
  });

  // Example execution history data
  const executionHistory = [
    {
      id: 'exec-202505091',
      status: 'Passed',
      passedFailed: '5/0',
      executedAt: 'May 9, 2025 - 11:15 AM',
      executedBy: 'john.smith'
    },
    {
      id: 'exec-202505092',
      status: 'Passed',
      passedFailed: '5/0',
      executedAt: 'May 9, 2025 - 10:30 AM',
      executedBy: 'john.smith'
    },
    {
      id: 'exec-202505093',
      status: 'Failed',
      passedFailed: '3/2',
      executedAt: 'May 8, 2025 - 04:45 PM',
      executedBy: 'jane.doe'
    },
    {
      id: 'exec-202505094',
      status: 'Failed',
      passedFailed: '2/3',
      executedAt: 'May 8, 2025 - 02:30 PM',
      executedBy: 'jane.doe'
    },
    {
      id: 'exec-202505095',
      status: 'Failed',
      passedFailed: '0/5',
      executedAt: 'May 7, 2025 - 09:15 AM',
      executedBy: 'admin.user'
    },
  ];

  // Mock execution data with detailed results
  const executionData = {
    'exec-202505091': {
      id: 'exec-202505091',
      status: 'Passed',
      instanceId: 'exec-202505091',
      executedBy: 'john.smith',
      environment: 'Production',
      executedAt: 'May 9, 2025 - 11:15 AM',
      passedCount: 5,
      failedCount: 0,
      results: [
        {
          id: 'tc-001',
          name: 'Valid Login Test',
          status: 'Passed',
          duration: '0.84s',
        },
        {
          id: 'tc-002',
          name: 'Invalid Credentials Test',
          status: 'Passed',
          duration: '0.92s',
        },
        {
          id: 'tc-003',
          name: 'Password Reset Test',
          status: 'Passed',
          duration: '1.15s',
        },
        {
          id: 'tc-004',
          name: 'Admin Access Test',
          status: 'Passed',
          duration: '0.76s',
        },
        {
          id: 'tc-005',
          name: 'User Permissions Test',
          status: 'Passed',
          duration: '0.88s',
        }
      ]
    },
    'exec-202505093': {
      id: 'exec-202505093',
      status: 'Failed',
      instanceId: 'exec-202505093',
      executedBy: 'jane.doe',
      environment: 'Staging',
      executedAt: 'May 8, 2025 - 04:45 PM',
      passedCount: 3,
      failedCount: 2,
      results: [
        {
          id: 'tc-001',
          name: 'Valid Login Test',
          status: 'Passed',
          duration: '0.86s',
        },
        {
          id: 'tc-002',
          name: 'Invalid Credentials Test',
          status: 'Passed',
          duration: '0.90s',
        },
        {
          id: 'tc-003',
          name: 'Password Reset Test',
          status: 'Failed',
          duration: '1.35s',
        },
        {
          id: 'tc-004',
          name: 'Admin Access Test',
          status: 'Passed',
          duration: '0.79s',
        },
        {
          id: 'tc-005',
          name: 'User Permissions Test',
          status: 'Failed',
          duration: '1.05s',
        }
      ]
    }
  };

  const handleViewExecution = (executionId) => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setSelectedExecution(executionData[executionId] || executionHistory.find(e => e.id === executionId));
      setLoading(false);
    }, 500);
  };

  const handleViewTestCase = (testCaseId) => {
    console.log(`View test case: ${testCaseId}`);
  };

  const handleBackToResults = () => {
    setSelectedExecution(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleExport = (format) => {
    console.log(`Export as ${format}`);
  };

  if (selectedExecution) {
    return (
      <ExecutionDetailsView 
        execution={selectedExecution} 
        onBack={handleBackToResults}
        onViewTestCase={handleViewTestCase}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
              <FaChevronDown className={`ml-1 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-10 animate-fade-in">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">Filter Options</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select 
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
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
                      onClick={() => {
                        setFilters({ status: 'all', date: 'all', executedBy: '' });
                        setShowFilters(false);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 mr-2"
                    >
                      Reset
                    </button>
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
            
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden">
              <div className="py-1">
                <button 
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  PDF
                </button>
                <button 
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excel
                </button>
                <button 
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Date Range Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-lg p-3 flex flex-wrap gap-2 border border-gray-200 shadow-sm">
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'all' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'today' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('yesterday')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'yesterday' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'week' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'month' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <div className="flex-grow"></div>
          <div className="flex items-center text-sm text-gray-500">
            <FaCalendarAlt className="mr-1" />
            <span>Custom Range</span>
          </div>
        </div>
      </div>
      
      {/* Results Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading test results...</p>
        </div>
      ) : (
        <TestResultsTable 
          results={executionHistory}
          onViewExecution={handleViewExecution}
          onFilter={(status) => handleFilterChange('status', status)}
        />
      )}
    </div>
  );
};

export default ModernTestResults;