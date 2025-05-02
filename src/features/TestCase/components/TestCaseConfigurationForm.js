import React, { useState } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";

const ITEMS_PER_PAGE = 6;

const TestCaseConfigurationForm = () => {
  const [activeTab, setActiveTab] = useState("Variables");
  const [variables, setVariables] = useState([
    { name: "user_email", value: "testuser@example.com" },
    { name: "user_password", value: "P@ssw0rd123" },
    { name: "auth_token", value: "eyJhbGciOiJIUzI1NiIsInR..." },
    { name: "api_base_url", value: "https://api.example.com" },
    { name: "request_timeout", value: "30 (seconds)" },
    { name: "max_retry_count", value: "3" },
    { name: "region", value: "ap-south-1" },
    { name: "app_version", value: "1.4.5" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Separate modals for add and edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Simple state for form inputs
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const totalPages = Math.ceil(variables.length / ITEMS_PER_PAGE);
  const paginatedVariables = variables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Open add modal with empty form
  const handleOpenAddModal = () => {
    setInputName("");
    setInputValue("");
    setIsAddModalOpen(true);
  };

  // Open edit modal with values from the selected variable
  const handleOpenEditModal = (index) => {
    const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    const variable = variables[realIndex];
    setInputName(variable.name);
    setInputValue(variable.value);
    setEditingIndex(realIndex);
    setIsEditModalOpen(true);
  };

  // Close both modals
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setInputName("");
    setInputValue("");
    setEditingIndex(null);
  };

  // Add new variable
  const handleAddVariable = () => {
    // Get values directly from DOM elements
    const nameInput = document.getElementById('add-variable-name');
    const valueInput = document.getElementById('add-variable-value');
    
    // Extract values
    const name = nameInput ? nameInput.value.trim() : '';
    const value = valueInput ? valueInput.value.trim() : '';
    
    // Validate
    if (name === "" || value === "") {
      return; // Don't add if either field is empty
    }
    
    // Add to variables array
    setVariables([...variables, { name, value }]);
    handleCloseModals();
  };

  // Update existing variable
  const handleUpdateVariable = () => {
    // Get values directly from DOM elements
    const nameInput = document.getElementById('edit-variable-name');
    const valueInput = document.getElementById('edit-variable-value');
    
    // Extract values
    const name = nameInput ? nameInput.value.trim() : '';
    const value = valueInput ? valueInput.value.trim() : '';
    
    // Validate
    if (name === "" || value === "") {
      return; // Don't update if either field is empty
    }
    
    // Update variables array
    const updatedVariables = [...variables];
    updatedVariables[editingIndex] = { name, value };
    setVariables(updatedVariables);
    handleCloseModals();
  };

  // Delete variable
  const handleDelete = (index) => {
    const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    const updatedVariables = [...variables];
    updatedVariables.splice(realIndex, 1);
    setVariables(updatedVariables);
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
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddVariable}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
            >
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
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateVariable}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
            >
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
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedVariables.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No variables found. Click "Add Variable" to create one.
                </td>
              </tr>
            ) : (
              paginatedVariables.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 truncate max-w-xs">{item.value}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(idx)}
                        className="text-gray-400 hover:text-[#4F46E5]"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete"
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
    </div>
  );
};

export default TestCaseConfigurationForm;