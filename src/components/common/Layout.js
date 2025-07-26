// src/components/common/Layout.js
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <Outlet /> {/* 👈 This is where all routed content will render */}
        </main>
      </div>
    </div>
  );
};

export default Layout;