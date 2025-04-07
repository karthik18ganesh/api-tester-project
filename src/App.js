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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
