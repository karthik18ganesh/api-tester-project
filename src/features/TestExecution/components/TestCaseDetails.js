import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { executionResults } from '../data/mockData';
import { FaChevronLeft, FaCheck, FaTimes } from 'react-icons/fa';

const TestCaseDetails = () => {
  const { executionId, testCaseId } = useParams();
  const navigate = useNavigate();
  
  const execution = executionResults[executionId];
  const testCase = execution?.results.find(r => r.id === testCaseId);
  
  if (!execution || !testCase) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 p-10">
          Test case not found
        </div>
      </div>
    );
  }

  // Format JSON for display
  const formatJSON = (json) => {
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaChevronLeft className="mr-2" />
          Back to Execution
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{testCase.name}</h1>
          <p className="text-gray-600">Execution ID: {executionId}</p>
        </div>
        <div className={`px-3 py-1 rounded text-white ${testCase.status === 'Passed' ? 'bg-green-500' : 'bg-red-500'}`}>
          {testCase.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-md p-4">
          <h2 className="font-semibold text-lg mb-4">Request</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Method</p>
            <p className="font-medium">{testCase.request.method}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">URL</p>
            <p className="font-medium">{testCase.request.url}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Headers</p>
            <pre className="bg-gray-100 p-3 rounded font-mono text-sm overflow-auto">
              {formatJSON(testCase.request.headers)}
            </pre>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h2 className="font-semibold text-lg mb-4">Response</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="font-medium">{testCase.response.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Body</p>
            <pre className="bg-gray-100 p-3 rounded font-mono text-sm overflow-auto">
              {formatJSON(testCase.response.data)}
            </pre>
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h2 className="font-semibold text-lg">Assertions</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 w-8">#</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Description</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testCase.assertions.map((assertion) => (
              <tr key={assertion.id}>
                <td className="py-3 px-4">{assertion.id}</td>
                <td className="py-3 px-4">{assertion.description}</td>
                <td className="py-3 px-4">
                  {assertion.status === 'Passed' ? (
                    <span className="flex items-center text-green-600">
                      <FaCheck className="mr-2" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <FaTimes className="mr-2" /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestCaseDetails; 