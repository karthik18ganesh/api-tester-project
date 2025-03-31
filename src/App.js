import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EnvironmentSetup from './components/EnvironmentSetup';
import Layout from './components/Layout';

function App() {
  return (
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
        path="/environment-setup"
        element={
          <Layout>
            <EnvironmentSetup />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
