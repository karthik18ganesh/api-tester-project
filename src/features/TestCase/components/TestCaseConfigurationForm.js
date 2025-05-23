import React, { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiSettings } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../../utils/api";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ITEMS_PER_PAGE = 6;

const TestCaseConfigurationForm = ({ detectedParameters = [], testCaseId: propTestCaseId }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Variables");
  const [existingVariables, setExistingVariables] = useState([]); // Variables from API
  const [uiVariables, setUiVariables] = useState([]); // Combined UI variables
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteVariable, setDeleteVariable] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editingVariable, setEditingVariable] = useState(null);
  
  // Get testCaseId from props or location state
  const testCaseId = propTestCaseId || location.state?.testCase?.testCaseId;

  const totalPages = Math.ceil(uiVariables.length / ITEMS_PER_PAGE);
  const paginatedVariables = uiVariables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate metadata for API requests
  const generateMetadata = () => {
    return {
      userId: "302",
      transactionId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
  };

  // Fetch existing variables from API
  const fetchExistingVariables = async () => {
    if (!testCaseId) return;
    
    try {
      setLoading(true);
      const response = await api(`/api/v1/variables/${testCaseId}`);
      
      if (response.result?.data) {
        const variablesData = response.result.data || [];
        setExistingVariables(variablesData);
      }
    } catch (err) {
      console.error("Error fetching variables:", err);
      toast.error("Failed to load variables");
    } finally {
      setLoading(false);
    }
  };

  // Combine existing variables with detected parameters for UI display
  const combineVariablesForUI = () => {
    const combined = [...existingVariables];
    
    // Add detected parameters that don't exist as variables yet
    detectedParameters.forEach(param => {
      const existsInVariables = existingVariables.some(v => v.name === param);
      if (!existsInVariables) {
        combined.push({
          name: param,
          value: "",
          isDetectedParameter: true,
          isNew: true, // Indicates this hasn't been saved to API yet
          createdDate: "-",
          updatedDate: "-"
        });
      }
    });
    
    setUiVariables(combined);
  };

  // Load existing variables when component mounts
  useEffect(() => {
    if (testCaseId) {
      fetchExistingVariables();
    }
  }, [testCaseId]);

  // Update UI variables when existing variables or detected parameters change
  useEffect(() => {
    combineVariablesForUI();
  }, [existingVariables, detectedParameters]);

  // Open add modal
  const handleOpenAddModal = () => {
    setInputName("");
    setInputValue("");
    setEditingVariable(null);
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (index) => {
    const variable = paginatedVariables[index];
    setInputName(variable.name);
    setInputValue(variable.value);
    setEditingVariable(variable);
    setIsEditModalOpen(true);
  };

  // Close modals
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setInputName("");
    setInputValue("");
    setEditingVariable(null);
  };

  // Add or update variable
  const handleSaveVariable = async (isUpdate = false) => {
    const nameInput = document.getElementById(isUpdate ? 'edit-variable-name' : 'add-variable-name');
    const valueInput = document.getElementById(isUpdate ? 'edit-variable-value' : 'add-variable-value');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const value = valueInput ? valueInput.value.trim() : '';
    
    if (name === "") {
      toast.error("Name cannot be empty");
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

      let response;
      
      if (isUpdate && editingVariable && !editingVariable.isNew) {
        // Update existing variable
        requestBody.data.variableId = editingVariable.variableId;
        response = await api("/api/v1/variables", "PUT", requestBody);
      } else {
        // Create new variable
        response = await api("/api/v1/variables", "POST", requestBody);
      }
      
      if (response.result?.code === "200") {
        toast.success(`Variable ${isUpdate ? 'updated' : 'created'} successfully`);
        await fetchExistingVariables(); // Refresh from API
      } else {
        throw new Error(response.result?.message || `Failed to ${isUpdate ? 'update' : 'create'} variable`);
      }
    } catch (err) {
      console.error(`Error ${isUpdate ? 'updating' : 'creating'} variable:`, err);
      toast.error(err.message || `Failed to ${isUpdate ? 'update' : 'create'} variable`);
    } finally {
      setLoading(false);
      handleCloseModals();
    }
  };

  // Delete variable
  const handleDeleteVariable = async () => {
    if (!deleteVariable) return;
    
    if (deleteVariable.isNew) {
      // Just remove from UI for detected parameters that haven't been saved
      setUiVariables(prev => prev.filter(v => v.name !== deleteVariable.name));
      toast.success("Parameter removed from list");
      setIsDeleteModalOpen(false);
      setDeleteVariable(null);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api(`/api/v1/variables/${deleteVariable.variableId}`, "DELETE");
      
      if (response.result?.code === "200") {
        toast.success("Variable deleted successfully");
        await fetchExistingVariables(); // Refresh from API
      } else {
        throw new Error(response.result?.message || "Failed to delete variable");
      }
    } catch (err) {
      console.error("Error deleting variable:", err);
      toast.error(err.message || "Failed to delete variable");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteVariable(null);
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (index) => {
    const variable = paginatedVariables[index];
    setDeleteVariable(variable);
    setIsDeleteModalOpen(true);
  };

  // Simple pagination rendering
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
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

  // Add Variable Modal
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
              onClick={() => handleSaveVariable(false)}
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

  // Edit Variable Modal
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
              onClick={() => handleSaveVariable(true)}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {editingVariable?.isNew ? 'Save' : 'Update'}
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
          disabled={!testCaseId || loading}
        >
          <FiPlus className="mr-1" />
          Add Variable
        </button>
      </div>

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
            {tab === "Variables" && uiVariables.length > 0 && (
              <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                {uiVariables.length}
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
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && uiVariables.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4F46E5] mr-2"></div>
                    Loading variables...
                  </div>
                </td>
              </tr>
            ) : paginatedVariables.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  {testCaseId 
                    ? "No variables found. Click \"Add Variable\" to create one."
                    : "Please save the test case before adding variables."}
                </td>
              </tr>
            ) : (
              paginatedVariables.map((item, idx) => {
                const isFromParameter = detectedParameters.includes(item.name);
                const hasValue = item.value && item.value.trim() !== '';
                const isNewParameter = item.isNew;
                
                return (
                  <tr key={`${item.name}-${idx}`} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="font-medium">{item.name}</span>
                        {isFromParameter && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                            Parameter
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="truncate max-w-xs">
                        {hasValue ? (
                          <span className="text-gray-900">{item.value}</span>
                        ) : (
                          <span className="text-gray-400 italic">Empty</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isFromParameter 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isFromParameter ? 'Auto-detected' : 'Manual'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isNewParameter 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isNewParameter ? 'Not Saved' : 'Saved'}
                      </span>
                    </td>
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
                          title={isNewParameter ? "Remove from list" : "Delete"}
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
      {renderPagination()}

      {/* Modals */}
      <AddVariableModal />
      <EditVariableModal />
      
      {/* Confirmation Modal for Delete */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteVariable(null);
        }}
        onConfirm={handleDeleteVariable}
        title={deleteVariable?.isNew ? "Remove Parameter" : "Delete Variable"}
        message={
          deleteVariable?.isNew 
            ? `Are you sure you want to remove "${deleteVariable?.name}" from the list? This will only remove it from the UI.`
            : `Are you sure you want to delete "${deleteVariable?.name}"? This action cannot be undone.`
        }
      />
    </div>
  );
};

export default TestCaseConfigurationForm;