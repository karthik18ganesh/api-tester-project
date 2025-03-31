import React, { useState } from "react";
import { FaHome, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const mockData = [
  {
    id: 1,
    name: "Staging Server",
    url: "staging.example.com",
    description: "Pre-release testing server",
    date: "29-03-2025",
  },
  {
    id: 2,
    name: "Production",
    url: "prod.example.com",
    description: "Live production environment",
    date: "31-12-2025",
  },
  {
    id: 3,
    name: "QA Environment",
    url: "qa.example.com",
    description: "Internal testing for bug fixes",
    date: "01-01-2026",
  },
  {
    id: 4,
    name: "Development",
    url: "localhost.example.com",
    description: "Local development setup",
    date: "31-12-2025",
  },
];

const EnvironmentSetup = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(mockData);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    url: "",
    description: "",
  });

  const isUpdateMode = formData.id !== null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdateMode) {
      setData((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...formData, date: item.date } : item
        )
      );
    } else {
      setData([
        ...data,
        {
          ...formData,
          id: data.length + 1,
          date: new Date().toLocaleDateString("en-GB"),
        },
      ]);
    }
    setFormData({ id: null, name: "", url: "", description: "" });
  };

  const handleEdit = (item) => {
    setFormData(item);
  };

  return (
    <div className="p-6 text-gray-800 font-inter">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <FaHome
          className="cursor-pointer text-gray-600"
          onClick={() => navigate("/dashboard")}
        />
        <span>/</span>
        <span className="text-gray-700 font-medium">Environment setup</span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-4">Environment setup</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-md mb-6 shadow-sm">
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
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>

        <button
          type="submit"
          className="bg-[#4F46E5] text-white px-6 py-2 rounded font-medium hover:bg-indigo-700"
        >
          {isUpdateMode ? "Update" : "Create"}
        </button>
      </form>

      {/* Table */}
      <div>
        <h3 className="text-md font-semibold mb-3">Environment details</h3>
        <div className="overflow-auto">
          <table className="min-w-full bg-white border rounded shadow-sm">
            <thead>
              <tr className="text-left bg-gray-50 text-sm text-gray-600 border-b">
                <th className="py-3 px-4">Environment name</th>
                <th className="py-3 px-4">Environment URL</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((env) => (
                <tr key={env.id} className="border-b text-sm">
                  <td className="py-3 px-4">{env.name}</td>
                  <td className="py-3 px-4 text-blue-600 underline cursor-pointer">
                    {env.url}
                  </td>
                  <td className="py-3 px-4">{env.description}</td>
                  <td className="py-3 px-4">{env.date}</td>
                  <td className="py-3 px-4 flex items-center gap-3 text-gray-600">
                    <FaEdit
                      className="cursor-pointer hover:text-blue-500"
                      onClick={() => handleEdit(env)}
                    />
                    <FaTrash className="text-gray-400 cursor-not-allowed" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentSetup;
