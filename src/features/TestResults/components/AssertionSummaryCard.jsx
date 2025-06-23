import React, { useState } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiSkipForward, FiCircle, FiChevronDown, FiChevronUp, FiTrendingUp, FiClock } from 'react-icons/fi';

const AssertionSummaryCard = ({ 
  summary, 
  showDetails = false, 
  onToggleDetails = null,
  executionTime = null,
  compact = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  if (!summary) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
                      <FiCircle className="w-4 h-4" />
          <span className="text-sm">No assertion data available</span>
        </div>
      </div>
    );
  }

  const { total = 0, passed = 0, failed = 0, skipped = 0 } = summary;
  const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggleDetails) {
      onToggleDetails(newExpanded);
    }
  };

  const getStatusColor = (rate) => {
    if (rate === 100) return 'text-green-700 bg-green-100 border-green-200';
    if (rate >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (rate >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getProgressBarColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <FiCircle className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm text-gray-900">Assertions</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FiCheck className="w-3 h-3 text-green-600" />
            <span className="text-green-700 font-medium">{passed}</span>
          </div>
          
          {failed > 0 && (
            <div className="flex items-center gap-1">
              <FiX className="w-3 h-3 text-red-600" />
              <span className="text-red-700 font-medium">{failed}</span>
            </div>
          )}
          
          {skipped > 0 && (
            <div className="flex items-center gap-1">
              <FiSkipForward className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 font-medium">{skipped}</span>
            </div>
          )}
          
          <span className="text-gray-500">({total} total)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${getProgressBarColor(successRate)}`}
              style={{ width: `${successRate}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 font-medium min-w-[32px]">
            {successRate}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div 
        className={`p-4 ${onToggleDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={onToggleDetails ? handleToggle : undefined}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Assertion Summary</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(successRate)}`}>
              {successRate}% Success Rate
            </span>
            
            {onToggleDetails && (
              <button className="text-gray-400 hover:text-gray-600">
                {isExpanded ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{passed}</div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <FiCheck className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <FiX className="w-6 h-6 text-red-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-600">{skipped}</div>
                <div className="text-sm text-gray-700">Skipped</div>
              </div>
              <FiSkipForward className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              <FiCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Assertion Success Rate</span>
            <span>{passed} / {total} passed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${total > 0 ? (passed / total) * 100 : 0}%` }}
              />
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }}
              />
              <div 
                className="bg-gray-400 transition-all duration-500"
                style={{ width: `${total > 0 ? (skipped / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {executionTime && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              <span>Avg execution: {executionTime}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <FiTrendingUp className="w-3 h-3" />
              <span>Success trend: {successRate >= 80 ? 'Good' : successRate >= 60 ? 'Fair' : 'Poor'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && onToggleDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Pass Rate:</span>
              <span className="font-medium text-green-700">
                {total > 0 ? Math.round((passed / total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Failure Rate:</span>
              <span className="font-medium text-red-700">
                {total > 0 ? Math.round((failed / total) * 100) : 0}%
              </span>
            </div>
            {skipped > 0 && (
              <div className="flex justify-between">
                <span>Skip Rate:</span>
                <span className="font-medium text-gray-600">
                  {total > 0 ? Math.round((skipped / total) * 100) : 0}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssertionSummaryCard; 