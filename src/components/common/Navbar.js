import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCog, FaUserCircle } from "react-icons/fa";
import Logo from "../../assets/Logo.svg";
import { toast } from "react-toastify";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-3">
        <img src={Logo} alt="Logo" className="w-6 h-6" />
        <h1 className="text-lg font-semibold text-gray-800">Automation</h1>
      </div>

      {/* Center - Search */}
      <div className="relative w-[640px]">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
        />
      </div>

      {/* Right - Icons */}
      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        <FaCog
          className="text-gray-500 hover:text-[#4F46E5] cursor-pointer transition-colors"
          onClick={() => setShowDropdown(!showDropdown)}
        />
        <FaUserCircle className="text-gray-500 hover:text-[#4F46E5] cursor-pointer text-xl transition-colors" />

        {showDropdown && (
          <div className="absolute right-0 top-10 w-40 bg-white border rounded shadow-md z-10">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
