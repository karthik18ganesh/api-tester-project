import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook for permission checking and management
 * Provides easy access to permission-related functionality throughout the application
 */
export const usePermissions = () => {
  const { 
    hasPermission, 
    getPermissions, 
    getAssignedProjects, 
    role: currentUserRole 
  } = useAuthStore();

  /**
   * Check if user has permission for a specific category and section
   * @param {string} category - Permission category (e.g., 'testDesign', 'admin')
   * @param {string} section - Specific section within the category (optional)
   * @returns {boolean} - True if user has permission
   */
  const canAccess = (category, section = null) => {
    return hasPermission(category, section);
  };

  /**
   * Check if user can perform a specific action
   * @param {string} action - Action to check (e.g., 'create', 'edit', 'delete', 'view')
   * @param {string} resource - Resource type (e.g., 'testCase', 'user', 'project')
   * @returns {boolean} - True if user can perform the action
   */
  const canPerform = (action, resource) => {
    // Map actions to permission categories and sections
    const permissionMap = {
      // Test Design permissions
      'create': {
        'testCase': hasPermission('testDesign', 'test-case'),
        'testSuite': hasPermission('testDesign', 'test-suite'),
        'testPackage': hasPermission('testDesign', 'test-package'),
        'apiRepository': hasPermission('testDesign', 'api-repository'),
        'functionVariable': hasPermission('testDesign', 'functions-variables')
      },
      'edit': {
        'testCase': hasPermission('testDesign', 'test-case'),
        'testSuite': hasPermission('testDesign', 'test-suite'),
        'testPackage': hasPermission('testDesign', 'test-package'),
        'apiRepository': hasPermission('testDesign', 'api-repository'),
        'functionVariable': hasPermission('testDesign', 'functions-variables'),
        'user': hasPermission('admin', 'userSettings')
      },
      'delete': {
        'testCase': hasPermission('testDesign', 'test-case'),
        'testSuite': hasPermission('testDesign', 'test-suite'),
        'testPackage': hasPermission('testDesign', 'test-package'),
        'apiRepository': hasPermission('testDesign', 'api-repository'),
        'functionVariable': hasPermission('testDesign', 'functions-variables'),
        'user': hasPermission('admin', 'userSettings')
      },
      'view': {
        'testCase': hasPermission('testDesign', 'test-case'),
        'testSuite': hasPermission('testDesign', 'test-suite'),
        'testPackage': hasPermission('testDesign', 'test-package'),
        'apiRepository': hasPermission('testDesign', 'api-repository'),
        'functionVariable': hasPermission('testDesign', 'functions-variables'),
        'user': hasPermission('admin', 'userSettings'),
        'execution': hasPermission('testExecution', 'execution'),
        'results': hasPermission('testExecution', 'results')
      },
      'execute': {
        'testCase': hasPermission('testExecution', 'execution'),
        'testSuite': hasPermission('testExecution', 'execution'),
        'testPackage': hasPermission('testExecution', 'execution')
      }
    };

    return permissionMap[action]?.[resource] || false;
  };

  /**
   * Check if user can manage other users
   * @returns {boolean} - True if user can manage users
   */
  const canManageUsers = () => {
    return hasPermission('admin', 'userSettings') || 
           currentUserRole === 'SUPER_ADMIN' || 
           currentUserRole === 'ADMIN';
  };

  /**
   * Check if user can manage a specific role
   * @param {string} targetRole - Role to check management permissions for
   * @returns {boolean} - True if user can manage the role
   */
  const canManageRole = (targetRole) => {
    if (currentUserRole === 'SUPER_ADMIN') return true;
    if (currentUserRole === 'ADMIN') return targetRole !== 'SUPER_ADMIN';
    return false;
  };

  /**
   * Check if user can access project setup
   * @returns {boolean} - True if user can access project setup
   */
  const canAccessProjectSetup = () => {
    return hasPermission('admin', 'project-setup');
  };

  /**
   * Check if user can access environment setup
   * @returns {boolean} - True if user can access environment setup
   */
  const canAccessEnvironmentSetup = () => {
    return hasPermission('admin', 'environment-setup');
  };

  /**
   * Check if user can access dashboard
   * @returns {boolean} - True if user can access dashboard
   */
  const canAccessDashboard = () => {
    return hasPermission('dashboard');
  };

  /**
   * Get all user permissions
   * @returns {Object} - User permissions object
   */
  const getUserPermissions = () => {
    return getPermissions();
  };

  /**
   * Get user's assigned projects
   * @returns {Array} - Array of assigned project names
   */
  const getUserProjects = () => {
    return getAssignedProjects();
  };

  /**
   * Check if user has access to a specific project
   * @param {string} projectName - Name of the project to check
   * @returns {boolean} - True if user has access to the project
   */
  const hasProjectAccess = (projectName) => {
    const userProjects = getUserProjects();
    return userProjects.includes(projectName) || 
           currentUserRole === 'SUPER_ADMIN' || 
           currentUserRole === 'ADMIN';
  };

  return {
    // Permission checking methods
    canAccess,
    canPerform,
    canManageUsers,
    canManageRole,
    canAccessProjectSetup,
    canAccessEnvironmentSetup,
    canAccessDashboard,
    hasProjectAccess,
    
    // Data access methods
    getUserPermissions,
    getUserProjects,
    
    // Current user info
    currentUserRole
  };
}; 