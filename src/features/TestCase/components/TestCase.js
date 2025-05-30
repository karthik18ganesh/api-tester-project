import React, { useState, useEffect } from "react";
import { FaTrash, FaFileExport, FaPlus, FaSearch } from "react-icons/fa";
import { FiX, FiGrid, FiChevronRight, FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { nanoid } from "nanoid";

const pageSize = 6;

const TestCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDir, setSortDir] = useState("DESC");
  const [searchTerm, setSearchTerm] = useState("");

  // Generate metadata for API requests
  const generateMetadata = () => {
    return {
      userId: localStorage.getItem("userId") || "302",
      transactionId: nanoid(),
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
        const formattedData = response.result.data.content.map(item => ({
          ...item,
          status: item.status || "Pending",
          executedDate: item.executedDate || "Never"
        }));
        
        setData(formattedData);
        setFilteredData(formattedData);
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
      setShowDeleteModal(false);
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
      await api("/api/v1/test-cases/export", "POST", requestBody);
      
      toast.info(`Exporting ${selected.length} test cases as ${format}...`);
      setExportOpen(false);
    } catch (err) {
      console.error(`Error exporting test cases as ${format}:`, err);
      toast.error(`Failed to export test cases as ${format}`);
    }
  };

  // Search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(testCase => 
        testCase.name.toLowerCase().includes(term) || 
        String(testCase.testCaseId).includes(term) ||
        (testCase.description && testCase.description.toLowerCase().includes(term))
      );
      setFilteredData(filtered);
    }
    
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredData(data);
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
    const ids = filteredData.map((item) => item.testCaseId);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected(
      allSelected
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])]
    );
  };

  // Get status badge styles based on status
  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      case 'in progress':
        return "bg-blue-100 text-blue-800";
      case 'pending':
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to determine test case type badge color
  const getTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'functional':
        return "bg-purple-100 text-purple-800";
      case 'performance':
        return "bg-yellow-100 text-yellow-800";
      case 'security':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <div className="p-6 font-inter text-gray-800">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Case" },
        ]}
      />

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Header with title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Test Cases</h2>
            <p className="text-sm text-gray-600 mt-1">
              Define and manage individual test scenarios for your APIs
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-10 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:-translate-y-0.5 transition-all"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-4">
          {selected.length === 0 ? (
            <button
              onClick={() => navigate("/test-design/test-case/create")}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Test Case
            </button>
          ) : (
            <div className="flex gap-3">
              <span className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                {selected.length} item{selected.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center"
                >
                  <FaFileExport className="mr-2" />
                  Export
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg w-40 z-10 animate-fade-in">
                    <div 
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-t-md flex items-center text-gray-700"
                      onClick={() => handleExport("PDF")}
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                      </svg>
                      PDF
                    </div>
                    <div 
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-b-md flex items-center text-gray-700 border-t"
                      onClick={() => handleExport("Excel")}
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                      </svg>
                      Excel
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Loading State */}
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading test cases...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="bg-red-100 rounded-full p-4 mb-4 text-red-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{error}</h3>
              <button 
                className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                onClick={fetchTestCases}
              >
                Try Again
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            /* Empty State */
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FiGrid className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No test cases found</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                {searchTerm 
                  ? `No cases match your search "${searchTerm}"`
                  : "Create your first test case to start testing your APIs"}
              </p>
              {searchTerm ? (
                <button 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 hover:-translate-y-0.5 transition-all flex items-center"
                  onClick={clearSearch}
                >
                  <FiX className="mr-2" />
                  Clear Search
                </button>
              ) : (
                <button 
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center"
                  onClick={() => navigate("/test-design/test-case/create")}
                >
                  <FaPlus className="mr-2" />
                  Create Test Case
                </button>
              )}
            </div>
          ) : (
            /* Table Content */
            <>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-medium">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          filteredData.length > 0 &&
                          filteredData.every((item) => selected.includes(item.testCaseId))
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="py-3 px-4 font-medium">ID</th>
                    <th className="py-3 px-4 font-medium">Test Case Name</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Description</th>
                    <th className="py-3 px-4 font-medium">Created</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr 
                      key={item.testCaseId} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.testCaseId)}
                          onChange={() => toggleSelect(item.testCaseId)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                        TC-{String(item.testCaseId).padStart(3, "0")}
                      </td>
                      <td
                        onClick={() =>
                          navigate("/test-design/test-case/create", {
                            state: { testCase: item },
                          })
                        }
                        className="py-3 px-4 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer flex items-center"
                      >
                        {item.name}
                        <FiChevronRight className="ml-1 h-4 w-4" />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 truncate max-w-xs">
                        {item.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 flex items-center">
                        <FiCalendar className="mr-1 h-3 w-3 text-gray-400" /> 
                        {item.createdDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status === "Completed" && <FiCheck className="mr-1 h-3 w-3" />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalElements)} to{" "}
                  {Math.min(currentPage * pageSize, totalElements)} of {totalElements} items
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:transform-none text-gray-600 transition-all"
                  >
                    Previous
                  </button>
                  {getPaginationRange().map((item, idx) => (
                    <button
                      key={idx}
                      disabled={item === "..."}
                      onClick={() => item !== "..." && setCurrentPage(item)}
                      className={`px-3 py-1 border rounded-md hover:-translate-y-0.5 transition-all ${
                        item === currentPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:transform-none text-gray-600 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteSelected}
        title="Delete Test Cases"
        message={`Are you sure you want to delete ${selected.length} selected test case${selected.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default TestCase;