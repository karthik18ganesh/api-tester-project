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
  const [showPreview, setShowPreview] = useState(null);
  const [uploadedRequestFileName, setUploadedRequestFileName] = useState("");
  const [uploadedResponseFileName, setUploadedResponseFileName] = useState("");

  const [requestTemplate, setRequestTemplate] = useState("");
  const [responseTemplate, setResponseTemplate] = useState("");

  const JSONPreviewModal = ({ title, content, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm whitespace-pre-wrap">
            {content}
          </pre>
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

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
          setUploadedRequestFileName(file.name);
          setRequestTemplate(formatted);
        } else {
          setUploadedResponseFileName(file.name);
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
      <h2 className="text-lg font-semibold text-gray-800">
        Create new test case
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Test case name
          </label>
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
          <label className="block text-sm font-medium mb-1">
            Response type
          </label>
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
        {/* Request Template */}
        {/* Request Template */}
        <div>
          <label className="block font-medium mb-2 text-sm">
            Request template
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              id="request-template"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "request")}
            />
            <label
              htmlFor="request-template"
              className="cursor-pointer border px-4 py-2 text-sm rounded bg-white hover:bg-gray-100"
            >
              Click to upload
            </label>
            {requestTemplate && (
              <>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {uploadedRequestFileName}
                </span>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
                  onClick={() =>
                    setShowPreview({
                      type: "request",
                      content: requestTemplate,
                    })
                  }
                >
                  Preview
                </button>
              </>
            )}
          </div>
        </div>

        {/* Response Template */}
        <div>
          <label className="block font-medium mb-2 text-sm">
            Response template
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              id="response-template"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "response")}
            />
            <label
              htmlFor="response-template"
              className="cursor-pointer border px-4 py-2 text-sm rounded bg-white hover:bg-gray-100"
            >
              Click to upload
            </label>
            {responseTemplate && (
              <>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {uploadedResponseFileName}
                </span>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA]"
                  onClick={() =>
                    setShowPreview({
                      type: "response",
                      content: responseTemplate,
                    })
                  }
                >
                  Preview
                </button>
              </>
            )}
          </div>
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
      {showPreview && (
        <JSONPreviewModal
          title={`${showPreview.type === "request" ? "Request" : "Response"} Template Preview`}
          content={showPreview.content}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  );
};

export default TestCaseTopForm;
