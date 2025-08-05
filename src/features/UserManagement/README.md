# User Management Integration

## Overview

The User Management module has been completely integrated with the backend APIs, removing all mock data and implementing real-time user management capabilities with granular permission control.

## Features

### ✅ **Enhanced Authentication**
- **Enhanced Login**: Uses `/api/v1/auth/login` with permission data
- **Permission Storage**: Stores user permissions and assigned projects
- **Token Management**: Enhanced JWT token handling with user data

### ✅ **User Management Operations**
- **Create Users**: Full user creation with roles, projects, and permissions
- **Update Users**: Edit user details, roles, and project assignments
- **Delete Users**: Safe user deletion with SUPER_ADMIN protection
- **Password Reset**: Temporary password generation for users
- **Permission Management**: Granular permission control per user

### ✅ **Advanced Features**
- **Search & Filtering**: Real-time search across username, email, first name, last name
- **Role-based Filtering**: Filter users by role (SUPER_ADMIN, ADMIN, TEST_DESIGNER, EXECUTOR)
- **Status Filtering**: Filter by user status (ACTIVE, INACTIVE)
- **Project Assignment**: Multi-project user assignment
- **Statistics**: Real-time user statistics and role distribution

### ✅ **Permission System**
- **Granular Permissions**: Module and section-level access control
- **Role Hierarchy**: Hierarchical role management
- **Permission Categories**: testDesign, testExecution, admin, dashboard
- **Section Permissions**: Fine-grained section access within categories

## API Integration

### **Authentication Endpoints**
```javascript
// Enhanced login with permissions
const response = await userManagement.auth.login(username, password);

// Enhanced sign up
const response = await userManagement.auth.signUp(userData);

// Logout
const response = await userManagement.auth.logout();
```

### **User Management Endpoints**
```javascript
// Get all users with search and filtering
const response = await userManagement.users.getAll(search, role, status, page, limit);

// Create new user
const response = await userManagement.users.create(userData);

// Update user
const response = await userManagement.users.update(userId, userData);

// Delete user
const response = await userManagement.users.delete(userId);

// Update user permissions
const response = await userManagement.users.updatePermissions(userId, permissions);

// Reset user password
const response = await userManagement.users.resetPassword(userId);
```

### **Configuration Endpoints**
```javascript
// Get available projects
const response = await userManagement.config.getProjects();

// Get role configuration
const response = await userManagement.config.getRoles();
```

## Permission System

### **Default Permission Matrix**
```json
{
  "SUPER_ADMIN": {
    "testDesign": {"enabled": true, "sections": ["*"]},
    "testExecution": {"enabled": true, "sections": ["*"]},
    "admin": {"enabled": true, "sections": ["*"]},
    "dashboard": {"enabled": true}
  },
  "ADMIN": {
    "testDesign": {"enabled": true, "sections": ["*"]},
    "testExecution": {"enabled": true, "sections": ["*"]},
    "admin": {"enabled": true, "sections": ["userSettings"]},
    "dashboard": {"enabled": true}
  },
  "TEST_DESIGNER": {
    "testDesign": {"enabled": true, "sections": ["*"]},
    "testExecution": {"enabled": true, "sections": ["results"]},
    "admin": {"enabled": false, "sections": []},
    "dashboard": {"enabled": true}
  },
  "EXECUTOR": {
    "testDesign": {"enabled": false, "sections": []},
    "testExecution": {"enabled": true, "sections": ["execution", "results"]},
    "admin": {"enabled": false, "sections": []},
    "dashboard": {"enabled": true}
  }
}
```

### **Permission Categories**
- **testDesign**: API Repository, Test Case, Test Suite, Test Package, Functions & Variables
- **testExecution**: Test Execution, Test Results
- **admin**: Project Setup, Environment Setup, User Management
- **dashboard**: Dashboard access

## Components

### **UserManagement Component**
- **Real-time Data**: Loads users, projects, and role configuration from APIs
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Loading indicators for all operations
- **Permission-based Access**: Only users with appropriate permissions can access
- **Responsive Design**: Mobile-friendly interface

### **PermissionGuard Component**
```javascript
import PermissionGuard from '../../components/common/PermissionGuard';

// Basic permission check
<PermissionGuard category="testDesign" section="test-case">
  <TestCasesComponent />
</PermissionGuard>

// With fallback content
<PermissionGuard 
  category="admin" 
  section="userSettings"
  fallback={<AccessDeniedMessage />}
>
  <UserManagementComponent />
</PermissionGuard>
```

### **usePermissions Hook**
```javascript
import { usePermissions } from '../../hooks/usePermissions';

const { canAccess, canPerform, canManageUsers } = usePermissions();

// Check specific permission
if (canAccess('testDesign', 'test-case')) {
  // User can access test cases
}

// Check action permission
if (canPerform('create', 'testCase')) {
  // User can create test cases
}

// Check user management
if (canManageUsers()) {
  // User can manage other users
}
```

## Usage Examples

### **Permission-based UI Rendering**
```javascript
import { usePermissions } from '../../hooks/usePermissions';

const Dashboard = () => {
  const { canAccess, canPerform } = usePermissions();

  return (
    <div>
      {canAccess('testDesign') && (
        <div>
          <h2>Test Design</h2>
          {canPerform('create', 'testCase') && (
            <button>Create Test Case</button>
          )}
        </div>
      )}
      
      {canAccess('admin', 'userSettings') && (
        <div>
          <h2>User Management</h2>
          <UserManagementComponent />
        </div>
      )}
    </div>
  );
};
```

### **User Management Operations**
```javascript
import { userManagement } from '../../utils/api';

// Create a new user
const createUser = async (userData) => {
  try {
    const response = await userManagement.users.create({
      username: 'newuser',
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      role: 'EXECUTOR',
      status: 'ACTIVE',
      projects: ['Project Alpha', 'Project Beta'],
      permissions: {
        testDesign: { enabled: false, sections: [] },
        testExecution: { enabled: true, sections: ['execution', 'results'] },
        admin: { enabled: false, sections: [] },
        dashboard: { enabled: true }
      }
    });
    
    if (response.result) {
      toast.success('User created successfully');
    }
  } catch (error) {
    toast.error('Failed to create user');
  }
};

// Update user permissions
const updatePermissions = async (userId, permissions) => {
  try {
    const response = await userManagement.users.updatePermissions(userId, permissions);
    
    if (response.result) {
      toast.success('Permissions updated successfully');
    }
  } catch (error) {
    toast.error('Failed to update permissions');
  }
};
```

## Error Handling

### **API Error Handling**
- **Network Errors**: Graceful handling of network failures
- **Validation Errors**: User-friendly error messages
- **Permission Errors**: Access denied messages
- **Server Errors**: Generic error handling with retry options

### **User Feedback**
- **Toast Notifications**: Success and error messages
- **Loading States**: Visual feedback during operations
- **Form Validation**: Real-time validation feedback
- **Confirmation Dialogs**: Safe deletion and destructive operations

## Security Features

### **Access Control**
- **Permission-based Access**: Granular permission checking
- **Role-based Protection**: SUPER_ADMIN protection
- **Input Validation**: Comprehensive form validation
- **Token Management**: Secure token handling

### **Data Protection**
- **Password Security**: Secure password handling
- **Permission Validation**: Server-side permission validation
- **Session Management**: Proper session handling
- **CSRF Protection**: Built-in CSRF protection

## Performance Optimizations

### **Data Loading**
- **Parallel Loading**: Load users, projects, and roles in parallel
- **Caching**: Cache role configuration and project data
- **Pagination**: Efficient large dataset handling
- **Search Optimization**: Optimized search algorithms

### **UI Performance**
- **Virtual Scrolling**: For large user lists
- **Debounced Search**: Optimized search input
- **Lazy Loading**: Load data on demand
- **Memoization**: Optimized re-renders

## Testing

### **Unit Tests**
- **Component Testing**: Test all user management components
- **Hook Testing**: Test usePermissions hook
- **API Testing**: Test all API integrations
- **Permission Testing**: Test permission logic

### **Integration Tests**
- **End-to-End Testing**: Complete user management workflows
- **API Integration**: Test real API endpoints
- **Permission Integration**: Test permission-based access
- **Error Handling**: Test error scenarios

## Deployment

### **Environment Configuration**
```javascript
// API base URL configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Debug logging (development only)
const debugLog = (message, data = null) => {
  if (import.meta.env.DEV && import.meta.env.VITE_API_DEBUG === 'true') {
    console.log(`[API Debug] ${message}`, data || '');
  }
};
```

### **Backend Requirements**
- **Enhanced User API**: All user management endpoints
- **Permission System**: Granular permission support
- **Project Management**: Project assignment capabilities
- **Role Configuration**: Role hierarchy support

## Migration Guide

### **From Mock Data**
1. **Remove Mock Data**: All mock data has been removed
2. **Update Imports**: Use new API service imports
3. **Add Error Handling**: Implement comprehensive error handling
4. **Update Components**: Use new permission-based components

### **Backend Integration**
1. **Deploy Enhanced Backend**: Ensure all APIs are available
2. **Initialize System**: Call `/api/v1/admin/initialize`
3. **Test Endpoints**: Verify all endpoints work correctly
4. **Monitor Performance**: Monitor API performance

## Troubleshooting

### **Common Issues**
1. **API Connection**: Check network connectivity and API base URL
2. **Permission Errors**: Verify user permissions and role assignments
3. **Data Loading**: Check API responses and error handling
4. **Token Issues**: Verify JWT token validity and storage

### **Debug Information**
```javascript
// Enable debug logging
VITE_API_DEBUG=true

// Check user permissions
console.log('User permissions:', useAuthStore.getState().permissions);

// Check API responses
console.log('API response:', response);
```

## Future Enhancements

### **Planned Features**
- **Bulk Operations**: Bulk user import/export
- **Advanced Filtering**: More sophisticated filtering options
- **Audit Logging**: User action audit trails
- **Email Integration**: Email notifications for user actions
- **Advanced Permissions**: More granular permission controls

### **Performance Improvements**
- **Real-time Updates**: WebSocket integration for real-time updates
- **Advanced Caching**: Redis-based caching for better performance
- **Optimized Queries**: Database query optimization
- **CDN Integration**: Static asset optimization

---

**🎉 The User Management module is now fully integrated with the backend APIs and ready for production use!** 