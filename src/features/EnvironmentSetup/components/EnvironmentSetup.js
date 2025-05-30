import React, { useState, useEffect } from "react";
import { FiTrash2, FiSearch, FiX, FiLink } from "react-icons/fi";
import { FaEdit, FaPlus, FaChevronDown, FaServer } from "react-icons/fa";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import Breadcrumb from "../../../components/common/Breadcrumb";
import IconButton from "../../../components/common/IconButton";
import { Button } from "../../../components/UI";
import { api } from "../../../utils/api";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useProjectStore } from "../../../stores/projectStore";

const pageSize = 6;

const EnvironmentSetup = () => {
  // Use project store for active project
  const { activeProject } = useProjectStore();
  
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    environmentName: "",
    environmentUrl: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [formExpanded, setFormExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isUpdateMode = formData.id !== null;
  
  // Filter data based on search term
  const filteredData = data.filter(
    env => 
      env.environmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.environmentUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.description?.toLowerCase().includes(searchTerm.toLowerCase() || "")
  );
  
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPaginationRange = () => {
    const range = [];
    const dots = "...";
    const visiblePages = 2;
    range.push(1);
    if (currentPage > visiblePages + 2) range.push(dots);
    for (
      let i = Math.max(2, currentPage - visiblePages);
      i <= Math.min(totalPages - 1, currentPage + visiblePages);
      i++
    ) {
      range.push(i);
    }
    if (currentPage + visiblePages < totalPages - 1) range.push(dots);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const fetchEnvironments = async () => {
    setIsLoading(true);
    try {
      // Updated to sort by updatedDate instead of createdDate to show most recently updated environments first
      const json = await api("/api/v1/environments?pageNo=0&limit=100&sortBy=updatedDate&sortDir=DESC", "GET");
      const { code, message, data: responseData } = json.result;

      if (code === "200") {
        // Map the API response to our component state format
        const mapped = responseData.content.map((env) => ({
          id: env.environmentId,
          environmentName: env.environmentName,
          environmentUrl: env.environmentUrl,
          description: env.description,
          date: env.createdDate,
          updatedDate: env.updatedDate, // Store updatedDate separately for display
          // Store the original environmentId separately to ensure it's available for updates
          environmentId: env.environmentId,
          // Store project data if needed
          project: env.project,
        }));
        setData(mapped);
      } else {
        toast.error(message || "Failed to fetch environments");
      }
    } catch (err) {
      toast.error("Error fetching environments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Get active project ID from store
    let activeProjectId = null;
    
    if (activeProject) {
      activeProjectId = activeProject.id;
    } else {
      toast.error("No active project selected. Please select a project first.");
      setIsLoading(false);
      return;
    }

    // Prepare the payload for create/update
    const payload = {
      requestMetaData: {
        userId: localStorage.getItem("userId"),
        transactionId: nanoid(),
        timestamp: new Date().toISOString(),
      },
      data: {
        // Use environmentId for updates - this is the key fix
        environmentId: isUpdateMode ? formData.id : undefined,
        environmentName: formData.environmentName,
        environmentUrl: formData.environmentUrl,
        description: formData.description,
        // Add any other required fields from the API
      }
    };

    // Add project ID only for CREATE operations, not for UPDATE
    if (!isUpdateMode) {
      payload.data.projectId = activeProjectId;
    }

    // Clean up undefined values
    if (!isUpdateMode) {
      delete payload.data.environmentId;
    }

    const method = isUpdateMode ? "PUT" : "POST";
    const url = isUpdateMode
      ? `/api/v1/environments`
      : "/api/v1/environments";

    try {
      const json = await api(url, method, payload);
      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || (isUpdateMode ? "Updated successfully" : "Created successfully"));
        fetchEnvironments();
        clearForm();
      } else {
        toast.error(message || "Failed to process request");
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    // Make sure to map the correct fields for editing
    setFormData({
      id: item.id, // This is environmentId from the API
      environmentName: item.environmentName,
      environmentUrl: item.environmentUrl,
      description: item.description,
    });
    setFormExpanded(true);
    // Smooth scroll to form
    document.getElementById("environmentForm").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const json = await api(`/api/v1/environments/${selectedEnv.id}`, "DELETE");
      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || "Environment deleted");
        fetchEnvironments();
      } else {
        toast.error(message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting environment");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const clearForm = () => {
    setFormData({ id: null, environmentName: "", environmentUrl: "", description: "" });
  };
  
  // Determine environment type/color based on name
  const getEnvironmentBadge = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('prod')) {
      return { label: 'Production', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    } else if (lowerName.includes('stage') || lowerName.includes('staging')) {
      return { label: 'Staging', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    } else if (lowerName.includes('dev')) {
      return { label: 'Development', bgColor: 'bg-green-100', textColor: 'text-green-800' };
    } else if (lowerName.includes('test') || lowerName.includes('qa') || lowerName.includes('uat')) {
      return { label: 'Testing', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    } else if (lowerName.includes('sandbox')) {
      return { label: 'Sandbox', bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
    } else if (lowerName.includes('integration')) {
      return { label: 'Integration', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' };
    } else if (lowerName.includes('demo')) {
      return { label: 'Demo', bgColor: 'bg-teal-100', textColor: 'text-teal-800' };
    } else {
      return { label: 'Other', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("URL copied to clipboard!");
      },
      () => {
        toast.error("Failed to copy URL");
      }
    );
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  return (
    <div className="p-6 text-gray-800 font-inter">
      <Breadcrumb items={[{ label: "Admin Settings" }, { label: "Environment Setup" }]} />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Environment Setup</h2>
      </div>

      {/* Enhanced Form with animation */}
      <div id="environmentForm" className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 mb-8">
        <div 
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex justify-between items-center cursor-pointer"
          onClick={() => setFormExpanded(!formExpanded)}
        >
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <FaServer className="text-indigo-200" />
            {isUpdateMode ? "Update Environment" : "Create New Environment"}
          </h3>
          <FaChevronDown 
            className={`text-white transition-transform duration-300 transform ${formExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${formExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Environment Name</label>
                <input
                  type="text"
                  value={formData.environmentName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, environmentName: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Development, Staging, Production"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Environment URL</label>
                <input
                  type="text"
                  value={formData.environmentUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, environmentUrl: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="https://api.example.com"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 p-3 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Describe this environment's purpose and usage"
              />
            </div>
            <div className="flex justify-end gap-3">
              {isUpdateMode && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  isUpdateMode ? "Update Environment" : "Create Environment"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Table with cards */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h3 className="text-lg font-medium text-gray-700">Environments</h3>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search environments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm("")}
              >
                <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {isLoading && data.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-indigo-200 rounded-full mb-4">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Loading environments...</p>
            </div>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 rounded-full p-3 mb-4">
              <FaServer className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No environments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No environments matching "${searchTerm}"` 
                : "Start by creating your first environment"}
            </p>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm("")} 
                className="flex items-center gap-2"
              >
                <FiX size={14} />
                <span>Clear Search</span>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Card-based display for environments */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {currentData.map((env) => {
                const envType = getEnvironmentBadge(env.environmentName);
                
                return (
                  <div key={env.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${envType.bgColor} ${envType.textColor}`}>
                          {envType.label}
                        </span>
                        <h4 className="font-medium text-gray-900 truncate">{env.environmentName}</h4>
                      </div>
                      <div className="flex gap-1">
                        <IconButton 
                          icon={FaEdit} 
                          onClick={() => handleEdit(env)}
                          className="bg-indigo-100 hover:bg-indigo-200 rounded-md text-indigo-600"
                        />
                        <IconButton 
                          icon={FiTrash2} 
                          onClick={() => {
                            setSelectedEnv(env);
                            setShowModal(true);
                          }}
                          className="bg-red-100 hover:bg-red-200 rounded-md text-red-600"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">URL</span>
                        <IconButton 
                          icon={FiLink} 
                          onClick={() => copyToClipboard(env.environmentUrl)}
                          className="text-gray-400 hover:text-indigo-600"
                          title="Copy URL"
                        />
                      </div>
                      <p className="text-gray-600 text-sm mb-4 overflow-hidden overflow-ellipsis">
                        {env.environmentUrl}
                      </p>
                      
                      {env.description && (
                        <>
                          <div className="text-xs text-gray-500 mb-1">Description</div>
                          <p className="text-gray-600 text-sm line-clamp-2">{env.description}</p>
                        </>
                      )}
                      
                      <div className="mt-4 text-xs text-gray-400 flex justify-between">
                        <span>Created: {env.date}</span>
                        {env.updatedDate && env.updatedDate !== env.date && (
                          <span>Updated: {env.updatedDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          
            {/* Enhanced Pagination */}
            <div className="flex justify-between items-center px-4 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} environments
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-gray-700 transition-colors"
                >
                  Prev
                </button>
                
                {getPaginationRange().map((item, idx) => (
                  <button
                    key={idx}
                    disabled={item === "..."}
                    onClick={() => item !== "..." && setCurrentPage(item)}
                    className={`px-3 py-1 border rounded-md ${
                      item === currentPage
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    } transition-colors`}
                  >
                    {item}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enhanced Modal - FIXED: Replace custom modal with ConfirmationModal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Environment"
        message={`Are you sure you want to delete "${selectedEnv?.environmentName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isLoading}
      />
    </div>
  );
};

export default EnvironmentSetup;