// src/components/common/ProjectActivationGuard.js
import React, { useState, useEffect } from 'react';
import { FaProjectDiagram, FaChevronRight, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { FiSettings, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import { useProjectStore } from '../../stores/projectStore';

// Custom hook for project activation - Updated to use Zustand store
export const useProjectActivation = () => {
  const { activeProject, setActiveProject, clearActiveProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const setProjectAsActive = (project) => {
    setActiveProject(project);
    toast.success(`Project "${project.name}" is now active`);
  };

  return {
    activeProject,
    setProjectAsActive,
    clearActiveProject,
    isLoading,
    hasActiveProject: !!activeProject
  };
};

// Project Selection Modal Component
const ProjectSelectionModal = ({ isOpen, onSelectProject, projects = [], loading = false, onRefresh }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  if (!isOpen) return null;

  const handleProjectSelect = () => {
    if (selectedProject) {
      onSelectProject(selectedProject);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <FaProjectDiagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Select Active Project</h2>
                <p className="text-indigo-100 text-sm">Choose a project to continue</p>
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Refresh projects"
            >
              <FiRefreshCw className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start">
            <FaExclamationTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">Project Selection Required</h3>
              <p className="text-amber-700 text-sm">
                You must select an active project to access the application features. 
                All your work will be associated with the selected project.
              </p>
            </div>
          </div>

          {/* Project List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Available Projects</h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-16"></div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 inline-flex mb-4">
                  <FaProjectDiagram className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-500 mb-4">You need to create a project first before proceeding.</p>
                <button
                  onClick={() => {
                    window.location.href = '/admin/project-setup';
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiSettings className="inline mr-2" />
                  Go to Project Setup
                </button>
              </div>
            ) : (
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProject?.id === project.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <span className="ml-2 bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded-full">
                            {project.projectId}
                          </span>
                        </div>
                        {project.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>Created: {project.date}</span>
                          {project.updatedDate && project.updatedDate !== project.date && (
                            <span className="ml-3">Updated: {project.updatedDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {selectedProject?.id === project.id ? (
                          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <FaCheck className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {projects.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {selectedProject ? (
                  <span className="flex items-center text-indigo-600">
                    <FaCheck className="mr-1" />
                    Project "{selectedProject.name}" selected
                  </span>
                ) : (
                  "Please select a project to continue"
                )}
              </div>
              <button
                onClick={handleProjectSelect}
                disabled={!selectedProject}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  selectedProject
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
                <FaChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Project Activation Guard Component
const ProjectActivationGuard = ({ children }) => {
  const { setProjectAsActive, isLoading, hasActiveProject } = useProjectActivation();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch projects from API
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
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
        setProjects(formatted);
      } else {
        toast.error(message || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Error loading projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !hasActiveProject) {
      setShowModal(true);
      fetchProjects();
    } else {
      setShowModal(false);
    }
  }, [isLoading, hasActiveProject]);

  const handleProjectSelect = (project) => {
    setProjectAsActive(project);
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <ProjectSelectionModal
        isOpen={showModal}
        onSelectProject={handleProjectSelect}
        projects={projects}
        loading={loadingProjects}
        onRefresh={fetchProjects}
      />
    </>
  );
};

export default ProjectActivationGuard;