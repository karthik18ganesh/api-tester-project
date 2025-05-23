import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ParameterCompletionSummary = ({ 
  testCaseId, 
  detectedParameters = [], 
  configuredParameters = [], 
  testCaseName = "",
  onComplete 
}) => {
  const navigate = useNavigate();
  
  const totalParameters = detectedParameters.length;
  const configuredCount = configuredParameters.length;
  const completionRate = totalParameters > 0 ? Math.round((configuredCount / totalParameters) * 100) : 100;
  const isComplete = completionRate === 100;
  
  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/test-design/test-case');
    }
  };

  // Don't show if no parameters detected
  if (totalParameters === 0) return null;

  return (
    <div className={`mt-6 p-6 rounded-lg border-2 ${
      isComplete 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-4 ${
            isComplete ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isComplete ? (
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <FiAlertCircle className="h-6 w-6 text-yellow-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 ${
              isComplete ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {isComplete ? 'Configuration Complete!' : 'Configuration Required'}
            </h3>
            
            <p className={`text-sm mb-3 ${
              isComplete ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {isComplete 
                ? `All ${totalParameters} parameter${totalParameters > 1 ? 's have' : ' has'} been configured for "${testCaseName}"`
                : `${configuredCount} of ${totalParameters} parameter${totalParameters > 1 ? 's' : ''} configured for "${testCaseName}"`
              }
            </p>
            
            {/* Parameter List */}
            <div className="flex flex-wrap gap-2 mb-4">
              {detectedParameters.map((param) => {
                const isConfigured = configuredParameters.includes(param);
                return (
                  <div
                    key={param}
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isConfigured
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {isConfigured && <FiCheckCircle className="w-3 h-3 mr-1" />}
                    ${param}
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-medium ${
                  isComplete ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  Configuration Progress
                </span>
                <span className={`text-xs font-bold ${
                  isComplete ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            
            {!isComplete && (
              <div className="flex items-center text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                <FiSettings className="mr-2 flex-shrink-0" />
                <span>Please provide values for all parameters above to ensure proper test execution.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="ml-4">
          {isComplete ? (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
            >
              Complete Test Case
              <FiArrowRight className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <div className="text-right">
              <div className={`text-2xl font-bold mb-1 ${
                isComplete ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {configuredCount}/{totalParameters}
              </div>
              <div className="text-xs text-gray-600">configured</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParameterCompletionSummary;