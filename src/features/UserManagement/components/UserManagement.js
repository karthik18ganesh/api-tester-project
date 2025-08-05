import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiSearch, 
  FiUserPlus, 
  FiEdit2, 
  FiTrash2, 
  FiShield, 
  FiKey,
  FiEye,
  FiMoreVertical,
  FiAlertTriangle,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  FaCrown, 
  FaUserShield, 
  FaUserCog, 
  FaUser,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useAuthStore } from '../../../stores/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { userManagement } from '../../../utils/api';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import Badge from '../../../components/UI/Badge';

// Helper function to transform API role data to UI format
const transformRoleData = (apiRoleData) => {
  if (!apiRoleData || !apiRoleData.roles) return {};
  
  const roleIcons = {
    'SUPER_ADMIN': <FaCrown className="h-4 w-4" />,
    'ADMIN': <FaUserShield className="h-4 w-4" />,
    'TEST_DESIGNER': <FaUserCog className="h-4 w-4" />,
    'EXECUTOR': <FaUser className="h-4 w-4" />
  };
  
  const roleColors = {
    'SUPER_ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
    'ADMIN': 'bg-blue-100 text-blue-800 border-blue-200',
    'TEST_DESIGNER': 'bg-green-100 text-green-800 border-green-200',
    'EXECUTOR': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  const transformedRoles = {};
  Object.entries(apiRoleData.roles).forEach(([roleKey, roleData]) => {
    transformedRoles[roleKey] = {
      label: roleData.label,
      icon: roleIcons[roleKey] || <FaUser className="h-4 w-4" />,
      color: roleColors[roleKey] || 'bg-gray-100 text-gray-800 border-gray-200',
      description: roleData.description,
      hierarchy: roleData.hierarchy
    };
  });
  
  return transformedRoles;
};

// Helper function to transform API permission data to UI format
const transformPermissionData = (apiRoleData) => {
  if (!apiRoleData || !apiRoleData.permissionSections) return {};
  
  return apiRoleData.permissionSections;
};

const UserManagement = () => {
  const { role: currentUserRole } = useAuthStore();
  const { canManageUsers, canManageRole } = usePermissions();
  const [users, setUsers] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [roleConfiguration, setRoleConfiguration] = useState({});
  const [permissionSections, setPermissionSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    roleDistribution: {},
    statusDistribution: {}
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'EXECUTOR',
    status: 'ACTIVE',
    projects: [],
    permissions: {}
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Initialize permissions when permissionSections are loaded
  useEffect(() => {
    if (Object.keys(permissionSections).length > 0) {
      const defaultPermissions = {};
      Object.keys(permissionSections).forEach(category => {
        defaultPermissions[category] = {
          enabled: category === 'dashboard', // Only dashboard is enabled by default
          sections: []
        };
      });
      
      setFormData(prev => ({
        ...prev,
        permissions: defaultPermissions
      }));
    }
  }, [permissionSections]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load users, projects, and role configuration in parallel
      const [usersResponse, projectsResponse, rolesResponse] = await Promise.all([
        userManagement.users.getAll(),
        userManagement.config.getProjects(),
        userManagement.config.getRoles()
      ]);

      if (usersResponse.result) {
        setUsers(usersResponse.result.users || []);
        setPagination(usersResponse.result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        setStats(usersResponse.result.stats || { totalUsers: 0, roleDistribution: {}, statusDistribution: {} });
      }

      if (projectsResponse.result) {
        setAvailableProjects(projectsResponse.result || []);
      }

      if (rolesResponse.result) {
        // Transform the API response to the expected format
        const transformedRoles = transformRoleData(rolesResponse.result);
        const transformedPermissions = transformPermissionData(rolesResponse.result);
        
        setRoleConfiguration(transformedRoles);
        setPermissionSections(transformedPermissions);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load user management data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const resetForm = () => {
    // Initialize permissions structure based on available permission sections from API
    const defaultPermissions = {};
    Object.keys(permissionSections).forEach(category => {
      defaultPermissions[category] = {
        enabled: category === 'dashboard', // Only dashboard is enabled by default
        sections: []
      };
    });
    
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'EXECUTOR',
      status: 'ACTIVE',
      projects: [],
      permissions: defaultPermissions
    });
  };

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await userManagement.users.create(formData);
      
      if (response.result) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        resetForm();
        loadInitialData(); // Reload users
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await userManagement.users.update(selectedUser.id, formData);
      
      if (response.result) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        loadInitialData(); // Reload users
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await userManagement.users.delete(selectedUser.id);
      
      if (response.result !== null) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setSelectedUser(null);
        loadInitialData(); // Reload users
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await userManagement.users.resetPassword(selectedUser.id);
      
      if (response.result) {
        toast.success(`Password reset successful. Temporary password: ${response.result.temporaryPassword}`);
        setShowPasswordResetModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await userManagement.users.updatePermissions(selectedUser.id, formData.permissions);
      
      if (response.result) {
        toast.success('Permissions updated successfully');
        setShowPermissionsModal(false);
        setSelectedUser(null);
        resetForm();
        loadInitialData(); // Reload users
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    
    // Initialize permissions structure based on available permission sections from API
    const userPermissions = user.permissions || {};
    const mergedPermissions = {};
    
    Object.keys(permissionSections).forEach(category => {
      mergedPermissions[category] = {
        enabled: userPermissions[category]?.enabled || false,
        sections: userPermissions[category]?.sections || []
      };
    });
    
    setFormData({
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '', // Don't populate password for edit
      role: user.role || 'EXECUTOR',
      status: user.status || 'ACTIVE',
      projects: user.projects || [],
      permissions: mergedPermissions
    });
    setShowEditModal(true);
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    
    // Initialize permissions structure based on available permission sections from API
    const defaultPermissions = {};
    Object.keys(permissionSections).forEach(category => {
      defaultPermissions[category] = {
        enabled: false,
        sections: []
      };
    });
    
    // Merge with user's existing permissions, ensuring all categories are present
    const userPermissions = user.permissions || {};
    const mergedPermissions = {};
    
    Object.keys(permissionSections).forEach(category => {
      mergedPermissions[category] = {
        enabled: userPermissions[category]?.enabled || false,
        sections: userPermissions[category]?.sections || []
      };
    });
    
    setFormData({
      ...formData,
      permissions: mergedPermissions
    });
    setShowPermissionsModal(true);
  };

  const togglePermissionSection = (category, section) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          enabled: prev.permissions[category]?.enabled || false,
          sections: (prev.permissions[category]?.sections || []).includes(section)
            ? (prev.permissions[category]?.sections || []).filter(s => s !== section)
            : [...(prev.permissions[category]?.sections || []), section]
        }
      }
    }));
  };

  const togglePermissionCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          enabled: !(prev.permissions[category]?.enabled || false),
          sections: prev.permissions[category]?.sections || []
        }
      }
    }));
  };

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <FiRefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-gray-600">Loading user management data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <FiUsers className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-indigo-100 mt-1">
                Manage users, roles, and permissions across your organization
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-indigo-100 text-sm">Total Users</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(roleConfiguration).map(([role, config]) => {
          const count = stats.roleDistribution[role] || 0;
          return (
            <div key={role} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{config.label}</div>
                </div>
                <div className={`p-3 rounded-lg ${config.color}`}>
                  {config.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              {Object.entries(roleConfiguration).map(([role, config]) => (
                <option key={role} value={role}>{config.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Create User Button */}
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <FiUserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username} • {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={roleConfiguration[user.role]?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
                      <span className="flex items-center">
                        {roleConfiguration[user.role]?.icon}
                        <span className="ml-1">{roleConfiguration[user.role]?.label || user.role}</span>
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={user.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                    }>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.projects?.slice(0, 2).map((project, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          {project}
                        </Badge>
                      ))}
                      {user.projects?.length > 2 && (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                          +{user.projects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {canManageRole(user.role) && (
                        <>
                          <button
                            onClick={() => openPermissionsModal(user)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Manage Permissions"
                          >
                            <FiShield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Edit User"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPasswordResetModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Reset Password"
                          >
                            <FiKey className="h-4 w-4" />
                          </button>
                          {user.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete User"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Enter username"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email"
              required
            />
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter first name"
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter last name"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(roleConfiguration).map(([role, config]) => (
                  canManageRole(role) && (
                    <option key={role} value={role}>{config.label}</option>
                  )
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Access</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableProjects.map((project) => (
                <label key={project} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.projects.includes(project)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, projects: [...formData.projects, project]});
                      } else {
                        setFormData({...formData, projects: formData.projects.filter(p => p !== project)});
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{project}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.password || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Enter username"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email"
              required
            />
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter first name"
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!canManageRole(formData.role)}
              >
                {Object.entries(roleConfiguration).map(([role, config]) => (
                  canManageRole(role) && (
                    <option key={role} value={role}>{config.label}</option>
                  )
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Access</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableProjects.map((project) => (
                <label key={project} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.projects.includes(project)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, projects: [...formData.projects, project]});
                      } else {
                        setFormData({...formData, projects: formData.projects.filter(p => p !== project)});
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{project}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Manage Permissions - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${roleConfiguration[selectedUser?.role]?.color || 'bg-gray-100'}`}>
                {roleConfiguration[selectedUser?.role]?.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900">{roleConfiguration[selectedUser?.role]?.label}</div>
                <div className="text-sm text-gray-600">{roleConfiguration[selectedUser?.role]?.description}</div>
              </div>
            </div>
          </div>

          {Object.entries(permissionSections).map(([category, categoryData]) => (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.permissions[category]?.enabled}
                    onChange={() => togglePermissionCategory(category)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-gray-900">{categoryData.label}</span>
                </label>
              </div>
              
              {formData.permissions[category]?.enabled && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(categoryData.sections).map(([sectionKey, sectionLabel]) => (
                    <label key={sectionKey} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.permissions[category]?.sections?.includes(sectionKey)}
                        onChange={() => togglePermissionSection(category, sectionKey)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{sectionLabel}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowPermissionsModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-red-600">
            <FiAlertTriangle className="h-6 w-6" />
            <span className="font-medium">This action cannot be undone</span>
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? 
            This will permanently remove their account and all associated data.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        title="Reset Password"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-orange-600">
            <FiKey className="h-6 w-6" />
            <span className="font-medium">Password Reset</span>
          </div>
          <p className="text-gray-600">
            A temporary password will be generated and sent to <strong>{selectedUser?.email}</strong>. 
            The user will be required to change their password on next login.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowPasswordResetModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement; 