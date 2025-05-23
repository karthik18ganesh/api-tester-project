// src/features/TestCase/TestCaseDetails.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import TestCaseTopForm from "./TestCaseTopForm";
import TestCaseConfigurationForm from "./TestCaseConfigurationForm";
import ParameterCompletionSummary from "./ParameterCompletionSummary";
import { FiCheckCircle, FiArrowDown, FiSettings, FiInfo } from "react-icons/fi";

const TestCaseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [detectedParameters, setDetectedParameters] = useState([]);
  const [testCaseSaved, setTestCaseSaved] = useState(false);
  const [savedTestCaseId, setSavedTestCaseId] = useState(null);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [variablesCreated, setVariablesCreated] = useState(0);
  const [configuredParameters, setConfiguredParameters] = useState([]);
  const [testCaseName, setTestCaseName] = useState("");
  
  // Check if we're in edit mode
  const isEditMode = !!location.state?.testCase;

  // Handle when parameters are detected in the top form
  const handleParametersDetected = (parameters, paramValues) => {
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

  // Handle when variables are auto-created
  const handleVariablesCreated = (count) => {
    setVariablesCreated(count);
  };

  // Handle when variables are updated (to track completion)
  const handleVariablesUpdated = (variables) => {
    // Check which detected parameters have corresponding variables with values
    const configuredParams = detectedParameters.filter(param => {
      const variable = variables.find(v => v.name === param);
      return variable && variable.value && variable.value.trim() !== '';
    });
    setConfiguredParameters(configuredParams);
  };

  // Handle completion
  const handleComplete = () => {
    navigate('/test-design/test-case');
  };

  // Configuration progress indicator
  const ConfigurationProgress = () => {
    if (!testCaseSaved || detectedParameters.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <FiSettings className="text-indigo-600 h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">Configuration Required</h3>
              <p className="text-indigo-700 text-sm">
                {detectedParameters.length} parameter{detectedParameters.length > 1 ? 's' : ''} detected in your test case
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-2" />
            <span className="text-green-700 font-medium">
              {variablesCreated} variable{variablesCreated !== 1 ? 's' : ''} auto-created
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-indigo-700">
            <FiArrowDown className="mr-2" />
            <span>Complete the configuration below to finalize your test case</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {detectedParameters.map((param, index) => (
              <span 
                key={param} 
                className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
              >
                ${param}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps = [
      { 
        title: "Create Test Case", 
        completed: testCaseSaved, 
        active: !testCaseSaved 
      },
      { 
        title: "Configure Parameters", 
        completed: testCaseSaved && detectedParameters.length > 0 && variablesCreated > 0, 
        active: testCaseSaved && detectedParameters.length > 0,
        disabled: !testCaseSaved || detectedParameters.length === 0
      }
    ];

    if (detectedParameters.length === 0 && testCaseSaved) {
      // No parameters detected, so we only have one step
      steps[0].completed = true;
      steps[0].active = false;
    }

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.title}>
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.active 
                      ? 'bg-indigo-500 text-white' 
                      : step.disabled
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-300 text-gray-600'
                  }
                `}>
                  {step.completed ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`
                  ml-2 text-sm font-medium
                  ${step.completed 
                    ? 'text-green-700' 
                    : step.active 
                      ? 'text-indigo-700' 
                      : step.disabled
                        ? 'text-gray-400'
                        : 'text-gray-600'
                  }
                `}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-px mx-4
                  ${steps[index + 1].completed || steps[index + 1].active 
                    ? 'bg-indigo-300' 
                    : 'bg-gray-300'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
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
      
      {/* Step Indicator */}
      <StepIndicator />
      
      {/* Test Case Form */}
      <TestCaseTopForm 
        onParametersDetected={handleParametersDetected}
        onTestCaseSaved={handleTestCaseSaved}
        onTestCaseNameChange={setTestCaseName}
      />
      
      {/* Configuration Progress Indicator */}
      <ConfigurationProgress />
      
      {/* Configuration Form - Always show if we have parameters or if the test case is saved */}
      {(showConfiguration || testCaseSaved) && (
        <>
          <hr className="my-6 border-gray-300" />
          <TestCaseConfigurationForm 
            detectedParameters={detectedParameters}
            testCaseId={savedTestCaseId || location.state?.testCase?.testCaseId}
            onVariablesCreated={handleVariablesCreated}
            onVariablesUpdated={handleVariablesUpdated}
          />
          
          {/* Parameter Completion Summary */}
          <ParameterCompletionSummary
            testCaseId={savedTestCaseId || location.state?.testCase?.testCaseId}
            detectedParameters={detectedParameters}
            configuredParameters={configuredParameters}
            testCaseName={testCaseName || location.state?.testCase?.name || "Test Case"}
            onComplete={handleComplete}
          />
        </>
      )}
      
      {/* Completion Message */}
      {testCaseSaved && detectedParameters.length === 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-2" />
            <div>
              <h3 className="font-medium text-green-800">Test Case Complete!</h3>
              <p className="text-green-700 text-sm">
                Your test case has been {isEditMode ? 'updated' : 'created'} successfully with no parameters detected.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseDetails;