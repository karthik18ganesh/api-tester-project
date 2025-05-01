import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";

const TestCaseTopForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.testCase; // Check if we're editing an existing test case
  
  const [loading, setLoading] = useState(false);
  
  // Hardcoded API options
  const apiOptions = [
    { id: 1, name: "LoginAPI" },
    { id: 2, name: "UserProfileAPI" },
    { id: 3, name: "ProductsAPI" },
    { id: 4, name: "OrdersAPI" },
    { id: 5, name: "PaymentAPI" }
  ];
  
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

  // Generate metadata for API requests
  const generateMetadata = () => {
    return {
      userId: "302", // This would typically come from auth context
      transactionId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
  };

  // Fetch test case details if in edit mode
  useEffect(() => {
    const fetchTestCaseDetails = async () => {
      if (editMode && location.state.testCase.testCaseId) {
        try {
          setLoading(true);
          // Get the latest test case data from the API
          const response = await api(`/api/v1/test-cases/${location.state.testCase.testCaseId}`);
          
          if (response.result?.data) {
            const testCase = response.result.data;
            
            setFormData({
              testCaseName: testCase.name || "",
              // Keep type and responseType as lowercase
              type: testCase.type || "",
              responseType: testCase.responseType || "",
              api: testCase.apiName || "",
              apiType: testCase.apiType || "",
              url: testCase.url || "",
              description: testCase.description || "",
            });

            // Set template data if available
            if (testCase.requestTemplate) {
              const formattedRequest = JSON.stringify(testCase.requestTemplate, null, 2);
              setRequestTemplate(formattedRequest);
              setUploadedRequestFileName("existing-request.json");
            }

            if (testCase.responseTemplate) {
              const formattedResponse = JSON.stringify(testCase.responseTemplate, null, 2);
              setResponseTemplate(formattedResponse);
              setUploadedResponseFileName("existing-response.json");
            }
          }
        } catch (err) {
          console.error("Error fetching test case details:", err);
          toast.error("Failed to load test case details");
        } finally {
          setLoading(false);
        }
      } else if (editMode) {
        // If we already have test case data from location state, use it without fetching
        const testCase = location.state.testCase;
        
        setFormData({
          testCaseName: testCase.name || "",
          type: testCase.type || "",
          responseType: testCase.responseType || "",
          api: testCase.apiName || "",
          apiType: testCase.apiType || "",
          url: testCase.url || "",
          description: testCase.description || "",
        });

        // Set template data if available
        if (testCase.requestTemplate) {
          const formattedRequest = JSON.stringify(testCase.requestTemplate, null, 2);
          setRequestTemplate(formattedRequest);
          setUploadedRequestFileName("existing-request.json");
        }

        if (testCase.responseTemplate) {
          const formattedResponse = JSON.stringify(testCase.responseTemplate, null, 2);
          setResponseTemplate(formattedResponse);
          setUploadedResponseFileName("existing-response.json");
        }
      }
    };

    fetchTestCaseDetails();
  }, [editMode, location.state]);

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
        try {
          const content = JSON.parse(event.target.result);
          const formatted = JSON.stringify(content, null, 2);
          if (type === "request") {
            setUploadedRequestFileName(file.name);
            setRequestTemplate(formatted);
          } else {
            setUploadedResponseFileName(file.name);
            setResponseTemplate(formatted);
          }
        } catch (error) {
          toast.error("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a valid JSON file.");
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: 'testCaseName', label: 'Test case name' },
      { field: 'type', label: 'Type' },
      { field: 'responseType', label: 'Response type' },
      { field: 'apiType', label: 'API Type' },
      { field: 'url', label: 'URL' },
    ];
    
    const missingFields = requiredFields.filter(({ field }) => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }
    
    if (!requestTemplate) {
      toast.error("Please upload a request template");
      return false;
    }
    
    if (!responseTemplate) {
      toast.error("Please upload a response template");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      let requestTemplateObj = {};
      let responseTemplateObj = {};
      
      try {
        requestTemplateObj = JSON.parse(requestTemplate);
        responseTemplateObj = JSON.parse(responseTemplate);
      } catch (err) {
        toast.error("Invalid JSON in templates");
        setLoading(false);
        return;
      }
      
      // Base payload for both create and update
      const payload = {
        requestMetaData: generateMetadata(),
        data: {
          name: formData.testCaseName,
          // Values are already lowercase from the dropdown
          type: formData.type,
          responseType: formData.responseType,
          apiName: formData.api,
          apiType: formData.apiType,
          url: formData.url,
          description: formData.description,
          requestTemplate: requestTemplateObj,
          responseTemplate: responseTemplateObj,
          executionOrder: 1, // Default execution order
        }
      };
      
      let response;
      
      if (editMode) {
        // Add testCaseId to the payload for update
        payload.data.testCaseId = location.state.testCase.testCaseId;
        
        // Update existing test case - the endpoint doesn't include the ID in the URL
        response = await api("/api/v1/test-cases", "PUT", payload);
        toast.success("Test Case updated successfully!");
      } else {
        // Create new test case
        response = await api("/api/v1/test-cases", "POST", payload);
        toast.success("Test Case created successfully!");
      }
      
      // Navigate back to the test case list
      navigate("/test-design/test-case");
    } catch (err) {
      console.error("Error saving test case:", err);
      toast.error(err.message || "Failed to save test case");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/test-design/test-case");
  };

  return (
    <div className="bg-white p-6 rounded border shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">
        {editMode ? "Edit test case" : "Create new test case"}
      </h2>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Test case name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="testCaseName"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.testCaseName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.type}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select</option>
            <option value="functional">functional</option>
            <option value="performance">performance</option>
            <option value="security">security</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Response type <span className="text-red-500">*</span>
          </label>
          <select
            name="responseType"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.responseType}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select</option>
            <option value="json">json</option>
            <option value="xml">xml</option>
            <option value="text">text</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            API
          </label>
          <select
            name="api"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.api}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select</option>
            {apiOptions.map((api) => (
              <option key={api.id} value={api.name}>
                {api.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            API Type <span className="text-red-500">*</span>
          </label>
          <select
            name="apiType"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.apiType}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="url"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.url}
            onChange={handleChange}
            placeholder="/api/endpoint"
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Request Template */}
        <div>
          <label className="block font-medium mb-2 text-sm">
            Request template <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              id="request-template"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "request")}
              disabled={loading}
            />
            <label
              htmlFor="request-template"
              className={`cursor-pointer border px-4 py-2 text-sm rounded bg-white hover:bg-gray-100 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
                  disabled={loading}
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
            Response template <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              id="response-template"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "response")}
              disabled={loading}
            />
            <label
              htmlFor="response-template"
              className={`cursor-pointer border px-4 py-2 text-sm rounded bg-white hover:bg-gray-100 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
                  disabled={loading}
                >
                  Preview
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-6 space-x-2">
        <button 
          onClick={handleCancel}
          className="px-4 py-2 border text-sm rounded hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] flex items-center"
          disabled={loading}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {editMode ? "Update" : "Save"}
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