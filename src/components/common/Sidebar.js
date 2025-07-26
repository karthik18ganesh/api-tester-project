// src/components/common/Sidebar.js - Enhanced with Modern Visual Design
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiPlayCircle,
  FiBarChart2,
  FiSettings,
  FiGlobe,
  FiFolder,
  FiUser,
  FiCode,
  FiLayers,
  FiArchive,
  FiDatabase,
  FiFileText,
  FiChevronRight,
  FiTrello,
  FiAlertTriangle,
  FiStar,
} from "react-icons/fi";
import { FaBars, FaChevronDown, FaChevronUp, FaProjectDiagram } from "react-icons/fa";
import Logo from "../../assets/Logo.svg";
import { useProjectActivation } from "./ProjectActivationGuard";
import { useUIStore } from "../../stores/uiStore";

const Sidebar = () => {
  const [adminOpen, setAdminOpen] = useState(false);
  const [testDesignOpen, setTestDesignOpen] = useState(false);
  const [testExecutionOpen, setTestExecutionOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject, hasActiveProject } = useProjectActivation();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore();

  useEffect(() => {
    // Auto-expand sections based on current route
    if (location.pathname.includes("/admin/")) {
      setAdminOpen(true);
    }
    
    if (location.pathname.includes("/test-design/")) {
      setTestDesignOpen(true);
    }

    // Expand test execution section if on test execution or results pages
    if (location.pathname.includes("/test-execution") || location.pathname.includes("/test-results")) {
      setTestExecutionOpen(true);
    }
  }, [location.pathname]);

  const isActive = (route) => location.pathname === route;

  // Check if navigation should be allowed
  const canNavigate = (requiresProject = true) => {
    if (!requiresProject) return true;
    return hasActiveProject;
  };

  // Handle navigation with project check
  const handleNavigation = (route, requiresProject = true) => {
    if (canNavigate(requiresProject)) {
      navigate(route);
    } else {
      // Show warning or redirect to project setup
      navigate('/admin/project-setup');
    }
  };

  // Test Execution submenu items
  const testExecutionSubMenus = [
    {
      label: "Test Execution",
      icon: <FiPlayCircle />,
      route: "/test-execution",
      requiresProject: true,
    },
    { 
      label: "Results", 
      icon: <FiBarChart2 />, 
      route: "/test-results",
      requiresProject: true,
    },
  ];

  const testDesignSubMenus = [
    {
      label: "API Repository",
      route: "/test-design/api-repository",
      icon: <FiDatabase />,
      requiresProject: true,
    },
    {
      label: "Test Case",
      route: "/test-design/test-case",
      icon: <FiFileText />,
      requiresProject: true,
    },
    {
      label: "Test Suite",
      route: "/test-design/test-suite",
      icon: <FiFolder />,
      requiresProject: true,
    },
    {
      label: "Test Package",
      route: "/test-design/test-package",
      icon: <FiArchive />,
      requiresProject: true,
    },
    {
      label: "Functions & Variables",
      route: "/test-design/functions-variables",
      icon: <FiCode />,
      requiresProject: true,
    },
  ];

  const adminSubMenus = [
    {
      label: "Environment Setup",
      route: "/admin/environment-setup",
      icon: <FiGlobe />,
      requiresProject: true,
    },
    {
      label: "Project Setup",
      route: "/admin/project-setup",
      icon: <FiFolder />,
      requiresProject: false, // Project setup doesn't require active project
    },
    { 
      label: "User Settings", 
      route: "/admin/user-settings", 
      icon: <FiUser />,
      requiresProject: false,
    },
  ];

  const MenuSection = ({ title, open, setOpen, items, icon }) => {
    const hasActiveItems = items.some(item => isActive(item.route));
    
    return (
      <div className={`mt-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <div
          onClick={() => !collapsed && setOpen(!open)}
          className={`flex ${
            collapsed ? "flex-col items-center justify-center" : "flex-row justify-between"
          } px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${
            hasActiveItems 
              ? "bg-indigo-50 text-indigo-700" 
              : "hover:bg-gray-50"
          }`}
        >
          <div
            className={`flex ${collapsed ? "flex-col items-center" : "flex-row items-center gap-3"}`}
          >
            <div className={`text-lg ${hasActiveItems ? 'text-indigo-600' : 'text-gray-600'}`}>
              {icon}
            </div>
            {!collapsed && (
              <span className={`text-sm font-medium ${hasActiveItems ? 'text-indigo-700' : 'text-gray-700'}`}>
                {title}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center">
              {hasActiveItems && (
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
              )}
              {open ? (
                <FaChevronUp className="text-xs text-gray-400" />
              ) : (
                <FaChevronDown className="text-xs text-gray-400" />
              )}
            </div>
          )}
        </div>
        
        {/* Submenu items */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open && !collapsed ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          {!collapsed &&
            items.map(({ label, route, icon, requiresProject = true }) => {
              const canAccess = canNavigate(requiresProject);
              const isActiveRoute = isActive(route);
              
              return (
                <div
                  key={label}
                  onClick={() => handleNavigation(route, requiresProject)}
                  className={`transition-colors duration-200 ml-2 my-0.5 rounded-lg ${
                    isActiveRoute
                      ? "bg-indigo-600 text-white cursor-pointer"
                      : canAccess 
                        ? "hover:bg-gray-100 text-gray-700 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className={`text-sm ${isActiveRoute ? 'text-white' : ''}`}>
                      {icon}
                    </div>
                    <span className={`flex-1 font-medium ${isActiveRoute ? 'text-white' : ''}`}>
                      {label}
                    </span>
                    <div className="flex items-center gap-1">
                      {!canAccess && requiresProject && (
                        <FiAlertTriangle className="text-amber-500 h-3 w-3" title="Requires active project" />
                      )}
                      {isActiveRoute && canAccess && (
                        <FiChevronRight className="text-white h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white h-screen border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div
        className={`flex items-center border-b border-gray-200 py-4 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-7 h-7" />
            <div>
              <span className="text-lg font-bold text-gray-800">
                API Automation
              </span>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-50 ${
            collapsed && "mt-0"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>
      </div>

      {/* Active Project Section */}
      {!collapsed && (
        <div className={`px-4 py-4 border-b border-gray-200 ${
          !hasActiveProject 
            ? 'bg-amber-50' 
            : 'bg-green-50'
        }`}>
          <div className="flex flex-col">
            <div className="text-xs text-gray-600 mb-2 flex items-center font-semibold">
              <FaProjectDiagram className="mr-2 text-indigo-600" />
              ACTIVE PROJECT
              {hasActiveProject && <FiStar className="ml-2 text-green-600 h-3 w-3" />}
            </div>
            {hasActiveProject ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-green-200">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {activeProject.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ID: {activeProject.projectId}
                  </div>
                </div>
                <div className="bg-green-600 text-white text-xs py-1 px-2 rounded-full font-medium">
                  ACTIVE
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-sm">
                <div className="flex items-center text-amber-700 mb-2">
                  <FiAlertTriangle className="mr-2 h-4 w-4" />
                  <span className="text-sm font-semibold">No Active Project</span>
                </div>
                <button
                  onClick={() => navigate('/admin/project-setup')}
                  className="w-full text-sm bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Select Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-6 text-sm text-gray-700 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Dashboard */}
        <div
          onClick={() => handleNavigation("/dashboard", true)}
          className={`flex ${
            collapsed ? "flex-col items-center justify-center" : "flex-row items-center"
          } gap-3 px-3 py-2.5 my-1 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
            isActive("/dashboard")
              ? "bg-indigo-600 text-white"
              : canNavigate(true)
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <div className={`text-lg ${isActive("/dashboard") ? 'text-white' : ''}`}>
            <FiGrid />
          </div>
          {!collapsed && (
            <div className="flex justify-between items-center flex-1">
              <span className={`font-medium ${isActive("/dashboard") ? 'text-white' : ''}`}>
                Dashboard
              </span>
              <div className="flex items-center">
                {!canNavigate(true) && (
                  <FiAlertTriangle className="text-amber-500 h-3 w-3 mr-2" title="Requires active project" />
                )}
                {isActive("/dashboard") && canNavigate(true) && (
                  <FiChevronRight className="text-white h-4 w-4" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Simple Divider */}
        <div className={`border-b border-gray-200 my-4 ${collapsed && "mx-2"}`}></div>
        
        {/* Section Label */}
        {!collapsed && (
          <div className="px-3 mb-2 text-xs text-gray-500 font-semibold">TEST MANAGEMENT</div>
        )}
        
        {/* Test Design subsection */}
        <MenuSection
          title="Test Design"
          open={testDesignOpen}
          setOpen={setTestDesignOpen}
          items={testDesignSubMenus}
          icon={<FiBox />}
        />
        
        {/* Test Execution subsection */}
        <MenuSection
          title="Test Execution"
          open={testExecutionOpen}
          setOpen={setTestExecutionOpen}
          items={testExecutionSubMenus}
          icon={<FiTrello />}
        />

        {/* Simple Divider */}
        <div className={`border-b border-gray-200 my-4 ${collapsed && "mx-2"}`}></div>
        
        {/* Section Label */}
        {!collapsed && (
          <div className="px-3 mb-2 text-xs text-gray-500 font-semibold">ADMINISTRATION</div>
        )}
        
        <MenuSection
          title="Admin Settings"
          open={adminOpen}
          setOpen={setAdminOpen}
          items={adminSubMenus}
          icon={<FiSettings />}
        />
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">APP VERSION</div>
              <div className="text-sm font-semibold text-gray-700">v1.0.0</div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="System Online"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;