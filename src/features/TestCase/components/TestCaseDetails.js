// src/features/TestCase/TestCaseDetails.js
import React, { useState, useMemo, useCallback } from "react";
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
  
  // Memoize values to prevent unnecessary re-renders
  const testCase = useMemo(() => location.state?.testCase, [location.state?.testCase]);
  const isEditMode = useMemo(() => !!testCase, [testCase]);
  const testCaseId = useMemo(() => testCase?.testCaseId, [testCase?.testCaseId]);

  // Stable callback for handling parameters detected
  const handleParametersDetected = useCallback((parameters) => {
    setDetectedParameters(parameters || []); // Handle null/undefined
    setShowConfiguration(true);
  }, []);

  // Stable callback for handling test case saved
  const handleTestCaseSaved = useCallback((testCaseId, parameters = []) => {
    setSavedTestCaseId(testCaseId);
    setTestCaseSaved(true);
    
    // Always show configuration form after save, regardless of parameters
    setDetectedParameters(parameters || []);
    setShowConfiguration(true);
  }, []);

  // Helper function to extract parameters
  const extractParameters = useCallback((text) => {
    if (!text) return [];
    const paramRegex = /\$\{([^}]+)\}/g;
    const params = [];
    let match;
    
    while ((match = paramRegex.exec(text)) !== null) {
      params.push(match[1]);
    }
    
    return params;
  }, []);

  // For edit mode, show configuration immediately if we have a test case ID
  React.useEffect(() => {
    if (isEditMode && testCaseId) {
      setSavedTestCaseId(testCaseId);
      setTestCaseSaved(true);
      setShowConfiguration(true);
      
      // Extract any parameters from the existing test case
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
  }, [isEditMode, testCaseId, testCase, extractParameters]); // Use stable, memoized dependencies

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
          testCaseId={savedTestCaseId || testCaseId}
          key={`config-${savedTestCaseId || testCaseId}`} // Force re-render when ID changes
        />
      )}
    </div>
  );
};

export default TestCaseDetails;