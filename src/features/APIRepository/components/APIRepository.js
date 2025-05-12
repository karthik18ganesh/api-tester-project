import React, { useState, useEffect } from "react";
import { FaTrash, FaFileExport, FaPlus, FaSearch } from "react-icons/fa";
import { FiX, FiGrid, FiChevronRight, FiCalendar, FiLink, FiCode } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { api } from "../../../utils/api";

const pageSize = 6;

const APIRepository = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchAPIs = async () => {
    setLoading(true);
    try {
      // In a real application, this would be an API call
      // For now, we'll use mock data with a timeout to simulate loading
      setTimeout(() => {
        const mockAPIs = Array.from({ length: 18 }, (_, i) => ({
          id: i + 1,
          apiId: `API-${String(100 + i)}`,
          name: [
            "User Login API",
            "Cart Checkout API",
            "Order Tracking API",
            "Search Endpoint",
            "Payment Gateway",
            "Inventory Fetch",
          ][i % 6],
          method: ["GET", "POST", "PUT", "DELETE", "PATCH", "GET"][i % 6],
          url: [
            "/api/auth/login",
            "/api/cart/checkout",
            "/api/orders/{id}/track",
            "/api/search",
            "/api/payments/process",
            "/api/inventory/fetch",
          ][i % 6],
          description: [
            "Handles user login authentication.",
            "Processes the checkout of shopping cart items.",
            "Fetches order tracking info using order ID.",
            "Returns filtered search results for products.",
            "Handles secure payment transactions.",
            "Fetches inventory stock details for admin.",
          ][i % 6],
          createdDate: new Date(2025, 3, 1 + (i % 6)).toLocaleDateString("en-GB"),
          environment: ["Development", "Production", "Staging", "Testing", "QA", "Development"][i % 6],
        }));
        
        setData(mockAPIs);
        setFilteredData(mockAPIs);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error("Error fetching APIs:", err);
      setError("Failed to load APIs. Please try again later.");
      toast.error("Error fetching APIs");
      setLoading(false);
    }
  };

  // Handle API deletion
  const handleDelete = async () => {
    if (selected.length === 0) {
      toast.warning("No APIs selected for deletion");
      return;
    }
    
    try {
      // This would be an API call in a real application
      // For now, we'll simulate a successful deletion
      
      // Update local state by filtering out deleted APIs
      const updatedData = data.filter(
        (api) => !selected.includes(api.id)
      );
      setData(updatedData);
      setFilteredData(updatedData);
      setSelected([]);
      
      toast.success(`Successfully deleted ${selected.length} API${selected.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("Error occurred while deleting APIs");
    } finally {
      setDeleteModalOpen(false);
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
        api => 
          api.name.toLowerCase().includes(term) || 
          api.apiId.toString().includes(term) ||
          api.url.toLowerCase().includes(term) ||
          api.description.toLowerCase().includes(term)
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

  // Get method badge color
  const getMethodColor = (method) => {
    switch(method.toUpperCase()) {
      case 'GET':
        return "bg-green-100 text-green-800";
      case 'POST':
        return "bg-blue-100 text-blue-800";
      case 'PUT':
        return "bg-yellow-100 text-yellow-800";
      case 'DELETE':
        return "bg-red-100 text-red-800";
      case 'PATCH':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get environment badge color
  const getEnvironmentBadge = (env) => {
    switch(env.toLowerCase()) {
      case 'production':
        return "bg-red-100 text-red-800";
      case 'staging':
        return "bg-amber-100 text-amber-800";
      case 'development':
        return "bg-green-100 text-green-800";
      case 'testing':
      case 'qa':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    fetchAPIs();
  }, []);

  return (
    <div className="p-6 font-inter text-gray-800">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "API Design" },
          { label: "API Repository" },
        ]}
      />

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Header with title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">API Repository</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your collection of API endpoints for testing
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search APIs..."
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
              onClick={() => navigate("/test-design/api-repository/create")}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" />
              Create API
            </button>
          ) : (
            <div className="flex gap-3">
              <span className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                {selected.length} item{selected.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
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
              <p className="text-gray-600">Loading APIs...</p>
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
                className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={fetchAPIs}
              >
                Try Again
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            /* Empty State */
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FiCode className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No APIs found</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                {searchTerm 
                  ? `No APIs match your search "${searchTerm}"`
                  : "Create your first API to start testing endpoints"}
              </p>
              {searchTerm ? (
                <button 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                  onClick={clearSearch}
                >
                  <FiX className="mr-2" />
                  Clear Search
                </button>
              ) : (
                <button 
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  onClick={() => navigate("/test-design/api-repository/create")}
                >
                  <FaPlus className="mr-2" />
                  Create API
                </button>
              )}
            </div>
          ) : (
            /* Table Content with Fixed Alignment */
            <>
              <div className="overflow-x-auto">
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
                      <th className="py-3 px-4 font-medium w-[10%]">API ID</th>
                      <th className="py-3 px-4 font-medium w-[20%]">API Name</th>
                      <th className="py-3 px-4 font-medium w-[10%] text-center">Method</th>
                      <th className="py-3 px-4 font-medium w-[20%]">Endpoint</th>
                      <th className="py-3 px-4 font-medium w-[10%] text-center">Environment</th>
                      <th className="py-3 px-4 font-medium w-[25%]">Description</th>
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
                          {item.apiId}
                        </td>
                        <td
                          onClick={() =>
                            navigate("/test-design/api-repository/create", {
                              state: { api: item },
                            })
                          }
                          className="py-3 px-4 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer truncate"
                        >
                          <div className="flex items-center">
                            <span className="truncate">{item.name}</span>
                            <FiChevronRight className="ml-1 flex-shrink-0 h-4 w-4" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(item.method)}`}>
                            {item.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 truncate">
                          <div className="flex items-center">
                            <FiLink className="mr-1 flex-shrink-0 h-3 w-3 text-gray-400" /> 
                            <span className="truncate font-mono text-xs">{item.url}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnvironmentBadge(item.environment)}`}>
                            {item.environment}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="truncate">
                            {item.description}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-40 text-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  {getPaginationRange().map((item, idx) => (
                    <button
                      key={idx}
                      disabled={item === "..."}
                      onClick={() => item !== "..." && setCurrentPage(item)}
                      className={`px-3 py-1 border rounded-md ${
                        item === currentPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "hover:bg-gray-100 text-gray-600"
                      } transition-colors`}
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-40 text-gray-600 transition-colors"
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
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete APIs"
        message={`Are you sure you want to delete ${selected.length} selected API${selected.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default APIRepository;