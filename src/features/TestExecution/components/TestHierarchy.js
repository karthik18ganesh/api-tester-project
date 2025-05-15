import React, { useState } from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';

const TestHierarchy = ({ data, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];
    const isSelected = selectedId === item.id;

    return (
      <div key={item.id} className="mb-2">
        <div 
          className={`flex items-center p-2 rounded cursor-pointer ${
            isSelected ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect(item)}
        >
          {hasChildren && (
            <span 
              className="mr-2 text-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
            >
              {isExpanded ? <FaAngleDown /> : <FaAngleRight />}
            </span>
          )}
          <span className={`ml-${hasChildren ? '0' : '4'}`}>
            {item.name}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 pl-2 border-l border-gray-300 mt-1">
            {item.children.map(child => renderItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md p-4 h-full overflow-auto">
      <h2 className="font-semibold text-lg mb-4">Test Selection</h2>
      {renderItem(data)}
    </div>
  );
};

export default TestHierarchy; 