// src/features/TestCase/components/TestCase.js
import React, { useState } from "react";
import { FaTrash, FaFileExport, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";

const pageSize = 6;

const mockTestCases = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  testCaseId: `TC-${String(25 - i).padStart(3, "0")}`,
  name: [
    "Cart Functionality Test",
    "Mobile App Launch Test",
    "API Response Validation",
    "Payment Processing Test",
    "Invalid Password Test",
    "Valid Login Test",
  ][i % 6],
  description: [
    "Verify that items can be added and removed from the cart correctly",
    "Ensure the mobile app launches without crashes on different devices.",
    "Check if the API returns the expected response format and status codes.",
    "Validate that a successful payment is processed correctly using a credit card.",
    "Ensure login fails with incorrect password and displays an error message.",
    "Verify that a user can log in with correct credentials.",
  ][i % 6],
  createdDate: new Date(2025, 2, 24 + (i % 6)).toLocaleDateString("en-GB"),
}));

const TestCase = () => {
  const navigate = useNavigate();
  const [data] = useState(mockTestCases);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = currentData.map((item) => item.id);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected(allSelected ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  };

  const getPaginationRange = () => {
    const range = [];
    const dots = "...";
    const visiblePages = 2;

    range.push(1);
    if (currentPage > visiblePages + 2) range.push(dots);

    for (let i = Math.max(2, currentPage - visiblePages); i <= Math.min(totalPages - 1, currentPage + visiblePages); i++) {
      range.push(i);
    }

    if (currentPage + visiblePages < totalPages - 1) range.push(dots);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="p-6 font-inter text-gray-800">
      <Breadcrumb
        items={[{ label: "Test Design" }, { label: "Test Case", path: "/test-design/test-case" }]}
      />
      <div className="border-b border-gray-200 mb-6"></div>

      <h2 className="text-2xl font-semibold mb-4">Test case</h2>

      <div className="flex justify-end gap-2 mb-3">
        {selected.length === 0 ? (
          <button
            onClick={() => navigate("/test-design/test-case/create")}
            className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
          >
            <FaPlus className="inline mr-2" />
            Create
          </button>
        ) : (
          <>
            <button className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]">
              <FaTrash className="inline mr-2" />
              Delete
            </button>
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
              >
                <FaFileExport className="inline mr-2" />
                Export
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 bg-white border rounded shadow w-32 z-10">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">As PDF</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">As Excel</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={currentData.every((item) => selected.includes(item.id))}
                />
              </th>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Test Case Name</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="py-3 px-4">{item.testCaseId}</td>
                <td
                  className="py-3 px-4 text-[#4F46E5] underline cursor-pointer"
                  onClick={() => navigate("/test-design/test-case/create", { state: { testCase: item } })}
                >
                  {item.name}
                </td>
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4">{item.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center px-4 py-3 text-sm text-gray-600 gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          >
            Prev
          </button>
          {getPaginationRange().map((item, idx) => (
            <button
              key={idx}
              disabled={item === "..."}
              onClick={() => item !== "..." && setCurrentPage(item)}
              className={`px-3 py-1 border rounded ${item === currentPage ? "bg-indigo-600 text-white" : "hover:bg-gray-100"}`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCase;
