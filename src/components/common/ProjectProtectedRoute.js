// src/components/common/ProjectProtectedRoute.js
import React from "react";
import { FaExclamationTriangle, FaProjectDiagram } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useProjectActivation } from "./ProjectActivationGuard";
import { useAuthStore } from "../../stores/authStore";

const ProjectProtectedRoute = ({ children }) => {
  const { hasActiveProject, isLoading } = useProjectActivation();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isAdminUser = role === 'SUPER_ADMIN' || role === 'ADMIN';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow SUPER_ADMIN and ADMIN to access routes even without an active project
  if (!hasActiveProject && !isAdminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-amber-100 rounded-full p-4 inline-flex mb-4">
            <FaExclamationTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Active Project Required</h2>
          <p className="text-gray-600 mb-6">
            You need to select an active project to access this page. 
            Please go to Project Setup to select or create a project.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/project-setup')}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <FiSettings className="mr-2" />
              Go to Project Setup
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <FaProjectDiagram className="mr-2" />
              Select Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProjectProtectedRoute;