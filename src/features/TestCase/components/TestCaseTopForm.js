import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { FiInfo } from "react-icons/fi";
import ParameterDiff from "../../../components/common/ParameterDiff";

const TestCaseTopForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.testCase; // Check if we're editing an existing test case
  
  const [loading, setLoading] = useState(false);
  const [loadingApis, setLoadingApis] = useState(false);
  
  // APIRepository state
  const [apiOptions, setApiOptions] = useState([]);
  const [selectedApiDetails, setSelectedApiDetails] = useState(null);
  
  // Parameters state
  const [parameters, setParameters] = useState([]);
  const [paramValues, setParamValues] = useState({});
  
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
  
  // Load available APIs from the API repository
  useEffect(() => {
    const fetchApis = async () => {
      setLoadingApis(true);
      try {
        const response = await api('/api/v1/apirepos', 'GET');
        if (response?.result?.data) {
          // Transform API response to options format
          const options = response.result.data.content.map(api => ({
            id: api.apiId,
            name: api.apiRepoName,
            method: api.method,
            url: api.url
          }));
          setApiOptions(options);
        }
      } catch (error) {
        console.error("Error fetching APIs:", error);
        toast.error("Failed to load APIs from repository");
        // Fallback to mock data if API call fails
        setApiOptions([
          { id: 1, name: "LoginAPI", method: "POST", url: "/api/auth/login" },
          { id: 2, name: "UserProfileAPI", method: "GET", url: "/api/users/${userId}" },
          { id: 3, name: "ProductsAPI", method: "GET", url: "/api/products" },
          { id: 4, name: "OrdersAPI", method: "POST", url: "/api/orders/${userId}" },
          { id: 5, name: "PaymentAPI", method: "POST", url: "/api/payments" }
        ]);
      } finally {
        setLoadingApis(false);
      }
    };
    
    fetchApis();
  }, []);
  
  // Helper function to extract parameters from a string
  const extractParameters = (text) => {
    if (!text) return [];
    const paramRegex = /\$\{([^}]+)\}/g;
    const params = [];
    let match;
    
    while ((match = paramRegex.exec(text)) !== null) {
      params.push(match[1]);
    }
    
    return [...new Set(params)]; // Remove duplicates
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
              
              // Load parameters from request template
              if (testCase.apiName) {
                // Find API by name and load its details
                const api = apiOptions.find(a => a.name === testCase.apiName);
                if (api) {
                  await loadApiDetails(api.id);
                }
              }
            }

            if (testCase.responseTemplate) {
              const formattedResponse = JSON.stringify(testCase.responseTemplate, null, 2);
              setResponseTemplate(formattedResponse);
              setUploadedResponseFileName("existing-response.json");
            }
            
            // Load parameter values if stored with test case
            if (testCase.parameterValues) {
              setParamValues(testCase.parameterValues);
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
        
        // Load parameter values if stored with test case
        if (testCase.parameterValues) {
          setParamValues(testCase.parameterValues);
        }
      }
    };

    fetchTestCaseDetails();
  }, [editMode, location.state, apiOptions]);

  // Load API details and extract parameters
  const loadApiDetails = async (apiId) => {
    if (!apiId) return;
    
    try {
      setLoadingApis(true);
      const response = await api(`/api/v1/apirepos/${apiId}`, 'GET');
      
      if (response?.result?.data) {
        const apiData = response.result.data;
        setSelectedApiDetails(apiData);
        
        // Extract parameters from URL, headers, body
        const urlParams = extractParameters(apiData.url);
        const headerParams = Object.entries(apiData.request?.headers || {})
          .flatMap(([k, v]) => [...extractParameters(k), ...extractParameters(v)]);
        const bodyParams = extractParameters(JSON.stringify(apiData.request?.body));
        
        // Combine all parameters
        const allParams = [...new Set([...urlParams, ...headerParams, ...bodyParams])];
        setParameters(allParams);
        
        // Initialize values for parameters not already set
        const initialValues = { ...paramValues };
        allParams.forEach(param => {
          if (!initialValues[param]) {
            initialValues[param] = '';
          }
        });
        setParamValues(initialValues);
        
        // Set URL and method from API
        setFormData(prev => ({
          ...prev,
          url: apiData.url,
          apiType: apiData.method
        }));
        
      } else {
        toast.error("Invalid API data format");
      }
    } catch (error) {
      console.error("Error loading API details:", error);
      toast.error("Failed to load API details");
    } finally {
      setLoadingApis(false);
    }
  };

  // JSON preview modal component
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

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // If API selection changes, load API details
    if (name === 'api' && value) {
      const selectedApi = apiOptions.find(api => api.name === value);
      if (selectedApi) {
        loadApiDetails(selectedApi.id);
      }
    }
  };
  
  // Handle parameter value changes
  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Handle file uploads for request/response templates
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

  // Form validation
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

  // Form submission
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
          parameterValues: paramValues // Add parameter values
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

  // Component to display parameter inputs
  const ParameterInputs = () => {
    if (parameters.length === 0) return null;
    
    return (
      <div className="mt-6 border-t pt-6">
        <h3 className="text-md font-semibold mb-3 flex items-center">
          API Parameters 
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
            {parameters.length}
          </span>
        </h3>
        
        <div className="bg-blue-50 p-2 rounded mb-4 text-sm flex items-center">
          <FiInfo className="text-blue-500 mr-2 flex-shrink-0" />
          <span>These parameters were detected in the selected API. Provide values that will be substituted during test execution.</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {parameters.map(param => (
            <div key={param} className="mb-2">
              <label className="block text-sm font-medium mb-1">
                <span className="text-blue-600">${param}</span>
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2 w-full"
                value={paramValues[param] || ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
                placeholder={`Value for ${param}`}
              />
            </div>
          ))}
        </div>
        
        {/* Show URL with parameter values */}
        <div className="mt-4 mb-2">
          <h4 className="text-sm font-medium mb-2">Preview with parameter values:</h4>
          <ParameterDiff 
            template={formData.url}
            values={paramValues}
            title="API URL"
          />
          
          {/* If there's a request body with parameters, show that too */}
          {requestTemplate && requestTemplate.includes('${') && (
            <ParameterDiff
              template={requestTemplate}
              values={paramValues}
              title="Request Body"
            />
          )}
        </div>
      </div>
    );
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
            disabled={loading || loadingApis}
          >
            <option value="">Select</option>
            {apiOptions.map((api) => (
              <option key={api.id} value={api.name}>
                {api.name} ({api.method} {api.url})
              </option>
            ))}
          </select>
          {loadingApis && <div className="text-xs text-gray-500 mt-1">Loading API details...</div>}
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
            disabled={loading || selectedApiDetails}
          >
            <option value="">Select</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          {selectedApiDetails && (
            <div className="text-xs text-gray-500 mt-1">Using method from selected API</div>
          )}
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
            disabled={loading || selectedApiDetails}
          />
          {selectedApiDetails && (
            <div className="text-xs text-gray-500 mt-1">Using URL from selected API</div>
          )}
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
      
      {/* Parameter inputs */}
      <ParameterInputs />

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

      {/* Modals */}
      {showPreview && (
        <JSONPreviewModal
          title={showPreview.type === "request" ? "Request Template" : "Response Template"}
          content={showPreview.content}
          onClose={() => setShowPreview(null)}
        />
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-4 py-2 bg-[#4F46E5] text-white rounded text-sm hover:bg-[#4338CA] 
            ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Saving..." : editMode ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default TestCaseTopForm;