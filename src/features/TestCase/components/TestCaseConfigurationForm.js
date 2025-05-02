import React, { useState, useEffect } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../../utils/api";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ITEMS_PER_PAGE = 6;

const TestCaseConfigurationForm = () => {
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
  
  // Get testCaseId from location state
  const testCaseId = location.state?.testCase?.testCaseId;

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
        setVariables(response.result.data || []);
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

  // Load variables when component mounts
  useEffect(() => {
    fetchVariables();
  }, [testCaseId]);

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

  // Add Variable Modal
  const AddVariableModal = () => {
    if (!isAddModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Add New Variable</h3>
          
          <div className="mb-4">
            <label htmlFor="add-variable-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="add-variable-name"
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
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
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="variable value"
              defaultValue={inputValue}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-4 py-2 border text-sm rounded"
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

  // Edit Variable Modal
  const EditVariableModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Edit Variable</h3>
          
          <div className="mb-4">
            <label htmlFor="edit-variable-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="edit-variable-name"
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
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
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="variable value"
              defaultValue={inputValue}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseModals}
              className="px-4 py-2 border text-sm rounded"
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
        <h2 className="text-md font-semibold">Test case configuration</h2>
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
              <th className="p-3 font-medium">Created Date</th>
              <th className="p-3 font-medium">Updated Date</th>
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
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  {testCaseId 
                    ? "No variables found. Click \"Add Variable\" to create one."
                    : "Please save the test case before adding variables."}
                </td>
              </tr>
            ) : (
              paginatedVariables.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 truncate max-w-xs">{item.value}</td>
                  <td className="p-3">{item.createdDate}</td>
                  <td className="p-3">{item.updatedDate}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(idx)}
                        className="text-gray-400 hover:text-[#4F46E5]"
                        title="Edit"
                        disabled={loading}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(idx)}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete"
                        disabled={loading}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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