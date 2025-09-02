// src/components/common/Sidebar.js - Enhanced with Modern Visual Design
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  FiInfo,
} from 'react-icons/fi';
import {
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaProjectDiagram,
} from 'react-icons/fa';
import Logo from '../../assets/Logo.svg';
import { useProjectActivation } from './ProjectActivationGuard';
import { useUIStore } from '../../stores/uiStore';
import { usePermissions } from '../../hooks/usePermissions';

const Sidebar = () => {
  const [adminOpen, setAdminOpen] = useState(false);
  const [testDesignOpen, setTestDesignOpen] = useState(false);
  const [testExecutionOpen, setTestExecutionOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject, hasActiveProject } = useProjectActivation();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore();
  const {
    canAccess,
    canManageUsers,
    canAccessProjectSetup,
    canAccessEnvironmentSetup,
    canAccessDashboard,
    hasProjectAccess,
    getUserPermissions,
    currentUserRole,
  } = usePermissions();

  // Check if user is admin/super admin
  const isAdminUser =
    currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN';

  // Debug: Log current permissions (temporary for troubleshooting)
  useEffect(() => {
    const permissions = getUserPermissions();
    console.log('=== PERMISSION DEBUG ===');
    console.log('Current user permissions:', permissions);
    console.log('Dashboard access:', canAccessDashboard());
    console.log('Test Design access:', canAccess('testDesign'));
    console.log('Test Execution access:', canAccess('testExecution'));
    console.log('Admin access:', canAccess('admin'));
    console.log('User role:', currentUserRole);
    console.log('Is admin user:', isAdminUser);
    console.log('=== END DEBUG ===');
  }, [
    getUserPermissions,
    canAccessDashboard,
    canAccess,
    currentUserRole,
    isAdminUser,
  ]);

  useEffect(() => {
    // Auto-expand sections based on current route
    if (location.pathname.includes('/admin/')) {
      setAdminOpen(true);
    }

    if (location.pathname.includes('/test-design/')) {
      setTestDesignOpen(true);
    }

    // Expand test execution section if on test execution or results pages
    if (
      location.pathname.includes('/test-execution') ||
      location.pathname.includes('/test-results')
    ) {
      setTestExecutionOpen(true);
    }
  }, [location.pathname]);

  const isActive = (route) => location.pathname === route;

  // Check if navigation should be allowed based on user role and project requirements
  const canNavigate = (requiresProject = true) => {
    // Admin users can always navigate (they can access any project)
    if (isAdminUser) return true;

    // For regular users, check if project is required and available
    if (!requiresProject) return true;
    return hasActiveProject;
  };

  // Handle navigation with project check
  const handleNavigation = (route, requiresProject = true) => {
    if (canNavigate(requiresProject)) {
      navigate(route);
    } else {
      // For regular users without projects, show project selection
      if (!isAdminUser) {
        navigate('/admin/project-setup');
      } else {
        // For admin users, allow navigation but show warning
        navigate(route);
      }
    }
  };

  // Test Execution submenu items with permission checks per section
  const testExecutionSubMenus = [
    {
      label: 'Test Execution',
      icon: <FiPlayCircle />,
      route: '/test-execution',
      requiresProject: true,
      permissionSection: 'execution',
    },
    {
      label: 'Results',
      icon: <FiBarChart2 />,
      route: '/test-results',
      requiresProject: true,
      permissionSection: 'results',
    },
  ].filter((item) => canAccess('testExecution', item.permissionSection));

  const testDesignSubMenus = [
    {
      label: 'API Repository',
      route: '/test-design/api-repository',
      icon: <FiDatabase />,
      requiresProject: true,
      permissionSection: 'apiRepository',
    },
    {
      label: 'Test Case',
      route: '/test-design/test-case',
      icon: <FiFileText />,
      requiresProject: true,
      permissionSection: 'testCases',
    },
    {
      label: 'Test Suite',
      route: '/test-design/test-suite',
      icon: <FiFolder />,
      requiresProject: true,
      permissionSection: 'testSuites',
    },
    {
      label: 'Test Package',
      route: '/test-design/test-package',
      icon: <FiArchive />,
      requiresProject: true,
      permissionSection: 'testPackages',
    },
    // {
    //   label: "Functions & Variables",
    //   route: "/test-design/functions-variables",
    //   icon: <FiCode />,
    //   requiresProject: true,
    //   permissionSection: 'functionsVariables'
    // },
    {
      label: 'Bulk Upload',
      route: '/test-design/bulk-upload',
      icon: <FiLayers />,
      requiresProject: true,
      permissionSection: 'bulkUpload',
    },
  ].filter((item) => canAccess('testDesign', item.permissionSection));

  const adminSubMenus = [
    {
      label: 'Environment Setup',
      route: '/admin/environment-setup',
      icon: <FiGlobe />,
      requiresProject: true,
      permissionSection: 'environmentSetup',
    },
    {
      label: 'Project Setup',
      route: '/admin/project-setup',
      icon: <FiFolder />,
      requiresProject: false, // Project setup doesn't require active project
      permissionSection: 'projectSetup',
    },
    {
      label: 'User Settings',
      route: '/admin/user-settings',
      icon: <FiUser />,
      requiresProject: false,
      permissionSection: 'userSettings',
    },
  ].filter((item) => canAccess('admin', item.permissionSection));

  const MenuSection = ({ title, open, setOpen, items, icon, permission }) => {
    // If no items, don't render
    if (items.length === 0) {
      return null;
    }

    const hasActiveItems = items.some((item) => isActive(item.route));

    return (
      <div className={`mt-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <div
          onClick={() => !collapsed && setOpen(!open)}
          className={`flex ${
            collapsed
              ? 'flex-col items-center justify-center'
              : 'flex-row justify-between'
          } px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${
            hasActiveItems ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
          }`}
        >
          <div
            className={`flex ${collapsed ? 'flex-col items-center' : 'flex-row items-center gap-3'}`}
          >
            <div
              className={`text-lg ${hasActiveItems ? 'text-indigo-600' : 'text-gray-600'}`}
            >
              {icon}
            </div>
            {!collapsed && (
              <span
                className={`text-sm font-medium ${hasActiveItems ? 'text-indigo-700' : 'text-gray-700'}`}
              >
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
            open && !collapsed
              ? 'max-h-96 opacity-100 mt-1'
              : 'max-h-0 opacity-0'
          }`}
        >
          {!collapsed &&
            items.map(
              ({ label, route, icon, requiresProject = true, permission }) => {
                const canAccess = canNavigate(requiresProject);
                const isActiveRoute = isActive(route);

                return (
                  <div
                    key={label}
                    onClick={() => handleNavigation(route, requiresProject)}
                    className={`transition-colors duration-200 ml-2 my-0.5 rounded-lg ${
                      isActiveRoute
                        ? 'bg-indigo-600 text-white cursor-pointer'
                        : canAccess
                          ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div
                        className={`text-sm ${isActiveRoute ? 'text-white' : ''}`}
                      >
                        {icon}
                      </div>
                      <span
                        className={`flex-1 font-medium ${isActiveRoute ? 'text-white' : ''}`}
                      >
                        {label}
                      </span>
                      <div className="flex items-center gap-1">
                        {!canAccess && requiresProject && !isAdminUser && (
                          <FiAlertTriangle
                            className="text-amber-500 h-3 w-3"
                            title="Requires active project"
                          />
                        )}
                        {isActiveRoute && canAccess && (
                          <FiChevronRight className="text-white h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
        </div>
      </div>
    );
  };

  // Show warning message for regular users without projects
  const showNoProjectWarning = !isAdminUser && !hasActiveProject && (
    <div className="px-3 py-2 mb-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start">
          <FiInfo className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <div className="font-medium text-amber-800 mb-1">
              No Project Assigned
            </div>
            <div className="text-amber-700">
              You need to be assigned to a project to access features. Contact
              your administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`bg-white h-screen border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div
        className={`flex items-center border-b border-gray-200 py-4 px-4 ${
          collapsed ? 'justify-center' : 'justify-between'
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
            collapsed && 'mt-0'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaBars />
        </button>
      </div>

      {/* Active Project Section */}
      {!collapsed && (
        <div
          className={`px-4 py-4 border-b border-gray-200 ${
            !hasActiveProject ? 'bg-amber-50' : 'bg-green-50'
          }`}
        >
          <div className="flex flex-col">
            <div className="text-xs text-gray-600 mb-2 flex items-center font-semibold">
              <FaProjectDiagram className="mr-2 text-indigo-600" />
              ACTIVE PROJECT
              {hasActiveProject && (
                <FiStar className="ml-2 text-green-600 h-3 w-3" />
              )}
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
                  <span className="text-sm font-semibold">
                    {isAdminUser ? 'No Active Project' : 'No Project Assigned'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/admin/project-setup')}
                  className="w-full text-sm bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  {isAdminUser ? 'Select Project' : 'Contact Admin'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Project Warning for Regular Users */}
      {!collapsed && showNoProjectWarning}

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-6 text-sm text-gray-700 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Dashboard - Only show if user has dashboard permission */}
        {(canAccessDashboard() || isAdminUser) && (
          <div
            onClick={() => handleNavigation('/dashboard', true)}
            className={`flex ${
              collapsed
                ? 'flex-col items-center justify-center'
                : 'flex-row items-center'
            } gap-3 px-3 py-2.5 my-1 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
              isActive('/dashboard')
                ? 'bg-indigo-600 text-white'
                : canNavigate(true)
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <div
              className={`text-lg ${isActive('/dashboard') ? 'text-white' : ''}`}
            >
              <FiGrid />
            </div>
            {!collapsed && (
              <div className="flex justify-between items-center flex-1">
                <span
                  className={`font-medium ${isActive('/dashboard') ? 'text-white' : ''}`}
                >
                  Dashboard
                </span>
                <div className="flex items-center">
                  {!canNavigate(true) && !isAdminUser && (
                    <FiAlertTriangle
                      className="text-amber-500 h-3 w-3 mr-2"
                      title="Requires active project"
                    />
                  )}
                  {isActive('/dashboard') && canNavigate(true) && (
                    <FiChevronRight className="text-white h-4 w-4" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simple Divider */}
        <div
          className={`border-b border-gray-200 my-4 ${collapsed && 'mx-2'}`}
        ></div>

        {/* Section Label */}
        {!collapsed && (
          <div className="px-3 mb-2 text-xs text-gray-500 font-semibold">
            TEST MANAGEMENT
          </div>
        )}

        {/* Test Design subsection - Only show if user has any test design permissions */}
        {(testDesignSubMenus.length > 0 || isAdminUser) && (
          <MenuSection
            title="Test Design"
            open={testDesignOpen}
            setOpen={setTestDesignOpen}
            items={testDesignSubMenus}
            icon={<FiBox />}
          />
        )}

        {/* Test Execution subsection - Only show if user has any test execution permissions */}
        {(testExecutionSubMenus.length > 0 || isAdminUser) && (
          <MenuSection
            title="Test Execution"
            open={testExecutionOpen}
            setOpen={setTestExecutionOpen}
            items={testExecutionSubMenus}
            icon={<FiTrello />}
          />
        )}

        {/* Simple Divider */}
        <div
          className={`border-b border-gray-200 my-4 ${collapsed && 'mx-2'}`}
        ></div>

        {/* Section Label */}
        {!collapsed && (
          <div className="px-3 mb-2 text-xs text-gray-500 font-semibold">
            ADMINISTRATION
          </div>
        )}

        {/* Admin Settings - Only show if user has any admin permissions */}
        {(adminSubMenus.length > 0 || isAdminUser) && (
          <MenuSection
            title="Admin Settings"
            open={adminOpen}
            setOpen={setAdminOpen}
            items={adminSubMenus}
            icon={<FiSettings />}
          />
        )}
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">
                APP VERSION
              </div>
              <div className="text-sm font-semibold text-gray-700">v1.0.0</div>
            </div>
            <div
              className="w-2 h-2 bg-green-500 rounded-full"
              title="System Online"
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
