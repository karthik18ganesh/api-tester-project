import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiSave, FiCopy, FiChevronDown, FiChevronUp, FiCode, FiClipboard } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRepository, environments } from "../../../utils/api";

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
      apiKeyName: "",
      apiKeyValue: "",
      apiKeyAddTo: "Header",
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
  const [envOptions, setEnvOptions] = useState([]);
  const [envLoading, setEnvLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  // Common headers for auto-suggestions
  const commonHeaders = [
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Authorization',
    'Cache-Control',
    'Content-Type',
    'Content-Length',
    'User-Agent',
    'X-Requested-With',
    'X-API-Key',
    'X-Auth-Token',
    'X-Client-Version',
    'X-Forwarded-For'
  ];

  // Bulk import/export functions
  const exportHeaders = () => {
    const activeHeaders = requestConfig.headers.filter(h => h.enabled && h.key.trim());
    const headerString = activeHeaders.map(h => `${h.key}: ${h.value}`).join('\n');
    navigator.clipboard.writeText(headerString);
    toast.success(`Exported ${activeHeaders.length} headers to clipboard`);
  };

  const importHeaders = () => {
    const input = prompt('Paste headers (one per line, format: "Key: Value"):');
    if (input) {
      try {
        const lines = input.trim().split('\n');
        const newHeaders = lines.map(line => {
          const [key, ...valueParts] = line.split(':');
          return {
            key: key?.trim() || '',
            value: valueParts.join(':').trim() || '',
            enabled: true
          };
        }).filter(h => h.key); // Only include headers with keys
        
        if (newHeaders.length > 0) {
          setRequestConfig(prev => ({
            ...prev,
            headers: [...prev.headers, ...newHeaders]
          }));
          toast.success(`Imported ${newHeaders.length} headers`);
        }
      } catch (err) {
        toast.error('Invalid header format');
      }
    }
  };

  const exportParams = () => {
    const activeParams = requestConfig.params.filter(p => p.enabled && p.key.trim());
    const paramString = activeParams.map(p => `${p.key}=${p.value}`).join('\n');
    navigator.clipboard.writeText(paramString);
    toast.success(`Exported ${activeParams.length} parameters to clipboard`);
  };

  const importParams = () => {
    const input = prompt('Paste parameters (one per line, format: "key=value"):');
    if (input) {
      try {
        const lines = input.trim().split('\n');
        const newParams = lines.map(line => {
          const [key, ...valueParts] = line.split('=');
          return {
            key: key?.trim() || '',
            value: valueParts.join('=').trim() || '',
            enabled: true
          };
        }).filter(p => p.key); // Only include params with keys
        
        if (newParams.length > 0) {
          setRequestConfig(prev => ({
            ...prev,
            params: [...prev.params, ...newParams]
          }));
          toast.success(`Imported ${newParams.length} parameters`);
        }
      } catch (err) {
        toast.error('Invalid parameter format');
      }
    }
  };

  // Fetch environments
  const fetchEnvironments = async () => {
    try {
      setEnvLoading(true);
      const response = await environments.getAll();
      
      if (response && response.result && response.result.data) {
        const envData = response.result.data.content.map(env => ({
          id: env.environmentId,
          name: env.environmentName
        }));
        setEnvOptions(envData);
      } else {
        throw new Error("Invalid environments response format");
      }
    } catch (error) {
      console.error("Error fetching environments:", error);
      toast.error("Failed to load environments: " + (error.message || "Unknown error"));
      // Fallback to empty array
      setEnvOptions([]);
    } finally {
      setEnvLoading(false);
    }
  };

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
    // Fetch environments on component mount
    fetchEnvironments();
    
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
            let authConfig = { type: "No Auth", bearerToken: "", username: "", password: "", apiKeyName: "", apiKeyValue: "", apiKeyAddTo: "Header" };
            if (apiData.request.auth) {
              if (apiData.request.auth.type === "BEARER") {
                authConfig = { 
                  type: "Bearer Token", 
                  bearerToken: apiData.request.auth.token || "", 
                  username: "", 
                  password: "",
                  apiKeyName: "",
                  apiKeyValue: "",
                  apiKeyAddTo: "Header"
                };
              } else if (apiData.request.auth.type === "BASIC") {
                authConfig = { 
                  type: "Basic Auth", 
                  bearerToken: "", 
                  username: apiData.request.auth.username || "", 
                  password: apiData.request.auth.password || "",
                  apiKeyName: "",
                  apiKeyValue: "",
                  apiKeyAddTo: "Header"
                };
              } else if (apiData.request.auth.type === "API_KEY") {
                authConfig = { 
                  type: "API Key", 
                  bearerToken: "", 
                  username: "", 
                  password: "",
                  apiKeyName: apiData.request.auth.keyName || "",
                  apiKeyValue: apiData.request.auth.keyValue || "",
                  apiKeyAddTo: apiData.request.auth.addTo || "Header"
                };
              }
            }
            
            // Setup body data
            let bodyConfig = {
              type: "none",
              contentType: "application/json",
              raw: "",
              formData: [{ key: "", value: "", type: "text", enabled: true }],
              urlEncoded: [{ key: "", value: "", enabled: true }]
            };
            
            if (apiData.request.body) {
              bodyConfig.type = apiData.request.body.type || "none";
              bodyConfig.contentType = apiData.request.body.contentType || "application/json";
              
              if (apiData.request.body.type === "raw") {
                bodyConfig.raw = apiData.request.body.raw || "";
              } else if (apiData.request.body.type === "form-data" && apiData.request.body.formData) {
                const formDataArray = Object.entries(apiData.request.body.formData).map(([key, data]) => ({
                  key,
                  value: data.value || data, // Handle both {value: "x", type: "text"} and simple "x" formats
                  type: data.type || "text",
                  enabled: true
                }));
                if (formDataArray.length > 0) {
                  bodyConfig.formData = formDataArray;
                } else {
                  bodyConfig.formData = [{ key: "", value: "", type: "text", enabled: true }];
                }
              } else if (apiData.request.body.type === "x-www-form-urlencoded" && apiData.request.body.urlEncoded) {
                const urlEncodedArray = Object.entries(apiData.request.body.urlEncoded).map(([key, value]) => ({
                  key,
                  value,
                  enabled: true
                }));
                if (urlEncodedArray.length > 0) {
                  bodyConfig.urlEncoded = urlEncodedArray;
                } else {
                  bodyConfig.urlEncoded = [{ key: "", value: "", enabled: true }];
                }
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
              body: bodyConfig
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
        auth: requestConfig.auth,
        body: requestConfig.body
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
    
    if (!requestConfig.environment) {
      toast.warning("Please select an environment");
      return;
    }
    
    // Validate auth fields if auth is enabled
    if (requestConfig.auth.type === "Bearer Token" && !requestConfig.auth.bearerToken.trim()) {
      toast.warning("Bearer token is required when using Bearer Token authentication");
      return;
    }
    
    if (requestConfig.auth.type === "Basic Auth") {
      if (!requestConfig.auth.username.trim() || !requestConfig.auth.password.trim()) {
        toast.warning("Username and password are required when using Basic Auth");
        return;
      }
    }
    
    if (requestConfig.auth.type === "API Key") {
      if (!requestConfig.auth.apiKeyName.trim() || !requestConfig.auth.apiKeyValue.trim()) {
        toast.warning("API Key name and value are required when using API Key authentication");
        return;
      }
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
      
      // Prepare auth data
      let authData = undefined;
      if (requestConfig.auth.type !== "No Auth") {
        authData = {
          type: requestConfig.auth.type === "Bearer Token" ? "BEARER" : 
                requestConfig.auth.type === "Basic Auth" ? "BASIC" : 
                requestConfig.auth.type === "API Key" ? "API_KEY" : "NONE"
        };
        
        if (requestConfig.auth.type === "Bearer Token") {
          authData.token = requestConfig.auth.bearerToken || "";
        } else if (requestConfig.auth.type === "Basic Auth") {
          authData.username = requestConfig.auth.username || "";
          authData.password = requestConfig.auth.password || "";
        } else if (requestConfig.auth.type === "API Key") {
          authData.keyName = requestConfig.auth.apiKeyName || "";
          authData.keyValue = requestConfig.auth.apiKeyValue || "";
          authData.addTo = requestConfig.auth.apiKeyAddTo || "Header";
        }
      }
      
      // Prepare body data
      let bodyData = undefined;
      if (requestConfig.body.type !== "none") {
        bodyData = {
          type: requestConfig.body.type,
          contentType: requestConfig.body.contentType
        };
        
        if (requestConfig.body.type === "raw") {
          bodyData.raw = requestConfig.body.raw;
        } else if (requestConfig.body.type === "form-data") {
          bodyData.formData = {};
          requestConfig.body.formData
            .filter(item => item.enabled && item.key)
            .forEach(item => {
              bodyData.formData[item.key] = {
                value: item.value,
                type: item.type
              };
            });
        } else if (requestConfig.body.type === "x-www-form-urlencoded") {
          bodyData.urlEncoded = {};
          requestConfig.body.urlEncoded
            .filter(item => item.enabled && item.key)
            .forEach(item => {
              bodyData.urlEncoded[item.key] = item.value;
            });
        }
      }
      
      // Build request payload in format expected by backend
      const payload = {
        requestMetaData: {
          userId: "3", // Should come from auth context
          transactionId: `tx-${Date.now()}`,
          timestamp: new Date().toISOString()
        },
        data: {
          apiRepoName: requestConfig.name,
          envId: parseInt(requestConfig.environment), // Use the selected environment ID
          method: requestConfig.method,
          url: requestConfig.url,
          description: requestConfig.description,
          request: {
            headers: headersObj,
            queryParams: paramsObj,
            pathParams: {},
            auth: authData,
            body: bodyData
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

  // Handle raw body change with enhanced JSON handling
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

  // Auto-format JSON
  const formatJSON = () => {
    if (requestConfig.body.contentType === 'application/json') {
      try {
        const parsed = JSON.parse(requestConfig.body.raw);
        const formatted = JSON.stringify(parsed, null, 2);
        handleRawBodyChange(formatted);
        toast.success("JSON formatted successfully");
      } catch (err) {
        toast.error("Invalid JSON: " + err.message);
      }
    }
  };

  // Minify JSON
  const minifyJSON = () => {
    if (requestConfig.body.contentType === 'application/json') {
      try {
        const parsed = JSON.parse(requestConfig.body.raw);
        const minified = JSON.stringify(parsed);
        handleRawBodyChange(minified);
        toast.success("JSON minified successfully");
      } catch (err) {
        toast.error("Invalid JSON: " + err.message);
      }
    }
  };

  // Copy body to clipboard
  const copyBodyToClipboard = () => {
    navigator.clipboard.writeText(requestConfig.body.raw);
    toast.success("Body copied to clipboard");
  };

  // Format response size in human readable format
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format response time with appropriate units
  const formatTime = (ms) => {
    if (!ms) return '0 ms';
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Copy specific response parts
  const copyResponsePart = (part, data) => {
    let textToCopy = '';
    switch (part) {
      case 'status':
        textToCopy = `${responseData.status} ${responseData.statusText}`;
        break;
      case 'headers':
        textToCopy = Object.entries(responseData.headers || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        break;
      case 'body':
        textToCopy = typeof responseData.data === 'object' 
          ? JSON.stringify(responseData.data, null, 2) 
          : String(responseData.data);
        break;
      case 'url':
        textToCopy = requestConfig.url;
        break;
      default:
        textToCopy = String(data);
    }
    
    navigator.clipboard.writeText(textToCopy);
    toast.success(`${part.charAt(0).toUpperCase() + part.slice(1)} copied to clipboard`);
  };

  // Validate Bearer Token format (basic validation)
  const validateBearerToken = (token) => {
    if (!token) return null;
    // Basic JWT token validation (3 parts separated by dots)
    if (token.includes('.')) {
      const parts = token.split('.');
      return parts.length === 3 ? 'valid' : 'invalid';
    }
    // Other bearer tokens - just check if not empty
    return token.length > 10 ? 'valid' : 'warning';
  };

  // Test auth configuration
  const testAuth = async () => {
    if (requestConfig.auth.type === "No Auth") {
      toast.info("No authentication configured to test");
      return;
    }

    // Simple validation tests
    let isValid = true;
    let message = "";

    switch (requestConfig.auth.type) {
      case "Bearer Token":
        if (!requestConfig.auth.bearerToken.trim()) {
          isValid = false;
          message = "Bearer token is required";
        } else {
          const validation = validateBearerToken(requestConfig.auth.bearerToken);
          if (validation === 'invalid') {
            isValid = false;
            message = "Bearer token format appears invalid (JWT should have 3 parts)";
          } else if (validation === 'warning') {
            message = "Bearer token appears short - please verify it's correct";
          } else {
            message = "Bearer token format looks valid";
          }
        }
        break;
      case "Basic Auth":
        if (!requestConfig.auth.username.trim() || !requestConfig.auth.password.trim()) {
          isValid = false;
          message = "Both username and password are required for Basic Auth";
        } else {
          message = "Basic auth credentials are configured";
        }
        break;
      case "API Key":
        if (!requestConfig.auth.apiKeyName.trim() || !requestConfig.auth.apiKeyValue.trim()) {
          isValid = false;
          message = "Both API key name and value are required";
        } else {
          message = `API key will be added to ${requestConfig.auth.apiKeyAddTo.toLowerCase()}`;
        }
        break;
    }

    if (isValid) {
      toast.success(message);
      setTokenValid('valid');
    } else {
      toast.warning(message);
      setTokenValid('invalid');
    }

    // Reset validation state after 3 seconds
    setTimeout(() => setTokenValid(null), 3000);
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
    toast.success("Response copied to clipboard");
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
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md flex items-center gap-1 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
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
                    disabled={envLoading}
                  >
                    <option value="">
                      {envLoading ? "Loading environments..." : "Select Environment"}
                    </option>
                    {envOptions.map(env => (
                      <option key={env.id} value={env.id}>{env.name}</option>
                    ))}
                  </select>
                  {envLoading && (
                    <div className="mt-1 text-xs text-gray-500 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-1"></div>
                      Loading environments...
                    </div>
                  )}
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
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 w-full"
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
              {[
                {
                  name: "Params",
                  hasData: requestConfig.params.some(p => p.enabled && p.key.trim())
                },
                {
                  name: "Headers", 
                  hasData: requestConfig.headers.some(h => h.enabled && h.key.trim())
                },
                {
                  name: "Authorization",
                  hasData: requestConfig.auth.type !== "No Auth"
                },
                {
                  name: "Body",
                  hasData: requestConfig.body.type !== "none"
                }
              ].map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 hover:-translate-y-0.5 transition-all focus:outline-none relative ${
                    activeTab === tab.name
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                  {tab.hasData && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              {/* Params Tab */}
              {activeTab === "Params" && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-700">Query Parameters</h3>
                      <span className="text-xs text-gray-500">
                        ({requestConfig.params.filter(p => p.enabled && p.key.trim()).length} active)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={importParams}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                        title="Import parameters from clipboard"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Import
                      </button>
                      <button
                        onClick={exportParams}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                        title="Export parameters to clipboard"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Export
                      </button>
                      <button
                        onClick={() => handleAddRow("params")}
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <FaPlus size={10} />
                        Add
                      </button>
                    </div>
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
                                placeholder="Parameter value or ${paramName}"
                                className={`w-full border-0 p-0 focus:ring-0 ${!param.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!param.enabled}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => handleRemoveRow("params", index)}
                                className="text-gray-400 hover:text-red-500"
                                title="Remove parameter"
                              >
                                <FaMinus size={10} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* URL Preview */}
                  {requestConfig.url && requestConfig.params.some(p => p.enabled && p.key.trim()) && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-xs text-blue-700 font-medium mb-1">URL Preview:</div>
                      <div className="text-xs text-blue-600 font-mono break-all">
                        {requestConfig.url}
                        {requestConfig.url.includes('?') ? '&' : '?'}
                        {requestConfig.params
                          .filter(p => p.enabled && p.key.trim())
                          .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                          .join('&')
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Headers Tab */}
              {activeTab === "Headers" && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-700">Headers</h3>
                      <span className="text-xs text-gray-500">
                        ({requestConfig.headers.filter(h => h.enabled && h.key.trim()).length} active)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={importHeaders}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                        title="Import headers from clipboard"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Import
                      </button>
                      <button
                        onClick={exportHeaders}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                        title="Export headers to clipboard"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Export
                      </button>
                      <button
                        onClick={() => handleAddRow("headers")}
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <FaPlus size={10} />
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-3 py-2"></th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">
                            Key
                            <span className="ml-1 text-gray-400" title="Common headers will show suggestions">ⓘ</span>
                          </th>
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
                            <td className="px-3 py-2 relative">
                              <input
                                type="text"
                                value={header.key}
                                onChange={e => handleRowChange("headers", index, "key", e.target.value)}
                                placeholder="Header name"
                                list={`header-suggestions-${index}`}
                                className={`w-full border-0 p-0 focus:ring-0 ${!header.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!header.enabled}
                              />
                              <datalist id={`header-suggestions-${index}`}>
                                {commonHeaders.map(headerName => (
                                  <option key={headerName} value={headerName} />
                                ))}
                              </datalist>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={header.value}
                                onChange={e => handleRowChange("headers", index, "value", e.target.value)}
                                placeholder="Header value or ${paramName}"
                                className={`w-full border-0 p-0 focus:ring-0 ${!header.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                disabled={!header.enabled}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => handleRemoveRow("headers", index)}
                                className="text-gray-400 hover:text-red-500"
                                title="Remove header"
                              >
                                <FaMinus size={10} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Common Headers Quick Add */}
                  <div className="mt-3">
                    <details className="group">
                      <summary className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Quick add common headers
                      </summary>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {commonHeaders.slice(0, 8).map(headerName => (
                          <button
                            key={headerName}
                            onClick={() => {
                              // Check if header already exists
                              const exists = requestConfig.headers.some(h => h.key.toLowerCase() === headerName.toLowerCase());
                              if (!exists) {
                                setRequestConfig(prev => ({
                                  ...prev,
                                  headers: [...prev.headers, { key: headerName, value: "", enabled: true }]
                                }));
                                toast.success(`Added ${headerName} header`);
                              } else {
                                toast.info(`${headerName} header already exists`);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            title={`Add ${headerName} header`}
                          >
                            {headerName}
                          </button>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              )}
              
              {/* Authorization Tab */}
              {activeTab === "Authorization" && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700">Type</label>
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
                    
                    {requestConfig.auth.type !== "No Auth" && (
                      <button
                        onClick={testAuth}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                          tokenValid === 'valid' ? 'bg-green-100 text-green-700' :
                          tokenValid === 'invalid' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {tokenValid === 'valid' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Valid
                          </>
                        ) : tokenValid === 'invalid' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Invalid
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Test Auth
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {requestConfig.auth.type === "Bearer Token" && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">Token</label>
                        {requestConfig.auth.bearerToken && (
                          <div className="flex items-center gap-1 text-xs">
                            {(() => {
                              const validation = validateBearerToken(requestConfig.auth.bearerToken);
                              return validation === 'valid' ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Valid format
                                </span>
                              ) : validation === 'warning' ? (
                                <span className="text-yellow-600 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Check format
                                </span>
                              ) : validation === 'invalid' ? (
                                <span className="text-red-600 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Invalid format
                                </span>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={requestConfig.auth.bearerToken}
                          onChange={e => handleAuthFieldChange("bearerToken", e.target.value)}
                          placeholder="Your bearer token or ${paramName}"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                        />
                        {requestConfig.auth.bearerToken && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(requestConfig.auth.bearerToken);
                              toast.success("Token copied to clipboard");
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Copy token"
                          >
                            <FiCopy size={14} />
                          </button>
                        )}
                      </div>
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
                          placeholder="Username or ${paramName}"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={requestConfig.auth.password}
                            onChange={e => handleAuthFieldChange("password", e.target.value)}
                            placeholder="Password or ${paramName}"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm pr-8"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">
                          Credentials will be base64 encoded and sent as: Authorization: Basic &lt;encoded&gt;
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {requestConfig.auth.type === "API Key" && (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                          <input
                            type="text"
                            value={requestConfig.auth.apiKeyName}
                            onChange={e => handleAuthFieldChange("apiKeyName", e.target.value)}
                            placeholder="API key name (e.g., X-API-Key)"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Key Value</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={requestConfig.auth.apiKeyValue}
                              onChange={e => handleAuthFieldChange("apiKeyValue", e.target.value)}
                              placeholder="API key value or ${paramName}"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono pr-8"
                            />
                            {requestConfig.auth.apiKeyValue && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(requestConfig.auth.apiKeyValue);
                                  toast.success("API key copied to clipboard");
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                title="Copy API key"
                              >
                                <FiCopy size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add to</label>
                        <select
                          value={requestConfig.auth.apiKeyAddTo}
                          onChange={e => handleAuthFieldChange("apiKeyAddTo", e.target.value)}
                          className="w-full sm:w-48 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option>Header</option>
                          <option>Query Params</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          API key will be added to {requestConfig.auth.apiKeyAddTo.toLowerCase()} as: {requestConfig.auth.apiKeyName || "key-name"}: {requestConfig.auth.apiKeyValue || "key-value"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {requestConfig.auth.type === "No Auth" && (
                    <div className="mt-4 text-center py-8">
                      <div className="bg-gray-100 rounded-full p-3 mx-auto w-fit mb-3">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.02.02l.01.01M5 12l2 2L9 12m6.02-6.02l.01.01" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">No Authentication</p>
                      <p className="text-xs text-gray-500 mt-1">
                        No authentication headers will be added to the request
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
                        <div className="flex items-center gap-2">
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
                        
                        {/* Body Tools */}
                        <div className="flex items-center gap-2">
                          {requestConfig.body.contentType === 'application/json' && (
                            <>
                              <button
                                onClick={formatJSON}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                title="Format JSON"
                              >
                                Format
                              </button>
                              <button
                                onClick={minifyJSON}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                title="Minify JSON"
                              >
                                Minify
                              </button>
                            </>
                          )}
                          <button
                            onClick={copyBodyToClipboard}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                            title="Copy body"
                          >
                            <FiCopy size={12} />
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">Request Body</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {requestConfig.body.raw && (
                              <span>{requestConfig.body.raw.length} characters</span>
                            )}
                            {jsonError && (
                              <span className="text-red-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Invalid JSON
                              </span>
                            )}
                            {!jsonError && requestConfig.body.contentType === 'application/json' && requestConfig.body.raw && (
                              <span className="text-green-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Valid JSON
                              </span>
                            )}
                          </div>
                        </div>
                        <textarea
                          value={requestConfig.body.raw}
                          onChange={e => handleRawBodyChange(e.target.value)}
                          rows={12}
                          className={`w-full p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            jsonError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                          placeholder={requestConfig.body.contentType === "application/json" ? 
                            '{\n  "key": "value",\n  "parameterized": "${paramName}"\n}' : 
                            "Enter request body"}
                          style={{
                            backgroundColor: requestConfig.body.contentType === 'application/json' ? '#f8fafc' : 'white'
                          }}
                        ></textarea>
                      </div>
                      
                      {jsonError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span><strong>JSON Error:</strong> {jsonError}</span>
                          </p>
                        </div>
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
                                    type="text"
                                    value={item.value}
                                    onChange={e => handleRowChange("formData", index, "value", e.target.value)}
                                    placeholder="Value or ${paramName}"
                                    className={`w-full border-0 p-0 focus:ring-0 ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
                                    disabled={!item.enabled}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    value={item.type}
                                    onChange={e => handleRowChange("formData", index, "type", e.target.value)}
                                    className={`w-full border-0 p-0 focus:ring-0 text-sm ${!item.enabled ? "bg-gray-50 text-gray-400" : ""}`}
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
                        <h3 className="text-sm font-medium text-gray-700">URL Encoded Data</h3>
                        <button
                          onClick={() => handleAddRow("urlEncoded")}
                          className="text-indigo-600 hover:text-indigo-800 hover:-translate-y-0.5 transition-all text-sm flex items-center"
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
                                    placeholder="Value or ${paramName}"
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
                        No request body will be sent.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Parameters Summary */}
            <ParametersSummary />
          </div>
          
          {/* Response Section */}
          <div ref={responseRef} className="bg-white border rounded-md shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Response</h3>
              {responseData.data && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyResponsePart('body', responseData.data)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                    title="Copy response body"
                  >
                    <FiCopy size={12} />
                    Copy Body
                  </button>
                  <button
                    onClick={copyResponseToClipboard}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors flex items-center gap-1"
                    title="Copy entire response"
                  >
                    <FiCopy size={14} />
                    Copy All
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4">
              {responseData.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                  <span className="text-gray-600">Sending request...</span>
                </div>
              ) : responseData.error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">Request Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{responseData.error}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyResponsePart('error', responseData.error)}
                      className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Copy error message"
                    >
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>
              ) : responseData.data ? (
                <div>
                  {/* Response Status and Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(responseData.status)}`}>
                            {responseData.status} {responseData.statusText}
                          </span>
                        </div>
                        <button
                          onClick={() => copyResponsePart('status')}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy status"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Status</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatTime(responseData.time)}
                        </div>
                        <button
                          onClick={() => copyResponsePart('time', formatTime(responseData.time))}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy response time"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Response Time</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatSize(responseData.size)}
                        </div>
                        <button
                          onClick={() => copyResponsePart('size', formatSize(responseData.size))}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy response size"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Response Size</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {responseData.contentType || 'application/json'}
                        </div>
                        <button
                          onClick={() => copyResponsePart('contentType', responseData.contentType)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy content type"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Content Type</div>
                    </div>
                  </div>
                  
                  {/* Response Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Response Body</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {typeof responseData.data === 'object' ? 'JSON' : 'Text'}
                        </span>
                        <button
                          onClick={() => copyResponsePart('body')}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Copy response body"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="border rounded-md bg-gray-50 overflow-hidden">
                      <div className="bg-gray-100 px-3 py-2 border-b flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">Response Data</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {responseData.data && (
                            <span>
                              {typeof responseData.data === 'object' 
                                ? `${Object.keys(responseData.data).length} properties`
                                : `${String(responseData.data).length} characters`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <pre className="p-4 text-sm font-mono overflow-auto max-h-96 bg-white">
                        {formatJsonResponse(responseData.data)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Response Headers */}
                  {Object.keys(responseData.headers).length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Response Headers</h4>
                        <button
                          onClick={() => copyResponsePart('headers')}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Copy all headers"
                        >
                          Copy Headers
                        </button>
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Header</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                              <th className="w-16 px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(responseData.headers).map(([key, value]) => (
                              <tr key={key}>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">{key}</td>
                                <td className="px-3 py-2 text-sm text-gray-600 break-all">{value}</td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    onClick={() => copyResponsePart('header', `${key}: ${value}`)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Copy header"
                                  >
                                    <FiCopy size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiSend className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Ready to send</p>
                  <p className="text-sm">Click the Send button to execute the request</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default APIRepositoryDetails;