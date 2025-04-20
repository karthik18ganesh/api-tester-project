import React, { useEffect, useState } from "react";
import { FaTrash, FaFileExport, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
const pageSize = 5;

const TestPackage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const fetchPackages = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/packages?pageNo=0&limit=100&sortBy=createdDate&sortDir=DESC");
        const json = await res.json();
        const { code, data: resultData, message } = json.result;
  
        if (code === "200") {
          const formatted = resultData.content.map(pkg => ({
            id: pkg.testPackageID,
            packageId: pkg.testPackageID,
            name: pkg.packageName,
            count: pkg.testSuites?.length || 0,
            created: pkg.createdDate,
            executed: pkg.updatedDate,
            status: "-"
          }));
          setData(formatted);
        } else {
          toast.error(message || "Failed to fetch packages");
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Something went wrong while fetching packages");
      }
    };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const ids = currentData.map((item) => item.id);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected(
      allSelected
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])],
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

  useEffect(() => {
      fetchPackages();
    }, []);
  
    const handleDelete = async () => {
      if (selected.length === 0) {
        toast.error("Please select package(s) to delete");
        return;
      }
    
      const payload = {
        requestMetaData: {
          userId: localStorage.getItem("userId") || "302",
          transactionId: nanoid(),
          timestamp: new Date().toISOString(),
        },
        data: selected, // array of package IDs
      };
    
      try {
        const res = await fetch("http://localhost:8080/api/v1/packages/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    
        const json = await res.json();
        const { code, message } = json.result;
    
        if (code === "200") {
          toast.success(message || "Packages deleted successfully");
    
          // Remove deleted packages from UI
          setData((prev) => prev.filter((pkg) => !selected.includes(pkg.id)));
          setSelected([]);
        } else {
          toast.error(message || "Failed to delete packages");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Error deleting packages");
      }
    };
    
  return (
    <div className="p-6 font-inter text-gray-800">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Package", path: "/test-design/test-package" },
        ]}
      />

      <div className="border-b border-gray-200 mb-6"></div>

      <h2 className="text-2xl font-semibold mb-4">Test Package</h2>

      {/* Header Buttons */}
      <div className="flex justify-end items-center gap-2 mb-3">
        {selected.length === 0 ? (
          <button
            onClick={() => navigate("/test-design/test-package/create")}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded hover:bg-indigo-700"
          >
            <FaPlus className="inline mr-2" /> Create
          </button>
        ) : (
          <>
            <button
  onClick={handleDelete}
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

      {/* Table */}
      <div className="bg-white rounded shadow-sm border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={currentData.every((item) =>
                    selected.includes(item.id),
                  )}
                />
              </th>
              <th className="py-3 px-4">Package ID</th>
              <th className="py-3 px-4">Test Package Name</th>
              <th className="py-3 px-4">Test Case Count</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Executed Date</th>
              <th className="py-3 px-4">Executed Status</th>
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
                <td className="py-3 px-4">{item.packageId}</td>
                {/* <td className="py-3 px-4 text-indigo-700 underline cursor-pointer">{item.name}</td> */}
                <td
                  className="py-3 px-4 text-indigo-700 underline cursor-pointer"
                  onClick={() =>
                    navigate("/test-design/test-package/create", {
                      state: { package: { id: item.testPackageID, ...item } },
                    })
                  }
                >
                  {item.name}
                </td>
                <td className="py-3 px-4">{item.count}</td>
                <td className="py-3 px-4">{item.created}</td>
                <td className="py-3 px-4">{item.executed}</td>
                <td className="py-3 px-4">{item.status}</td>
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
      </div>
    </div>
  );
};

export default TestPackage;
