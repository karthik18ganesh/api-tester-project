import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCog, FaUserCircle, FaBell, FaChevronDown } from "react-icons/fa";
import { FiLogOut, FiUser, FiSettings, FiHelpCircle } from "react-icons/fi";
import Logo from "../../assets/Logo.svg";
import { toast } from "react-toastify";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [activeProject, setActiveProject] = useState(() => {
    // Get active project from localStorage or use default
    const storedProject = localStorage.getItem("activeProject");
    return storedProject ? JSON.parse(storedProject) : null;
  });
  
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Mock user data - in production, this would come from your auth context/state
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator",
    avatar: null // If null, we'll use the FaUserCircle icon
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for active project changes from other components
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

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      {/* Left - Logo & Active Project */}
      <div className="flex items-center gap-3">
        <img src={Logo} alt="Logo" className="w-6 h-6" />
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-800 mr-2">
            {activeProject ? activeProject.name : "Automation"}
          </h1>
          {activeProject && (
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium py-0.5 px-2 rounded-full">
              {activeProject.projectId}
            </span>
          )}
        </div>
      </div>

      {/* Center - Search */}
      <div className="relative w-[640px]">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Right - Icons & User Profile */}
      <div className="flex items-center gap-6">
        {/* Settings Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-gray-500 hover:text-indigo-600 cursor-pointer transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Settings"
          >
            <FaCog className="h-5 w-5" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  navigate("/admin/user-settings");
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                User Settings
              </button>
              <button
                onClick={() => {
                  navigate("/admin/environment-setup");
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Environment Setup
              </button>
              <button
                onClick={() => {
                  navigate("/admin/project-setup");
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Project Setup
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="text-gray-500 hover:text-indigo-600 cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <FaBell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {notifications}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="User profile"
          >
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FaUserCircle className="h-6 w-6" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <FaChevronDown className="h-3 w-3 text-gray-400" />
            </div>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50 py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowProfileDropdown(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="mr-3 h-4 w-4 text-gray-400" />
                Your Profile
              </button>
              
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowProfileDropdown(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiSettings className="mr-3 h-4 w-4 text-gray-400" />
                Settings
              </button>
              
              <button
                onClick={() => {
                  navigate("/help");
                  setShowProfileDropdown(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiHelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                Help Center
              </button>
              
              <div className="border-t border-gray-100 mt-1"></div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setShowProfileDropdown(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <FiLogOut className="mr-3 h-4 w-4 text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;