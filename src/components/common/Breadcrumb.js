import React from "react";
import { FiHome, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4 mt-2">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center hover:text-[#4F46E5]"
      >
        <FiHome className="mr-1" />
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FiChevronRight className="mx-1" />
          {item.path ? (
            <button
              onClick={() => navigate(item.path)}
              className="hover:text-[#4F46E5]"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[#4F46E5] font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
