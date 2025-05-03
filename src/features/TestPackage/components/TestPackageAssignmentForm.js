import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IconButton from "../../../components/common/IconButton";
import Button from "../../../components/common/Button";
import { api } from "../../../utils/api";

const ITEMS_PER_PAGE = 6;

const TestPackageAssignmentForm = ({
  testSuites,
  onAddToPackage,
  packageId,
  packageCreated,
  prefilledSuites = [],
}) => {
  const [selectedSuites, setSelectedSuites] = useState([]);
  const [availableSuites, setAvailableSuites] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState(null);


  useEffect(() => {
    const fetchTestSuites = async () => {
      try {
        const json = await api("/api/v1/test-suites?pageNo=0&limit=50&sortBy=createdDate&sortDir=DESC", "GET");
        const { code, data } = json.result;
  
        if (code === "200") {
          const suites = data.content.map((suite) => ({
            id: suite.testSuiteID,
            name: suite.suiteName,
            description: suite.description,
          }));
          setAvailableSuites(suites);
        } else {
          toast.error("Failed to load test suites");
        }
      } catch (err) {
        toast.error("Error fetching test suites");
      }
    };
  
    const fetchAssociatedSuites = async () => {
      try {
        const json = await api(`/api/v1/packages/${packageId}/test-suites`, "GET");
        const { code, data } = json.result;
  
        if (code === "200" && Array.isArray(data)) {
          const formatted = data.map((suite) => ({
            id: suite.testSuiteID,
            name: suite.suiteName,
            description: suite.description,
          }));
          setTableData(formatted);
          setAvailableSuites((prev) =>
            prev.filter((suite) => !formatted.some((assigned) => assigned.id === suite.id))
          );
        }
      } catch (err) {
        console.error("Error fetching associated test suites:", err);
        toast.error("Error loading previously assigned test suites");
      }
    };
  
    if (packageCreated) {
      fetchTestSuites();
      fetchAssociatedSuites();
    } else if (prefilledSuites.length > 0) {
      const initial = prefilledSuites.map((name, i) => ({
        id: Date.now() + i,
        name,
        description: `This is the description for ${name}`,
      }));
      setTableData(initial);
    }
  }, [packageCreated, packageId, prefilledSuites]);

  const handleRemoveBadge = (id) => {
    const removedSuite = selectedSuites.find((s) => s.id === id);
    if (removedSuite) {
      setAvailableSuites((prev) => [...prev, removedSuite]);
    }
    setSelectedSuites((prev) => prev.filter((s) => s.id !== id));
  };
  

  const handleAddToPackage = () => {
    if (selectedSuites.length === 0) {
      toast.warning("No test Suites selected");
      return;
    }
    const newTableData = [...tableData, ...selectedSuites];
    setTableData(newTableData);
    setSelectedSuites([]);
    toast.success("Test Suites added to package");
  };

  const handleAddSuite = (suite) => {
    setSelectedSuites((prev) => [...prev, suite]);
    setAvailableSuites((prev) => prev.filter((s) => s.id !== suite.id));
    setDropdownOpen(false);
  };
  

  const handleDeleteRow = (id) => {
    const toDelete = tableData.find((item) => item.id === id);
    setTableData(tableData.filter((item) => item.id !== id));
    setAvailableSuites([...availableSuites, toDelete]);
  };

  const handleCancel = () => {
    const restored = [...availableSuites, ...tableData];
    setAvailableSuites(restored);
    setTableData([]);
    setSelectedSuites([]);
  };

  const paginatedData = tableData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);

  const renderPagination = () => {
    let pages = [];
    const pageWindow = 2;
    const start = Math.max(1, currentPage - pageWindow);
    const end = Math.min(totalPages, currentPage + pageWindow);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`px-2 py-1 mx-1 ${i === currentPage ? "bg-indigo-600 text-white" : "bg-white border hover:bg-gray-100"}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex justify-end items-center px-4 py-3 text-sm text-gray-600 gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>
        {start > 1 && <span>...</span>}
        {pages}
        {end < totalPages && <span>...</span>}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg mt-8">
      <h3 className="font-semibold text-sm text-gray-700 mb-2">
        Test package configuration
        <span className="ml-2 text-blue-500 text-xs bg-blue-100 px-2 py-1 rounded-full">
          ℹ Assign Suite
        </span>
      </h3>
      {/* Label for the dropdown */}
{/* Multi-select badge input container */}
<div className="relative w-full col-span-2">
  <label className="text-sm font-medium text-gray-600 mb-1 block">
    Select Test Suite
  </label>

  {/* Input + badges + button */}
  <div
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="flex items-center flex-wrap min-h-[46px] w-full px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer hover:border-indigo-500 transition-all"
  >
    {/* Selected badges */}
    {selectedSuites.length === 0 && (
      <span className="text-sm text-gray-400">Select test suite(s)</span>
    )}

    {selectedSuites.map((suite) => (
      <span
        key={suite.id}
        className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 text-xs rounded-full mr-2 mb-1"
        onClick={(e) => e.stopPropagation()} // prevent dropdown toggle
      >
        {suite.name}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveBadge(suite.id);
          }}
          className="ml-2 text-xs font-bold text-indigo-500 hover:text-red-500"
        >
          ×
        </button>
      </span>
    ))}

    {/* Add Button inside input, sticks to right */}
    {selectedSuites.length > 0 && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAddToPackage();
        }}
        className="ml-auto bg-[#4F46E5] text-white text-xs px-3 py-1 rounded hover:bg-[#4338CA] whitespace-nowrap"
      >
        Add to package
      </button>
    )}
  </div>

  {/* Dropdown */}
  {dropdownOpen && (
    <div className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1 bg-white border border-gray-300 rounded shadow-md">
      {availableSuites.length > 0 ? (
        availableSuites.filter(
          (suite) =>
            !selectedSuites.find((s) => s.id === suite.id) &&
            !tableData.find((t) => t.id === suite.id)
        )
        .map((suite) => (
          <div
            key={suite.id}
            onClick={() => handleAddSuite(suite)}
            className="px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer text-sm text-gray-700 transition-all"
          >
            <div className="font-medium">{suite.name}</div>
            <div className="text-xs text-gray-400">{suite.description}</div>
          </div>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">No available suites</div>
      )}
    </div>
  )}
</div>    

      {tableData.length > 0 && (
        <>
          <table className="w-full border mt-4">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="p-3">Suite ID</th>
                <th className="p-3">Test Suite Name</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((test) => (
                <tr key={test.id} className="border-b">
                  <td className="p-3">{test.id}</td>
                  <td className="p-3">{test.name}</td>
                  <td className="p-3">{test.description}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDeleteRow(test.id)}>
                      <IconButton icon={FiTrash2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {renderPagination()}

          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border rounded text-sm text-gray-700 bg-white hover:bg-gray-100"
            >
              Cancel
            </button>
            <Button
  onClick={async () => {
    try {
      const payload = {
        requestMetaData: {
          userId: localStorage.getItem("userId") || "001",
          transactionId: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
        data: tableData.map((s) => s.id),
      };

      const json = await api(`/api/v1/test-suites/associate-to-packages/${packageId}`, "POST", payload);

      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || "Test Suites associated successfully");
      } else {
        toast.error(message || "Failed to associate test suites");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error associating test suites");
    }
  }}
>
  Create
</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TestPackageAssignmentForm;
