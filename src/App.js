import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import TestSuite from "./components/TestSuite";
import Dashboard from "./components/Dashboard";
import EnvironmentSetup from "./components/EnvironmentSetup";
import ProjectSetup from "./components/ProjectSetup";
import Layout from "./components/Layout";
import TestSuiteDetails from "./components/TestSuiteDetails";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/test-design/test-suite"
          element={
            <Layout>
              <TestSuite />
            </Layout>
          }
        />
        <Route
          path="/test-design/test-suite/create"
          element={<TestSuiteDetails />}
        />
        <Route
          path="/environment-setup"
          element={
            <Layout>
              <EnvironmentSetup />
            </Layout>
          }
        />
        <Route
          path="/project-setup"
          element={
            <Layout>
              <ProjectSetup />
            </Layout>
          }
        />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
