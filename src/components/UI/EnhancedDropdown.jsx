import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

// Native Select Dropdown with Custom Styling
export const EnhancedDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  disabled = false
}) => {
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full appearance-none px-4 py-2 pr-10 text-left
          border border-gray-300 rounded-lg bg-white
          hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20
          transition-all duration-200 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${value ? 'text-gray-900' : 'text-gray-500'}
        `}
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="text-gray-900 bg-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom chevron icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <FiChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

// Days selector using native select
export const DaysSelector = ({ selectedDays, onDaysChange, className = "" }) => {
  const daysOptions = [
    { value: "1", label: "Last 24 hours" },
    { value: "7", label: "Last 7 days" },
    { value: "14", label: "Last 14 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" }
  ];

  return (
    <div className={className}>
      <EnhancedDropdown
        options={daysOptions}
        value={selectedDays}
        onChange={onDaysChange}
      />
    </div>
  );
};

// Alternative: Pure CSS Styled Select (backup option)
export const StyledNativeSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  disabled = false
}) => {
  return (
    <div className={`styled-select-wrapper ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="styled-select"
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Alternative Days Selector using pure CSS styling (backup)
export const DaysSelectorStyled = ({ selectedDays, onDaysChange, className = "" }) => {
  const daysOptions = [
    { value: "7", label: "Last 7 days" },
    { value: "14", label: "Last 14 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" }
  ];

  return (
    <StyledNativeSelect
      options={daysOptions}
      value={selectedDays}
      onChange={onDaysChange}
      className={className}
    />
  );
}; 