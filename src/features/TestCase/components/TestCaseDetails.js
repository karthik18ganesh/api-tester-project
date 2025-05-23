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
    setDetectedParameters(parameters);
    setShowConfiguration(true);
  };

  // Handle when test case is saved
  const handleTestCaseSaved = (testCaseId, parameters = []) => {
    console.log("Test case saved:", testCaseId, "Parameters:", parameters);
    setSavedTestCaseId(testCaseId);
    setTestCaseSaved(true);
    
    if (parameters.length > 0) {
      setDetectedParameters(parameters);
      setShowConfiguration(true);
    }
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
      
      {/* Configuration Form - Show when parameters are detected or test case is saved */}
      {(showConfiguration || testCaseSaved) && detectedParameters.length > 0 && (
        <TestCaseConfigurationForm 
          detectedParameters={detectedParameters}
          testCaseId={savedTestCaseId || location.state?.testCase?.testCaseId}
        />
      )}
    </div>
  );
};

export default TestCaseDetails;