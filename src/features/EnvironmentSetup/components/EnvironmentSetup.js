import React, { useState } from "react";
import { FaHome, FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import IconButton from "../../../components/common/IconButton";
import Button from "../../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../../../components/common/Breadcrumb";

const pageSize = 5;

const mockData = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  name: `Environment ${i + 1}`,
  url: `env${i + 1}.example.com`,
  description: `This is environment ${i + 1}`,
  date: new Date(2025, 2, (i % 28) + 1).toLocaleDateString("en-GB"),
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
      toast.success(`"${formData.name}" updated successfully`);
    } else {
      setData((prev) => [
        ...prev,
        {
          ...formData,
          id: prev.length + 1,
          date: new Date().toLocaleDateString("en-GB"),
        },
      ]);
      toast.success(`"${formData.name}" created successfully`);
    }
    setFormData({ id: null, name: "", url: "", description: "" });
    setCurrentPage(1);
  };

  const handleEdit = (item) => setFormData(item);

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== selectedEnv.id));
    setShowModal(false);
    toast.success(`"${selectedEnv?.name}" deleted successfully`);
  };

  const getPaginationRange = () => {
    const range = [];
    const dots = "...";
    const visiblePages = 2;
    const totalVisible = 3;

    range.push(1);

    if (currentPage > visiblePages + 2) {
      range.push(dots);
    }

    for (
      let i = Math.max(2, currentPage - visiblePages);
      i <= Math.min(totalPages - 1, currentPage + visiblePages);
      i++
    ) {
      range.push(i);
    }

    if (currentPage + visiblePages < totalPages - 1) {
      range.push(dots);
    }

    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="p-6 text-gray-800 font-inter">
      <Breadcrumb
        items={[{ label: "Admin Settings" }, { label: "Environment Settings" }]}
      />

      <div className="border-b border-gray-200 mb-6"></div>

      <h2 className="text-2xl font-semibold mb-4">Environment setup</h2>

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

        <div className="flex justify-end gap-3">
          {isUpdateMode && (
            <button
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              onClick={() =>
                setFormData({ id: null, name: "", url: "", description: "" })
              }
            >
              Cancel
            </button>
          )}
          <Button>{isUpdateMode ? "Update" : "Create"}</Button>
        </div>
      </form>

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
                  <IconButton icon={FaEdit} onClick={() => handleEdit(env)} />
                  <IconButton
                    icon={FiTrash2}
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

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center transition-all duration-300 animate-fadeIn">
          <div className="bg-white rounded shadow-lg w-[90%] max-w-md animate-scaleIn overflow-hidden">
            {/* Header with icon and light blue background */}
            <div className="bg-blue-50 p-4 flex items-center gap-3 border-b">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-800">
                Delete Environment:{" "}
                <span className="text-blue-700">"{selectedEnv?.name}"</span>
              </h3>
            </div>

            {/* Message Body */}
            <div className="p-5 text-sm text-gray-700">
              Are you sure you want to delete this environment? <br />
              <strong>This action is permanent and cannot be reversed.</strong>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 px-5 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <Button onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSetup;
