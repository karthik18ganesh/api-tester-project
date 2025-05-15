import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ExecutionResults = ({ results, inProgress, onViewDetails }) => {
  const navigate = useNavigate();
  
  if (!results && !inProgress) {
    return (
      <div className="border rounded-md p-6 h-full flex items-center justify-center">
        <p className="text-gray-500">Select and run a test to see results</p>
      </div>
    );
  }

  const executionInfo = results || { 
    instanceId: 'In Progress', 
    executedBy: '-', 
    environment: '-', 
    executedAt: '-',
    passedCount: 0,
    failedCount: 0
  };

  return (
    <div className="border rounded-md p-4 h-full overflow-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Execution Details</h2>
          <div className={`px-3 py-1 rounded text-white ${inProgress ? 'bg-yellow-500' : results?.failedCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
            {inProgress ? 'In Progress' : results?.failedCount > 0 ? 'Failed' : 'Passed'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Instance ID</p>
            <p className="font-medium">{executionInfo.instanceId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Executed By</p>
            <p className="font-medium">{executionInfo.executedBy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Environment</p>
            <p className="font-medium">{executionInfo.environment}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Executed At</p>
            <p className="font-medium">{executionInfo.executedAt}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex items-center">
            <FaCheck className="text-green-500 mr-2" />
            <span>Passed: {executionInfo.passedCount}</span>
          </div>
          <div className="flex items-center">
            <FaTimes className="text-red-500 mr-2" />
            <span>Failed: {executionInfo.failedCount}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-md mb-3">Test Cases</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Duration</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inProgress ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    Running tests...
                  </td>
                </tr>
              ) : (
                results?.results.map((result) => (
                  <tr key={result.id}>
                    <td className="py-3 px-4">{result.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${result.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{result.duration}</td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => onViewDetails(result.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExecutionResults; 