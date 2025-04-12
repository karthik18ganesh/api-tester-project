
import React from "react";

const APIFormTop = ({
  formData = {
    method: "GET",
    url: "",
    name: "",
    environment: "",
    description: "",
  },
  setFormData = () => {},
  onSubmit = () => {},
  onSend = () => {},
  isEdit = false,
  environments = [],
}) => {
  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      method: "GET",
      url: "",
      name: "",
      environment: "",
      description: "",
    });
  };

  return (
    <div className="bg-white border rounded-md p-6 shadow-sm mb-6 space-y-6">
      {/* Postman-style bar: Method + URL + Send */}
      <div className="flex items-center shadow-sm">
        <select
          name="method"
          value={formData.method}
          onChange={handleChange}
          className="rounded-l-md border border-gray-300 bg-gray-100 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        >
          {methods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="http://localhost:8080/users/login"
          className="flex-1 border-t border-b border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        />

        <button
          onClick={onSend}
          className="rounded-r-md bg-[#4F46E5] text-white text-sm px-4 py-2 hover:bg-[#4338CA]"
        >
          Send
        </button>
      </div>

      {/* Row 2 - Name, Env, Description, Save/Cancel */}
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API repository name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter API name"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign environment
          </label>
          <select
            name="environment"
            value={formData.environment}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Select</option>
            {environments.map((env) => (
              <option key={env._id || env.id} value={env._id || env.id}>
                {env.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-4 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>

        <div className="col-span-12">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the API"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default APIFormTop;
