import React, { useState } from "react";
import { toast } from "react-toastify";

const TestCaseTopForm = () => {
  const [formData, setFormData] = useState({
    testCaseName: "",
    type: "",
    responseType: "",
    api: "",
    apiType: "",
    url: "",
    description: "",
  });

  const [requestTemplate, setRequestTemplate] = useState("");
  const [responseTemplate, setResponseTemplate] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = JSON.parse(event.target.result);
        const formatted = JSON.stringify(content, null, 2);
        if (type === "request") {
          setRequestTemplate(formatted);
        } else {
          setResponseTemplate(formatted);
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a valid JSON file.");
    }
  };

  const handleSubmit = () => {
    toast.success("Test Case saved successfully!");
  };

  return (
    <div className="bg-white p-6 rounded border shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Create new test case</h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test case name</label>
          <input
            type="text"
            name="testCaseName"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.testCaseName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            name="type"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Functional">Functional</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Response type</label>
          <select
            name="responseType"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.responseType}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="JSON">JSON</option>
            <option value="XML">XML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">API</label>
          <select
            name="api"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.api}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="LoginAPI">LoginAPI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">API Type</label>
          <select
            name="apiType"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.apiType}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <input
            type="text"
            name="url"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.url}
            onChange={handleChange}
          />
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Request template</label>
          <input
            type="file"
            accept=".json"
            className="mb-2"
            onChange={(e) => handleFileUpload(e, "request")}
          />
          <button className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]">
            Upload
          </button>
          {requestTemplate && (
            <pre className="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-auto text-sm">
              {requestTemplate}
            </pre>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Response template</label>
          <input
            type="file"
            accept=".json"
            className="mb-2"
            onChange={(e) => handleFileUpload(e, "response")}
          />
          <button className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]">
            Upload
          </button>
          {responseTemplate && (
            <pre className="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-auto text-sm">
              {responseTemplate}
            </pre>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 space-x-2">
        <button className="px-4 py-2 border text-sm rounded">Cancel</button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default TestCaseTopForm;
