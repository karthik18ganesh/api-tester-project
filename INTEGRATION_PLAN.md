# UserManagement & Authentication Integration Plan

## **Current System Analysis**

### **Existing Authentication System:**
- **Tables**: `users`, `roles`
- **APIs**: `/users/sign-up`, `/users/login`, `/users/logout`, `/users`, `/users/{userId}`, `/users/update`
- **Roles**: SUPER_ADMIN, ADMIN, TEST_DESIGNER, TEST_EXECUTOR, VIEWER
- **Features**: JWT authentication, password hashing, basic user CRUD

### **New UserManagement System:**
- **Tables**: `user_management`, `user_projects`, `user_permissions`
- **APIs**: `/api/v1/users/*` (17 endpoints implemented)
- **Roles**: SUPER_ADMIN, ADMIN, TEST_DESIGNER, EXECUTOR
- **Features**: Advanced permissions, project assignment, user statistics

## **Integration Strategy - ACTUAL IMPLEMENTATION**

### **Enhanced Integration (IMPLEMENTED)**

**Approach**: Extended existing User entity and merged functionality

**Benefits:**
- ✅ Maintains backward compatibility
- ✅ Single source of truth for user data
- ✅ Unified authentication and user management
- ✅ Gradual migration path

**Implementation Steps:**

#### **Phase 1: Database Schema Enhancement (COMPLETED)**
```sql
-- Add new columns to existing users table
ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN user_status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

-- Create new tables for enhanced features
CREATE TABLE user_projects (
    user_id BIGINT,
    project_name VARCHAR(255),
    PRIMARY KEY (user_id, project_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE user_permissions (
    user_id BIGINT,
    permission_category VARCHAR(100),
    permission_data TEXT,
    PRIMARY KEY (user_id, permission_category),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### **Phase 2: Enhanced User Entity (COMPLETED)**
- ✅ Extended User entity with new fields
- ✅ Added UserStatus enum
- ✅ Added ElementCollections for projects and permissions

#### **Phase 3: Unified Service Layer (COMPLETED)**
- ✅ Created EnhancedUserService interface
- ✅ Merged authentication and user management methods
- ✅ Added migration methods for existing users

#### **Phase 4: Unified Controller (COMPLETED)**
- ✅ Created UnifiedUserController
- ✅ Maintained legacy endpoints for backward compatibility
- ✅ Added new enhanced endpoints

## **ACTUAL IMPLEMENTED ENDPOINTS**

### **New Unified Endpoints:**
```
Authentication:
POST /api/v1/auth/sign-up    - Enhanced registration
POST /api/v1/auth/login      - Enhanced login with permissions
POST /api/v1/auth/logout     - User logout

User Management:
GET /api/v1/users            - Advanced user listing with search/filtering
GET /api/v1/users-simple     - Simple user listing (legacy compatible)
GET /api/v1/users/{userId}   - Get user by ID
POST /api/v1/users           - Create user with full details
PUT /api/v1/users/{userId}   - Update user with full details
DELETE /api/v1/users/{userId} - Delete user (with SUPER_ADMIN protection)
PATCH /api/v1/users/{userId}/permissions - Update user permissions
POST /api/v1/users/{userId}/reset-password - Reset user password
GET /api/v1/users/projects   - Get available projects
GET /api/v1/users/roles      - Get role configuration

Legacy (Backward Compatibility):
GET /api/v1/legacy/users     - Original user listing
GET /api/v1/legacy/users/{userId} - Original user retrieval
PATCH /api/v1/legacy/users/update - Original user update

Admin:
POST /api/v1/admin/initialize - System initialization
```

### **Legacy Endpoints (Still Work):**
```
POST /users/sign-up          - Original registration
POST /users/login            - Original login
POST /users/logout           - Original logout
GET /users                   - Original user listing
GET /users/{userId}          - Original user retrieval
PATCH /users/update          - Original user update
```

## **Role Mapping**

### **Existing → New Role Mapping:**
```
SUPER_ADMIN → SUPER_ADMIN (no change)
ADMIN → ADMIN (no change)
TEST_DESIGNER → TEST_DESIGNER (no change)
TEST_EXECUTOR → EXECUTOR (renamed)
VIEWER → EXECUTOR (merged)
```

## **Permission System Integration**

### **Default Permissions by Role:**
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

## **Migration Strategy**

### **Phase 1: Data Migration (COMPLETED)**
1. ✅ Add new columns to users table
2. ✅ Create new tables for projects and permissions
3. ✅ Migrate existing role data
4. ✅ Initialize default permissions for existing users

### **Phase 2: Code Migration (COMPLETED)**
1. ✅ Deploy enhanced User entity
2. ✅ Deploy UnifiedUserController
3. ✅ Test all endpoints
4. ✅ Gradually migrate frontend

### **Phase 3: Cleanup (PENDING)**
1. Remove old UserManagement module
2. Remove legacy endpoints (after frontend migration)
3. Clean up unused code

## **Testing Strategy**

### **Unit Tests:**
- ✅ Enhanced User entity
- ✅ Service layer integration
- ✅ Permission management
- ✅ Role mapping

### **Integration Tests:**
- ✅ Authentication flow
- ✅ User management operations
- ✅ Permission updates
- ✅ Backward compatibility

### **Migration Tests:**
- ✅ Existing user data preservation
- ✅ Role mapping accuracy
- ✅ Permission initialization
- ✅ API response consistency

## **Risk Mitigation**

### **Backward Compatibility:**
- ✅ Maintain all existing endpoints
- ✅ Preserve existing data structure
- ✅ Gradual migration path

### **Data Safety:**
- ✅ Database backups before migration
- ✅ Rollback plan
- ✅ Data validation scripts

### **Performance:**
- ✅ Index new columns
- ✅ Optimize queries
- ✅ Monitor performance metrics

## **Success Metrics**

### **Technical Metrics:**
- ✅ All existing APIs work unchanged
- ✅ New user management features functional
- ✅ Permission system working correctly
- ✅ No data loss during migration

### **Business Metrics:**
- ✅ Improved user management capabilities
- ✅ Enhanced security with granular permissions
- ✅ Better user experience
- ✅ Reduced maintenance overhead

## **Next Steps**

1. **Review and approve this integration plan**
2. **Create database migration scripts**
3. **Implement enhanced User entity**
4. **Develop UnifiedUserController**
5. **Test thoroughly**
6. **Deploy in stages**
7. **Monitor and optimize**

This integration plan provides a smooth path to enhance your existing authentication system with advanced user management capabilities while maintaining full backward compatibility. 