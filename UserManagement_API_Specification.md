# UserManagement API Specification

## Overview
This document outlines the **ACTUAL IMPLEMENTED** APIs for the UserManagement module that has been integrated with the existing signup/authentication system. The module provides a unified solution for user management, role-based access control, permissions, and project assignments.

## Base URL
```
/api/v1
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔄 **ACTUAL IMPLEMENTED ENDPOINTS**

### **AUTHENTICATION ENDPOINTS**

#### 1. Enhanced Sign Up
```
POST /api/v1/auth/sign-up
```

**Request Body:**
```json
{
  "data": {
    "username": "newuser",
    "passwordHash": "password123",
    "email": "newuser@apitest.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "roleId": 1,
      "roleName": "EXECUTOR"
    }
  }
}
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "code": "200",
    "message": "User Created Successfully",
    "data": {
      "userId": 6,
      "username": "newuser",
      "email": "newuser@apitest.com",
      "firstName": "John",
      "lastName": "Doe",
      "userStatus": "ACTIVE",
      "role": {
        "roleId": 1,
        "roleName": "EXECUTOR"
      },
      "assignedProjects": [],
      "permissions": {}
    }
  }
}
```

#### 2. Enhanced Login
```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "data": {
    "username": "superadmin",
    "password": "password123"
  }
}
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "code": "200",
    "message": "User Logged in Successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "user": {
        "userId": 1,
        "username": "superadmin",
        "email": "superadmin@apitest.com",
        "firstName": "Super",
        "lastName": "Administrator",
        "userStatus": "ACTIVE",
        "role": {
          "roleId": 1,
          "roleName": "SUPER_ADMIN"
        },
        "assignedProjects": ["Project Alpha", "Project Beta"],
        "permissions": {
          "testDesign": {
            "enabled": true,
            "sections": ["api-repository", "test-case", "test-suite", "test-package", "functions-variables"]
          },
          "testExecution": {
            "enabled": true,
            "sections": ["execution", "results"]
          },
          "admin": {
            "enabled": true,
            "sections": ["project-setup", "environment-setup", "user-settings"]
          },
          "dashboard": {
            "enabled": true
          }
        }
      }
    }
  }
}
```

#### 3. Logout
```
POST /api/v1/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "code": "200",
    "message": "User Logged out Successfully",
    "data": "Bearer <token>"
  }
}
```

### **USER MANAGEMENT ENDPOINTS**

#### 4. Get All Users (Enhanced)
```
GET /api/v1/users
```

**Query Parameters:**
- `search` (string, optional): Search term for username, email, first name, or last name
- `role` (string, optional): Filter by role (SUPER_ADMIN, ADMIN, TEST_DESIGNER, EXECUTOR)
- `status` (string, optional): Filter by status (ACTIVE, INACTIVE)
- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of items per page (default: 20)

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "users": [
      {
        "id": 1,
        "username": "superadmin",
        "email": "superadmin@apitest.com",
        "firstName": "Super",
        "lastName": "Administrator",
        "role": "SUPER_ADMIN",
        "status": "ACTIVE",
        "lastLogin": "2024-01-20T10:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "projects": ["Project Alpha", "Project Beta", "Project Gamma"],
        "permissions": {
          "testDesign": {
            "enabled": true,
            "sections": ["api-repository", "test-case", "test-suite", "test-package", "functions-variables"]
          },
          "testExecution": {
            "enabled": true,
            "sections": ["execution", "results"]
          },
          "admin": {
            "enabled": true,
            "sections": ["project-setup", "environment-setup", "user-settings"]
          },
          "dashboard": {
            "enabled": true
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    },
    "stats": {
      "totalUsers": 5,
      "roleDistribution": {
        "SUPER_ADMIN": 1,
        "ADMIN": 1,
        "TEST_DESIGNER": 2,
        "EXECUTOR": 1
      },
      "statusDistribution": {
        "ACTIVE": 4,
        "INACTIVE": 1
      }
    }
  }
}
```

#### 5. Get All Users (Simple - Legacy Compatible)
```
GET /api/v1/users-simple
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": [
    {
      "userId": 1,
      "username": "superadmin",
      "email": "superadmin@apitest.com",
      "firstName": "Super",
      "lastName": "Administrator",
      "userStatus": "ACTIVE",
      "role": {
        "roleId": 1,
        "roleName": "SUPER_ADMIN"
      },
      "assignedProjects": ["Project Alpha", "Project Beta"],
      "permissions": {}
    }
  ]
}
```

#### 6. Get User by ID
```
GET /api/v1/users/{userId}
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "id": 1,
    "username": "superadmin",
    "email": "superadmin@apitest.com",
    "firstName": "Super",
    "lastName": "Administrator",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "lastLogin": "2024-01-20T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "projects": ["Project Alpha", "Project Beta", "Project Gamma"],
    "permissions": {
      "testDesign": {
        "enabled": true,
        "sections": ["api-repository", "test-case", "test-suite", "test-package", "functions-variables"]
      },
      "testExecution": {
        "enabled": true,
        "sections": ["execution", "results"]
      },
      "admin": {
        "enabled": true,
        "sections": ["project-setup", "environment-setup", "user-settings"]
      },
      "dashboard": {
        "enabled": true
      }
    }
  }
}
```

#### 7. Create User (Enhanced)
```
POST /api/v1/users
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@apitest.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "role": "EXECUTOR",
  "status": "ACTIVE",
  "projects": ["Project Alpha", "Project Beta"],
  "permissions": {
    "testDesign": {
      "enabled": false,
      "sections": []
    },
    "testExecution": {
      "enabled": true,
      "sections": ["execution", "results"]
    },
    "admin": {
      "enabled": false,
      "sections": []
    },
    "dashboard": {
      "enabled": true
    }
  }
}
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "id": 6,
    "username": "newuser",
    "email": "newuser@apitest.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EXECUTOR",
    "status": "ACTIVE",
    "lastLogin": null,
    "createdAt": "2024-01-21T15:30:00Z",
    "projects": ["Project Alpha", "Project Beta"],
    "permissions": {
      "testDesign": {
        "enabled": false,
        "sections": []
      },
      "testExecution": {
        "enabled": true,
        "sections": ["execution", "results"]
      },
      "admin": {
        "enabled": false,
        "sections": []
      },
      "dashboard": {
        "enabled": true
      }
    }
  }
}
```

#### 8. Update User
```
PUT /api/v1/users/{userId}
```

**Request Body:**
```json
{
  "username": "updateduser",
  "email": "updateduser@apitest.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "TEST_DESIGNER",
  "status": "ACTIVE",
  "projects": ["Project Alpha", "Project Beta", "Project Gamma"],
  "permissions": {
    "testDesign": {
      "enabled": true,
      "sections": ["api-repository", "test-case", "test-suite"]
    },
    "testExecution": {
      "enabled": true,
      "sections": ["execution", "results"]
    },
    "admin": {
      "enabled": false,
      "sections": []
    },
    "dashboard": {
      "enabled": true
    }
  }
}
```

#### 9. Delete User
```
DELETE /api/v1/users/{userId}
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": null
}
```

#### 10. Update User Permissions
```
PATCH /api/v1/users/{userId}/permissions
```

**Request Body:**
```json
{
  "permissions": {
    "testDesign": {
      "enabled": true,
      "sections": ["api-repository", "test-case", "test-suite"]
    },
    "testExecution": {
      "enabled": true,
      "sections": ["execution", "results"]
    },
    "admin": {
      "enabled": false,
      "sections": []
    },
    "dashboard": {
      "enabled": true
    }
  }
}
```

#### 11. Reset User Password
```
POST /api/v1/users/{userId}/reset-password
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "temporaryPassword": "TempPass123!",
    "expiresAt": "2024-01-22T15:30:00Z"
  }
}
```

#### 12. Get Available Projects
```
GET /api/v1/users/projects
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": [
    "Project Alpha",
    "Project Beta", 
    "Project Gamma",
    "Project Delta"
  ]
}
```

#### 13. Get Role Configuration
```
GET /api/v1/users/roles
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "roles": {
      "SUPER_ADMIN": {
        "label": "Super Admin",
        "description": "Full system access with all privileges",
        "hierarchy": 4
      },
      "ADMIN": {
        "label": "Admin", 
        "description": "Administrative access with user management",
        "hierarchy": 3
      },
      "TEST_DESIGNER": {
        "label": "Test Designer",
        "description": "Test creation and design capabilities", 
        "hierarchy": 2
      },
      "EXECUTOR": {
        "label": "Executor",
        "description": "Test execution and viewing results only",
        "hierarchy": 1
      }
    },
    "permissionSections": {
      "testDesign": {
        "label": "Test Design",
        "sections": {
          "api-repository": "API Repository",
          "test-case": "Test Case", 
          "test-suite": "Test Suite",
          "test-package": "Test Package",
          "functions-variables": "Functions & Variables"
        }
      },
      "testExecution": {
        "label": "Test Execution",
        "sections": {
          "execution": "Test Execution",
          "results": "Test Results"
        }
      },
      "admin": {
        "label": "Administration", 
        "sections": {
          "project-setup": "Project Setup",
          "environment-setup": "Environment Setup",
          "user-settings": "User Management"
        }
      }
    }
  }
}
```

### **LEGACY ENDPOINTS (Backward Compatibility)**

#### 14. Get All Users (Legacy)
```
GET /api/v1/legacy/users
```

#### 15. Get User by ID (Legacy)
```
GET /api/v1/legacy/users/{userId}
```

#### 16. Update User (Legacy)
```
PATCH /api/v1/legacy/users/update
```

### **ADMIN ENDPOINTS**

#### 17. Initialize System
```
POST /api/v1/admin/initialize
```

**Response:**
```json
{
  "responseMetaData": {
    "referenceId": "d44f30ac-7e9a-4489-aaaf-eb2e48c0f9bb",
    "timestamp": "2025-08-04T07:39:30.897640Z"
  },
  "result": {
    "code": "200",
    "message": "System initialized successfully",
    "data": "All default roles, permissions, and user migrations completed"
  }
}
```

---

## 🔄 **FRONTEND INTEGRATION GUIDE**

### **Step 1: Update Authentication Flow**

**Old Authentication:**
```javascript
// Old login endpoint
const login = async (username, password) => {
  const response = await fetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { username, password }
    })
  });
  return response.json();
};
```

**New Enhanced Authentication:**
```javascript
// New enhanced login endpoint
const login = async (username, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { username, password }
    })
  });
  const result = await response.json();
  
  // Store enhanced user data with permissions
  if (result.result.code === "200") {
    localStorage.setItem('user', JSON.stringify(result.result.data.user));
    localStorage.setItem('token', result.result.data.token);
    localStorage.setItem('permissions', JSON.stringify(result.result.data.user.permissions));
  }
  
  return result;
};
```

### **Step 2: Implement Permission-Based UI**

```javascript
// Permission checking utility
const hasPermission = (category, section = null) => {
  const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');
  const categoryPermissions = permissions[category];
  
  if (!categoryPermissions || !categoryPermissions.enabled) {
    return false;
  }
  
  if (!section) {
    return categoryPermissions.enabled;
  }
  
  return categoryPermissions.sections.includes('*') || 
         categoryPermissions.sections.includes(section);
};

// Usage in components
const TestDesignComponent = () => {
  if (!hasPermission('testDesign', 'testCases')) {
    return <div>Access denied</div>;
  }
  return <TestCasesComponent />;
};

const AdminPanel = () => {
  if (!hasPermission('admin', 'userSettings')) {
    return <div>Access denied</div>;
  }
  return <UserManagementComponent />;
};
```

### **Step 3: Update User Management**

```javascript
// Enhanced user creation
const createUser = async (userData) => {
  const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      role: userData.role,
      status: userData.status,
      projects: userData.projects,
      permissions: userData.permissions
    })
  });
  return response.json();
};

// Enhanced user listing with search and filtering
const getUsers = async (search = '', role = '', status = '', page = 1, limit = 20) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/v1/users?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Step 4: Role Configuration Integration**

```javascript
// Get role configuration for UI
const getRoleConfiguration = async () => {
  const response = await fetch('/api/v1/users/roles', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};

// Get available projects
const getAvailableProjects = async () => {
  const response = await fetch('/api/v1/users/projects', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

---

## 🔐 **SECURITY & PERMISSIONS**

### **Default Permission Matrix:**
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

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Backend Deployment:**
- [ ] Run database migration scripts (`database_migration.sql`)
- [ ] Deploy enhanced application code
- [ ] Call `/api/v1/admin/initialize` to set up system
- [ ] Test all endpoints for functionality
- [ ] Verify backward compatibility

### **Frontend Integration:**
- [ ] Update authentication endpoints to use `/api/v1/auth/*`
- [ ] Implement permission-based UI components
- [ ] Update user management to use new endpoints
- [ ] Test all user management features
- [ ] Verify permission system works correctly

### **Testing:**
- [ ] Test legacy endpoints still work
- [ ] Test new enhanced endpoints
- [ ] Test permission-based access control
- [ ] Test user creation and management
- [ ] Test role configuration and project assignment

---

## 📞 **SUPPORT**

For integration support:
1. Check application logs for detailed error messages
2. Verify database connectivity and schema
3. Test individual endpoints to isolate issues
4. Use the rollback plan if necessary
5. Contact the development team with specific error details

**🎉 The enhanced user management system is now fully integrated and ready for frontend implementation!** 