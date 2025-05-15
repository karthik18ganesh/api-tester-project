import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TestHierarchy from './TestHierarchy';
import ExecutionResults from './ExecutionResults';
import { testHierarchy, executionResults } from '../data/mockData';
import { FaPlay } from 'react-icons/fa';

const TestExecution = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const handleRun = () => {
    if (!selectedItem) return;

    setExecuting(true);
    setExecutionResult(null);
    
    // Simulate execution delay
    setTimeout(() => {
      setExecuting(false);
      setExecutionResult(executionResults['exec-20405009-001']);
    }, 2000);
  };

  const handleViewDetails = (testCaseId) => {
    if (executionResult) {
      navigate(`/test-execution/results/${executionResult.id}/${testCaseId}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Test Execution</h1>
          <p className="text-gray-600">Run test packages, suites, or individual cases</p>
        </div>
        <button
          onClick={handleRun}
          disabled={!selectedItem || executing}
          className={`flex items-center px-4 py-2 rounded text-white ${
            !selectedItem || executing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <FaPlay className="mr-2" />
          Run {selectedItem?.type === 'package' ? 'Package' : selectedItem?.type === 'suite' ? 'Suite' : 'Case'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[calc(100vh-200px)]">
          <TestHierarchy 
            data={testHierarchy} 
            onSelect={handleSelect} 
            selectedId={selectedItem?.id}
          />
        </div>
        <div className="h-[calc(100vh-200px)]">
          <ExecutionResults 
            results={executionResult}
            inProgress={executing}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default TestExecution; 