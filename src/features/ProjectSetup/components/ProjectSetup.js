import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaChevronDown, FaStar, FaRegStar, FaCheck } from "react-icons/fa";
import { FiTrash2, FiSearch, FiX } from "react-icons/fi";
import IconButton from "../../../components/common/IconButton";
import { Button } from "../../../components/UI";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { api } from "../../../utils/api";

const pageSize = 6; // Changed from 5 to 6 per request

const ProjectSetup = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    projectId: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formExpanded, setFormExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProject, setActiveProject] = useState(() => {
    // Get active project from localStorage or use default
    const storedProject = localStorage.getItem("activeProject");
    return storedProject ? JSON.parse(storedProject) : null;
  });
  
  const isUpdateMode = formData.id !== null;
  
  // Filter data based on search term
  const filteredData = data.filter(
    project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Use updatedDate instead of createdDate to show most recently updated projects first
      const json = await api("/api/v1/projects?pageNo=0&limit=100&sortBy=updatedDate&sortDir=DESC", "GET");
      const { code, data: responseData, message } = json.result;

      if (code === "200") {
        const formatted = responseData.content.map((p) => ({
          id: p.id,
          name: p.projectName,
          projectId: p.projectId,
          description: p.description,
          date: p.createdDate,
          updatedDate: p.updatedDate
        }));
        setData(formatted);
      } else {
        toast.error(message || "Failed to fetch projects");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = {
      requestMetaData: {
        userId: localStorage.getItem("userId"),
        transactionId: nanoid(),
        timestamp: new Date().toISOString(),
      },
      data: {
        id: formData.id || null,
        projectId: formData.projectId,
        projectName: formData.name,
        description: formData.description,
      },
    };

    const method = isUpdateMode ? "PUT" : "POST";

    try {
      const json = await api("/api/v1/projects", method, payload);

      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || (isUpdateMode ? "Updated" : "Created"));
        fetchProjects();
        setFormData({ id: null, name: "", projectId: "", description: "" });
      } else {
        toast.error(message || "Failed to process project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error during submission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setFormExpanded(true);
    // Smooth scroll to form
    document.getElementById("projectForm").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const json = await api(`/api/v1/projects/${selectedProject.id}`, "DELETE");
      const { code, message } = json.result;

      if (code === "200") {
        // If the deleted project was active, clear it
        if (activeProject && activeProject.id === selectedProject.id) {
          setActiveProject(null);
          localStorage.removeItem("activeProject");
          // Trigger a storage event to notify other components
          window.dispatchEvent(new Event('storage'));
        }
        
        toast.success(message || "Project deleted");
        fetchProjects();
      } else {
        toast.error(message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting project");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const clearForm = () => {
    setFormData({ id: null, name: "", projectId: "", description: "" });
  };
  
  const setProjectAsActive = (project) => {
    setActiveProject(project);
    localStorage.setItem("activeProject", JSON.stringify(project));
    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    toast.success(`Project "${project.name}" set as active`);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 font-inter text-gray-800">
      <Breadcrumb items={[{ label: "Admin Settings" }, { label: "Project Setup" }]} />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Project Setup</h2>
      </div>

      {/* Enhanced Form with animation */}
      <div id="projectForm" className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 mb-8">
        <div 
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex justify-between items-center cursor-pointer"
          onClick={() => setFormExpanded(!formExpanded)}
        >
          <h3 className="text-lg font-medium text-white">
            {isUpdateMode ? "Update Project" : "Create New Project"}
          </h3>
          <FaChevronDown 
            className={`text-white transition-transform duration-300 transform ${formExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${formExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Project ID</label>
                <input
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, projectId: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter project ID"
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
                placeholder="Enter project description"
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
                  isUpdateMode ? "Update Project" : "Create Project"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Table Section with Selection */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-700">Projects</h3>
            {activeProject && (
              <div className="ml-3 bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-full flex items-center">
                <span className="mr-1">Active:</span>
                <span className="font-medium">{activeProject.name}</span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search projects..."
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
              <p className="text-sm text-gray-500">Loading projects...</p>
            </div>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 rounded-full p-3 mb-4">
              <FiSearch className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No projects matching "${searchTerm}"` 
                : "Start by creating your first project"}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Project ID</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((project, index) => (
                    <tr 
                      key={project.id} 
                      className={`border-b border-gray-200 hover:bg-indigo-50/30 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      } ${activeProject && activeProject.id === project.id ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setProjectAsActive(project)}
                          className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none transition-colors"
                          title={activeProject && activeProject.id === project.id ? "Current active project" : "Set as active project"}
                          disabled={activeProject && activeProject.id === project.id}
                        >
                          <span 
                            className={`${
                              activeProject && activeProject.id === project.id
                                ? "bg-indigo-600"
                                : "bg-gray-200"
                            } absolute inset-y-0 left-0 w-11 h-6 rounded-full transition-colors`}
                          ></span>
                          <span 
                            className={`${
                              activeProject && activeProject.id === project.id 
                                ? "translate-x-6" 
                                : "translate-x-1"
                            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                          ></span>
                        </button>
                      </td>
                      <td className="p-4 font-medium text-indigo-700">{project.name}</td>
                      <td className="p-4 text-gray-600">{project.projectId}</td>
                      <td className="p-4 text-gray-600 line-clamp-2">{project.description}</td>
                      <td className="p-4 text-gray-500">
                        <div>
                          <div>Created: {project.date}</div>
                          {project.updatedDate && project.updatedDate !== project.date && (
                            <div className="text-xs text-gray-400">Updated: {project.updatedDate}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <IconButton 
                            icon={FaEdit} 
                            onClick={() => handleEdit(project)}
                            className="bg-indigo-100 hover:bg-indigo-200 rounded-md text-indigo-600"
                          />
                          <IconButton 
                            icon={FiTrash2} 
                            onClick={() => {
                              setSelectedProject(project);
                              setShowModal(true);
                            }}
                            className="bg-red-100 hover:bg-red-200 rounded-md text-red-600"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          
            {/* Enhanced Pagination */}
            <div className="flex justify-between items-center px-4 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} projects
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

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full p-6">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FiTrash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                  Delete Project
                </h3>
                <p className="text-gray-600 text-center">
                  Are you sure you want to delete <span className="font-medium text-gray-900">"{selectedProject?.name}"</span>? This action cannot be undone.
                </p>
                
                {activeProject && activeProject.id === selectedProject?.id && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                    <div className="font-medium mb-1">Warning</div>
                    <p>This is currently set as your active project. Deleting it will remove your active project selection.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <Button 
                  onClick={handleDelete} 
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSetup;