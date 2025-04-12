
import React, { useState } from "react";
import { FiTrash } from "react-icons/fi";

const HeadersTab = () => {
  const [headers, setHeaders] = useState([{ key: "", value: "", description: "" }]);

  const handleChange = (index, field, value) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  const handleAddRow = () => {
    setHeaders([...headers, { key: "", value: "", description: "" }]);
  };

  const handleDeleteRow = (index) => {
    const updated = [...headers];
    updated.splice(index, 1);
    setHeaders(updated);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2 font-medium text-gray-600">Key</th>
            <th className="px-4 py-2 font-medium text-gray-600">Value</th>
            <th className="px-4 py-2 font-medium text-gray-600">Description</th>
            <th className="px-4 py-2 font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => handleChange(index, "key", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => handleChange(index, "value", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={header.description}
                  onChange={(e) => handleChange(index, "description", e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleDeleteRow(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleAddRow}
        className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded hover:bg-[#4338CA] text-sm"
      >
        + Add Header
      </button>
    </div>
  );
};

export default HeadersTab;
