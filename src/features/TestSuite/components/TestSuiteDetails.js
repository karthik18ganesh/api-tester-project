import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import TestSuiteAssignmentForm from "./TestSuiteAssignmentForm";
import TestSuiteTopForm from "./TestSuitTopForm";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { api } from "../../../utils/api";

const TestSuiteDetails = () => {
  const { state } = useLocation();
  const isUpdateMode = !!state?.suite;
  const [suiteCreated, setSuiteCreated] = useState(false);
  const [testSuiteRows, setTestSuiteRows] = useState([]);
  const [suiteDetails, setSuiteDetails] = useState(null);

  const [testCases] = useState([
    "Cart Functionality Test",
    "Mobile App Launch Test",
    "API Response Validation",
    "Payment Processing Test",
    "Invalid Password Test",
  ]);

  const navigate = useNavigate();
  const suiteId = state?.suite?.id;

  const handleSubmit = async (formData) => {
    const isUpdate = !!suiteId;
  
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
        ...(formData.publishMethod === "Email"
          ? { email: formData.email }
          : { ftpPath: formData.ftpPath }),
        ...(isUpdate && { testSuiteID: suiteId }),
      },
    };
  
    try {
      const json = await api("/api/v1/test-suites", isUpdate ? "PUT" : "POST", payload);

      const { code, message } = json.result;
  
      if (code === "200") {
        toast.success(message || "Suite saved successfully");
        setTimeout(() => navigate("/test-design/test-suite"), 1000);
      } else {
        toast.error(message || "Failed to save test suite");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const fetchSuiteById = async () => {
      if (!suiteId) return;
  
      try {
        const json = await api(`/api/v1/test-suites/${suiteId}`);
        const { code, message, data } = json.result;
  
        if (code === "200") {
          setSuiteDetails({
            name: data.suiteName,
            description: data.description,
            execution: data.execution,
            executionType: data.executionType,
            reportType: data.reportType,
            publishMethod: data.publishMethod,
            email: data.email || "",
            ftpPath: data.ftpPath || "",
            testCases: data.testCases || [],
          });
        } else {
          toast.error(message || "Failed to load suite data");
        }
      } catch (error) {
        console.error("Error loading suite:", error);
        toast.error("Error fetching test suite data");
      }
    };
  
    fetchSuiteById();
  }, [suiteId]);
  

  const handleAddToSuite = (selectedCases) => {
    if (!selectedCases || selectedCases.length === 0) {
      toast.error("Please select at least one test case");
      return;
    }

    const newRows = selectedCases.map((name, index) => ({
      id: Date.now() + index,
      name,
      status: "Pending",
      createdDate: new Date().toLocaleDateString(),
      executedDate: "-",
    }));

    setTestSuiteRows((prev) => [...prev, ...newRows]);
    toast.success("Test cases added to the suite");
  };

  return (
    <div className="p-6 font-inter">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Suite", path: "/test-design/test-suite" },
          { label: "Create" },
        ]}
      />
      <hr className="mb-6 border-gray-200" />

      {/* Top Form */}
      <TestSuiteTopForm
        onSave={handleSubmit}
        onCancel={() => setSuiteCreated(false)}
        isUpdate={!!suiteId}
        defaultValues={suiteDetails}
      />
      <hr className="my-6 border-gray-200" />

      {/* Assignment Form */}
      <TestSuiteAssignmentForm
        testCases={testCases}
        onAddToSuite={handleAddToSuite}
        suiteCreated={true}
        prefilledCases={state?.suite?.testCases || []}
      />

      {/* Table */}
      {testSuiteRows.length > 0 && (
        <div className="mt-8 bg-white p-4 border shadow-sm rounded">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Associated Test Cases
          </h3>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-4 py-2 border">Test Case Name</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created Date</th>
                <th className="px-4 py-2 border">Executed Date</th>
              </tr>
            </thead>
            <tbody>
              {testSuiteRows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2 border">{row.name}</td>
                  <td className="px-4 py-2 border">{row.status}</td>
                  <td className="px-4 py-2 border">{row.createdDate}</td>
                  <td className="px-4 py-2 border">{row.executedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestSuiteDetails;
