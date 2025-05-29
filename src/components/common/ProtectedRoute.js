// src/components/common/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  
  // Double check with token existence for backward compatibility during migration
  const hasValidAuth = isAuthenticated && token;
  
  if (!hasValidAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
