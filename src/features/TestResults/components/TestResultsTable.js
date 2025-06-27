import React, { useState } from 'react';
import { FaCheck, FaTimes, FaCalendarAlt, FaUser, FaClock, FaChevronDown, FaChevronUp, FaEye } from 'react-icons/fa';
import { FiFilter, FiSearch, FiX, FiMoreHorizontal, FiDownload } from 'react-icons/fi';
import { getTestCaseDisplayStatus, getStatusBadgeClass, getAssertionSubtitle } from '../../../utils/testStatusUtils';

const TestResultsTable = ({ results, onViewExecution, onFilter, totalResults, currentPage, pageSize }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  
  // Ensure we have valid props with defaults
  const safeResults = results || [];
  const safeTotalResults = totalResults || 0;
  
  // Filter results based on search term and status filter
  const filteredResults = React.useMemo(() => {
    return safeResults.filter(execution => {
      const matchesSearch = 
        execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.executedBy.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = 
        filterStatus === 'all' || 
        execution.status.toLowerCase() === filterStatus.toLowerCase();
        
      return matchesSearch && matchesStatus;
    });
  }, [safeResults, searchTerm, filterStatus]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setShowFilterDropdown(false);
    if (onFilter) {
      onFilter(status);
    }
  };

  const handleExport = (format) => {
    // Export functionality would be implemented here
    setShowExportDropdown(false);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
      if (!event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="font-semibold text-lg text-gray-800 flex items-center">
          Test Results
          <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">
            {safeTotalResults} executions
          </span>
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Filter dropdown */}
          <div className="relative inline-block filter-dropdown">
            <button 
              className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <FiFilter className="text-gray-500" />
              <span>
                {filterStatus === 'all' ? 'All Status' : 
                 filterStatus === 'passed' ? 'Passed' : 
                 filterStatus === 'failed' ? 'Failed' : 'Filter'}
              </span>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button 
                    onClick={() => handleFilterChange('all')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === 'all' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                    }`}
                  >
                    All Status
                  </button>
                  <button 
                    onClick={() => handleFilterChange('passed')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === 'passed' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                    }`}
                  >
                    Passed
                  </button>
                  <button 
                    onClick={() => handleFilterChange('failed')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === 'failed' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Export button */}
          <div className="relative inline-block export-dropdown">
            <button 
              className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              <FiDownload className="text-gray-500" />
              <span>Export</span>
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button 
                    onClick={() => handleExport('PDF')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button 
                    onClick={() => handleExport('Excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Excel
                  </button>
                  <button 
                    onClick={() => handleExport('CSV')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-100 rounded-full p-3 inline-flex mb-4">
            <FiSearch className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No test executions available'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Execution ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assertions</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed at</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed by</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((execution) => {
                const displayStatus = getTestCaseDisplayStatus(execution);
                const badgeClass = getStatusBadgeClass(displayStatus);
                const assertionSubtitle = getAssertionSubtitle(execution);
                
                return (
                  <tr key={execution.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <button 
                        className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                        onClick={() => onViewExecution && onViewExecution(execution.id)}
                      >
                        {execution.id}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                        {displayStatus.displayText === 'Passed' ? (
                          <FaCheck className="mr-1 h-3 w-3" />
                        ) : displayStatus.displayText === 'Executed' ? (
                          <FaCheck className="mr-1 h-3 w-3" />
                        ) : (
                          <FaTimes className="mr-1 h-3 w-3" />
                        )}
                        {displayStatus.displayText}
                      </span>
                      {displayStatus.isExecutedWithoutAssertions && (
                        <div className="text-xs text-blue-600 mt-1">No assertions created</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className="text-green-600 font-medium mr-1">{execution.passedTests || execution.passedFailed?.split('/')[0] || '0'}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-red-600 font-medium ml-1">{execution.failedTests || (execution.totalTests - (execution.passedTests || 0)) || execution.passedFailed?.split('/')[1] || '0'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {execution.totalTests || (execution.passedTests || 0) + (execution.failedTests || 0)} total
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {execution.assertionSummary && execution.assertionSummary.total > 0 ? (
                        <div>
                          <div className="flex items-center">
                            <FaCheck className="mr-1 h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium mr-1">{execution.assertionSummary.passed}</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-red-600 font-medium ml-1">{execution.assertionSummary.failed}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {execution.assertionSummary.total} total
                            {execution.assertionSummary.skipped > 0 && (
                              <span className="text-gray-400 ml-1">({execution.assertionSummary.skipped} skipped)</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">No assertions</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-gray-500">
                        <FaCalendarAlt className="mr-1 h-3 w-3" />
                        <span className="text-sm">{execution.executedAt}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-gray-500">
                        <FaUser className="mr-1 h-3 w-3" />
                        <span className="text-sm">{execution.executedBy}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestResultsTable;