// src/components/common/Layout.js
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet /> {/* 👈 This is where all routed content will render */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
