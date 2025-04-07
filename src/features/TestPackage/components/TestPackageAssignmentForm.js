import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IconButton from "../../../components/common/IconButton";
import Button from "../../../components/common/Button";

const allMockTestSuites = Array.from({ length: 50 }, (_, i) => ({
  id: `TS-${(i + 1).toString().padStart(3, "0")}`,
  name: `Test Suite ${i + 1}`,
  description: `This is the description for test Suite ${i + 1}.`,
}));

const ITEMS_PER_PAGE = 6;

const TestPackageAssignmentForm = ({
  testSuites,
  onAddToPackage,
  packageCreated,
  prefilledSuites = [],
}) => {
  const [selectedSuites, setSelectedSuites] = useState([]);
  const [availableSuites, setAvailableSuites] = useState(allMockTestSuites);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (prefilledSuites.length > 0) {
      const initial = prefilledSuites.map((name, i) => ({
        id: Date.now() + i,
        name,
        description: `This is the description for ${name}`,
      }));
      setTableData(initial);
    }
  }, [prefilledSuites]);

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selected = availableSuites.find((item) => item.name === selectedId);
    if (selected) {
      setSelectedSuites([...selectedSuites, selected]);
      setAvailableSuites(
        availableSuites.filter((item) => item.id !== selected.id),
      );
    }
  };

  const handleRemoveBadge = (id) => {
    const toRemove = selectedSuites.find((item) => item.id === id);
    setAvailableSuites([...availableSuites, toRemove]);
    setSelectedSuites(selectedSuites.filter((item) => item.id !== id));
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
      <label className="text-sm font-medium text-gray-600 mb-1 block">
        Select test Suite
      </label>
      <div className="flex items-center mb-4 space-x-2">
        <div className="flex flex-wrap gap-2 flex-1 border px-2 py-2 rounded">
          {selectedSuites.map((test) => (
            <span
              key={test.id}
              className="bg-blue-100 text-blue-600 px-2 py-1 text-sm rounded-full flex items-center space-x-1"
            >
              <span>{test.name}</span>
              <button
                onClick={() => handleRemoveBadge(test.id)}
                className="text-xs font-bold px-1"
              >
                ×
              </button>
            </span>
          ))}
          <select
            onChange={handleSelectChange}
            className="outline-none flex-1 bg-transparent"
          >
            <option value=""></option>
            {availableSuites.map((test) => (
              <option key={test.id} value={test.name}>
                {test.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
          onClick={handleAddToPackage}
          disabled={selectedSuites.length === 0}
        >
          Add to package
        </button>
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
            <Button onClick={() => toast.success("Test Suites associated")}>
              Create
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TestPackageAssignmentForm;
