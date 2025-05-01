// src/features/TestCase/components/TestCase.js
import React, { useState, useEffect } from "react";
import { FaTrash, FaFileExport, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";

const pageSize = 6;

const TestCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDir, setSortDir] = useState("DESC");

  // Generate metadata for API requests
  const generateMetadata = () => {
    return {
      userId: "302", // This would typically come from auth context
      transactionId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
  };

  // Fetch data from API
  const fetchTestCases = async () => {
    try {
      setLoading(true);
      // API expects pageNo to be 0-indexed, but our UI is 1-indexed
      const response = await api(
        `/api/v1/test-cases?pageNo=${currentPage - 1}&limit=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      
      // Check if the response has the expected structure
      if (response.result?.data) {
        setData(response.result.data.content || []);
        setTotalPages(response.result.data.totalPages || 0);
        setTotalElements(response.result.data.totalElements || 0);
        
        // Clear selection when data changes
        setSelected([]);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Error fetching test cases:", err);
      setError("Failed to load test cases. Please try again later.");
      toast.error("Failed to load test cases");
    } finally {
      setLoading(false);
    }
  };

  // Delete selected test cases
  const deleteSelected = async () => {
    try {
      const requestBody = {
        requestMetaData: generateMetadata(),
        data: selected
      };
      
      // Use the bulk delete endpoint
      await api("/api/v1/test-cases/delete", "DELETE", requestBody);
      
      toast.success(`Successfully deleted ${selected.length} test case(s)`);
      fetchTestCases(); // Refresh the data
      setSelected([]); // Clear selection
    } catch (err) {
      console.error("Error deleting test cases:", err);
      toast.error("Failed to delete test cases");
    }
  };

  // Handle export action
  const handleExport = async (format) => {
    try {
      const requestBody = {
        requestMetaData: generateMetadata(),
        data: {
          format: format,
          testCaseIds: selected
        }
      };
      
      // This would typically call an API endpoint to generate the export
      // Adjust based on your actual API
      await api("/api/v1/test-cases/export", "POST", requestBody);
      
      toast.info(`Exporting ${selected.length} test cases as ${format}...`);
      setExportOpen(false);
    } catch (err) {
      console.error(`Error exporting test cases as ${format}:`, err);
      toast.error(`Failed to export test cases as ${format}`);
    }
  };

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchTestCases();
  }, [currentPage, sortBy, sortDir]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = data.map((item) => item.testCaseId);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected(
      allSelected
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])]
    );
  };

  const getPaginationRange = () => {
    const range = [];
    const dots = "...";
    const visiblePages = 2;

    range.push(1);
    if (currentPage > visiblePages + 2) range.push(dots);

    for (
      let i = Math.max(2, currentPage - visiblePages);
      i <= Math.min(totalPages - 1, currentPage + visiblePages);
      i++
    ) {
      range.push(i);
    }

    if (currentPage + visiblePages < totalPages - 1) range.push(dots);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  if (loading && data.length === 0) {
    return (
      <div className="p-6 font-inter text-gray-800">
        <Breadcrumb
          items={[
            { label: "Test Design" },
            { label: "Test Case", path: "/test-design/test-case" },
          ]}
        />
        <div className="border-b border-gray-200 mb-6"></div>
        <h2 className="text-2xl font-semibold mb-4">Test case</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
          <span className="ml-2">Loading test cases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-inter text-gray-800">
        <Breadcrumb
          items={[
            { label: "Test Design" },
            { label: "Test Case", path: "/test-design/test-case" },
          ]}
        />
        <div className="border-b border-gray-200 mb-6"></div>
        <h2 className="text-2xl font-semibold mb-4">Test case</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          <p>{error}</p>
          <button 
            onClick={fetchTestCases} 
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-inter text-gray-800">
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Case", path: "/test-design/test-case" },
        ]}
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
            <button 
              onClick={deleteSelected}
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
            >
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
                  <div 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleExport("PDF")}
                  >
                    As PDF
                  </div>
                  <div 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleExport("Excel")}
                  >
                    As Excel
                  </div>
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
                  checked={
                    data.length > 0 && 
                    data.every((item) => selected.includes(item.testCaseId))
                  }
                />
              </th>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Test Case Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No test cases found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.testCaseId} className="border-b">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.testCaseId)}
                      onChange={() => toggleSelect(item.testCaseId)}
                    />
                  </td>
                  <td className="py-3 px-4">TC-{String(item.testCaseId).padStart(3, "0")}</td>
                  <td
                    className="py-3 px-4 text-[#4F46E5] underline cursor-pointer"
                    onClick={() =>
                      navigate("/test-design/test-case/create", {
                        state: { testCase: item },
                      })
                    }
                  >
                    {item.name}
                  </td>
                  <td className="py-3 px-4 capitalize">{item.type}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">{item.createdDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Loading indicator for subsequent page loads */}
        {loading && data.length > 0 && (
          <div className="py-4 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#4F46E5] mr-2"></div>
            Loading...
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-600">
          <div>
            {totalElements > 0 && (
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalElements)} of {totalElements} entries
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
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
                className={`px-3 py-1 border rounded ${
                  item === currentPage ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
                }`}
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
    </div>
  );
};

export default TestCase;