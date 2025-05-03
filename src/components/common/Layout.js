// src/components/common/Layout.js
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [activeProject, setActiveProject] = useState(null);

  // Listen for active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedProject = localStorage.getItem("activeProject");
      if (storedProject) {
        setActiveProject(JSON.parse(storedProject));
      } else {
        setActiveProject(null);
      }
    };
    
    // Initial check
    handleStorageChange();
    
    // Listen for changes
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet /> {/* 👈 This is where all routed content will render */}
        </main>
      </div>
    </div>
  );
};

export default Layout;