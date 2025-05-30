import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import TestSuiteAssignmentForm from "./TestSuiteAssignmentForm";
import TestSuiteTopForm from "./TestSuiteTopForm";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { api } from "../../../utils/api";

const TestSuiteDetails = () => {
  const { state } = useLocation();
  const isUpdateMode = !!state?.suite;
  const [suiteCreated, setSuiteCreated] = useState(false);
  const [suiteDetails, setSuiteDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSuiteId, setNewSuiteId] = useState(null);
  
  // Use refs to track initialization state and prevent multiple API calls
  const suiteDetailsLoaded = useRef(false);
  const apiCallInProgress = useRef(false);

  const navigate = useNavigate();
  const suiteId = state?.suite?.id;

  // Handle form submission
  const handleSubmit = async (formData) => {
    const isUpdate = !!suiteId;
    setSaving(true);
  
    const payload = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "302",
        transactionId: nanoid(),
        timestamp: new Date().toISOString(),
      },
      data: {
        suiteName: formData.name,
        description: formData.description,
        execution: formData.execution,
        executionType: formData.executionType,
        reportType: formData.reportType,
        publishMethod: formData.publishMethod,
        // Only include email if publishMethod is Email
        ...(formData.publishMethod === "Email" 
          ? { email: formData.email } 
          : {}),
        // Only include ftpPath if publishMethod is FTP path
        ...(formData.publishMethod === "FTP path" 
          ? { ftpPath: formData.ftpPath } 
          : {}),
        ...(isUpdate && { testSuiteID: suiteId }),
      },
    };
  
    try {
      const json = await api("/api/v1/test-suites", isUpdate ? "PUT" : "POST", payload);
      const { code, message, data } = json.result;
  
      if (code === "200") {
        toast.success(message || "Suite saved successfully");
        
        // If it's a new suite, store the ID for test case association
        if (!isUpdate && data && data.testSuiteID) {
          setNewSuiteId(data.testSuiteID);
          setSuiteCreated(true);
        } else if (isUpdate) {
          // For updates, just set the flag but don't navigate away yet
          setSuiteCreated(true);
        }
      } else {
        toast.error(message || "Failed to save test suite");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Load existing suite details - only once
  useEffect(() => {
    const fetchSuiteById = async () => {
      // Skip if no suiteId, already loaded, or API call is in progress
      if (!suiteId || suiteDetailsLoaded.current || apiCallInProgress.current) return;
      
      apiCallInProgress.current = true;
      setLoading(true);
  
      try {
        const json = await api(`/api/v1/test-suites/${suiteId}`, "GET");
        const { code, message, data } = json.result;
  
        if (code === "200") {
          setSuiteDetails({
            name: data.suiteName,
            description: data.description,
            execution: data.execution || "On demand",
            executionType: data.executionType || "Execute all test case if any fails",
            reportType: data.reportType || "PDF",
            publishMethod: data.publishMethod || "",
            email: data.email || "",
            ftpPath: data.ftpPath || "",
          });
          
          // Mark as loaded
          suiteDetailsLoaded.current = true;
          setSuiteCreated(true);
        } else {
          toast.error(message || "Failed to load suite data");
        }
      } catch (error) {
        console.error("Error loading suite:", error);
        toast.error("Error fetching test suite data");
      } finally {
        setLoading(false);
        apiCallInProgress.current = false;
      }
    };
  
    fetchSuiteById();
  }, [suiteId]); // Only depends on suiteId

  // Loading state
  if (loading && !suiteDetailsLoaded.current) {
    return (
      <div className="p-6 font-inter flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading test suite details...</div>
      </div>
    );
  }

  return (
    <div className="p-6 font-inter">
      {/* Breadcrumbs - Fixed to show "Update" when in update mode */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Suite", path: "/test-design/test-suite" },
          { label: isUpdateMode ? "Update" : "Create" },
        ]}
      />
      <hr className="mb-6 border-gray-200" />

      {/* Top Form */}
      <TestSuiteTopForm
        onSave={handleSubmit}
        onCancel={() => navigate("/test-design/test-suite")}
        isUpdate={!!suiteId}
        defaultValues={suiteDetails}
        isSaving={saving}
      />
      <hr className="my-6 border-gray-200" />

      {/* Assignment Form (only shown after suite is created in create mode, or immediately in update mode) */}
      {(suiteCreated || isUpdateMode) && (
        <TestSuiteAssignmentForm
          key={`test-suite-assignment-${isUpdateMode ? suiteId : newSuiteId}`} // Add a key prop to force re-render when ID changes
          suiteId={isUpdateMode ? suiteId : newSuiteId}
          onComplete={() => navigate("/test-design/test-suite")}
        />
      )}
    </div>
  );
};

export default TestSuiteDetails;