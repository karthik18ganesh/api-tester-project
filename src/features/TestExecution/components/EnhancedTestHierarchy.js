import React, { useState } from 'react';
import { FaAngleDown, FaAngleRight, FaBoxOpen, FaLayerGroup, FaCodeBranch } from 'react-icons/fa';

// Modern Test Hierarchy component with enhanced styling and animations
const EnhancedTestHierarchy = ({ data, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState({ [data.id]: true });

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get icon based on item type
  const getIcon = (type) => {
    switch (type) {
      case 'package':
        return <FaBoxOpen className="text-indigo-500" />;
      case 'suite':
        return <FaLayerGroup className="text-blue-500" />;
      case 'case':
        return <FaCodeBranch className="text-green-500" />;
      default:
        return <FaCodeBranch className="text-gray-500" />;
    }
  };

  const renderItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];
    const isSelected = selectedId === item.id;

    return (
      <div key={item.id} className="mb-1">
        <div 
          className={`flex items-center p-2.5 rounded-md cursor-pointer transition-all duration-200 ${
            isSelected ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center w-full">
            <span className="mr-2 text-gray-500 w-5">
              {getIcon(item.type)}
            </span>
            
            <span className="flex-1 font-medium text-sm">
              {item.name}
            </span>
            
            {hasChildren && (
              <button
                className={`p-1 rounded-full hover:bg-gray-200 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(item.id);
                }}
              >
                {isExpanded ? <FaAngleDown className="text-gray-400" /> : <FaAngleRight className="text-gray-400" />}
              </button>
            )}
          </div>
        </div>
        
        {hasChildren && (
          <div 
            className={`overflow-hidden transition-all duration-300 ml-4 pl-2 border-l border-indigo-100 ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {item.children.map(child => renderItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md p-4 h-full overflow-auto bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-gray-800">Test Selection</h2>
        <span className="bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">
          {countItems(data)} items
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {renderItem(data)}
      </div>
    </div>
  );
};

// Helper function to count total items in the tree
const countItems = (node) => {
  let count = 1; // Count the node itself
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      count += countItems(child);
    });
  }
  return count;
};

export default EnhancedTestHierarchy;