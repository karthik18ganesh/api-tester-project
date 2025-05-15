import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { executionResults } from '../../TestExecution/data/mockData';
import { FaChevronLeft, FaCheck, FaTimes } from 'react-icons/fa';

const ExecutionDetails = () => {
  const { executionId } = useParams();
  const navigate = useNavigate();

  // For demo, use the existing execution data
  const results = executionResults['exec-20405009-001'];

  const handleViewDetails = (testCaseId) => {
    navigate(`/test-execution/results/${results.id}/${testCaseId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/test-results')} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaChevronLeft className="mr-2" />
          Back to Results
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Execution Details</h1>
            <p className="text-gray-600">Execution ID: {results.id}</p>
          </div>
          <div className={`px-3 py-1 rounded text-white ${results.failedCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
            {results.failedCount > 0 ? 'Failed' : 'Passed'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Instance ID</p>
            <p className="font-medium">{results.instanceId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Executed By</p>
            <p className="font-medium">{results.executedBy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Environment</p>
            <p className="font-medium">{results.environment}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Executed At</p>
            <p className="font-medium">{results.executedAt}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex items-center">
            <FaCheck className="text-green-500 mr-2" />
            <span>Passed: {results.passedCount}</span>
          </div>
          <div className="flex items-center">
            <FaTimes className="text-red-500 mr-2" />
            <span>Failed: {results.failedCount}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h2 className="font-semibold text-lg">Test Cases</h2>
        </div>
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
            {results.results.map((result) => (
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
                    onClick={() => handleViewDetails(result.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutionDetails; 