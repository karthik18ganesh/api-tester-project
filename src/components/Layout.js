import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
