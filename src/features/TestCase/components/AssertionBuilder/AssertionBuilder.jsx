import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiEdit3, FiPlay, FiCopy, FiRefreshCw, FiCircle, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { 
  AssertionTypes, 
  AssertionOperators, 
  createAssertion, 
  getAssertionTypeInfo,
  validateAssertion,
  AssertionTemplates
} from '../../types/assertionTypes';
import { AssertionEngine } from '../../utils/assertionEngine';
import { assertions } from '../../../../utils/api';
import AssertionEditorModal from './AssertionEditorModal';

const AssertionBuilder = ({ 
  testCaseId, 
  sampleResponse = null, 
  onAssertionsChange = () => {},
  readOnly = false 
}) => {
  const [assertionList, setAssertionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssertion, setEditingAssertion] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [selectedAssertions, setSelectedAssertions] = useState([]);

  // Fetch assertions for test case
  const fetchAssertions = useCallback(async () => {
    if (!testCaseId) return;
    
    try {
      setLoading(true);
      const response = await assertions.getByTestCase(testCaseId);
      
      if (response.result?.code === "200") {
        const assertionsData = response.result.data || [];
        setAssertionList(Array.isArray(assertionsData) ? assertionsData : []);
      } else if (response.result?.code === "404") {
        setAssertionList([]);
      } else {
        setAssertionList([]);
      }
    } catch (error) {
      console.error('Error fetching assertions:', error);
      toast.error('Failed to load assertions');
      setAssertionList([]);
    } finally {
      setLoading(false);
    }
  }, [testCaseId]); // FIXED: Removed onAssertionsChange to prevent infinite loop

  useEffect(() => {
    fetchAssertions();
  }, [fetchAssertions]);

  // FIXED: Call onAssertionsChange when assertionList changes, not during fetchAssertions
  useEffect(() => {
    onAssertionsChange(assertionList);
  }, [assertionList, onAssertionsChange]);

  // Handle assertion save
  const handleSaveAssertion = async (assertionData) => {
    try {
      setLoading(true);
      
      if (editingAssertion) {
        // Update existing assertion using assertionId - include isEnabled as backend now supports it
        const { id, createdBy, createdAt, updatedAt, priority, testCaseId, ...cleanAssertionData } = assertionData;
        await assertions.update(editingAssertion.assertionId, cleanAssertionData);
        toast.success('Assertion updated successfully');
      } else {
        // Create new assertion - include isEnabled as backend now supports it
        const { id, createdBy, createdAt, updatedAt, priority, ...cleanAssertionData } = assertionData;
        await assertions.create({
          ...cleanAssertionData,
          testCaseId: testCaseId
        });
        toast.success('Assertion created successfully');
      }
      
      await fetchAssertions();
      handleCloseModals();
    } catch (error) {
      console.error('Error saving assertion:', error);
      toast.error(`Failed to ${editingAssertion ? 'update' : 'create'} assertion`);
    } finally {
      setLoading(false);
    }
  };

  // Handle assertion delete
  const handleDeleteAssertion = async (assertionId) => {
    try {
      setLoading(true);
      await assertions.delete(assertionId);
      toast.success('Assertion deleted successfully');
      await fetchAssertions();
    } catch (error) {
      console.error('Error deleting assertion:', error);
      toast.error('Failed to delete assertion');
    } finally {
      setLoading(false);
    }
  };

  // Test assertion against sample response
  const handleTestAssertion = async (assertion) => {
    if (!sampleResponse) {
      toast.warning('No sample response available for testing');
      return;
    }

    try {
      const result = await AssertionEngine.executeAssertion(
        assertion, 
        sampleResponse, 
        { responseTime: 500 }
      );
      
      setTestResults(prev => ({
        ...prev,
        [assertion.assertionId || assertion.id]: result
      }));
      
      toast.success(`Assertion test completed: ${result.status}`);
    } catch (error) {
      console.error('Error testing assertion:', error);
      toast.error('Failed to test assertion');
    }
  };

  // Test all assertions
  const handleTestAllAssertions = async () => {
    if (!sampleResponse) {
      toast.warning('No sample response available for testing');
      return;
    }

    try {
      setLoading(true);
      const results = await AssertionEngine.executeAssertions(
        assertionList,
        sampleResponse,
        { responseTime: 500 }
      );
      
      const resultMap = {};
      results.forEach(result => {
        resultMap[result.assertionId] = result;
      });
      
      setTestResults(resultMap);
      
      const summary = AssertionEngine.calculateAssertionSummary(results);
      toast.success(`Test completed: ${summary.passed}/${summary.total} passed`);
    } catch (error) {
      console.error('Error testing assertions:', error);
      toast.error('Failed to test assertions');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingAssertion(null);
  };

  // Handle edit assertion
  const handleEditAssertion = (assertion) => {
    setEditingAssertion(assertion);
    setIsEditModalOpen(true);
  };

  // Handle clone assertion
  const handleCloneAssertion = (assertion) => {
    const clonedAssertion = {
      ...assertion,
      id: undefined, // Remove ID so new assertionId will be generated
      assertionId: undefined, // Remove assertionId so new one will be generated
      name: `${assertion.name} (Copy)`
    };
    
    setEditingAssertion(clonedAssertion);
    setIsAddModalOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedAssertions.length === 0) return;
    
    try {
      setLoading(true);
      await assertions.bulkDelete(selectedAssertions);
      toast.success(`${selectedAssertions.length} assertions deleted`);
      setSelectedAssertions([]);
      await fetchAssertions();
    } catch (error) {
      console.error('Error bulk deleting assertions:', error);
      toast.error('Failed to delete assertions');
    } finally {
      setLoading(false);
    }
  };

  // Toggle assertion selection
  const toggleAssertionSelection = (assertionId) => {
    setSelectedAssertions(prev => 
      prev.includes(assertionId) 
        ? prev.filter(id => id !== assertionId)
        : [...prev, assertionId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedAssertions.length === assertionList.length) {
      setSelectedAssertions([]);
    } else {
      setSelectedAssertions(assertionList.map(a => a.assertionId || a.id));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">Assertions</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {assertionList.length} configured
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {sampleResponse && (
              <button
                onClick={handleTestAllAssertions}
                disabled={loading || assertionList.length === 0}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FiPlay className="w-4 h-4" />
                Test All
              </button>
            )}
            
            {selectedAssertions.length > 0 && !readOnly && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete ({selectedAssertions.length})
              </button>
            )}
            
            {!readOnly && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Assertion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assertions List */}
      <div className="divide-y divide-gray-200">
        {loading && assertionList.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading assertions...</p>
          </div>
        ) : assertionList.length === 0 ? (
          <div className="p-8 text-center">
            <FiCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No assertions configured</h4>
            <p className="text-sm text-gray-500 mb-4">
              Add assertions to validate API responses automatically
            </p>
            {!readOnly && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Your First Assertion
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select All Header */}
            {!readOnly && assertionList.length > 1 && (
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedAssertions.length === assertionList.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Select All ({assertionList.length})
                </label>
              </div>
            )}

            {/* Assertion Items */}
            {assertionList.map((assertion, index) => {
              const typeInfo = getAssertionTypeInfo(assertion.type);
              const assertionKey = assertion.assertionId || assertion.id;
              const testResult = testResults[assertionKey];
              
              return (
                <AssertionItem
                  key={assertionKey}
                  assertion={assertion}
                  typeInfo={typeInfo}
                  testResult={testResult}
                  isSelected={selectedAssertions.includes(assertionKey)}
                  onToggleSelect={() => toggleAssertionSelection(assertionKey)}
                  onEdit={() => handleEditAssertion(assertion)}
                  onDelete={() => handleDeleteAssertion(assertionKey)}
                  onClone={() => handleCloneAssertion(assertion)}
                  onTest={() => handleTestAssertion(assertion)}
                  readOnly={readOnly}
                  showSampleTest={!!sampleResponse}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Assertion Editor Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <AssertionEditorModal
          isOpen={isAddModalOpen || isEditModalOpen}
          isEdit={isEditModalOpen}
          assertion={editingAssertion}
          onSave={handleSaveAssertion}
          onClose={handleCloseModals}
          sampleResponse={sampleResponse}
        />
      )}
    </div>
  );
};

// Individual assertion item component
const AssertionItem = ({ 
  assertion, 
  typeInfo, 
  testResult, 
  isSelected, 
  onToggleSelect, 
  onEdit, 
  onDelete, 
  onClone, 
  onTest,
  readOnly,
  showSampleTest 
}) => {
  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start gap-3">
        {!readOnly && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{typeInfo.icon}</span>
                <h4 className="font-medium text-gray-900">{assertion.name}</h4>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {typeInfo.label}
                </span>
                {!assertion.isEnabled && (
                  <span className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full">
                    Disabled
                  </span>
                )}
              </div>
              
              {assertion.description && (
                <p className="text-sm text-gray-600 mb-2">{assertion.description}</p>
              )}
              
              <div className="text-sm text-gray-500 space-y-1">
                <div>Target: <code className="bg-gray-100 px-1 rounded">{assertion.config.target}</code></div>
                <div>
                  Condition: <span className="font-medium">{assertion.config.operator}</span>
                  {assertion.config.expectedValue && (
                    <> <code className="bg-gray-100 px-1 rounded">{assertion.config.expectedValue}</code></>
                  )}
                </div>
              </div>
              
              {testResult && (
                <div className="mt-2 p-2 rounded border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm">
                    {testResult.status === 'PASSED' ? (
                      <FiCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiX className="w-4 h-4 text-red-600" />
                    )}
                    <span className={testResult.status === 'PASSED' ? 'text-green-700' : 'text-red-700'}>
                      {testResult.status}
                    </span>
                    <span className="text-gray-500">({testResult.executionTime}ms)</span>
                  </div>
                  {testResult.error && (
                    <p className="text-sm text-red-600 mt-1">{testResult.error}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              {showSampleTest && (
                <button
                  onClick={onTest}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Test assertion"
                >
                  <FiPlay className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={onClone}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Clone assertion"
              >
                <FiCopy className="w-4 h-4" />
              </button>
              
              {!readOnly && (
                <>
                  <button
                    onClick={onEdit}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Edit assertion"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={onDelete}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete assertion"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default AssertionBuilder; 