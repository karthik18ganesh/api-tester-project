import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

const ITEMS_PER_PAGE = 6;

const TestCaseConfigurationForm = () => {
  const [activeTab, setActiveTab] = useState("Variables");
  const [variables, setVariables] = useState([
    { name: "user_email", value: "testuser@example.com" },
    { name: "user_password", value: "P@ssw0rd123" },
    { name: "auth_token", value: "eyJhbGciOiJIUzI1NiIsInR..." },
    { name: "api_base_url", value: "https://api.example.com" },
    { name: "request_timeout", value: "30 (seconds)" },
    { name: "max_retry_count", value: "3" },
    { name: "region", value: "ap-south-1" },
    { name: "app_version", value: "1.4.5" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(variables.length / ITEMS_PER_PAGE);
  const paginatedVariables = variables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = (indexToRemove) => {
    const indexInData = (currentPage - 1) * ITEMS_PER_PAGE + indexToRemove;
    const updated = [...variables];
    updated.splice(indexInData, 1);
    setVariables(updated);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-end mt-4 space-x-1 text-sm">
        <button
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
        {startPage > 1 && <span className="px-2">...</span>}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded ${
              page === currentPage
                ? "bg-[#4F46E5] text-white"
                : "border hover:bg-[#4338CA] hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && <span className="px-2">...</span>}
        <button
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg mt-8">
      <div className="flex items-center mb-4 space-x-2">
        <h2 className="text-md font-semibold">Test case configuration</h2>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {["Variables", "Functions"].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 font-medium ${
              activeTab === tab
                ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedVariables.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3">{item.name}</td>
                <td className="p-3 truncate">{item.value}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(idx)}
                    className="text-gray-400 hover:text-[#4F46E5]"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 space-x-2">
        <button className="px-4 py-2 border text-sm rounded">Cancel</button>
        <button className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]">
          Create
        </button>
      </div>
    </div>
  );
};

export default TestCaseConfigurationForm;
