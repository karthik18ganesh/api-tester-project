
import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import Breadcrumb from "../../../components/common/Breadcrumb";
import IconButton from "../../../components/common/IconButton";
import Button from "../../../components/common/Button";
import { api } from "../../../utils/api";

const pageSize = 5;

const EnvironmentSetup = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    environmentName: "",
    environmentUrl: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState(null);

  const isUpdateMode = formData.id !== null;
  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const fetchEnvironments = async () => {
    try {
      const json = await api("/api/v1/environments?pageNo=0&limit=100&sortBy=createdDate&sortDir=DESC", "GET");
      const { code, message, data: responseData } = json.result;

      if (code === "200") {
        const mapped = responseData.content.map((env) => ({
          id: env.environmentId,
          environmentName: env.environmentName,
          environmentUrl: env.environmentUrl,
          description: env.description,
          date: env.createdDate,
        }));
        setData(mapped);
      } else {
        toast.error(message || "Failed to fetch environments");
      }
    } catch (err) {
      toast.error("Error fetching environments");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      requestMetaData: {
        userId: localStorage.getItem("userId"),
        transactionId: nanoid(),
        timestamp: new Date().toISOString(),
      },
      data: {
        //projectId: localStorage.getItem("activeProjectId"),
        environmentName: formData.environmentName,
        environmentUrl: formData.environmentUrl,
        description: formData.description,
      }
    };

    const method = isUpdateMode ? "PUT" : "POST";
    const url = isUpdateMode
      ? `/api/v1/environments/${formData.id}`
      : "/api/v1/environments";

    try {
      const json = await api(url, method, payload);
      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || (isUpdateMode ? "Updated" : "Created"));
        fetchEnvironments();
        setFormData({ id: null, environmentName: "", environmentUrl: "", description: "" });
      } else {
        toast.error(message || "Failed to process request");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (item) => setFormData(item);

  const handleDelete = async () => {
    try {
      const json = await api(`/api/v1/environments/${selectedEnv.id}`, "DELETE");
      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || "Environment deleted");
        fetchEnvironments();
      } else {
        toast.error(message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting environment");
    }
    setShowModal(false);
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  return (
    <div className="p-6 text-gray-800 font-inter">
      <Breadcrumb items={[{ label: "Admin Settings" }, { label: "Environment Setup" }]} />
      <div className="border-b border-gray-200 mb-6"></div>
      <h2 className="text-2xl font-semibold my-4">Environment Setup</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm border mb-6">
        <h3 className="text-lg font-medium mb-4">
          {isUpdateMode ? "Update Environment" : "Create New Environment"}
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm block mb-1">Environment Name</label>
            <input
              type="text"
              value={formData.environmentName}
              onChange={(e) => setFormData((prev) => ({ ...prev, environmentName: e.target.value }))}
              className="w-full border p-2 rounded bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Environment URL</label>
            <input
              type="text"
              value={formData.environmentUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, environmentUrl: e.target.value }))}
              className="w-full border p-2 rounded bg-gray-50"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm block mb-1">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full border p-2 rounded bg-gray-50"
          />
        </div>
        <div className="flex justify-end gap-3">
          {isUpdateMode && (
            <button
              type="button"
              onClick={() => setFormData({ id: null, environmentName: "", environmentUrl: "", description: "" })}
              className="px-4 py-2 border rounded text-gray-600"
            >
              Cancel
            </button>
          )}
          <Button type="submit">{isUpdateMode ? "Update" : "Create"}</Button>
        </div>
      </form>

      <div className="bg-white rounded shadow-sm border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">URL</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((env) => (
              <tr key={env.id} className="border-b">
                <td className="p-3">{env.environmentName}</td>
                <td className="p-3">{env.environmentUrl}</td>
                <td className="p-3">{env.description}</td>
                <td className="p-3">{env.date}</td>
                <td className="p-3 text-right">
                  <IconButton icon={FaEdit} onClick={() => handleEdit(env)} />
                  <IconButton icon={FiTrash2} onClick={() => {
                    setSelectedEnv(env);
                    setShowModal(true);
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              Are you sure you want to delete "{selectedEnv?.environmentName}"?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded text-gray-600"
                onClick={() => setShowModal(false)}
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
