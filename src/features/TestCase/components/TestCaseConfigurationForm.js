import React, { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiSettings, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import { FaMagic } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../../utils/api";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ITEMS_PER_PAGE = 6;

const TestCaseConfigurationForm = ({ detectedParameters = [], testCaseId: propTestCaseId }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Variables");
  const [variables, setVariables] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creatingParameters, setCreatingParameters] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteVariable, setDeleteVariable] = useState(null);
  const [editingVariable, setEditingVariable] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: ""
  });
  
  const testCaseId = propTestCaseId || location.state?.testCase?.testCaseId;

  // Calculate parameter statistics
  const totalDetectedParams = detectedParameters?.length || 0;
  const savedParams = variables.filter(v => 
    detectedParameters?.includes(v.name)
  ).length;
  const unsavedParams = totalDetectedParams - savedParams;

  // Generate metadata for API requests
  const generateMetadata = () => ({
    userId: localStorage.getItem("userId") || "302",
    transactionId: Date.now().toString(),
    timestamp: new Date().toISOString()
  });

  // Fetch existing variables from API
  const fetchVariables = async () => {
    if (!testCaseId) {
      console.log("No testCaseId provided, skipping variable fetch");
      setInitialLoadComplete(true);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching variables for test case ID: ${testCaseId}`);
      
      const response = await api(`/api/v1/variables/${testCaseId}`);
      console.log("Variables API response:", response);
      
      if (response.result?.code === "200") {
        const variablesData = response.result.data || [];
        console.log("Variables data:", variablesData);
        setVariables(Array.isArray(variablesData) ? variablesData : []);
      } else if (response.result?.code === "404") {
        // No variables found - this is normal for new test cases
        console.log("No variables found for test case, setting empty array");
        setVariables([]);
      } else {
        console.warn("Unexpected response code:", response.result?.code);
        setVariables([]);
      }
    } catch (err) {
      console.error("Error fetching variables:", err);
      
      // Handle different error scenarios
      if (err.message.includes("404") || err.message.toLowerCase().includes("not found")) {
        // No variables exist yet - this is normal
        console.log("404 error - no variables exist yet, setting empty array");
        setVariables([]);
      } else {
        // Other errors - show user-friendly message but don't block the UI
        console.error("Non-404 error fetching variables:", err);
        toast.error("Could not load existing variables, but you can still create new ones");
        setVariables([]);
      }
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Create a single variable
  const createVariable = async (name, value = "", description = "") => {
    try {
      const requestBody = {
        requestMetaData: generateMetadata(),
        data: {
          name: name.trim(),
          value: value.trim(),
          description: description.trim(),
          isParameter: detectedParameters?.includes(name) || false,
          testCase: {
            testCaseId: testCaseId
          }
        }
      };

      console.log("Creating variable with payload:", requestBody);
      const response = await api("/api/v1/variables", "POST", requestBody);
      console.log("Create variable response:", response);
      
      if (response.result?.code === "200") {
        return response.result.data;
      } else {
        throw new Error(response.result?.message || "Failed to create variable");
      }
    } catch (err) {
      console.error("Error creating variable:", err);
      throw err;
    }
  };

  // Update existing variable
  const updateVariable = async (variableId, name, value, description = "") => {
    try {
      const requestBody = {
        requestMetaData: generateMetadata(),
        data: {
          variableId: variableId,
          name: name.trim(),
          value: value.trim(),
          description: description.trim(),
          isParameter: detectedParameters?.includes(name) || false,
          testCase: {
            testCaseId: testCaseId
          }
        }
      };

      const response = await api("/api/v1/variables", "PUT", requestBody);
      
      if (response.result?.code === "200") {
        return response.result.data;
      } else {
        throw new Error(response.result?.message || "Failed to update variable");
      }
    } catch (err) {
      console.error("Error updating variable:", err);
      throw err;
    }
  };

  // Delete variable
  const deleteVariableById = async (variableId) => {
    try {
      const response = await api(`/api/v1/variables/${variableId}`, "DELETE");
      
      if (response.result?.code === "200") {
        return true;
      } else {
        throw new Error(response.result?.message || "Failed to delete variable");
      }
    } catch (err) {
      console.error("Error deleting variable:", err);
      throw err;
    }
  };

  // Create all unassociated detected parameters
  const handleCreateAllParameters = async () => {
    if (!detectedParameters || detectedParameters.length === 0) {
      toast.info("No parameters detected to create");
      return;
    }

    if (unsavedParams === 0) {
      toast.info("All detected parameters already have variables");
      return;
    }

    setCreatingParameters(true);
    
    try {
      const unCreatedParams = detectedParameters.filter(param => 
        !variables.some(v => v.name === param)
      );

      let successCount = 0;
      let failCount = 0;

      for (const param of unCreatedParams) {
        try {
          await createVariable(param, "", `Auto-created from detected parameter: ${param}`);
          successCount++;
        } catch (error) {
          console.error(`Failed to create parameter ${param}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Created ${successCount} parameter variable${successCount > 1 ? 's' : ''}`);
        await fetchVariables(); // Refresh the list
      }

      if (failCount > 0) {
        toast.warning(`Failed to create ${failCount} parameter${failCount > 1 ? 's' : ''}`);
      }

    } catch (error) {
      console.error("Error creating parameters:", error);
      toast.error("Error creating parameter variables");
    } finally {
      setCreatingParameters(false);
    }
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setFormData({ name: "", value: "", description: "" });
    setEditingVariable(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (variable) => {
    setFormData({
      name: variable.name || "",
      value: variable.value || "",
      description: variable.description || ""
    });
    setEditingVariable(variable);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({ name: "", value: "", description: "" });
    setEditingVariable(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save variable (create or update)
  const handleSaveVariable = async () => {
    const { name, value, description } = formData;
    
    if (!name.trim()) {
      toast.error("Variable name is required");
      return;
    }

    // Check for duplicate names (excluding current variable when editing)
    const existingVariable = variables.find(v => 
      v.name.toLowerCase() === name.trim().toLowerCase() && 
      (!editingVariable || v.variableId !== editingVariable.variableId)
    );
    
    if (existingVariable) {
      toast.error("A variable with this name already exists");
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingVariable) {
        // Update existing variable
        await updateVariable(editingVariable.variableId, name, value, description);
        toast.success("Variable updated successfully");
      } else {
        // Create new variable
        await createVariable(name, value, description);
        toast.success("Variable created successfully");
      }
      
      await fetchVariables(); // Refresh the list
      handleCloseModals();
      
    } catch (err) {
      console.error("Error saving variable:", err);
      toast.error(err.message || "Failed to save variable");
    } finally {
      setLoading(false);
    }
  };

  // Delete variable handler
  const handleDeleteVariable = async () => {
    if (!deleteVariable) return;
    
    try {
      setLoading(true);
      
      await deleteVariableById(deleteVariable.variableId);
      toast.success("Variable deleted successfully");
      await fetchVariables(); // Refresh the list
      
    } catch (err) {
      console.error("Error deleting variable:", err);
      toast.error(err.message || "Failed to delete variable");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteVariable(null);
    }
  };

  const openDeleteModal = (variable) => {
    setDeleteVariable(variable);
    setIsDeleteModalOpen(true);
  };

  // Load variables when component mounts or testCaseId changes
  useEffect(() => {
    console.log("TestCaseConfigurationForm mounted with testCaseId:", testCaseId);
    if (testCaseId) {
      fetchVariables();
    } else {
      console.log("No testCaseId, setting initial load complete");
      setInitialLoadComplete(true);
    }
  }, [testCaseId]);

  // Pagination
  const totalPages = Math.ceil(variables.length / ITEMS_PER_PAGE);
  const paginatedVariables = variables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            className={`px-3 py-1 rounded ${
              page === currentPage
                ? "bg-[#4F46E5] text-white"
                : "border hover:bg-gray-100"
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

  // Variable Modal Component
  const VariableModal = ({ isOpen, isEdit = false }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            {isEdit ? <FiEdit3 className="mr-2 text-indigo-600" /> : <FiPlus className="mr-2 text-indigo-600" />}
            {isEdit ? 'Edit Variable' : 'Add New Variable'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="variable_name"
                autoFocus
              />
              {detectedParameters?.includes(formData.name) && (
                <div className="text-xs text-blue-600 mt-1">
                  💡 This matches a detected parameter
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleFormChange('value', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="variable value"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional description"
                rows="3"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveVariable}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded-md hover:bg-[#4338CA] flex items-center"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Don't render anything until we've tried to load variables at least once
  if (!initialLoadComplete) {
    return (
      <div className="bg-white shadow p-6 rounded-lg mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
          <span className="text-gray-600">Loading configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow p-6 rounded-lg mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-md font-semibold flex items-center">
            <FiSettings className="mr-2 text-gray-600" />
            Test case configuration
          </h2>
          
          {/* Parameter Status Badge */}
          {totalDetectedParams > 0 && (
            <div className="ml-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {totalDetectedParams} parameters detected
              </span>
              {unsavedParams > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  {unsavedParams} not created
                </span>
              )}
              {unsavedParams === 0 && totalDetectedParams > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                  <FiCheckCircle className="mr-1 h-3 w-3" />
                  All parameters created
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Create All Parameters Button */}
          {unsavedParams > 0 && (
            <button
              onClick={handleCreateAllParameters}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
              disabled={!testCaseId || loading || creatingParameters}
            >
              {creatingParameters ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaMagic className="mr-1" />
                  Create All Parameters ({unsavedParams})
                </>
              )}
            </button>
          )}
          
          {/* Add Variable Button - Always available when we have testCaseId */}
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
            disabled={!testCaseId || loading}
          >
            <FiPlus className="mr-1" />
            Add Variable
          </button>
        </div>
      </div>

      {/* Parameter Summary */}
      {totalDetectedParams > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900 mb-1">
                Detected Parameters: {detectedParameters.join(', ')}
              </div>
              <div className="text-xs text-blue-700">
                {savedParams} of {totalDetectedParams} parameters have been created as variables
              </div>
            </div>
            {unsavedParams > 0 && (
              <div className="text-xs text-blue-600">
                💡 Use "Create All Parameters" to automatically create variables for all detected parameters
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Parameters but Variables Available Message */}
      {totalDetectedParams === 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-sm text-gray-700">
            <FiSettings className="inline mr-2" />
            No parameters detected in your test case templates. You can still create variables manually to store reusable values.
          </div>
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

      {/* Variables Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Description</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && variables.length === 0 ? (
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
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiSettings className="h-8 w-8 text-gray-300 mb-3" />
                    <div className="text-lg font-medium mb-2">No variables created yet</div>
                    <div className="text-sm mb-4">
                      {testCaseId 
                        ? "Create variables to store reusable values for your test case"
                        : "Save the test case first to start creating variables"}
                    </div>
                    {testCaseId && (
                      <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
                      >
                        <FiPlus className="mr-1" />
                        Create Your First Variable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedVariables.map((variable) => {
                const isDetectedParam = detectedParameters?.includes(variable.name);
                const hasValue = variable.value && variable.value.trim() !== '';
                
                return (
                  <tr key={variable.variableId} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="font-medium">{variable.name}</span>
                        {isDetectedParam && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                            Parameter
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="truncate max-w-xs">
                        {hasValue ? (
                          <span className="text-gray-900">{variable.value}</span>
                        ) : (
                          <span className="text-gray-400 italic">Empty</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDetectedParam 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isDetectedParam ? 'Auto-detected' : 'Manual'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="truncate max-w-xs text-gray-600 text-sm">
                        {variable.description || '—'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(variable)}
                          className="text-gray-400 hover:text-[#4F46E5] transition-colors"
                          title="Edit variable"
                          disabled={loading}
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(variable)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete variable"
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

      {/* Functions Tab Content */}
      {activeTab === "Functions" && (
        <div className="mt-4 p-8 text-center text-gray-500 bg-gray-50 rounded-md">
          <FiSettings className="h-8 w-8 text-gray-300 mb-3 mx-auto" />
          <div className="text-lg font-medium mb-2">Functions Coming Soon</div>
          <div className="text-sm">
            Function management will be available in a future update.
          </div>
        </div>
      )}

      {/* Modals */}
      <VariableModal isOpen={isAddModalOpen} isEdit={false} />
      <VariableModal isOpen={isEditModalOpen} isEdit={true} />
      
      {/* Confirmation Modal for Delete */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteVariable(null);
        }}
        onConfirm={handleDeleteVariable}
        title="Delete Variable"
        message={`Are you sure you want to delete "${deleteVariable?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default TestCaseConfigurationForm;