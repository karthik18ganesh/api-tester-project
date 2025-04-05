import React, { useEffect, useState } from "react";
import Button from "../../../components/common/Button";

const TestPackageTopForm = ({
  onSave,
  onCancel,
  isUpdate = false,
  defaultValues,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    execution: "On demand",
    executionType: "Execute all test case if any fails",
    reportType: "PDF",
    description: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData({ ...formData, ...defaultValues });
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
      description: "",
    });
    onCancel?.();
  };

  return (
    <div className="bg-white p-6 rounded border shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Create new test package
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Login_Test_Package"
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
          >
            <option>PDF</option>
            <option>HTML</option>
          </select>
        </div>
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
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border rounded text-sm text-gray-700 bg-white hover:bg-gray-100"
        >
          Cancel
        </button>
        <Button
          onClick={handleSubmit}
        >
          {isUpdate ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default TestPackageTopForm;
