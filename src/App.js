import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/common/Layout";
import EnvironmentSetup from "./features/EnvironmentSetup/components/EnvironmentSetup";
import ProjectSetup from "./features/ProjectSetup/components/ProjectSetup";
import TestSuite from "./features/TestSuite/components/TestSuite";
import TestSuiteDetails from "./features/TestSuite/components/TestSuiteDetails";
import TestPackage from "./features/TestPackage/components/TestPackage";
import TestPackageDetails from "./features/TestPackage/components/TestPackageDetails";
import Dashboard from "./components/common/Dashboard";
import Login from "./features/Login/components/Login";
import Toast from "./components/common/Toast";
import TestCase from "./features/TestCase/components/TestCase";
import TestCaseDetails from "./features/TestCase/components/TestCaseDetails";

const App = () => {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Admin Settings */}
          <Route
            path="/admin/environment-setup"
            element={<EnvironmentSetup />}
          />
          <Route path="/admin/project-setup" element={<ProjectSetup />} />
          {/* Test Design */}
          <Route path="/test-design/test-suite" element={<TestSuite />} />
          <Route
            path="/test-design/test-suite/create"
            element={<TestSuiteDetails />}
          />
          <Route path="/test-design/test-package" element={<TestPackage />} />
          <Route
            path="/test-design/test-package/create"
            element={<TestPackageDetails />}
          />
          <Route path="/test-design/test-case" element={<TestCase />} />
          <Route
            path="/test-design/test-case/create"
            element={<TestCaseDetails />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
