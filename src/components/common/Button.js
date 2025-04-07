import React from "react";

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
