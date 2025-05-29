import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCog, FaUserCircle, FaBell, FaChevronDown } from "react-icons/fa";
import { FiLogOut, FiUser, FiSettings, FiHelpCircle, FiGrid, FiLayers, FiArchive, FiX } from "react-icons/fi";
import Logo from "../../assets/Logo.svg";
import { toast } from "react-toastify";
import { api } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import { useProjectStore } from "../../stores/projectStore";
import { useUIStore } from "../../stores/uiStore";

const GlobalSearchModal = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm.trim());
      } else {
        setSearchResults([]);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async (keyword) => {
    if (!keyword.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await api(`/api/global-search?keyword=${encodeURIComponent(keyword)}`);
      
      // Handle different possible response structures
      let results = [];
      
      if (response && Array.isArray(response)) {
        // Direct array response
        results = response;
      } else if (response && response.result && Array.isArray(response.result.data)) {
        // Nested in result.data
        results = response.result.data;
      } else if (response && response.result && Array.isArray(response.result)) {
        // Nested in result
        results = response.result;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Nested in data
        results = response.data;
      } else if (response && Array.isArray(response.data)) {
        // Direct data array
        results = response.data;
      } else {
        // Try to extract from any nested structure
        const extractArray = (obj) => {
          if (Array.isArray(obj)) return obj;
          if (obj && typeof obj === 'object') {
            for (const key in obj) {
              const result = extractArray(obj[key]);
              if (Array.isArray(result) && result.length > 0) return result;
            }
          }
          return [];
        };
        results = extractArray(response);
      }
      
      // Ensure results is always an array
      if (!Array.isArray(results)) {
        results = [];
      }
      
      setSearchResults(results);
      
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      toast.error("Failed to perform search");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(searchResults[selectedIndex]);
    }
  };

  // Get icon based on entity type
  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case "TestCase":
        return <FiGrid className="w-4 h-4 text-green-500" />;
      case "TestSuite":
        return <FiLayers className="w-4 h-4 text-blue-500" />;
      case "TestPackage":
        return <FiArchive className="w-4 h-4 text-purple-500" />;
      default:
        return <FiGrid className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get entity type display name
  const getEntityTypeDisplay = (entityType) => {
    switch (entityType) {
      case "TestCase":
        return "Test Case";
      case "TestSuite":
        return "Test Suite";
      case "TestPackage":
        return "Test Package";
      default:
        return entityType;
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    onNavigate(result);
    onClose();
  };

  // Highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 animate-scale-in">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="relative mr-3">
              <FaSearch className="text-indigo-500 animate-pulse" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search test cases, suites, or packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-lg outline-none font-medium"
            />
            <button
              onClick={onClose}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto search-results" ref={resultsRef}>
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Searching...</span>
                </div>
              </div>
            ) : searchTerm && searchResults.length === 0 ? (
              <div className="text-center py-12">
                <FiGrid className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms or check spelling
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors search-result-item ${
                      selectedIndex === index ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getEntityIcon(result.entityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {highlightText(result.name, searchTerm)}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {getEntityTypeDisplay(result.entityType)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {highlightText(result.description, searchTerm)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Zustand stores
  const { logout, user } = useAuthStore();
  const { activeProject } = useProjectStore();
  const { 
    modals,
    notifications,
    openSearchModal,
    closeSearchModal
  } = useUIStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Mock user data - this would come from auth store in real implementation
  const userData = user || {
    name: "User",
    email: "user@example.com",
    role: "Administrator",
    avatar: null
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

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearchModal]);

  // Handle navigation from search results
  const handleSearchNavigation = (result) => {
    switch (result.entityType) {
      case "TestCase":
        navigate("/test-design/test-case/create", {
          state: { testCase: { testCaseId: result.id, ...result } }
        });
        break;
      case "TestSuite":
        navigate("/test-design/test-suite/create", {
          state: { suite: { id: result.id, ...result } }
        });
        break;
      case "TestPackage":
        navigate("/test-design/test-package/create", {
          state: { package: { id: result.id, ...result } }
        });
        break;
      default:
        toast.error("Unknown entity type");
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm relative z-30">
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
          <button
            onClick={() => openSearchModal()}
            className="w-full flex items-center px-4 py-2.5 text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:from-white hover:to-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 group focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <FaSearch className="text-gray-400 mr-3 group-hover:text-indigo-500 transition-colors duration-200" />
            <span className="flex-1 text-left text-sm font-medium group-hover:text-gray-700">Search test cases, suites, or packages...</span>
            <div className="flex items-center space-x-1 text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-200 group-hover:border-gray-300 transition-all duration-200">
              <kbd className="font-mono">⌘</kbd>
              <kbd className="font-mono">K</kbd>
            </div>
          </button>
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
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 py-1 animate-fade-in">
                <button
                  onClick={() => {
                    navigate("/admin/user-settings");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  User Settings
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/environment-setup");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Environment Setup
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/project-setup");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
              {notifications.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse">
                  {notifications.count}
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
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt={userData.name} 
                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <FaUserCircle className="h-6 w-6" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.role}</p>
                </div>
                <FaChevronDown className="h-3 w-3 text-gray-400" />
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50 py-1 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                  <p className="text-sm text-gray-500 truncate">{userData.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiUser className="mr-3 h-4 w-4 text-gray-400" />
                  Your Profile
                </button>
                
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiSettings className="mr-3 h-4 w-4 text-gray-400" />
                  Settings
                </button>
                
                <button
                  onClick={() => {
                    navigate("/help");
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  <FiLogOut className="mr-3 h-4 w-4 text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={modals.globalSearch.isOpen}
        onClose={closeSearchModal}
        onNavigate={handleSearchNavigation}
      />
    </>
  );
};

export default Navbar;