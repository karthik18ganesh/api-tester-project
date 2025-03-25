import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-8">
          <h2 className="text-2xl font-semibold">Test Automation Dashboard!</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
