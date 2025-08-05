import React from 'react';
import { useAuthStore } from '../../stores/authStore';

/**
 * PermissionGuard component for controlling access based on user permissions
 * 
 * @param {Object} props
 * @param {string} props.category - Permission category (e.g., 'testDesign', 'admin', 'testExecution')
 * @param {string} props.section - Specific section within the category (optional)
 * @param {React.ReactNode} props.children - Content to render if permission is granted
 * @param {React.ReactNode} props.fallback - Content to render if permission is denied (optional)
 * @param {boolean} props.requireAll - If true, requires both category and section permissions (default: false)
 */
const PermissionGuard = ({ 
  category, 
  section = null, 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasPermission } = useAuthStore();

  // Check if user has the required permission
  const hasAccess = hasPermission(category, section);

  // If requireAll is true, we need both category and section permissions
  const shouldRender = requireAll 
    ? (hasPermission(category) && (section ? hasPermission(category, section) : true))
    : hasAccess;

  if (shouldRender) {
    return <>{children}</>;
  }

  // Return fallback content or null
  return fallback ? <>{fallback}</> : null;
};

export default PermissionGuard; 