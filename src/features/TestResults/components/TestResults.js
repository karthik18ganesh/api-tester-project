import React from 'react';
import { useNavigate } from 'react-router-dom';
import { executionHistory } from '../../TestExecution/data/mockData';
import { FaCheck, FaTimes } from 'react-icons/fa';

const TestResults = () => {
  const navigate = useNavigate();

  const handleViewExecution = (executionId) => {
    navigate(`/test-execution/results/${executionId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Test Results</h1>
        <p className="text-gray-600">View history of all test executions</p>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h2 className="font-semibold text-lg">Results</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Execution ID</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Passed/Failed</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Executed at</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Executed by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {executionHistory.map((execution) => (
              <tr key={execution.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => handleViewExecution(execution.id)}
                  >
                    {execution.id}
                  </button>
                </td>
                <td className="py-3 px-4">
                  {execution.status === 'Passed' ? (
                    <span className="flex items-center text-green-600">
                      <FaCheck className="mr-2" />
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        Passed
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <FaTimes className="mr-2" />
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        Failed
                      </span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">{execution.passedFailed}</td>
                <td className="py-3 px-4">{execution.executedAt}</td>
                <td className="py-3 px-4">{execution.executedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestResults; 