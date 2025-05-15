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
import ProtectedRoute from "./components/common/ProtectedRoute";
import APIRepository from "./features/APIRepository/components/APIRepository";
import APIRepositoryDetails from "./features/APIRepository/components/APIRepositoryDetails";
import TestExecution from "./features/TestExecution/components/TestExecution";
import { default as ExecutionTestCaseDetails } from "./features/TestExecution/components/TestCaseDetails";
import TestResults from "./features/TestResults/components/TestResults";
import ExecutionDetails from "./features/TestResults/components/ExecutionDetails";

const App = () => {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* Admin Settings */}
          <Route
            path="/admin/environment-setup"
            element={<ProtectedRoute><EnvironmentSetup /></ProtectedRoute>}
          />
          <Route path="/admin/project-setup" element={<ProtectedRoute><ProjectSetup /></ProtectedRoute>} />
          {/* Test Design */}
          <Route path="/test-design/api-repository" element={<ProtectedRoute><APIRepository /></ProtectedRoute>} />
          <Route
            path="/test-design/api-repository/create"
            element={<ProtectedRoute><APIRepositoryDetails /></ProtectedRoute>}
          />
          <Route path="/test-design/test-suite" element={<ProtectedRoute><TestSuite /></ProtectedRoute>} />
          <Route
            path="/test-design/test-suite/create"
            element={<ProtectedRoute><TestSuiteDetails /></ProtectedRoute>}
          />
          <Route path="/test-design/test-package" element={<ProtectedRoute><TestPackage /></ProtectedRoute>} />
          <Route
            path="/test-design/test-package/create"
            element={<ProtectedRoute><TestPackageDetails /></ProtectedRoute>}
          />
          <Route path="/test-design/test-case" element={<ProtectedRoute><TestCase /></ProtectedRoute>} />
          <Route
            path="/test-design/test-case/create"
            element={<ProtectedRoute><TestCaseDetails /></ProtectedRoute>}
          />
          {/* Test Execution & Results */}
          <Route path="/test-execution" element={<ProtectedRoute><TestExecution /></ProtectedRoute>} />
          <Route path="/test-execution/results/:executionId/:testCaseId" element={<ProtectedRoute><ExecutionTestCaseDetails /></ProtectedRoute>} />
          <Route path="/test-results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
          <Route path="/test-execution/results/:executionId" element={<ProtectedRoute><ExecutionDetails /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
