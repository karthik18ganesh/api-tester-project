import React from "react";

const IconButton = ({ icon: Icon, className = "", ...props }) => {
  return (
    <button
      className={`p-2 text-gray-500 hover:text-[#4F46E5] transition-colors duration-200 ${className}`}
      {...props}
    >
      <Icon size={18} />
    </button>
  );
};

export default IconButton;
