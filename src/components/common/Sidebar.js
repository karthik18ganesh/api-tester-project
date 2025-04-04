import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCogs,
  FaTachometerAlt,
  FaList,
  FaFlask,
  FaRegChartBar,
  FaUserCog,
  FaChevronDown,
  FaChevronUp,
  FaUsersCog,
  FaDatabase,
  FaProjectDiagram,
} from "react-icons/fa";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [testDesignOpen, setTestDesignOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (route) => location.pathname === route;

  const mainMenus = [
    { label: "Dashboard", icon: <FaTachometerAlt />, route: "/dashboard" },
    { label: "Test Execution", icon: <FaFlask />, route: "/test-execution" },
    { label: "Results", icon: <FaRegChartBar />, route: "/results" },
  ];

  const adminSubMenus = [
    {
      label: "Environment Setup",
      route: "admin/environment-setup",
      icon: <FaCogs />,
    },
    {
      label: "Project Setup",
      route: "admin/project-setup",
      icon: <FaProjectDiagram />,
    },
    { label: "User Settings", route: "admin/user-settings", icon: <FaUserCog /> },
  ];

  const testDesignSubMenus = [
    {
      label: "API Repository",
      route: "/test-design/api-repository",
      icon: <FaDatabase />,
    },
    { label: "Test Case", route: "/test-design/test-case", icon: <FaList /> },
    { label: "Test Suite", route: "/test-design/test-suite", icon: <FaList /> },
    {
      label: "Test Package",
      route: "/test-design/test-package",
      icon: <FaList />,
    },
    {
      label: "Functions & Variables",
      route: "/test-design/functions-variables",
      icon: <FaList />,
    },
  ];

  return (
    <div
      className={`bg-[#F9FAFB] h-screen border-r shadow-sm transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <span className="text-lg font-bold text-[#111827]">Automation</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 text-xl"
        >
          <FaBars />
        </button>
      </div>

      <div className="px-2 text-sm text-gray-700">
        {mainMenus.map(({ label, icon, route }) => (
          <div
            key={label}
            onClick={() => route && navigate(route)}
            className={`flex ${collapsed ? "flex-col items-center" : "flex-row items-center"} gap-3 px-3 py-2 mb-1 rounded cursor-pointer transition-all duration-200 ease-in-out ${
              isActive(route)
                ? "bg-[#EEF4FF] border-l-4 border-[#4F46E5] text-[#1E40AF]"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="text-xl">{icon}</div>
            {!collapsed && <span className="text-sm">{label}</span>}
          </div>
        ))}

        {/* Test Design Menu */}
        <div
          className={`mt-2 ${collapsed ? "flex flex-col items-center" : ""}`}
        >
          <div
            onClick={() => setTestDesignOpen(!testDesignOpen)}
            className={`flex ${collapsed ? "flex-col items-center" : "flex-row justify-between"} px-3 py-2 rounded cursor-pointer transition-colors`}
          >
            <div
              className={`flex ${collapsed ? "flex-col items-center" : "flex-row items-center gap-3"}`}
            >
              <FaList className="text-[16px]" />
              {!collapsed && <span className="text-sm">Test Design</span>}
            </div>
            {!collapsed &&
              (testDesignOpen ? (
                <FaChevronUp className="text-xs" />
              ) : (
                <FaChevronDown className="text-xs" />
              ))}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${testDesignOpen && !collapsed ? "max-h-60" : "max-h-0"}`}
          >
            {!collapsed &&
              testDesignSubMenus.map(({ label, route, icon }) => (
                <div
                  key={label}
                  onClick={() => navigate(route)}
                  className={`flex items-center gap-3 px-5 py-2 ml-3 mb-1 rounded cursor-pointer transition-colors text-sm ${
                    isActive(route)
                      ? "bg-[#EEF4FF] border-l-4 border-[#4F46E5] text-[#1E40AF]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="text-[14px]">{icon}</div>
                  <span>{label}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Admin Settings */}
        <div
          className={`mt-2 ${collapsed ? "flex flex-col items-center" : ""}`}
        >
          <div
            onClick={() => setAdminOpen(!adminOpen)}
            className={`flex ${collapsed ? "flex-col items-center" : "flex-row justify-between"} px-3 py-2 rounded cursor-pointer transition-colors`}
          >
            <div
              className={`flex ${collapsed ? "flex-col items-center" : "flex-row items-center gap-3"}`}
            >
              <FaUsersCog className="text-[16px]" />
              {!collapsed && <span className="text-sm">Admin Settings</span>}
            </div>
            {!collapsed &&
              (adminOpen ? (
                <FaChevronUp className="text-xs" />
              ) : (
                <FaChevronDown className="text-xs" />
              ))}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${adminOpen && !collapsed ? "max-h-60" : "max-h-0"}`}
          >
            {!collapsed &&
              adminSubMenus.map(({ label, route, icon }) => (
                <div
                  key={label}
                  onClick={() => navigate(route)}
                  className={`flex items-center gap-3 px-5 py-2 ml-3 mb-1 rounded cursor-pointer transition-colors text-sm ${
                    isActive(route)
                      ? "bg-[#EEF4FF] border-l-4 border-[#4F46E5] text-[#1E40AF]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="text-[14px]">{icon}</div>
                  <span>{label}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
