import React from "react";

const Sidebar = () => {
  const menuItems = [
    "Test Design",
    "Test Run",
    "Results",
    "Environment",
    "Notifications",
    "Integration"
  ];

  return (
    <div className="w-20 bg-gray-900 text-white flex flex-col items-center py-4 h-screen">
      {menuItems.map((item, idx) => (
        <div key={idx} className="my-3 text-center cursor-pointer hover:bg-gray-700 w-full py-2">
          <span className="text-xs">{item}</span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
