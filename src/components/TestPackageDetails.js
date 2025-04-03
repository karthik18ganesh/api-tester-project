import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { toast } from "react-toastify";
import Layout from "./Layout";
import TestPackageAssignmentForm from "./TestPackageAssignmentForm";
import TestPackageTopForm from "./TestPackageTopForm";
import { useLocation } from "react-router-dom";

const TestPackageDetails = () => {
  const { state } = useLocation();
  const isUpdateMode = !!state?.package;

  const [packageCreated, setPackageCreated] = useState(false);
  const [testPackageRows, setTestPackageRows] = useState([]);

  const [testCases] = useState([
    "Cart Functionality Test",
    "Mobile App Launch Test",
    "API Response Validation",
    "Payment Processing Test",
    "Invalid Password Test",
  ]);

  const handleSubmit = (formData) => {
    if (!formData.name) {
      toast.error("Please enter package name");
      return;
    }
    setPackageCreated(true);
    toast.success(`"${formData.name}" created successfully`);
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
    <Layout>
      <div className="p-6 font-inter">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-600 flex items-center gap-2 mb-4">
          <FaHome className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-medium">Test package</span>
        </div>
        <hr className="mb-6 border-gray-200" />

        {/* Top Form */}
        <TestPackageTopForm
          onSave={handleSubmit}
          onCancel={() => setPackageCreated(false)}
          isUpdate={isUpdateMode}
          defaultValues={state?.package}
        />
        <hr className="my-6 border-gray-200" />

        {/* Assignment Form */}
        <TestPackageAssignmentForm
          testCases={testCases}
          onAddToPackage={handleAddToPackage}
          packageCreated={true}
          prefilledCases={state?.package?.testCases || []}
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
    </Layout>
  );
};

export default TestPackageDetails;
