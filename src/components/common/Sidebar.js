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
} from "react-icons/fi";
import { FaBars, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Logo from "../../assets/Logo.svg";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [testDesignOpen, setTestDesignOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(() => {
    // Get active project from localStorage or use default
    const storedProject = localStorage.getItem("activeProject");
    return storedProject ? JSON.parse(storedProject) : null;
  });

  // Listen for active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedProject = localStorage.getItem("activeProject");
      if (storedProject) {
        setActiveProject(JSON.parse(storedProject));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Auto-expand sections based on current route
  useEffect(() => {
    // Check if current route is under admin
    if (location.pathname.includes("/admin/")) {
      setAdminOpen(true);
    }
    
    // Check if current route is under test-design
    if (location.pathname.includes("/test-design/")) {
      setTestDesignOpen(true);
    }
  }, [location.pathname]);

  const isActive = (route) => location.pathname === route;

  const mainMenus = [
    { label: "Dashboard", icon: <FiGrid />, route: "/dashboard" },
    {
      label: "Test Execution",
      icon: <FiPlayCircle />,
      route: "/test-execution",
    },
    { label: "Results", icon: <FiBarChart2 />, route: "/results" },
  ];

  const adminSubMenus = [
    {
      label: "Environment Setup",
      route: "/admin/environment-setup",
      icon: <FiGlobe />,
    },
    {
      label: "Project Setup",
      route: "/admin/project-setup",
      icon: <FiFolder />,
    },
    { label: "User Settings", route: "/admin/user-settings", icon: <FiUser /> },
  ];

  const testDesignSubMenus = [
    {
      label: "API Repository",
      route: "/test-design/api-repository",
      icon: <FiDatabase />,
    },
    {
      label: "Test Case",
      route: "/test-design/test-case",
      icon: <FiFileText />,
    },
    {
      label: "Test Suite",
      route: "/test-design/test-suite",
      icon: <FiLayers />,
    },
    {
      label: "Test Package",
      route: "/test-design/test-package",
      icon: <FiArchive />,
    },
    {
      label: "Functions & Variables",
      route: "/test-design/functions-variables",
      icon: <FiCode />,
    },
  ];

  const MenuSection = ({ title, open, setOpen, items, icon }) => {
    return (
      <div className={`mt-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <div
          onClick={() => !collapsed && setOpen(!open)}
          className={`flex ${
            collapsed ? "flex-col items-center justify-center" : "flex-row justify-between"
          } px-3 py-2.5 rounded-md cursor-pointer transition-colors hover:bg-gray-100`}
        >
          <div
            className={`flex ${collapsed ? "flex-col items-center" : "flex-row items-center gap-3"}`}
          >
            {icon}
            {!collapsed && <span className="text-sm font-medium">{title}</span>}
          </div>
          {!collapsed &&
            (open ? (
              <FaChevronUp className="text-xs text-gray-500" />
            ) : (
              <FaChevronDown className="text-xs text-gray-500" />
            ))}
        </div>
        
        {/* Submenu items */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open && !collapsed ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {!collapsed &&
            items.map(({ label, route, icon }) => (
              <div
                key={label}
                onClick={() => navigate(route)}
                className={`flex items-center gap-3 pl-9 pr-3 py-2.5 my-0.5 rounded-md cursor-pointer transition-colors text-sm ${
                  isActive(route)
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="text-[14px]">{icon}</div>
                <span>{label}</span>
                {isActive(route) && <FiChevronRight className="ml-auto text-indigo-500" />}
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white h-screen border-r shadow-sm transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div
        className={`flex items-center border-b border-gray-100 py-4 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-7 h-7" />
            <span className="text-lg font-bold text-gray-800">API Tester</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-gray-600 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-gray-100 ${
            collapsed && "mt-2"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>
      </div>

      {/* Active Project (when sidebar is expanded) */}
      {!collapsed && activeProject && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col">
            <div className="text-xs text-gray-500 mb-1">ACTIVE PROJECT</div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-800 truncate">
                {activeProject.name}
              </span>
              <span className="bg-indigo-100 text-indigo-800 text-xs py-0.5 px-1.5 rounded-full">
                {activeProject.projectId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-6 text-sm text-gray-700">
        {/* Main Menu Items */}
        <div className="mb-4">
          <div className={`${!collapsed && "mb-2 px-3"}`}>
            <div className={`text-xs text-gray-500 ${collapsed && "hidden"}`}>MAIN NAVIGATION</div>
          </div>
          
          {mainMenus.map(({ label, icon, route }) => (
            <div
              key={label}
              onClick={() => route && navigate(route)}
              className={`flex ${
                collapsed ? "flex-col items-center justify-center" : "flex-row items-center"
              } gap-3 px-3 py-2.5 my-1 rounded-md cursor-pointer transition-all duration-200 ease-in-out ${
                isActive(route)
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="text-[18px]">{icon}</div>
              {!collapsed && (
                <div className="flex justify-between items-center flex-1">
                  <span className="text-sm">{label}</span>
                  {isActive(route) && <FiChevronRight className="text-indigo-500" />}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`border-b border-gray-100 my-3 ${collapsed && "mx-2"}`}></div>

        {/* Test Design Section */}
        <div className={`${!collapsed && "mb-2 px-3"}`}>
          <div className={`text-xs text-gray-500 ${collapsed && "hidden"}`}>TEST MANAGEMENT</div>
        </div>
        
        <MenuSection
          title="Test Design"
          open={testDesignOpen}
          setOpen={setTestDesignOpen}
          items={testDesignSubMenus}
          icon={<FiBox className="text-[18px]" />}
        />

        {/* Divider */}
        <div className={`border-b border-gray-100 my-3 ${collapsed && "mx-2"}`}></div>

        {/* Admin Settings */}
        <div className={`${!collapsed && "mb-2 px-3"}`}>
          <div className={`text-xs text-gray-500 ${collapsed && "hidden"}`}>ADMINISTRATION</div>
        </div>
        
        <MenuSection
          title="Admin Settings"
          open={adminOpen}
          setOpen={setAdminOpen}
          items={adminSubMenus}
          icon={<FiSettings className="text-[18px]" />}
        />
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="text-xs text-gray-500 mb-1">APP VERSION</div>
          <div className="text-sm">v1.3.0</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;