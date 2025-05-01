
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import IconButton from "../../../components/common/IconButton";
import Button from "../../../components/common/Button";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { api } from "../../../utils/api";
const pageSize = 5;

const ProjectSetup = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    projectId: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const isUpdateMode = formData.id !== null;
  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const fetchProjects = async () => {
    try {
      const json = await api("/api/v1/projects?pageNo=0&limit=100&sortBy=createdDate&sortDir=DESC", "GET");
      const { code, data: responseData, message } = json.result;

      if (code === "200") {
        const formatted = responseData.content.map((p) => ({
          id: p.id,
          name: p.projectName,
          projectId: p.projectId,
          description: p.description,
          date: p.createdDate,
        }));
        setData(formatted);
      } else {
        toast.error(message || "Failed to fetch projects");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching projects");
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
        id: formData.id,
        projectId: formData.projectId,
        projectName: formData.name,
        description: formData.description,
      },
    };

    const method = isUpdateMode ? "PUT" : "POST";

    try {
      const json = await api("/api/v1/projects", method, payload);

      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || (isUpdateMode ? "Updated" : "Created"));
        fetchProjects();
        setFormData({ id: null, name: "", projectId: "", description: "" });
      } else {
        toast.error(message || "Failed to process project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error during submission");
    }
  };

  const handleEdit = (item) => setFormData(item);

  const handleDelete = async () => {
    try {
      const json = await api(`/api/v1/projects/${selectedProject.id}`, "DELETE");
      const { code, message } = json.result;

      if (code === "200") {
        toast.success(message || "Project deleted");
        fetchProjects();
      } else {
        toast.error(message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting project");
    }

    setShowModal(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 font-inter text-gray-800">
      <Breadcrumb items={[{ label: "Admin Settings" }, { label: "Project Setup" }]} />
      <div className="border-b border-gray-200 mb-6"></div>
      <h2 className="text-2xl font-semibold my-4">Project Setup</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm border mb-6">
        <h3 className="text-lg font-medium mb-4">
          {isUpdateMode ? "Update Project" : "Create New Project"}
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm block mb-1">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border p-2 rounded bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Project ID</label>
            <input
              type="text"
              value={formData.projectId}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectId: e.target.value }))}
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
              onClick={() => setFormData({ id: null, name: "", projectId: "", description: "" })}
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
              <th className="p-3">Project ID</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((project) => (
              <tr key={project.id} className="border-b">
                <td className="p-3">{project.name}</td>
                <td className="p-3">{project.projectId}</td>
                <td className="p-3">{project.description}</td>
                <td className="p-3">{project.date}</td>
                <td className="p-3 text-right">
                  <IconButton icon={FaEdit} onClick={() => handleEdit(project)} />
                  <IconButton icon={FiTrash2} onClick={() => {
                    setSelectedProject(project);
                    setShowModal(true);
                  }} />
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              Are you sure you want to delete project "{selectedProject?.name}"?
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

export default ProjectSetup;
