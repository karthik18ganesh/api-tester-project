import React from 'react';
import { FaCheck, FaTimes, FaCalendarAlt, FaUser, FaFilter, FaDownload, FaSearch } from 'react-icons/fa';

const TestResultsTable = ({ results, onViewExecution, onFilter }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  
  // Filter results based on search term and status filter
  const filteredResults = React.useMemo(() => {
    return results.filter(execution => {
      const matchesSearch = 
        execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.executedBy.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = 
        filterStatus === 'all' || 
        execution.status.toLowerCase() === filterStatus.toLowerCase();
        
      return matchesSearch && matchesStatus;
    });
  }, [results, searchTerm, filterStatus]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (onFilter) {
      onFilter(status);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="font-semibold text-lg text-gray-800 flex items-center">
          Test Results
          <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">
            {results.length} executions
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
              className="pl-9 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Filter dropdown */}
          <div className="relative inline-block">
            <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
              <FaFilter className="text-gray-500" />
              <span>
                {filterStatus === 'all' ? 'All Status' : 
                 filterStatus === 'passed' ? 'Passed' : 
                 filterStatus === 'failed' ? 'Failed' : 'Filter'}
              </span>
            </button>
            
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden">
              <div className="py-1">
                <button 
                  onClick={() => handleFilterChange('all')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  All Status
                </button>
                <button 
                  onClick={() => handleFilterChange('passed')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Passed
                </button>
                <button 
                  onClick={() => handleFilterChange('failed')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Failed
                </button>
              </div>
            </div>
          </div>
          
          {/* Export button */}
          <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
            <FaDownload className="text-gray-500" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-100 rounded-full p-3 inline-flex mb-4">
            <FaSearch className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No test executions available'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Execution ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passed/Failed</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed at</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed by</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((execution) => (
                <tr key={execution.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                      onClick={() => onViewExecution(execution.id)}
                    >
                      {execution.id}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    {execution.status === 'Passed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheck className="mr-1 h-3 w-3" />
                        Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaTimes className="mr-1 h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="text-green-600 font-medium mr-1">{execution.passedFailed.split('/')[0]}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-red-600 font-medium ml-1">{execution.passedFailed.split('/')[1]}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-gray-500">
                      <FaCalendarAlt className="mr-1 h-3 w-3" />
                      {execution.executedAt}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-gray-500">
                      <FaUser className="mr-1 h-3 w-3" />
                      {execution.executedBy}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination (simplified for the example) */}
      <div className="bg-gray-50 py-3 px-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredResults.length}</span> of{' '}
          <span className="font-medium">{filteredResults.length}</span> results
        </div>
        
        <div className="flex gap-1">
          <button
            disabled={true}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40 text-gray-600"
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded bg-indigo-600 text-white"
          >
            1
          </button>
          <button
            disabled={true}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40 text-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultsTable;