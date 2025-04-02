
import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaInfoCircle } from "react-icons/fa";

const TestSuiteAssignmentForm = ({ testCases, onAddToSuite, suiteCreated }) => {
  const [selected, setSelected] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelect = (item) => {
    if (!selected.includes(item)) {
      setSelected([...selected, item]);
    }
  };

  const handleRemove = (item) => {
    setSelected(selected.filter((i) => i !== item));
  };

  const handleAdd = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one test case");
      return;
    }
    onAddToSuite?.(selected);
    setSelected([]);
  };

  const availableOptions = testCases.filter((item) => !selected.includes(item));

  return (
    <div className="bg-white shadow-sm rounded p-4 mt-6">
      <div className="flex items-center mb-3">
        <label className="font-semibold text-gray-700 mr-2">
          Test suite configuration
        </label>
        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <FaInfoCircle className="text-blue-600" /> Assign test cases
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <div
            onClick={toggleDropdown}
            className="border rounded px-4 py-2 flex items-center justify-between cursor-pointer min-h-[44px]"
          >
            <div className="flex flex-wrap gap-2">
              {selected.map((item) => (
                <span
                  key={item}
                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  {item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item);
                    }}
                    className="text-blue-500 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <span className="ml-auto text-gray-500">&#9662;</span>
          </div>

          {dropdownOpen && (
            <ul className="absolute z-10 bg-white shadow-md w-full mt-1 rounded max-h-48 overflow-y-auto">
              {availableOptions.map((item) => (
                <li
                  key={item}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                  onClick={() => handleSelect(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className={`px-4 py-2 rounded text-white ${
            suiteCreated ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleAdd}
          disabled={!suiteCreated}
        >
          Add to suite
        </button>
      </div>
    </div>
  );
};

export default TestSuiteAssignmentForm;
