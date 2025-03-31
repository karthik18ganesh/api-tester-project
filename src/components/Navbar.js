import React from "react";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white shadow-md">
      <div className="text-lg font-bold">Test Automation </div>
      <input
        type="text"
        placeholder="Search..."
        className="border rounded px-4 py-2 w-1/3"
      />
      <div className="space-x-3">
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          + Create
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
          Run
        </button>
      </div>
    </div>
  );
};

export default Navbar;
