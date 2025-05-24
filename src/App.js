// Updated App.js with Project Activation Guard

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
import ProjectActivationGuard from "./components/common/ProjectActivationGuard";
import ProjectProtectedRoute from "./components/common/ProjectProtectedRoute";
import APIRepository from "./features/APIRepository/components/APIRepository";
import APIRepositoryDetails from "./features/APIRepository/components/APIRepositoryDetails";
import TestExecution from "./features/TestExecution/components/TestExecution";
import TestCaseDetailsView from "./features/TestExecution/components/TestCaseDetailsView";
import TestResults from "./features/TestResults/components/TestResults";
import ExecutionDetailsView from "./features/TestResults/components/ExecutionDetailsView";

const EnhancedApp = () => {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          {/* Dashboard - requires active project */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <Dashboard />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Settings - Project Setup doesn't require active project */}
          <Route
            path="/admin/project-setup"
            element={
              <ProtectedRoute>
                <ProjectSetup />
              </ProtectedRoute>
            }
          />
          
          {/* Environment Setup - requires active project */}
          <Route
            path="/admin/environment-setup"
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <EnvironmentSetup />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            }
          />
          
          {/* Test Design - all require active project */}
          <Route 
            path="/test-design/api-repository" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <APIRepository />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/test-design/api-repository/create"
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <APIRepositoryDetails />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/test-design/test-suite" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestSuite />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/test-design/test-suite/create"
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestSuiteDetails />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/test-design/test-package" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestPackage />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/test-design/test-package/create"
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestPackageDetails />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/test-design/test-case" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestCase />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/test-design/test-case/create"
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestCaseDetails />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            }
          />
          
          {/* Test Execution & Results - require active project */}
          <Route 
            path="/test-execution" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestExecution />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/test-execution/results/:executionId" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <ExecutionDetailsView />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/test-execution/results/:executionId/:testCaseId" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestCaseDetailsView />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/test-results" 
            element={
              <ProtectedRoute>
                <ProjectActivationGuard>
                  <ProjectProtectedRoute>
                    <TestResults />
                  </ProjectProtectedRoute>
                </ProjectActivationGuard>
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default EnhancedApp;