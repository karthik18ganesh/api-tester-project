import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TestPackageAssignmentForm from "./TestPackageAssignmentForm";
import TestPackageTopForm from "./TestPackageTopForm";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

const TestPackageDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isUpdateMode = !!state?.package;
  const [packageId, setPackageId] = useState(() => state?.package?.id || null);


  const [packageCreated, setPackageCreated] = useState(isUpdateMode);
  const [testPackageRows, setTestPackageRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);

  useEffect(() => {
    if (!packageId) return;
    if (state?.package?.id && !packageId) {
      setPackageId(state.package.id);
    }
    const fetchPackage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/v1/packages/${packageId}`);
        const json = await res.json();
        const { code, message, data } = json.result;
  
        if (code === "200") {
          setPackageData({
            name: data.packageName,
            description: data.description,
            execution: data.execution,
            executionType: data.executionType,
            reportType: data.reportType,
          });
        } else {
          toast.error(message || "Failed to load package data");
        }
      } catch (error) {
        console.error("Failed to load package:", error);
        toast.error("Error while loading test package");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPackage();
  }, [state, packageId]);

  const handleSavePackage = async (formData) => {
    const isUpdate = !!packageId;
    const payload = {
      requestMetaData: {
        userId: localStorage.getItem("userId") || "00",
        transactionId: nanoid(),
        timestamp: new Date().toISOString(),
      },
      data: {
        packageName: formData.name,
        description: formData.description,
        execution: formData.execution,
        executionType: formData.executionType,
        reportType: formData.reportType,
        ...(isUpdate && { testPackageID: packageId }),
      },
    };
  
    try {
      const res = await fetch("http://localhost:8080/api/v1/packages", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const json = await res.json();
      const { code, message, data } = json.result;
  
      if (code === "200") {
        toast.success(`"${formData.name}" ${isUpdate ? "Updated" : "Created"} successfully`);
  
        if (!isUpdate && data?.testPackageID) {
          setPackageId(data.testPackageID);
        }
  
        setPackageCreated(true);
      } else {
        toast.error(message || "Failed to create test package");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error occurred during creation");
    }
  };

  const handleAddToPackage = (selectedCases) => {
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

    setTestPackageRows((prev) => [...prev, ...newRows]);
    toast.success("Test cases added to the package");
  };

  return (
    <div className="p-6 font-inter">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Package", path: "/test-design/test-package" },
          { label: "Create" },
        ]}
      />

      <hr className="mb-6 border-gray-200" />

      {/* Top Form */}
      <TestPackageTopForm
        onSave={handleSavePackage}
        onCancel={() => setPackageCreated(false)}
        isUpdate={!!packageId}
        defaultValues={packageData}
      />
      <hr className="my-6 border-gray-200" />

      {/* Assignment Form */}
      <TestPackageAssignmentForm
        packageCreated={packageCreated}
        packageId={packageId}
        prefilledSuites={state?.package?.testSuites || []}
      />

      {/* Table */}
      {testPackageRows.length > 0 && (
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
              {testPackageRows.map((row) => (
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

export default TestPackageDetails;
