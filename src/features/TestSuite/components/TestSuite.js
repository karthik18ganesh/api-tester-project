import React, { useEffect, useState } from "react";
import { FaTrash, FaFileExport, FaPlus, FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { api } from "../../../utils/api";

const pageSize = 5;

const TestSuite = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
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
          status: suite.status || "-",    
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

  // Load data on component mount
  useEffect(() => {
    fetchSuites();
  }, []);

  return (
    <div className="p-6 font-inter text-gray-800">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Test Design", path: "/test-design" },
          { label: "Test Suite" },
        ]}
      />

      <div className="border-b border-gray-200 mb-6"></div>

      <h2 className="text-2xl font-semibold mb-4">Test Suite</h2>

      {/* Search and Actions Row */}
      <div className="flex justify-between items-center mb-4">
        {/* Search Box */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border rounded-md pr-10"
          />
          {searchTerm ? (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>
          ) : (
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selected.length === 0 ? (
            <button
              onClick={() => navigate("/test-design/test-suite/create")}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded hover:bg-indigo-700"
            >
              <FaPlus className="inline mr-2" /> Create
            </button>
          ) : (
            <>
              <button 
                onClick={() => setShowModal(true)} 
                className="px-4 py-2 bg-[#4F46E5] text-white rounded hover:bg-indigo-700"
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded hover:bg-indigo-700"
                >
                  <FaFileExport className="inline mr-2" /> Export
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-1 bg-white shadow border rounded w-32 z-10">
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      As PDF
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      As Excel
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded shadow-sm border p-8 text-center">
          <div className="text-gray-600">Loading test suites...</div>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {data.length === 0 ? (
            <div className="bg-white rounded shadow-sm border p-8 text-center">
              <div className="text-gray-600 mb-4">No test suites found</div>
              <button
                onClick={() => navigate("/test-design/test-suite/create")}
                className="px-4 py-2 bg-[#4F46E5] text-white rounded hover:bg-indigo-700"
              >
                Create New Test Suite
              </button>
            </div>
          ) : (
            <>
              {/* No Search Results */}
              {filteredData.length === 0 && searchTerm && (
                <div className="bg-white rounded shadow-sm border p-6 text-center">
                  <div className="text-gray-600 mb-2">No test suites match your search criteria</div>
                  <button
                    onClick={clearSearch}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Clear search
                  </button>
                </div>
              )}
              
              {/* Table */}
              {filteredData.length > 0 && (
                <div className="bg-white rounded shadow-sm border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                      <tr>
                        <th className="py-3 px-4">
                          <input
                            type="checkbox"
                            onChange={toggleSelectAll}
                            checked={
                              currentData.length > 0 &&
                              currentData.every((item) => selected.includes(item.id))
                            }
                          />
                        </th>
                        <th className="py-3 px-4">Suite ID</th>
                        <th className="py-3 px-4">Test Suite Name</th>
                        <th className="py-3 px-4">Test Case Count</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4">Executed Date</th>
                        <th className="py-3 px-4">Executed Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selected.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                            />
                          </td>
                          <td className="py-3 px-4">{item.suiteId}</td>
                          <td
                            className="py-3 px-4 text-indigo-700 underline cursor-pointer"
                            onClick={() =>
                              navigate("/test-design/test-suite/create", {
                                state: { suite: item },
                              })
                            }
                          >
                            {item.name}
                          </td>
                          <td className="py-3 px-4">{item.count}</td>
                          <td className="py-3 px-4">{item.created}</td>
                          <td className="py-3 px-4">{item.executed || "-"}</td>
                          <td className="py-3 px-4">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
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
                          className={`px-3 py-1 border rounded ${
                            item === currentPage
                              ? "bg-indigo-600 text-white"
                              : "hover:bg-gray-100"
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
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete ${selected.length === 1 ? 'this test suite' : 'these test suites'}? This action cannot be undone.`}
      />
    </div>
  );
};

export default TestSuite;