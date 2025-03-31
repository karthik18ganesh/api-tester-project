import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaHome, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const pageSize = 5;

const mockData = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Environment ${i + 1}`,
  url: `env${i + 1}.example.com`,
  description: `This is environment ${i + 1}`,
  date: new Date(2025, 2, i + 1).toLocaleDateString("en-GB"),
}));

const EnvironmentSetup = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(mockData);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    url: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState(null);

  const isUpdateMode = formData.id !== null;
  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdateMode) {
      setData((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...formData, date: item.date } : item,
        ),
      );
    } else {
      setData((prev) => [
        ...prev,
        {
          ...formData,
          id: prev.length + 1,
          date: new Date().toLocaleDateString("en-GB"),
        },
      ]);
    }
    setFormData({ id: null, name: "", url: "", description: "" });
    setCurrentPage(1);
  };

  const handleEdit = (item) => setFormData(item);

  return (
    <div className="p-6 text-gray-800 font-inter">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
        <FaHome
          className="cursor-pointer text-gray-600"
          onClick={() => navigate("/dashboard")}
        />
        <span>/</span>
        <span className="text-gray-700 font-medium">Environment setup</span>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mb-6"></div>

      {/* Page Title */}
      <h2 className="text-xl font-semibold mb-4">Environment setup</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 border rounded-md mb-6 shadow-sm"
      >
        <h3 className="text-md font-semibold mb-4">
          {isUpdateMode ? "Update environment" : "Create new environment"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Environment name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border rounded px-3 py-2 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Environment URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              className="w-full border rounded px-3 py-2 bg-gray-50"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>

        {/* Button at bottom-right of form */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#4F46E5] text-white px-6 py-2 rounded font-medium hover:bg-indigo-700"
          >
            {isUpdateMode ? "Update" : "Create"}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded shadow-sm border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="py-3 px-4">Environment name</th>
              <th className="py-3 px-4">Environment URL</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((env) => (
              <tr key={env.id} className="border-b">
                <td className="py-3 px-4">{env.name}</td>
                <td className="py-3 px-4 text-blue-600 underline cursor-pointer">
                  {env.url}
                </td>
                <td className="py-3 px-4">{env.description}</td>
                <td className="py-3 px-4">{env.date}</td>
                <td className="py-3 px-4 text-right flex justify-end gap-3 pr-4">
                  <FaEdit
                    className="cursor-pointer text-gray-600 hover:text-blue-500"
                    onClick={() => handleEdit(env)}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setSelectedEnv(env);
                      setShowModal(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center px-4 py-3 text-sm text-gray-600 gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-200 animate-fade-in">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Environment
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete this environment{" "}
              <span className="font-semibold text-red-600">
                "{selectedEnv?.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setData((prev) =>
                    prev.filter((item) => item.id !== selectedEnv.id),
                  );
                  setShowModal(false);
                  toast.success(`"${selectedEnv?.name}" deleted successfully`);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSetup;
