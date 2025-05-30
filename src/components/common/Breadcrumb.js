import React from "react";
import { FiHome, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";

const Breadcrumb = ({ items: customItems, showHome = true }) => {
  const navigate = useNavigate();
  const autoBreadcrumbs = useBreadcrumbs();
  
  // Use custom items if provided, otherwise use auto-generated breadcrumbs
  const items = customItems || autoBreadcrumbs;

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6 mt-2" aria-label="Breadcrumb">
      {showHome && (
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="flex items-center hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:text-indigo-600"
          title="Go to Dashboard"
        >
          <FiHome className="w-4 h-4 mr-1" />
        </button>
      )}
      
      {items.map((item, index) => {
        // Skip the first item if it's dashboard and showHome is true (to avoid duplication)
        if (showHome && index === 0 && (item.label === 'Dashboard' || item.icon === 'home')) {
          return null;
        }

        const isLast = index === items.length - 1;
        const isClickable = item.path && !isLast;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <FiChevronRight className="mx-2 w-4 h-4 text-gray-400" />
            {isClickable ? (
              <button
                onClick={() => handleNavigation(item.path)}
                className="hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:text-indigo-600 font-medium"
                title={`Go to ${item.label}`}
              >
                {item.label}
              </button>
            ) : (
              <span className={`font-medium ${isLast ? 'text-indigo-600' : 'text-gray-900'}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
