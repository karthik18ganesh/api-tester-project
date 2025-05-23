import React, { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiCheckCircle, FiAlertCircle, FiSettings } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../../utils/api";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ITEMS_PER_PAGE = 6;

const TestCaseConfigurationForm = ({ detectedParameters = [], testCaseId: propTestCaseId, onVariablesCreated, onVariablesUpdated }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Variables");
  const [variables, setVariables] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteVariableId, setDeleteVariableId] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editingVariableId, setEditingVariableId] = useState(null);
  const [autoCreatingVariables, setAutoCreatingVariables] = useState(false);
  const [parametersProcessed, setParametersProcessed] = useState(false);
  
  // Get testCaseId from props or location state
  const testCaseId = propTestCaseId || location.state?.testCase?.testCaseId;

  const totalPages = Math.ceil(variables.length / ITEMS_PER_PAGE);
  const paginatedVariables = variables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate metadata for API requests
  const generateMetadata = () => {
    return {
      userId: "302", // This would typically come from auth context
      transactionId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
  };

  // Fetch variables for the current test case
  const fetchVariables = async () => {
    if (!testCaseId) return;
    
    try {
      setLoading(true);
      const response = await api(`/api/v1/variables/${testCaseId}`);
      
      if (response.result?.data) {
        const variablesData = response.result.data || [];
        setVariables(variablesData);
        
        // Notify parent component about variables update
        if (onVariablesUpdated) {
          onVariablesUpdated(variablesData);
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Error fetching variables:", err);
      toast.error("Failed to load variables");
    } finally {
      setLoading(false);
    }
  };

  // Auto-create variables for detected parameters
  const autoCreateVariables = async (parameters) => {
    if (!testCaseId || !parameters.length || parametersProcessed) return;
    
    setAutoCreatingVariables(true);
    let createdCount = 0;
    let skippedCount = 0;
    
    try {
      // Check which parameters already exist as variables
      const existingVariableNames = variables.map(v => v.name);
      const newParameters = parameters.filter(param => !existingVariableNames.includes(param));
      
      if (newParameters.length === 0) {
        toast.info("All parameters already have corresponding variables");
        setParametersProcessed(true);
        return;
      }

      // Create variables for new parameters
      for (const param of newParameters) {
        try {
          const requestBody = {
            requestMetaData: generateMetadata(),
            data: {
              name: param,
              value: "", // Empty value initially - user will fill this
              testCase: {
                testCaseId: testCaseId
              }
            }
          };
          
          const response = await api("/api/v1/variables", "POST", requestBody);
          
          if (response.result?.code === "200") {
            createdCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`Error creating variable for parameter ${param}:`, error);
          skippedCount++;
        }
      }

      // Show success message
      if (createdCount > 0) {
        toast.success(`Auto-created ${createdCount} variable${createdCount > 1 ? 's' : ''} for detected parameters`);
        await fetchVariables(); // Refresh the variables list
      }
      
      if (skippedCount > 0) {
        toast.warning(`${skippedCount} parameter${skippedCount > 1 ? 's' : ''} could not be created`);
      }

      setParametersProcessed(true);
      
      if (onVariablesCreated) {
        onVariablesCreated(createdCount);
      }

    } catch (error) {
      console.error("Error auto-creating variables:", error);
      toast.error("Failed to auto-create variables");
    } finally {
      setAutoCreatingVariables(false);
    }
  };

  // Load variables when component mounts or testCaseId changes
  useEffect(() => {
    if (testCaseId) {
      fetchVariables();
    }
  }, [testCaseId]);

  // Auto-create variables when parameters are detected
  useEffect(() => {
    if (detectedParameters.length > 0 && testCaseId && variables.length >= 0 && !parametersProcessed) {
      // Small delay to ensure variables are loaded first
      setTimeout(() => {
        autoCreateVariables(detectedParameters);
      }, 500);
    }
  }, [detectedParameters, testCaseId, variables, parametersProcessed]);

  // Open add modal with empty form
  const handleOpenAddModal = () => {
    setInputName("");
    setInputValue("");
    setIsAddModalOpen(true);
  };

  // Open edit modal with values from the selected variable
  const handleOpenEditModal = (index) => {
    const variable = paginatedVariables[index];
    setInputName(variable.name);
    setInputValue(variable.value);
    setEditingVariableId(variable.variableId);
    setIsEditModalOpen(true);
  };

  // Close both modals
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setInputName("");
    setInputValue("");
    setEditingVariableId(null);
  };

  // Add new variable
  const handleAddVariable = async () => {
    // Get values directly from DOM elements
    const nameInput = document.getElementById('add-variable-name');
    const valueInput = document.getElementById('add-variable-value');
    
    // Extract values
    const name = nameInput ? nameInput.value.trim() : '';
    const value = valueInput ? valueInput.value.trim() : '';
    
    // Validate
    if (name === "" || value === "") {
      toast.error("Name and value cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      
      const requestBody = {
        requestMetaData: generateMetadata(),
        data: {
          name: name,
          value: value,
          testCase: {
            testCaseId: testCaseId
          }
        }
      };
      
      const response = await api("/api/v1/variables", "POST", requestBody);
      
      if (response.result?.code === "200") {
        toast.success("Variable created successfully");
        fetchVariables(); // Refresh the data
      } else {
        throw new Error(response.result?.message || "Failed to create variable");
      }
    } catch (err) {
      console.error("Error creating variable:", err);
      toast.error(err.message || "Failed to create variable");
    } finally {
      setLoading(false);
      handleCloseModals();
    }
  };

  // Update existing variable
  const handleUpdateVariable = async () => {
    // Get values directly from DOM elements
    const nameInput = document.getElementById('edit-variable-name');
    const valueInput = document.getElementById('edit-variable-value');
    
    // Extract values
    const name = nameInput ? nameInput.value.trim() : '';
    const value = valueInput ? valueInput.value.trim() : '';
    
    // Validate
    if (name === "" || value === "") {
      toast.error("Name and value cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      
      const requestBody = {
        requestMetaData: generateMetadata(),
        data: {
          variableId: editingVariableId,
          name: name,
          value: value,
          testCase: {
            testCaseId: testCaseId
          }
        }
      };
      
      const response = await api("/api/v1/variables", "PUT", requestBody);
      
      if (response.result?.code === "200") {
        toast.success("Variable updated successfully");
        fetchVariables(); // Refresh the data
      } else {
        throw new Error(response.result?.message || "Failed to update variable");
      }
    } catch (err) {
      console.error("Error updating variable:", err);
      toast.error(err.message || "Failed to update variable");
    } finally {
      setLoading(false);
      handleCloseModals();
    }
  };

  // Delete variable
  const handleDelete = async () => {
    if (!deleteVariableId) {
      toast.error("Cannot delete variable: Missing ID");
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api(`/api/v1/variables/${deleteVariableId}`, "DELETE");
      
      if (response.result?.code === "200") {
        toast.success("Variable deleted successfully");
        fetchVariables(); // Refresh the data
      } else {
        throw new Error(response.result?.message || "Failed to delete variable");
      }
    } catch (err) {
      console.error("Error deleting variable:", err);
      toast.error(err.message || "Failed to delete variable");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteVariableId(null);
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (index) => {
    const variable = paginatedVariables[index];
    setDeleteVariableId(variable.variableId);
    setIsDeleteModalOpen(true);
  };

  // Simple pagination rendering
  const renderPagination = () => {
    const pageNumbers = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-end mt-4 space-x-1 text-sm">
        <button
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
        {startPage > 1 && <span className="px-2">...</span>}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded ${
              page === currentPage
                ? "bg-[#4F46E5] text-white"
                : "border hover:bg-[#4338CA] hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && <span className="px-2">...</span>}
        <button
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  // Get variable status (whether it has a value or not)
  const getVariableStatus = (variable) => {
    const hasValue = variable.value && variable.value.trim() !== '';
    const isFromParameter = detectedParameters.includes(variable.name);
    
    return {
      hasValue,
      isFromParameter,
      statusColor: hasValue ? 'text-green-600' : 'text-yellow-600',
      statusIcon: hasValue ? FiCheckCircle : FiAlertCircle,
      statusText: hasValue ? 'Configured' : 'Needs Value'
    };
  };

  // Parameter Status Summary Component
  const ParameterStatusSummary = () => {
    if (detectedParameters.length === 0) return null;
    
    const parameterVariables = variables.filter(v => detectedParameters.includes(v.name));
    const configuredCount = parameterVariables.filter(v => v.value && v.value.trim() !== '').length;
    const totalCount = detectedParameters.length;
    const isComplete = configuredCount === totalCount;
    
    return (
      <div className={`mb-4 p-4 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isComplete ? (
              <FiCheckCircle className="text-green-600 mr-2" />
            ) : (
              <FiAlertCircle className="text-yellow-600 mr-2" />
            )}
            <div>
              <h4 className={`font-medium ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
                Parameter Configuration Status
              </h4>
              <p className={`text-sm ${isComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                {configuredCount} of {totalCount} parameters configured
              </p>
            </div>
          </div>
          <div className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
            {Math.round((configuredCount / totalCount) * 100)}%
          </div>
        </div>
        
        {!isComplete && (
          <div className="mt-2 text-sm text-yellow-700">
            Please provide values for all detected parameters to ensure proper test execution.
          </div>
        )}
      </div>
    );
  };

  // Enhanced Add Variable Modal
  const AddVariableModal = () => {
    if (!isAddModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiPlus className="mr-2 text-indigo-600" />
            Add New Variable
          </h3>
          
          <div className="mb-4">
            <label htmlFor="add-variable-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="add-variable-name"
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="variable_name"
              defaultValue={inputName}
              ref={(input) => {
                if (input && isAddModalOpen) setTimeout(() => input.focus(), 50);
              }}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="add-variable-value" className="block text-sm font-medium mb-1">Value</label>
            <input
              id="add-variable-value"
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="variable value"
              defaultValue={inputValue}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-4 py-2 border text-sm rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddVariable}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Edit Variable Modal
  const EditVariableModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaEdit className="mr-2 text-indigo-600" />
            Edit Variable
          </h3>
          
          <div className="mb-4">
            <label htmlFor="edit-variable-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="edit-variable-name"
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="variable_name"
              defaultValue={inputName}
              ref={(input) => {
                if (input && isEditModalOpen) setTimeout(() => input.focus(), 50);
              }}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="edit-variable-value" className="block text-sm font-medium mb-1">Value</label>
            <input
              id="edit-variable-value"
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="variable value"
              defaultValue={inputValue}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-4 py-2 border text-sm rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateVariable}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Update
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-semibold flex items-center">
          <FiSettings className="mr-2 text-gray-600" />
          Test case configuration
        </h2>
        <button
          onClick={handleOpenAddModal}
          className="px-3 py-1 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
          disabled={!testCaseId || loading || autoCreatingVariables}
        >
          <FiPlus className="mr-1" />
          Add Variable
        </button>
      </div>

      {/* Parameter Status Summary */}
      <ParameterStatusSummary />

      {/* Auto-creation indicator */}
      {autoCreatingVariables && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-700 text-sm">Auto-creating variables for detected parameters...</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {["Variables", "Functions"].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 font-medium ${
              activeTab === tab
                ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Variables" && variables.length > 0 && (
              <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                {variables.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Created Date</th>
              <th className="p-3 font-medium">Updated Date</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && variables.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4F46E5] mr-2"></div>
                    Loading variables...
                  </div>
                </td>
              </tr>
            ) : paginatedVariables.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  {testCaseId 
                    ? detectedParameters.length > 0 
                      ? "Variables will be auto-created for detected parameters..."
                      : "No variables found. Click \"Add Variable\" to create one."
                    : "Please save the test case before adding variables."}
                </td>
              </tr>
            ) : (
              paginatedVariables.map((item, idx) => {
                const status = getVariableStatus(item);
                const StatusIcon = status.statusIcon;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <StatusIcon className={`h-4 w-4 ${status.statusColor} mr-1`} />
                        <span className={`text-xs ${status.statusColor} font-medium`}>
                          {status.statusText}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="font-medium">{item.name}</span>
                        {status.isFromParameter && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                            Parameter
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="truncate max-w-xs">
                        {item.value ? (
                          <span className="text-gray-900">{item.value}</span>
                        ) : (
                          <span className="text-yellow-600 italic">Empty</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        status.isFromParameter 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {status.isFromParameter ? 'Auto-detected' : 'Manual'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{item.createdDate}</td>
                    <td className="p-3 text-gray-600">{item.updatedDate}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(idx)}
                          className="text-gray-400 hover:text-[#4F46E5] transition-colors"
                          title="Edit"
                          disabled={loading}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                          disabled={loading}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {variables.length > ITEMS_PER_PAGE && renderPagination()}

      {/* Modals */}
      <AddVariableModal />
      <EditVariableModal />
      
      {/* Confirmation Modal for Delete */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteVariableId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Variable"
        message="Are you sure you want to delete this variable? This action cannot be undone."
      />
    </div>
  );
};

export default TestCaseConfigurationForm;