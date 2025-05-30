import React, { useEffect, useState } from "react";
import { FaTrash, FaFileExport, FaPlus, FaSearch } from "react-icons/fa";
import { FiX, FiGrid, FiChevronRight, FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { api } from "../../../utils/api";

const pageSize = 6;

const TestSuite = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch all test suites
  const fetchSuites = async () => {
    setLoading(true);
    try {
      const json = await api("/api/v1/test-suites", "GET");
      const { code, message, data: resultData } = json.result;
  
      if (code === "200") {
        const formatted = resultData.content.map((suite) => ({
          id: suite.testSuiteID,
          suiteId: suite.testSuiteID, 
          name: suite.suiteName,
          count: suite.testCases?.length || 0,
          created: suite.createdDate,   
          executed: suite.updatedDate,    
          status: suite.status || "Pending",    
        }));
        setData(formatted);
        setFilteredData(formatted);
      } else {
        toast.error(message || "Failed to fetch test suites");
      }
    } catch (err) {
      console.error("Error fetching test suites:", err);
      toast.error("Error fetching test suites");
    } finally {
      setLoading(false);
    }
  };

  // Handle test suite deletion
  const handleDelete = async () => {
    if (selected.length === 0) {
      toast.warning("No test suites selected for deletion");
      return;
    }
    
    const payload = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: nanoid(),
        timestamp: new Date().toISOString(),
      },
      data: selected,
    };
  
    try {
      const json = await api("/api/v1/test-suites/delete", "DELETE", payload);
      const { code, message } = json.result;
  
      if (code === "200") {
        toast.success(message || "Test Suites deleted successfully");
        // Update local state by filtering out deleted suites
        const updatedData = data.filter(
          (suite) => !selected.includes(suite.id)
        );
        setData(updatedData);
        setFilteredData(updatedData);
        setSelected([]);
      } else {
        toast.error(message || "Failed to delete Test Suites");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("Error occurred while deleting Test Suites");
    } finally {
      setShowModal(false);
    }
  };

  // Handle checkbox selections
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = currentData.map((item) => item.id);
    const allSelected = currentPageIds.every((id) => selected.includes(id));
    
    setSelected((prev) => {
      if (allSelected) {
        // Deselect all on current page
        return prev.filter((id) => !currentPageIds.includes(id));
      } else {
        // Select all on current page
        return [...new Set([...prev, ...currentPageIds])];
      }
    });
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        suite => 
          suite.name.toLowerCase().includes(term) || 
          suite.suiteId.toString().includes(term)
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

  // Pagination helpers
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

  // Load data on component mount
  useEffect(() => {
    fetchSuites();
  }, []);

  return (
    <div className="p-6 font-inter text-gray-800">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Suite" },
        ]}
      />

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Header with title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Test Suites</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage collections of test cases grouped for execution
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search suites..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-10 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
              onClick={() => navigate("/test-suite/create")}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Test Suite
            </button>
          ) : (
            <div className="flex gap-3">
              <span className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                {selected.length} item{selected.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setShowModal(true)}
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
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-t-md flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                      </svg>
                      PDF
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-b-md flex items-center text-gray-700 border-t">
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
              <p className="text-gray-600">Loading test suites...</p>
            </div>
          ) : filteredData.length === 0 ? (
            /* Empty State */
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FiGrid className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No test suites found</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                {searchTerm 
                  ? `No suites match your search "${searchTerm}"`
                  : "Create your first test suite to organize your test cases"}
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
                  onClick={() => navigate("/test-suite/create")}
                >
                  <FaPlus className="mr-2" />
                  Create Test Suite
                </button>
              )}
            </div>
          ) : (
            /* Table Content */
            <>
              <table className="w-full text-sm text-left table-fixed">
  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
    <tr>
      <th className="py-3 px-4 font-medium w-[5%]">
        <input
          type="checkbox"
          onChange={toggleSelectAll}
          checked={
            currentData.length > 0 &&
            currentData.every((item) => selected.includes(item.id))
          }
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </th>
      <th className="py-3 px-4 font-medium w-[10%]">ID</th>
      <th className="py-3 px-4 font-medium w-[25%]">Suite Name</th>
      <th className="py-3 px-4 font-medium w-[10%] text-center">Test Cases</th>
      <th className="py-3 px-4 font-medium w-[15%]">Created</th>
      <th className="py-3 px-4 font-medium w-[20%]">Last Executed</th>
      <th className="py-3 px-4 font-medium w-[15%]">Status</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {currentData.map((item) => (
      <tr 
        key={item.id} 
        className="hover:bg-gray-50 transition-colors"
      >
        <td className="py-3 px-4">
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={() => toggleSelect(item.id)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </td>
        <td className="py-3 px-4 text-gray-600 font-mono text-xs truncate">
          {item.suiteId}
        </td>
        <td
          onClick={() =>
            navigate("/test-suite/create", {
              state: { suite: item },
            })
          }
          className="py-3 px-4 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
        >
          <div className="flex items-center">
            <span className="truncate">{item.name}</span>
            <FiChevronRight className="ml-1 flex-shrink-0 h-4 w-4" />
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
            {item.count}
          </span>
        </td>
        <td className="py-3 px-4 text-gray-600 truncate">
          <div className="flex items-center">
            <FiCalendar className="mr-1 flex-shrink-0 h-3 w-3 text-gray-400" /> 
            <span className="truncate">{item.created}</span>
          </div>
        </td>
        <td className="py-3 px-4 text-gray-600 truncate">
          <div className="flex items-center">
            <FiClock className="mr-1 flex-shrink-0 h-3 w-3 text-gray-400" /> 
            <span className="truncate">{item.executed || "Never"}</span>
          </div>
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
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{" "}
                  {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} items
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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Test Suites"
        message={`Are you sure you want to delete ${selected.length} selected test suite${selected.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default TestSuite;