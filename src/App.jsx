// Phase 4 Enhanced App.jsx with Advanced Performance Optimizations

import React, { useEffect, Suspense, lazy, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Phase 4 Providers and Optimizations
import { QueryProvider } from "./providers/QueryProvider";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

// Existing components
import Layout from "./components/common/Layout";
import Toast from "./components/common/Toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ProjectActivationGuard from "./components/common/ProjectActivationGuard";
import ProjectProtectedRoute from "./components/common/ProjectProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Import Zustand stores
import { initializeStores } from "./stores";

// Lazy load feature components for code splitting with preloading
const EnvironmentSetup = lazy(() => 
  import("./features/EnvironmentSetup/components/EnvironmentSetup")
);
const ProjectSetup = lazy(() => 
  import("./features/ProjectSetup/components/ProjectSetup")
);
const TestSuite = lazy(() => 
  import("./features/TestSuite/components/TestSuite")
);
const TestSuiteDetails = lazy(() => 
  import("./features/TestSuite/components/TestSuiteDetails")
);
const TestPackage = lazy(() => 
  import("./features/TestPackage/components/TestPackage")
);
const TestPackageDetails = lazy(() => 
  import("./features/TestPackage/components/TestPackageDetails")
);
const Dashboard = lazy(() => 
  import("./components/common/Dashboard")
);
const Login = lazy(() => 
  import("./features/Login/components/Login")
);
const TestCase = lazy(() => 
  import("./features/TestCase/components/TestCase")
);
const TestCaseDetails = lazy(() => 
  import("./features/TestCase/components/TestCaseDetails")
);
const APIRepository = lazy(() => 
  import("./features/APIRepository/components/APIRepository")
);
const APIRepositoryDetails = lazy(() => 
  import("./features/APIRepository/components/APIRepositoryDetails")
);
const TestExecution = lazy(() => 
  import("./features/TestExecution/components/TestExecution")
);
const TestCaseDetailsView = lazy(() => 
  import("./features/TestExecution/components/TestCaseDetailsView")
);
const TestResults = lazy(() => 
  import("./features/TestResults/components/TestResults")
);
const ExecutionDetailsView = lazy(() => 
  import("./features/TestResults/components/ExecutionDetailsView")
);
const FunctionsVariables = lazy(() => 
  import("./features/FunctionsVariables/FunctionsVariables")
);
const UserManagement = lazy(() => 
  import("./features/UserManagement/components/UserManagement")
);
const BulkUpload = lazy(() => 
  import("./features/TestDesign/components/BulkUpload")
);

// Enhanced loading component with skeleton
const EnhancedLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner />
      <p className="mt-4 text-sm text-gray-600">Loading application...</p>
    </div>
  </div>
);

// Wrapper component for protected routes with enhanced loading
const LazyProtectedRoute = ({ children }) => (
  <ErrorBoundary>
    <ProtectedRoute>
      <Suspense fallback={<EnhancedLoadingSpinner />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  </ErrorBoundary>
);

// Wrapper component for project protected routes with enhanced loading
const LazyProjectProtectedRoute = ({ children }) => (
  <ErrorBoundary>
    <ProtectedRoute>
      <ProjectActivationGuard>
        <ProjectProtectedRoute>
          <Suspense fallback={<EnhancedLoadingSpinner />}>
            {children}
          </Suspense>
        </ProjectProtectedRoute>
      </ProjectActivationGuard>
    </ProtectedRoute>
  </ErrorBoundary>
);

const EnhancedApp = () => {
  // Initialize stores on app mount
  useEffect(() => {
    initializeStores();

    // Preload critical routes
    const preloadRoutes = () => {
      // Preload dashboard and common routes
      import("./components/common/Dashboard");
      import("./features/APIRepository/components/APIRepository");
      import("./features/TestExecution/components/TestExecution");
    };

    // Preload after initial render
    setTimeout(preloadRoutes, 1000);
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <Router>
          <Toast />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route 
              path="/login" 
              element={
                <ErrorBoundary>
                  <Suspense fallback={<EnhancedLoadingSpinner />}>
                    <Login />
                  </Suspense>
                </ErrorBoundary>
              } 
            />
            
            <Route element={<Layout />}>
              {/* Dashboard - requires active project */}
              <Route 
                path="/dashboard" 
                element={
                  <LazyProjectProtectedRoute>
                    <Dashboard />
                  </LazyProjectProtectedRoute>
                } 
              />
              
              {/* Admin Settings - Project Setup doesn't require active project */}
              <Route
                path="/admin/project-setup"
                element={
                  <LazyProtectedRoute>
                    <ProjectSetup />
                  </LazyProtectedRoute>
                }
              />
              
              {/* Environment Setup - requires active project */}
              <Route
                path="/admin/environment-setup"
                element={
                  <LazyProjectProtectedRoute>
                    <EnvironmentSetup />
                  </LazyProjectProtectedRoute>
                }
              />
              
              {/* Test Design - all require active project */}
              <Route 
                path="/test-design/api-repository" 
                element={
                  <LazyProjectProtectedRoute>
                    <APIRepository />
                  </LazyProjectProtectedRoute>
                } 
              />
              <Route
                path="/test-design/api-repository/create"
                element={
                  <LazyProjectProtectedRoute>
                    <APIRepositoryDetails />
                  </LazyProjectProtectedRoute>
                }
              />
              <Route 
                path="/test-design/test-suite" 
                element={
                  <LazyProjectProtectedRoute>
                    <TestSuite />
                  </LazyProjectProtectedRoute>
                } 
              />
              <Route
                path="/test-design/test-suite/create"
                element={
                  <LazyProjectProtectedRoute>
                    <TestSuiteDetails />
                  </LazyProjectProtectedRoute>
                }
              />
              <Route 
                path="/test-design/test-package" 
                element={
                  <LazyProjectProtectedRoute>
                    <TestPackage />
                  </LazyProjectProtectedRoute>
                } 
              />
              <Route
                path="/test-design/test-package/create"
                element={
                  <LazyProjectProtectedRoute>
                    <TestPackageDetails />
                  </LazyProjectProtectedRoute>
                }
              />
              <Route 
                path="/test-design/test-case" 
                element={
                  <LazyProjectProtectedRoute>
                    <TestCase />
                  </LazyProjectProtectedRoute>
                } 
              />
              <Route
                path="/test-design/test-case/create"
                element={
                  <LazyProjectProtectedRoute>
                    <TestCaseDetails />
                  </LazyProjectProtectedRoute>
                }
              />
              <Route
                path="/test-design/functions-variables"
                element={
                  <LazyProjectProtectedRoute>
                    <FunctionsVariables />
                  </LazyProjectProtectedRoute>
                }
              />
              <Route
                path="/test-design/bulk-upload"
                element={
                  <LazyProjectProtectedRoute>
                    <BulkUpload />
                  </LazyProjectProtectedRoute>
                }
              />
              
              {/* Test Execution & Results - require active project */}
              <Route 
                path="/test-execution" 
                element={
                  <LazyProjectProtectedRoute>
                    <TestExecution />
                  </LazyProjectProtectedRoute>
                } 
              />
              
              <Route 
                path="/test-execution/results/:executionId" 
                element={
                  <LazyProjectProtectedRoute>
                    <ExecutionDetailsView />
                  </LazyProjectProtectedRoute>
                } 
              />
              
              <Route 
                path="/test-execution/results/:executionId/:testCaseId" 
                element={
                  <LazyProjectProtectedRoute>
                    <TestCaseDetailsView />
                  </LazyProjectProtectedRoute>
                } 
              />
              
              <Route 
                path="/test-results" 
                element={
                  <LazyProjectProtectedRoute>
                    <TestResults />
                  </LazyProjectProtectedRoute>
                } 
              />

              {/* Admin User Settings - doesn't require active project */}
              <Route
                path="/admin/user-settings"
                element={
                  <LazyProtectedRoute>
                    <UserManagement />
                  </LazyProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default EnhancedApp;