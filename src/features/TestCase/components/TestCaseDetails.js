// src/features/TestCase/TestCaseDetails.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import TestCaseTopForm from "./TestCaseTopForm";
import TestCaseConfigurationForm from "./TestCaseConfigurationForm";

const TestCaseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [detectedParameters, setDetectedParameters] = useState([]);
  const [testCaseSaved, setTestCaseSaved] = useState(false);
  const [savedTestCaseId, setSavedTestCaseId] = useState(null);
  const [showConfiguration, setShowConfiguration] = useState(false);
  
  // Check if we're in edit mode
  const isEditMode = !!location.state?.testCase;

  // Handle when parameters are detected in the top form
  const handleParametersDetected = (parameters) => {
    console.log("Parameters detected:", parameters);
    setDetectedParameters(parameters || []); // Handle null/undefined
    setShowConfiguration(true);
  };

  // Handle when test case is saved
  const handleTestCaseSaved = (testCaseId, parameters = []) => {
    console.log("Test case saved:", testCaseId, "Parameters:", parameters);
    setSavedTestCaseId(testCaseId);
    setTestCaseSaved(true);
    
    // Always show configuration form after save, regardless of parameters
    setDetectedParameters(parameters || []);
    setShowConfiguration(true);
  };

  // For edit mode, show configuration immediately if we have a test case ID
  React.useEffect(() => {
    if (isEditMode && location.state?.testCase?.testCaseId) {
      console.log("Edit mode detected, showing configuration form");
      setSavedTestCaseId(location.state.testCase.testCaseId);
      setTestCaseSaved(true);
      setShowConfiguration(true);
      
      // Extract any parameters from the existing test case
      const testCase = location.state.testCase;
      const existingParams = [];
      
      // Check URL for parameters
      if (testCase.url) {
        const urlParams = extractParameters(testCase.url);
        existingParams.push(...urlParams);
      }
      
      // Check templates for parameters
      if (testCase.requestTemplate) {
        const reqParams = extractParameters(JSON.stringify(testCase.requestTemplate));
        existingParams.push(...reqParams);
      }
      
      if (testCase.responseTemplate) {
        const resParams = extractParameters(JSON.stringify(testCase.responseTemplate));
        existingParams.push(...resParams);
      }
      
      // Remove duplicates
      const uniqueParams = [...new Set(existingParams)];
      setDetectedParameters(uniqueParams);
    }
  }, [isEditMode, location.state]);

  // Helper function to extract parameters
  const extractParameters = (text) => {
    if (!text) return [];
    const paramRegex = /\$\{([^}]+)\}/g;
    const params = [];
    let match;
    
    while ((match = paramRegex.exec(text)) !== null) {
      params.push(match[1]);
    }
    
    return params;
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Case", path: "/test-design/test-case" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
      />
      
      {/* Test Case Form */}
      <TestCaseTopForm 
        onParametersDetected={handleParametersDetected}
        onTestCaseSaved={handleTestCaseSaved}
      />
      
      {/* Configuration Form - Show when test case is saved OR in edit mode */}
      {(showConfiguration || testCaseSaved || isEditMode) && (
        <TestCaseConfigurationForm 
          detectedParameters={detectedParameters}
          testCaseId={savedTestCaseId || location.state?.testCase?.testCaseId}
          key={`config-${savedTestCaseId || location.state?.testCase?.testCaseId}`} // Force re-render when ID changes
        />
      )}
    </div>
  );
};

export default TestCaseDetails;