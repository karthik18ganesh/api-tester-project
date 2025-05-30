import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { FiSave } from "react-icons/fi";

// Import optimized sub-components
import FormFields from "./TestCaseForm/FormFields";
import ParameterPreview from "./TestCaseForm/ParameterPreview";
import FileUploadSection from "./TestCaseForm/FileUploadSection";
import JSONPreviewModal from "./TestCaseForm/JSONPreviewModal";
import { 
  detectAllParameters, 
  extractParameters, 
  extractParametersFromApiDetails 
} from "./TestCaseForm/ParameterExtractor";

const TestCaseTopForm = ({ onParametersDetected, onTestCaseSaved }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Memoize the test case ID to prevent unnecessary re-renders
  const testCaseId = useMemo(() => 
    location.state?.testCase?.testCaseId, 
    [location.state?.testCase?.testCaseId]
  );
  
  const editMode = useMemo(() => !!location.state?.testCase, [location.state?.testCase]);
  
  // Ref to track if we've already fetched the test case details
  const hasFetchedRef = useRef(false);
  const lastFetchedIdRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingApis, setLoadingApis] = useState(false);
  
  // API Repository state
  const [apiOptions, setApiOptions] = useState([]);
  const [selectedApiDetails, setSelectedApiDetails] = useState(null);
  const [selectedApiId, setSelectedApiId] = useState(null);
  
  // Parameters state
  const [parameters, setParameters] = useState([]);
  
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

  // Memoized metadata generation
  const generateMetadata = useCallback(() => ({
    userId: "302", // This would typically come from auth context
    transactionId: Date.now().toString(),
    timestamp: new Date().toISOString()
  }), []);

  // Stable callback for parameters detected
  const handleParametersDetected = useCallback((params) => {
    if (onParametersDetected) {
      onParametersDetected(params);
    }
  }, [onParametersDetected]);

  // Stable callback for test case saved
  const handleTestCaseSaved = useCallback((id, params) => {
    if (onTestCaseSaved) {
      onTestCaseSaved(id, params);
    }
  }, [onTestCaseSaved]);
  
  // Load available APIs from the API repository
  useEffect(() => {
    const fetchApis = async () => {
      setLoadingApis(true);
      try {
        const response = await api('/api/v1/apirepos', 'GET');
        if (response?.result?.data) {
          const options = response.result.data.content.map(api => ({
            id: api.apiId,
            name: api.apiRepoName,
            method: api.method,
            url: api.url
          }));
          setApiOptions(options);
        }
      } catch (error) {
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

  // Update parameters when URL or API changes
  const updateParametersFromSources = useCallback(() => {
    const urlParams = extractParameters(formData.url);
    const apiParams = extractParametersFromApiDetails(selectedApiDetails);
    const allParams = [...new Set([...urlParams, ...apiParams])];
    
    setParameters(allParams);
    if (allParams.length > 0) {
      handleParametersDetected(allParams);
    }
  }, [formData.url, selectedApiDetails, handleParametersDetected]);

  // Load API details
  const loadApiDetails = useCallback(async (apiId) => {
    if (!apiId) return;
    
    try {
      setLoadingApis(true);
      const response = await api(`/api/v1/apirepos/${apiId}`, 'GET');
      
      if (response?.result?.data) {
        const apiData = response.result.data;
        setSelectedApiDetails(apiData);
        setSelectedApiId(apiId);
        
        setFormData(prev => ({
          ...prev,
          url: apiData.url,
          apiType: apiData.method
        }));
        
        setTimeout(updateParametersFromSources, 100);
      } else {
        toast.error("Invalid API data format");
      }
    } catch (error) {
      toast.error("Failed to load API details");
    } finally {
      setLoadingApis(false);
    }
  }, [updateParametersFromSources]);

  // Fetch test case details if in edit mode - FIXED to prevent infinite loop
  useEffect(() => {
    // Prevent re-fetching if we've already fetched this test case
    if (!editMode || !testCaseId || hasFetchedRef.current && lastFetchedIdRef.current === testCaseId) {
      return;
    }

    const fetchTestCaseDetails = async () => {
      try {
        setLoading(true);
        hasFetchedRef.current = true;
        lastFetchedIdRef.current = testCaseId;

        const response = await api(`/api/v1/test-cases/${testCaseId}`);
        
        if (response.result?.data) {
          const testCase = response.result.data;
          
          setFormData({
            testCaseName: testCase.name || "",
            type: testCase.type || "",
            responseType: testCase.responseType || "",
            api: testCase.apiName || "",
            apiType: testCase.apiType || "",
            url: testCase.url || "",
            description: testCase.description || "",
          });

          if (testCase.api && testCase.api.apiId) {
            setSelectedApiId(testCase.api.apiId);
          }

          // Set template data if available
          if (testCase.requestTemplate) {
            const formattedRequest = typeof testCase.requestTemplate === 'string'
              ? testCase.requestTemplate
              : JSON.stringify(testCase.requestTemplate, null, 2);
            setRequestTemplate(formattedRequest);
            setUploadedRequestFileName("existing-request.json");
          }

          if (testCase.responseTemplate) {
            const formattedResponse = typeof testCase.responseTemplate === 'string'
              ? testCase.responseTemplate
              : JSON.stringify(testCase.responseTemplate, null, 2);
            setResponseTemplate(formattedResponse);
            setUploadedResponseFileName("existing-response.json");
          }
          
          const detectedParams = detectAllParameters(testCase);
          setParameters(detectedParams);
          
          handleParametersDetected(detectedParams);
          handleTestCaseSaved(testCase.testCaseId, detectedParams);

          if (testCase.apiName && testCase.api && testCase.api.apiId) {
            await loadApiDetails(testCase.api.apiId);
          }
        }
      } catch (err) {
        toast.error("Failed to load test case details");
        hasFetchedRef.current = false; // Reset on error so user can retry
        lastFetchedIdRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    // Use the data from location.state directly if available (for immediate display)
    if (location.state?.testCase && !location.state.testCase.testCaseId) {
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

      if (testCase.apiId) {
        setSelectedApiId(testCase.apiId);
      }

      // Set template data
      if (testCase.requestTemplate) {
        const formattedRequest = typeof testCase.requestTemplate === 'string'
          ? testCase.requestTemplate
          : JSON.stringify(testCase.requestTemplate, null, 2);
        setRequestTemplate(formattedRequest);
        setUploadedRequestFileName("existing-request.json");
      }

      if (testCase.responseTemplate) {
        const formattedResponse = typeof testCase.responseTemplate === 'string'
          ? testCase.responseTemplate
          : JSON.stringify(testCase.responseTemplate, null, 2);
        setResponseTemplate(formattedResponse);
        setUploadedResponseFileName("existing-response.json");
      }
      
      const detectedParams = detectAllParameters(testCase);
      setParameters(detectedParams);
      
      handleParametersDetected(detectedParams);
      handleTestCaseSaved(testCase.testCaseId, detectedParams);
    } else {
      // Fetch from API if we have a test case ID
      fetchTestCaseDetails();
    }
  }, [editMode, testCaseId, handleParametersDetected, handleTestCaseSaved]); // Removed unstable dependencies

  // Reset fetched ref when navigating to a different test case
  useEffect(() => {
    return () => {
      hasFetchedRef.current = false;
      lastFetchedIdRef.current = null;
    };
  }, [testCaseId]);

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'api' && value) {
      const selectedApi = apiOptions.find(api => api.name === value);
      if (selectedApi) {
        loadApiDetails(selectedApi.id);
      } else {
        setSelectedApiDetails(null);
        setSelectedApiId(null);
      }
    }

    if (name === 'url') {
      setTimeout(updateParametersFromSources, 100);
    }
  }, [apiOptions, loadApiDetails, updateParametersFromSources]);

  // Form validation
  const validateForm = useCallback(() => {
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
    
    return true;
  }, [formData]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      let requestTemplateObj = {};
      let responseTemplateObj = {};
      
      if (requestTemplate) {
        try {
          requestTemplateObj = JSON.parse(requestTemplate);
        } catch (err) {
          toast.error("Invalid JSON in request template");
          return;
        }
      }
      
      if (responseTemplate) {
        try {
          responseTemplateObj = JSON.parse(responseTemplate);
        } catch (err) {
          toast.error("Invalid JSON in response template");
          return;
        }
      }
      
      const payload = {
        requestMetaData: generateMetadata(),
        data: {
          name: formData.testCaseName,
          type: formData.type,
          responseType: formData.responseType,
          apiName: formData.api,
          apiType: formData.apiType,
          url: formData.url,
          description: formData.description,
          executionOrder: 1,
        }
      };

      if (requestTemplate) {
        payload.data.requestTemplate = requestTemplateObj;
      }
      
      if (responseTemplate) {
        payload.data.responseTemplate = responseTemplateObj;
      }

      if (selectedApiId) {
        payload.data.apiId = selectedApiId.toString();
      }
      
      let response;
      let savedTestCaseId;
      
      if (editMode) {
        payload.data.testCaseId = testCaseId;
        savedTestCaseId = testCaseId;
        response = await api("/api/v1/test-cases", "PUT", payload);
        toast.success("Test Case updated successfully!");
      } else {
        response = await api("/api/v1/test-cases", "POST", payload);
        toast.success("Test Case created successfully!");
        savedTestCaseId = response?.result?.data?.testCaseId;
      }
      
      const urlParams = extractParameters(formData.url);
      const apiParams = extractParametersFromApiDetails(selectedApiDetails);
      const detectedParams = [...new Set([...urlParams, ...apiParams])];

      handleParametersDetected(detectedParams);
      handleTestCaseSaved(savedTestCaseId, detectedParams);
      
    } catch (err) {
      toast.error(err.message || "Failed to save test case");
    } finally {
      setLoading(false);
    }
  }, [validateForm, requestTemplate, responseTemplate, generateMetadata, formData, selectedApiId, editMode, testCaseId, selectedApiDetails, handleParametersDetected, handleTestCaseSaved]);

  const handleCancel = useCallback(() => {
    navigate("/test-design/test-case");
  }, [navigate]);

  return (
    <div className="bg-white p-6 rounded border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiSave className="mr-2 text-indigo-600" />
          {editMode ? "Edit test case" : "Create new test case"}
        </h2>
        <div className="flex items-center gap-2">
          {selectedApiId && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              API ID: {selectedApiId}
            </span>
          )}
          {parameters.length > 0 && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {parameters.length} parameter{parameters.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
      </div>

      <FormFields
        formData={formData}
        apiOptions={apiOptions}
        loading={loading}
        loadingApis={loadingApis}
        selectedApiId={selectedApiId}
        selectedApiDetails={selectedApiDetails}
        onFieldChange={handleChange}
      />

      <ParameterPreview parameters={parameters} />

      <FileUploadSection
        requestTemplate={requestTemplate}
        responseTemplate={responseTemplate}
        uploadedRequestFileName={uploadedRequestFileName}
        uploadedResponseFileName={uploadedResponseFileName}
        onRequestTemplateChange={setRequestTemplate}
        onResponseTemplateChange={setResponseTemplate}
        onRequestFileNameChange={setUploadedRequestFileName}
        onResponseFileNameChange={setUploadedResponseFileName}
        onShowPreview={setShowPreview}
        loading={loading}
      />

      {showPreview && (
        <JSONPreviewModal
          title={showPreview.type === "request" ? "Request Template" : "Response Template"}
          content={showPreview.content}
          onClose={() => setShowPreview(null)}
        />
      )}

      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-4 py-2 bg-[#4F46E5] text-white rounded text-sm hover:bg-[#4338CA] hover:-translate-y-0.5 transition-all flex items-center ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              {editMode ? "Update" : "Save"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TestCaseTopForm;