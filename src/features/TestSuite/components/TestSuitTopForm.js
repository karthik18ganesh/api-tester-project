import React, { useEffect, useState } from "react";
import Button from "../../../components/common/Button";

const TestSuiteTopForm = ({
  onSave,
  onCancel,
  isUpdate = false,
  defaultValues,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    execution: "On demand",
    executionType: "Execute all test case if any fails",
    reportType: "PDF",
    publishMethod: "",
    email: "",
    ftpPath: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData((prev) => ({
        ...prev,
        ...defaultValues,
      }));
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      execution: "On demand",
      executionType: "Execute all test case if any fails",
      reportType: "PDF",
      publishMethod: "",
      email: "",
      ftpPath: "",
      description: "",
    });
    onCancel?.();
  };

  return (
    <div className="bg-white p-6 rounded border shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isUpdate ? `Update test suite: ${defaultValues?.name || ''}` : "Create new test suite"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suite name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Login_Test_Suite"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Execution
          </label>
          <select
            name="execution"
            value={formData.execution}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={isSaving}
          >
            <option>On demand</option>
            <option>Scheduled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Execution type
          </label>
          <select
            name="executionType"
            value={formData.executionType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={isSaving}
          >
            <option>Execute all test case if any fails</option>
            <option>Stop on first failure</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report type
          </label>
          <select
            name="reportType"
            value={formData.reportType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={isSaving}
          >
            <option>PDF</option>
            <option>HTML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Publish method
          </label>
          <select
            name="publishMethod"
            value={formData.publishMethod}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={isSaving}
          >
            <option value="">Select Publish Method</option>
            <option>Email</option>
            <option>FTP path</option>
            <option>In-app</option>
          </select>
        </div>

        {formData.publishMethod === "Email" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tester@example.com"
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={isSaving}
            />
          </div>
        )}

        {formData.publishMethod === "FTP path" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FTP path
            </label>
            <input
              type="text"
              name="ftpPath"
              value={formData.ftpPath}
              onChange={handleChange}
              placeholder="/ftp/test_suites/login/"
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={isSaving}
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Tests login functionality, including valid/invalid credentials"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border rounded text-sm text-gray-700 bg-white hover:bg-gray-100"
          disabled={isSaving}
        >
          Cancel
        </button>
        <Button 
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isUpdate ? "Updating..." : "Saving..."}
            </>
          ) : isUpdate ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default TestSuiteTopForm;