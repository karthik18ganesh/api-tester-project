import React, { useState } from 'react';
import { FaAngleDown, FaAngleRight, FaBoxOpen, FaLayerGroup, FaVial, FaFolder } from 'react-icons/fa';
import { FiPackage, FiLayers, FiFileText } from 'react-icons/fi';

// Modern Test Hierarchy component with enhanced styling and animations
const EnhancedTestHierarchy = ({ data, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState({ [data.id]: true });

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get icon and styling based on item type
  const getIconAndStyle = (type, hasChildren = false) => {
    switch (type) {
      case 'root':
        return {
          icon: <FaFolder className="text-gray-600" />,
          bgColor: 'hover:bg-gray-50',
          textColor: 'text-gray-700 font-medium'
        };
      case 'package':
        return {
          icon: <FiPackage className="text-indigo-600" />,
          bgColor: 'hover:bg-indigo-50',
          textColor: 'text-indigo-700 font-medium'
        };
      case 'suite':
        return {
          icon: <FiLayers className="text-blue-600" />,
          bgColor: 'hover:bg-blue-50',
          textColor: 'text-blue-700'
        };
      case 'case':
        return {
          icon: <FiFileText className="text-green-600" />,
          bgColor: 'hover:bg-green-50',
          textColor: 'text-green-700'
        };
      default:
        return {
          icon: <FaFolder className="text-gray-500" />,
          bgColor: 'hover:bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  // Get item count display with more detailed breakdown
  const getItemCount = (item) => {
    if (!item.children || item.children.length === 0) return null;
    
    if (item.type === 'package') {
      // For packages, show suite count
      const suiteCount = item.children.length;
      let caseCount = 0;
      item.children.forEach(suite => {
        if (suite.children) {
          caseCount += suite.children.length;
        }
      });
      
      if (caseCount > 0) {
        return `${suiteCount} suite${suiteCount !== 1 ? 's' : ''}, ${caseCount} case${caseCount !== 1 ? 's' : ''}`;
      } else {
        return `${suiteCount} suite${suiteCount !== 1 ? 's' : ''}`;
      }
    } else if (item.type === 'suite') {
      // For suites, show test case count
      const caseCount = item.children.length;
      return caseCount > 0 ? `${caseCount} case${caseCount !== 1 ? 's' : ''}` : 'No test cases';
    }
    
    return null;
  };

  const renderItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];
    const isSelected = selectedId === item.id;
    const { icon, bgColor, textColor } = getIconAndStyle(item.type, hasChildren);
    const itemCount = getItemCount(item);

    return (
      <div key={item.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <div 
          className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all duration-200 group ${
            isSelected 
              ? 'bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-200' 
              : `${bgColor} ${textColor}`
          }`}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                className={`p-1 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200 mr-2 ${
                  isExpanded ? 'rotate-0' : '-rotate-90'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(item.id);
                }}
              >
                {isExpanded ? (
                  <FaAngleDown className="text-gray-400 group-hover:text-gray-600" />
                ) : (
                  <FaAngleRight className="text-gray-400 group-hover:text-gray-600" />
                )}
              </button>
            )}
            
            {/* Icon */}
            <span className="mr-3 flex-shrink-0">
              {icon}
            </span>
            
            {/* Name */}
            <span className="flex-1 font-medium text-sm truncate">
              {item.name}
            </span>
            
            {/* Item Count Badge */}
            {item.type !== 'case' && (
              <span className={`ml-2 text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                isSelected 
                  ? 'bg-indigo-200 text-indigo-800' 
                  : 'bg-gray-200 text-gray-600 group-hover:bg-white group-hover:shadow-sm'
              }`}>
                {(() => {
                  const count = getItemCount(item);
                  if (count === null) {
                    return item.type === 'suite' ? 'Empty' : '0';
                  }
                  return count;
                })()}
              </span>
            )}
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && (
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`${depth < 2 ? 'ml-2 border-l border-gray-200 pl-2' : ''} mt-1`}>
              {item.children.map(child => renderItem(child, depth + 1))}
              
              {/* Show empty state for suites with no test cases */}
              {item.type === 'suite' && item.children.length === 0 && isExpanded && (
                <div className="ml-8 py-2 text-xs text-gray-400 italic">
                  No test cases in this suite
                </div>
              )}
              
              {/* Show empty state for packages with no suites */}
              {item.type === 'package' && item.children.length === 0 && isExpanded && (
                <div className="ml-8 py-2 text-xs text-gray-400 italic">
                  No test suites in this package
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle empty state
  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="border rounded-md p-4 h-full overflow-auto bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-gray-800">Test Selection</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <FaFolder className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Available</h3>
          <p className="text-gray-500 max-w-sm">
            No test packages, suites, or cases are available for execution. Create some test content to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 h-full overflow-auto bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h2 className="font-semibold text-lg text-gray-800">Test Selection</h2>
        {data.children && data.children.length > 0 && (
          <span className="bg-indigo-100 text-indigo-700 text-xs py-1 px-3 rounded-full font-medium">
            {countTotalItems(data)} items
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {data.children && data.children.length > 0 ? (
          data.children.map(child => renderItem(child, 0))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaFolder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No test packages found</p>
          </div>
        )}
      </div>
      
      {/* Selection Info */}
      {selectedId && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Selected:</div>
          <div className="text-sm font-medium text-gray-700 truncate">
            {getSelectedItemPath(data, selectedId)}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to count total items in the tree
const countTotalItems = (node) => {
  let count = 0;
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      count += 1;
      count += countTotalItems(child);
    });
  }
  return count;
};

// Helper function to get the path of selected item
const getSelectedItemPath = (root, selectedId) => {
  const findPath = (node, targetId, path = []) => {
    if (node.id === targetId) {
      return [...path, node.name].join(' > ');
    }
    
    if (node.children) {
      for (const child of node.children) {
        const result = findPath(child, targetId, [...path, node.name]);
        if (result) return result;
      }
    }
    
    return null;
  };
  
  return findPath(root, selectedId) || 'Unknown';
};

export default EnhancedTestHierarchy;