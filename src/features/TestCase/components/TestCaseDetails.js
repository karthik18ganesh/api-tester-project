// src/features/TestCase/TestCaseDetails.js
import React from "react";
import Breadcrumb from "../../../components/common/Breadcrumb";
import TestCaseTopForm from "./TestCaseTopForm";
import TestCaseConfigurationForm from "./TestCaseConfigurationForm";

const TestCaseDetails = () => {
  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Test Design" },
          { label: "Test Case", path: "/test-design/test-case" },
          { label: "Create" },
        ]}
      />
      <TestCaseTopForm />
      <hr className="my-6 border-gray-300" />
      <TestCaseConfigurationForm />
    </div>
  );
};

export default TestCaseDetails;
