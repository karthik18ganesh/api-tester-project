import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiSave, FiCopy, FiChevronDown, FiChevronUp, FiCode, FiClipboard } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRepository } from "../../../utils/api";

// Breadcrumb component (simplified for the example)
const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4 mt-2">
      <a href="/dashboard" className="flex items-center hover:text-[#4F46E5]">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </a>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <svg className="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {item.path ? (
            <a href={item.path} className="hover:text-[#4F46E5]">
              {item.label}
            </a>
          ) : (
            <span className="text-[#4F46E5] font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Helper component to highlight parameters in text
const ParameterizedText = ({ text }) => {
  if (!text) return null;
  
  // Match ${paramName} pattern
  const parts = text.split(/(\\$\{[^}]+\})/g);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part.match(/^\$\{[^}]+\}$/)) {
          return (
            <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded">
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

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

// Main component for API Repository Details
const APIRepositoryDetails = () => {
  const responseRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const apiId = location.state?.apiId;
  const [isLoading, setIsLoading] = useState(apiId ? true : false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Parameters state
  const [detectedParams, setDetectedParams] = useState([]);
  
  // Request configuration state
  const [requestConfig, setRequestConfig] = useState({
    id: null,
    requestId: null,
    method: "GET",
    url: "",
    name: "",
    environment: "",
    description: "",
    headers: [{ key: "", value: "", enabled: true }],
    auth: {
      type: "No Auth",
      bearerToken: "",
      username: "",
      password: "",
    },
    body: {
      type: "none",
      contentType: "application/json",
      raw: "",
      formData: [{ key: "", value: "", type: "text", enabled: true }],
      urlEncoded: [{ key: "", value: "", enabled: true }],
    },
    params: [{ key: "", value: "", enabled: true }],
  });

  // Response state
  const [responseData, setResponseData] = useState({
    isLoading: false,
    status: null,
    statusText: "",
    time: null,
    size: null,
    contentType: "",
    data: null,
    headers: {},
    error: null,
  });

  // UI state
  const [activeTab, setActiveTab] = useState("Params");
  const [jsonError, setJsonError] = useState(null);
  const [envOptions, setEnvOptions] = useState([
    { id: "env_development", name: "Development" },
    { id: "env_staging", name: "Staging" },
    { id: "env_production", name: "Production" },
  ]);

  // Function to update detected parameters
  const updateDetectedParams = (config) => {
    const urlParams = extractParameters(config.url);
    
    const headerParams = config.headers
      .filter(h => h.key || h.value)
      .flatMap(h => [
        ...extractParameters(h.key),
        ...extractParameters(h.value)
      ]);
    
    const queryParams = config.params
      .filter(p => p.key || p.value)
      .flatMap(p => [
        ...extractParameters(p.key),
        ...extractParameters(p.value)
      ]);
    
    const bodyParams = extractParameters(config.body.raw);
    
    const allParams = [...new Set([
      ...urlParams,
      ...headerParams,
      ...queryParams,
      ...bodyParams
    ])];
    
    setDetectedParams(allParams);
  };

  // Fetch API details if editing an existing one
  useEffect(() => {
    if (apiId && !initialDataLoaded) {
      const fetchApiDetails = async () => {
        try {
          setIsLoading(true);
          const response = await apiRepository.getById(apiId);
          
          if (response && response.result && response.result.data) {
            const apiData = response.result.data;
            
            // Transform API response to component state format
            const headers = Object.entries(apiData.request.headers || {}).map(([key, value]) => ({
              key, value, enabled: true
            }));
            if (headers.length === 0) headers.push({ key: "", value: "", enabled: true });
            
            const queryParams = Object.entries(apiData.request.queryParams || {}).map(([key, value]) => ({
              key, value, enabled: true
            }));
            if (queryParams.length === 0) queryParams.push({ key: "", value: "", enabled: true });
            
            // Setup auth data
            let authConfig = { type: "No Auth", bearerToken: "", username: "", password: "" };
            if (apiData.request.auth) {
              if (apiData.request.auth.type === "BEARER") {
                authConfig = { 
                  type: "Bearer Token", 
                  bearerToken: apiData.request.auth.token || "", 
                  username: "", 
                  password: "" 
                };
              } else if (apiData.request.auth.type === "BASIC") {
                authConfig = { 
                  type: "Basic Auth", 
                  bearerToken: "", 
                  username: apiData.request.auth.username || "", 
                  password: apiData.request.auth.password || "" 
                };
              }
            }
            
            const updatedConfig = {
              id: apiData.apiId,
              requestId: apiData.request.requestId,
              method: apiData.method,
              url: apiData.url,
              name: apiData.apiRepoName,
              environment: apiData.envId,
              description: apiData.description || "",
              headers: headers,
              params: queryParams,
              auth: authConfig,
              body: {
                type: "none", // Would need logic to determine from request
                contentType: "application/json",
                raw: "",
                formData: [{ key: "", value: "", type: "text", enabled: true }],
                urlEncoded: [{ key: "", value: "", enabled: true }],
              }
            };
            
            setRequestConfig(updatedConfig);
            updateDetectedParams(updatedConfig);
            
            setInitialDataLoaded(true);
            toast.success("API details loaded");
          } else {
            throw new Error("Invalid API response format");
          }
        } catch (error) {
          console.error("Error fetching API details:", error);
          toast.error("Failed to load API details: " + (error.message || "Unknown error"));
          // Navigate back to list on error
          navigate("/test-design/api-repository");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchApiDetails();
    }
  }, [apiId, navigate, initialDataLoaded]);

  // Method to handle sending the API request
  const handleSend = async () => {
    setResponseData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Execute API using the API repository service
      const apiToExecute = {
        id: requestConfig.id,
        name: requestConfig.name,
        environment: requestConfig.environment,
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        params: requestConfig.params,
        auth: requestConfig.auth
      };
      
      const startTime = Date.now();
      const response = await apiRepository.execute(apiToExecute);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Get response size and content type
      const responseString = typeof response === 'string' 
        ? response 
        : JSON.stringify(response);
      const responseSize = responseString.length;
      
      // Update response state
      setResponseData({
        isLoading: false,
        status: 200, // API returns HTTP status in response
        statusText: "OK",
        time: duration,
        size: responseSize,
        contentType: "application/json",
        data: response,
        headers: {}, // Headers are not returned in the executeAPI response
        error: null,
      });
      
      // Scroll to response section
      if (responseRef.current) {
        responseRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Request error:", error);
      
      setResponseData({
        isLoading: false,
        status: error.status || 500,
        statusText: error.statusText || "Error",
        time: null,
        size: null,
        contentType: "",
        data: null,
        headers: {},
        error: error.message || "Failed to send request",
      });
    }
  };

  // Method to handle saving the API
  const handleSave = async () => {
    if (!requestConfig.name || !requestConfig.url) {
      toast.warning("API name and URL are required");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare request data for API
      const headersObj = {};
      requestConfig.headers
        .filter(h => h.enabled && h.key)
        .forEach(h => {
          headersObj[h.key] = h.value;
        });
      
      const paramsObj = {};
      requestConfig.params
        .filter(p => p.enabled && p.key)
        .forEach(p => {
          paramsObj[p.key] = p.value;
        });
      
      // Build request payload in format expected by backend
      const payload = {
        requestMetaData: {
          userId: "3", // Should come from auth context
          transactionId: `tx-${Date.now()}`,
          timestamp: new Date().toISOString()
        },
        data: {
          apiRepoName: requestConfig.name,
          envId: requestConfig.environment,
          method: requestConfig.method,
          url: requestConfig.url,
          description: requestConfig.description,
          request: {
            headers: headersObj,
            queryParams: paramsObj,
            pathParams: {}
          }
        }
      };
      
      // Add ID for update operations
      if (requestConfig.id) {
        payload.data.apiId = requestConfig.id;
        
        if (requestConfig.requestId) {
          payload.data.request.requestId = requestConfig.requestId;
        }
      }
      
      let response;
      if (requestConfig.id) {
        // Update existing API - pass the properly formatted payload directly
        response = await apiRepository.update(payload);
        toast.success("API updated successfully");
      } else {
        // Create new API - use the same payload format for consistency
        response = await apiRepository.update(payload); // Using update here because it accepts our payload format
        toast.success("API created successfully");
      }
      
      if (response && response.result && response.result.data) {
        // Navigate back to the API Repository list
        navigate("/test-design/api-repository");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save API: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Method to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedConfig = {
      ...requestConfig,
      [name]: value,
    };
    
    setRequestConfig(updatedConfig);
    
    // Update parameters when URL changes
    if (name === 'url') {
      updateDetectedParams(updatedConfig);
    }
  };

  // Add a new row to an array (headers, params, etc.)
  const handleAddRow = (field) => {
    if (field === "headers") {
      setRequestConfig(prev => ({
        ...prev,
        headers: [...prev.headers, { key: "", value: "", enabled: true }],
      }));
    } else if (field === "params") {
      setRequestConfig(prev => ({
        ...prev,
        params: [...prev.params, { key: "", value: "", enabled: true }],
      }));
    } else if (field === "formData") {
      setRequestConfig(prev => ({
        ...prev,
        body: {
          ...prev.body,
          formData: [...prev.body.formData, { key: "", value: "", type: "text", enabled: true }],
        },
      }));
    } else if (field === "urlEncoded") {
      setRequestConfig(prev => ({
        ...prev,
        body: {
          ...prev.body,
          urlEncoded: [...prev.body.urlEncoded, { key: "", value: "", enabled: true }],
        },
      }));
    }
  };

  // Remove a row from an array
  const handleRemoveRow = (field, index) => {
    if (field === "headers") {
      setRequestConfig(prev => ({
        ...prev,
        headers: prev.headers.filter((_, i) => i !== index),
      }));
    } else if (field === "params") {
      setRequestConfig(prev => ({
        ...prev,
        params: prev.params.filter((_, i) => i !== index),
      }));
    } else if (field === "formData") {
      setRequestConfig(prev => ({
        ...prev,
        body: {
          ...prev.body,
          formData: prev.body.formData.filter((_, i) => i !== index),
        },
      }));
    } else if (field === "urlEncoded") {
      setRequestConfig(prev => ({
        ...prev,
        body: {
          ...prev.body,
          urlEncoded: prev.body.urlEncoded.filter((_, i) => i !== index),
        },
      }));
    }
  };

  // Handle changes to rows (headers, params, etc.)
  const handleRowChange = (field, index, key, value) => {
    let updatedItems;
    
    if (field === 'headers') {
      updatedItems = [...requestConfig.headers];
      updatedItems[index] = { ...updatedItems[index], [key]: value };
    } else if (field === 'params') {
      updatedItems = [...requestConfig.params];
      updatedItems[index] = { ...updatedItems[index], [key]: value };
    } else if (field === 'formData') {
      updatedItems = [...requestConfig.body.formData];
      updatedItems[index] = { ...updatedItems[index], [key]: value };
    } else if (field === 'urlEncoded') {
      updatedItems = [...requestConfig.body.urlEncoded];
      updatedItems[index] = { ...updatedItems[index], [key]: value };
    }
    
    let updatedConfig;
    
    if (field === 'headers' || field === 'params') {
      updatedConfig = {
        ...requestConfig,
        [field]: updatedItems
      };
    } else {
      updatedConfig = {
        ...requestConfig,
        body: {
          ...requestConfig.body,
          [field]: updatedItems
        }
      };
    }
    
    setRequestConfig(updatedConfig);
    updateDetectedParams(updatedConfig);
  };

  // Toggle enabled state for a row
  const handleToggleEnabled = (field, index) => {
    if (field === "headers") {
      setRequestConfig(prev => {
        const newHeaders = [...prev.headers];
        newHeaders[index] = { 
          ...newHeaders[index], 
          enabled: !newHeaders[index].enabled 
        };
        return { ...prev, headers: newHeaders };
      });
    } else if (field === "params") {
      setRequestConfig(prev => {
        const newParams = [...prev.params];
        newParams[index] = { 
          ...newParams[index], 
          enabled: !newParams[index].enabled 
        };
        return { ...prev, params: newParams };
      });
    } else if (field === "formData") {
      setRequestConfig(prev => {
        const newFormData = [...prev.body.formData];
        newFormData[index] = { 
          ...newFormData[index], 
          enabled: !newFormData[index].enabled 
        };
        return { 
          ...prev, 
          body: { ...prev.body, formData: newFormData } 
        };
      });
    } else if (field === "urlEncoded") {
      setRequestConfig(prev => {
        const newUrlEncoded = [...prev.body.urlEncoded];
        newUrlEncoded[index] = { 
          ...newUrlEncoded[index], 
          enabled: !newUrlEncoded[index].enabled 
        };
        return { 
          ...prev, 
          body: { ...prev.body, urlEncoded: newUrlEncoded } 
        };
      });
    }
  };

  // Handle auth type change
  const handleAuthTypeChange = (type) => {
    setRequestConfig(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        type,
      },
    }));
  };

  // Handle auth field change
  const handleAuthFieldChange = (field, value) => {
    setRequestConfig(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        [field]: value,
      },
    }));
  };

  // Handle body type change
  const handleBodyTypeChange = (type) => {
    setRequestConfig(prev => ({
      ...prev,
      body: {
        ...prev.body,
        type,
      },
    }));
  };

  // Handle body content type change
  const handleBodyContentTypeChange = (contentType) => {
    setRequestConfig(prev => ({
      ...prev,
      body: {
        ...prev.body,
        contentType,
      },
    }));
  };

  // Handle raw body change
  const handleRawBodyChange = (value) => {
    try {
      // Attempt to parse as JSON to validate
      if (requestConfig.body.contentType === 'application/json') {
        JSON.parse(value);
        setJsonError(null);
      }
    } catch (err) {
      setJsonError(err.message);
    }
    
    const updatedConfig = {
      ...requestConfig,
      body: {
        ...requestConfig.body,
        raw: value
      }
    };
    
    setRequestConfig(updatedConfig);
    updateDetectedParams(updatedConfig);
  };

  // Helper to get status badge color
  const getStatusBadgeColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800";
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-800";
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Format JSON for display
  const formatJsonResponse = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };

  // Copy response to clipboard
  const copyResponseToClipboard = () => {
    const textToCopy = typeof responseData.data === 'object' 
      ? JSON.stringify(responseData.data, null, 2) 
      : String(responseData.data);
    
    navigator.clipboard.writeText(textToCopy);
  };

  // Parameters Summary Component
  const ParametersSummary = () => {
    if (detectedParams.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic p-3 border-t">
          No parameters detected. Use {"$"}{"{paramName}"} syntax in URL, headers, params or body to create parameters.
        </div>
      );
    }
    
    return (
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold mb-2 px-3">Detected Parameters</h3>
        <div className="px-3 pb-3 flex flex-wrap gap-2">
          {detectedParams.map(param => (
            <span 
              key={param} 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {"$"}{"{" + param + "}"}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Render URL input with parameter highlighting
  const renderUrlInput = () => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
          <input
            type="text"
            name="url"
            className="flex-1 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={requestConfig.url}
            onChange={handleInputChange}
            placeholder="https://api.example.com/v1/resource/$\{resourceId\}"
          />
        </div>
        {requestConfig.url && requestConfig.url.includes("${") && (
          <div className="mt-1 text-xs">
            <span className="font-medium">With parameters: </span>
            <ParameterizedText text={requestConfig.url} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "API Repository", path: "/test-design/api-repository" },
          { label: requestConfig.id ? "Edit" : "Create" }
        ]}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading API details...</span>
        </div>
      ) : (
        <>
          {/* URL Bar */}
          <div className="bg-white border rounded-md shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {requestConfig.id ? "Edit API Request" : "New API Request"}
              </h2>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md flex items-center gap-1 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4">
              {/* API Name, Environment, Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Name</label>
                  <input
                    type="text"
                    name="name"
                    value={requestConfig.name}
                    onChange={handleInputChange}
                    placeholder="Enter API name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    name="environment"
                    value={requestConfig.environment}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select Environment</option>
                    {envOptions.map(env => (
                      <option key={env.id} value={env.id}>{env.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={requestConfig.description}
                    onChange={handleInputChange}
                    placeholder="API description (optional)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              {/* Method + URL + Send Button */}
              <div className="grid grid-cols-12 gap-4 mb-4 items-start">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={requestConfig.method}
                    onChange={e => setRequestConfig(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                    <option>OPTIONS</option>
                    <option>HEAD</option>
                  </select>
                </div>
                
                <div className="col-span-8">
                  {renderUrlInput()}
                </div>
                
                <div className="col-span-2 flex flex-col justify-end">
                  <label className="block text-sm font-medium text-gray-700 mb-1 invisible">Send</label>
                  <button
                    onClick={handleSend}
                    disabled={responseData.isLoading || !requestConfig.url}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 w-full"
                  >
                    {responseData.isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FiSend />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Request Configuration */}
          <div className="bg-white border rounded-md shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              {["Params", "Headers", "Authorization", "Body"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 focus:outline-none ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              {/* Params Tab */}
              {activeTab === "Params" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Query Parameters</h3>
                    <button
                      onClick={() => handleAddRow("params")}
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    >
                      <FaPlus className="mr-1" size={10} />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-3 py-2"></th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Key</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Value</th>
                          <th className="w-20 px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requestConfig.params.map((param, index) => (
                          <tr key={index} className={!param.enabled ? "bg-gray-50 text-gray-400" : ""}>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={param.enabled}
                                onChange={() => handleToggleEnabled("params", index)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={param.key}
                                onChange={e => handleRowChange("params", index, "key", e.target.value)}
                                placeholder="Parameter name"
                                className={`w-full border-0 p-0 focus:ring-0 ${!param.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!param.enabled}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={param.value}
                                onChange={e => handleRowChange("params", index, "value", e.target.value)}
                                placeholder="Parameter value or $\{paramName\}"
                                className={`w-full border-0 p-0 focus:ring-0 ${!param.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!param.enabled}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => handleRemoveRow("params", index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <FaMinus size={10} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Headers Tab */}
              {activeTab === "Headers" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Headers</h3>
                    <button
                      onClick={() => handleAddRow("headers")}
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    >
                      <FaPlus className="mr-1" size={10} />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-3 py-2"></th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Key</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Value</th>
                          <th className="w-20 px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requestConfig.headers.map((header, index) => (
                          <tr key={index} className={!header.enabled ? "bg-gray-50 text-gray-400" : ""}>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={header.enabled}
                                onChange={() => handleToggleEnabled("headers", index)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={header.key}
                                onChange={e => handleRowChange("headers", index, "key", e.target.value)}
                                placeholder="Header name"
                                className={`w-full border-0 p-0 focus:ring-0 ${!header.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!header.enabled}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={header.value}
                                onChange={e => handleRowChange("headers", index, "value", e.target.value)}
                                placeholder="Header value or $\{paramName\}"
                                className={`w-full border-0 p-0 focus:ring-0 ${!header.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!header.enabled}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => handleRemoveRow("headers", index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <FaMinus size={10} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Authorization Tab */}
              {activeTab === "Authorization" && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={requestConfig.auth.type}
                      onChange={e => handleAuthTypeChange(e.target.value)}
                      className="w-full sm:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option>No Auth</option>
                      <option>Bearer Token</option>
                      <option>Basic Auth</option>
                      <option>API Key</option>
                    </select>
                  </div>
                  
                  {requestConfig.auth.type === "Bearer Token" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                      <input
                        type="text"
                        value={requestConfig.auth.bearerToken}
                        onChange={e => handleAuthFieldChange("bearerToken", e.target.value)}
                        placeholder="Your bearer token or $\{paramName\}"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The token will be added as: Authorization: Bearer &lt;token&gt;
                      </p>
                    </div>
                  )}
                  
                  {requestConfig.auth.type === "Basic Auth" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={requestConfig.auth.username}
                          onChange={e => handleAuthFieldChange("username", e.target.value)}
                          placeholder="Username or $\{paramName\}"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={requestConfig.auth.password}
                          onChange={e => handleAuthFieldChange("password", e.target.value)}
                          placeholder="Password or $\{paramName\}"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  {requestConfig.auth.type === "API Key" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                        <input
                          type="text"
                          value={requestConfig.auth.apiKeyName}
                          onChange={e => handleAuthFieldChange("apiKeyName", e.target.value)}
                          placeholder="API key name"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                        <input
                          type="text"
                          value={requestConfig.auth.apiKeyValue}
                          onChange={e => handleAuthFieldChange("apiKeyValue", e.target.value)}
                          placeholder="API key value or $\{paramName\}"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add to</label>
                        <select
                          value={requestConfig.auth.apiKeyAddTo}
                          onChange={e => handleAuthFieldChange("apiKeyAddTo", e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option>Header</option>
                          <option>Query Params</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {requestConfig.auth.type === "No Auth" && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        No authentication will be added to the request.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Body Tab */}
              {activeTab === "Body" && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
                    <div className="flex flex-wrap gap-3">
                      {["none", "raw", "form-data", "x-www-form-urlencoded"].map(type => (
                        <label key={type} className="inline-flex items-center">
                          <input
                            type="radio"
                            name="bodyType"
                            value={type}
                            checked={requestConfig.body.type === type}
                            onChange={() => handleBodyTypeChange(type)}
                            className="h-4 w-4 text-indigo-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {type === "none" ? "None" : 
                             type === "raw" ? "Raw" : 
                             type === "form-data" ? "Form Data" : 
                             "URL Encoded"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {requestConfig.body.type === "raw" && (
                    <div>
                      <div className="mb-2 flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Content Type</label>
                        <select
                          value={requestConfig.body.contentType}
                          onChange={e => handleBodyContentTypeChange(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value="application/json">JSON</option>
                          <option value="application/xml">XML</option>
                          <option value="text/plain">Text</option>
                          <option value="text/html">HTML</option>
                        </select>
                      </div>
                      
                      <div className="border rounded-md">
                        <textarea
                          value={requestConfig.body.raw}
                          onChange={e => handleRawBodyChange(e.target.value)}
                          rows={10}
                          className={`w-full p-3 font-mono text-sm ${jsonError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                          placeholder={requestConfig.body.contentType === "application/json" ? 
                            '{\n  "key": "value",\n  "parameterized": "$\\{paramName\\}"\n}' : 
                            "Enter request body"}
                        ></textarea>
                      </div>
                      
                      {jsonError && (
                        <p className="mt-1 text-sm text-red-600">
                          Invalid JSON: {jsonError}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {requestConfig.body.type === "form-data" && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Form Data</h3>
                        <button
                          onClick={() => handleAddRow("formData")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                        >
                          <FaPlus className="mr-1" size={10} />
                          <span>Add</span>
                        </button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-12 px-3 py-2"></th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Key</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Value</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2 w-24">Type</th>
                              <th className="w-20 px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {requestConfig.body.formData.map((item, index) => (
                              <tr key={index} className={!item.enabled ? "bg-gray-50 text-gray-400" : ""}>
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={() => handleToggleEnabled("formData", index)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={item.key}
                                    onChange={e => handleRowChange("formData", index, "key", e.target.value)}
                                    placeholder="Key"
                                    className={`w-full border-0 p-0 focus:ring-0 ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                    disabled={!item.enabled}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type={item.type === "file" ? "text" : "text"}
                                    value={item.value}
                                    onChange={e => handleRowChange("formData", index, "value", e.target.value)}
                                    placeholder={item.type === "file" ? "File path" : "Value or $\\{paramName\\}"}
                                    className={`w-full border-0 p-0 focus:ring-0 ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                    disabled={!item.enabled}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    value={item.type}
                                    onChange={e => handleRowChange("formData", index, "type", e.target.value)}
                                    className={`border-0 p-0 ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                    disabled={!item.enabled}
                                  >
                                    <option value="text">Text</option>
                                    <option value="file">File</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    onClick={() => handleRemoveRow("formData", index)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <FaMinus size={10} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {requestConfig.body.type === "x-www-form-urlencoded" && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">URL Encoded Form</h3>
                        <button
                          onClick={() => handleAddRow("urlEncoded")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                        >
                          <FaPlus className="mr-1" size={10} />
                          <span>Add</span>
                        </button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-12 px-3 py-2"></th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Key</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Value</th>
                              <th className="w-20 px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {requestConfig.body.urlEncoded.map((item, index) => (
                              <tr key={index} className={!item.enabled ? "bg-gray-50 text-gray-400" : ""}>
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={() => handleToggleEnabled("urlEncoded", index)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={item.key}
                                    onChange={e => handleRowChange("urlEncoded", index, "key", e.target.value)}
                                    placeholder="Key"
                                    className={`w-full border-0 p-0 focus:ring-0 ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                    disabled={!item.enabled}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={item.value}
                                    onChange={e => handleRowChange("urlEncoded", index, "value", e.target.value)}
                                    placeholder="Value or $\\{paramName\\}"
                                    className={`w-full border-0 p-0 focus:ring-0 ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                    disabled={!item.enabled}
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    onClick={() => handleRemoveRow("urlEncoded", index)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <FaMinus size={10} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {requestConfig.body.type === "none" && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        No body will be sent with this request.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Parameters info and help text */}
              {detectedParams.length > 0 ? (
                <div className="mt-6 bg-gray-50 p-3 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tip:</span> You can use <code className="bg-gray-100 px-1 py-0.5 rounded">{"$"}{"{paramName}"}</code> syntax in any field to create parameterized values.
                    These parameters will be detected and can be filled with actual values when creating Test Cases.
                  </p>
                </div>
              ) : (
                <div className="mt-6 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Tip:</span> Use <code className="bg-blue-100 px-1 py-0.5 rounded">{"$"}{"{paramName}"}</code> syntax in URL, headers, or body to create parameterized APIs.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Response Section */}
          <div 
            ref={responseRef}
            className="bg-white border rounded-md shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b p-4 bg-gray-50">
              <h3 className="font-medium text-gray-700">Response</h3>
              
              {responseData.status && (
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(responseData.status)}`}>
                    Status: {responseData.status} {responseData.statusText}
                  </span>
                  
                  {responseData.time && (
                    <span className="text-xs text-gray-500">
                      Time: {responseData.time}ms
                    </span>
                  )}
                  
                  {responseData.size && (
                    <span className="text-xs text-gray-500">
                      Size: {typeof responseData.size === 'number' ? `${(responseData.size / 1024).toFixed(2)} KB` : responseData.size}
                    </span>
                  )}
                  
                  <button
                    onClick={copyResponseToClipboard}
                    className="text-gray-500 hover:text-indigo-600"
                    title="Copy response"
                    disabled={!responseData.data}
                  >
                    <FiClipboard />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              {responseData.isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : responseData.error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  <h4 className="font-medium mb-2">Error</h4>
                  <p>{responseData.error}</p>
                </div>
              ) : responseData.data ? (
                <div>
                  {/* Tabs for Response, Headers, etc. */}
                  <div className="border-b mb-4">
                    <div className="flex">
                      <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 text-sm font-medium">
                        Response
                      </button>
                      <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-medium">
                        Headers
                      </button>
                    </div>
                  </div>
                  
                  {/* Response Body */}
                  <div className="overflow-auto max-h-96">
                    <pre className="bg-gray-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {formatJsonResponse(responseData.data)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiSend className="inline-block mb-2 h-8 w-8" />
                  <p>Submit a request to see the response</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Parameters Summary displayed at bottom instead */}
          {detectedParams.length > 0 && (
            <ParametersSummary />
          )}
        </>
      )}
    </div>
  );
};

export default APIRepositoryDetails;