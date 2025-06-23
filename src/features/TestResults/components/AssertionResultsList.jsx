import React, { useState, useMemo } from 'react';
import { 
  FiCheck, FiX, FiAlertTriangle, FiSkipForward, FiCircle, FiCode, FiClock, 
  FiFilter, FiSearch, FiChevronDown, FiChevronRight, FiArrowUp, FiArrowDown, FiEye 
} from 'react-icons/fi';

const AssertionResultsList = ({ 
  results = [], 
  groupBy = null, 
  showExecutionTime = true,
  compact = false,
  searchable = true,
  filterable = true,
  sortable = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedResults, setExpandedResults] = useState(new Set());

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'FAILED':
        return <FiX className="w-4 h-4 text-red-600" />;
      case 'ERROR':
        return <FiAlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'SKIPPED':
        return <FiSkipForward className="w-4 h-4 text-gray-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'ERROR':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'SKIPPED':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'json_path':
        return <FiCircle className="w-3 h-3" />;
      case 'status_code':
        return <FiCode className="w-3 h-3" />;
      case 'response_time':
        return <FiClock className="w-3 h-3" />;
      default:
        return <FiCheck className="w-3 h-3" />;
    }
  };

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = results.filter(result => {
      const matchesSearch = !searchTerm || 
        result.assertionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        result.status?.toUpperCase() === statusFilter.toUpperCase();
      
      return matchesSearch && matchesStatus;
    });

    // Sort results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.assertionName || a.name || '';
          bValue = b.assertionName || b.name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'executionTime':
          aValue = a.executionTime || 0;
          bValue = b.executionTime || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [results, searchTerm, statusFilter, sortBy, sortOrder]);

  // Group results if needed
  const groupedResults = useMemo(() => {
    if (!groupBy) return { 'All Assertions': filteredAndSortedResults };

    const groups = {};
    filteredAndSortedResults.forEach(result => {
      let groupKey;
      
      if (groupBy === 'status') {
        groupKey = result.status || 'Unknown';
      } else if (groupBy === 'testCase') {
        groupKey = result.testCaseName || result.testCaseId || 'Unknown Test Case';
      } else {
        groupKey = 'Other';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(result);
    });

    return groups;
  }, [filteredAndSortedResults, groupBy]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleResult = (resultId) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p>No assertion results available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {(searchable || filterable || sortable) && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {searchable && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assertions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {filterable && (
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="ERROR">Error</option>
                <option value="SKIPPED">Skipped</option>
              </select>
            </div>
          )}

          {sortable && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button
                onClick={() => handleSort('name')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                  sortBy === 'name' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Name
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('status')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                  sortBy === 'status' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Status
                {sortBy === 'status' && (
                  sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                )}
              </button>
              {showExecutionTime && (
                <button
                  onClick={() => handleSort('executionTime')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm ${
                    sortBy === 'executionTime' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Time
                  {sortBy === 'executionTime' && (
                    sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {Object.entries(groupedResults).map(([groupKey, groupResults]) => (
          <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
            {groupBy && (
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedGroups.has(groupKey) ? (
                    <FiChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <FiChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">{groupKey}</span>
                  <span className="text-sm text-gray-500">({groupResults.length})</span>
                </div>
              </button>
            )}

            {(expandedGroups.has(groupKey) || !groupBy) && (
              <div className="divide-y divide-gray-100">
                {groupResults.map((result, index) => {
                  const resultId = result.assertionId || result.id || index;
                  const isExpanded = expandedResults.has(resultId);

                  return (
                    <div key={resultId} className="bg-white">
                      <div className={`p-4 ${compact ? 'py-3' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(result.status)}
                              <span className="font-medium text-gray-900">
                                {result.assertionName || result.name || `Assertion ${index + 1}`}
                              </span>
                              {result.type && result.type !== 'system' && (
                                <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full border">
                                  {getTypeIcon(result.type)}
                                  {result.type.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>

                            {!compact && result.path && (
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Target:</span>
                                <code className="ml-1 bg-gray-100 px-1 rounded text-xs">{result.path}</code>
                              </div>
                            )}

                            {!compact && (result.expectedValue !== undefined || result.actualValue !== undefined) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
                                {result.expectedValue !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Expected:</span>
                                    <div className="mt-1 p-2 bg-gray-50 rounded border text-xs font-mono break-all max-h-20 overflow-y-auto">
                                      {typeof result.expectedValue === 'object' 
                                        ? JSON.stringify(result.expectedValue, null, 2)
                                        : String(result.expectedValue)}
                                    </div>
                                  </div>
                                )}

                                {result.actualValue !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Actual:</span>
                                    <div className="mt-1 p-2 bg-gray-50 rounded border text-xs font-mono break-all max-h-20 overflow-y-auto">
                                      {typeof result.actualValue === 'object' 
                                        ? JSON.stringify(result.actualValue, null, 2)
                                        : String(result.actualValue)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {!compact && result.error && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                                <div className="flex items-start gap-2">
                                  <FiX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-red-900 mb-1">Error Details</div>
                                    <div className="text-red-700">{result.error}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.status?.toUpperCase() === 'PASSED' ? 'bg-green-100 text-green-700' :
                              result.status?.toUpperCase() === 'FAILED' ? 'bg-red-100 text-red-700' :
                              result.status?.toUpperCase() === 'ERROR' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.status}
                            </span>

                            {showExecutionTime && result.executionTime !== undefined && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                {result.executionTime}ms
                              </span>
                            )}

                            {compact && (result.expectedValue !== undefined || result.actualValue !== undefined || result.error) && (
                              <button
                                onClick={() => toggleResult(resultId)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <FiEye className="w-3 h-3" />
                                Details
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded details for compact mode */}
                        {compact && isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                            {result.path && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Target:</span>
                                <code className="ml-1 bg-gray-100 px-1 rounded text-xs">{result.path}</code>
                              </div>
                            )}

                            {(result.expectedValue !== undefined || result.actualValue !== undefined) && (
                              <div className="grid grid-cols-1 gap-3 text-sm">
                                {result.expectedValue !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Expected:</span>
                                    <div className="mt-1 p-2 bg-gray-50 rounded border text-xs font-mono break-all max-h-20 overflow-y-auto">
                                      {typeof result.expectedValue === 'object' 
                                        ? JSON.stringify(result.expectedValue, null, 2)
                                        : String(result.expectedValue)}
                                    </div>
                                  </div>
                                )}

                                {result.actualValue !== undefined && (
                                  <div>
                                    <span className="text-gray-600">Actual:</span>
                                    <div className="mt-1 p-2 bg-gray-50 rounded border text-xs font-mono break-all max-h-20 overflow-y-auto">
                                      {typeof result.actualValue === 'object' 
                                        ? JSON.stringify(result.actualValue, null, 2)
                                        : String(result.actualValue)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {result.error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                                <div className="flex items-start gap-2">
                                  <FiX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-red-900 mb-1">Error Details</div>
                                    <div className="text-red-700">{result.error}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FiCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>No assertions match the current filters</p>
        </div>
      )}
    </div>
  );
};

export default AssertionResultsList; 