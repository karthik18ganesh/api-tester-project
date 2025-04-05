import React from 'react';
import { FaSearch, FaCog, FaUserCircle } from 'react-icons/fa';
import Logo from "../../assets/Logo.svg";
const Navbar = () => {
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
      <div className="flex items-center gap-4">
        <FaCog className="text-gray-500 hover:text-[#4F46E5] cursor-pointer transition-colors" />
        <FaUserCircle className="text-gray-500 hover:text-[#4F46E5] cursor-pointer text-xl transition-colors" />
      </div>
    </header>
  );
};

export default Navbar;
