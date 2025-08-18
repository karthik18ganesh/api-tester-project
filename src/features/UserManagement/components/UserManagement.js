import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  FiRefreshCw,
  FiMail,
  FiUser,
  FiLock,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiGrid,
  FiChevronDown
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

// UNCONTROLLED Input Component - NO STATE, NO RE-RENDERS
const UncontrolledInput = ({ 
  label, 
  defaultValue = '', 
  type = "text", 
  placeholder, 
  icon: Icon, 
  required = false, 
  error = null,
  inputRef
}) => {
  const internalRef = useRef(null);
  const ref = inputRef || internalRef;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`
            w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 
            border-2 ${error ? 'border-red-300' : 'border-gray-200'} 
            rounded-xl bg-white text-gray-900 placeholder-gray-400
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none
            hover:border-gray-300 transition-colors text-base
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <FiAlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// UNCONTROLLED Select Component
const UncontrolledSelect = ({ 
  label, 
  defaultValue = '', 
  options = [], 
  required = false, 
  error = null,
  selectRef
}) => {
  const internalRef = useRef(null);
  const ref = selectRef || internalRef;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          defaultValue={defaultValue}
          className={`
            w-full pl-4 pr-10 py-3 
            border-2 ${error ? 'border-red-300' : 'border-gray-200'} 
            rounded-xl bg-white text-gray-900
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none
            hover:border-gray-300 transition-colors text-base
            appearance-none cursor-pointer
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <FiChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <FiAlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const UserManagement = () => {
  const { role: currentUserRole } = useAuthStore();
  const { canManageUsers, canManageRole } = usePermissions();
  
  // Basic state - NO FORM STATE
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

  // REFS for uncontrolled inputs - NO STATE UPDATES
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);
  const statusRef = useRef(null);
  
  // ONLY PERMISSIONS IN STATE (for checkboxes that need visual feedback)
  const [permissions, setPermissions] = useState({});
  const [selectedProjects, setSelectedProjects] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [pagination.page, pagination.limit]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      const [usersResponse, projectsResponse, rolesResponse] = await Promise.all([
        userManagement.users.getAll('', '', '', pagination.page, pagination.limit),
        userManagement.config.getProjects(),
        userManagement.config.getRoles()
      ]);

      if (usersResponse.result) {
        setUsers(usersResponse.result.users);
        setPagination(prev => ({
          ...prev,
          total: usersResponse.result.total,
          totalPages: usersResponse.result.totalPages
        }));
        setStats(usersResponse.result.stats);
      }

      if (projectsResponse.result) {
        setAvailableProjects(projectsResponse.result);
      }

      if (rolesResponse.result) {
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

  // Memoized role options for selects
  const roleOptions = useMemo(() => {
    return Object.entries(roleConfiguration).map(([roleKey, roleData]) => ({
      value: roleKey,
      label: roleData.label
    }));
  }, [roleConfiguration]);

  const statusOptions = useMemo(() => [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ], []);

  // Helper to reset form refs
  const resetFormRefs = () => {
    if (usernameRef.current) usernameRef.current.value = '';
    if (emailRef.current) emailRef.current.value = '';
    if (firstNameRef.current) firstNameRef.current.value = '';
    if (lastNameRef.current) lastNameRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
    if (roleRef.current) roleRef.current.value = 'EXECUTOR';
    if (statusRef.current) statusRef.current.value = 'ACTIVE';
    
    setSelectedProjects([]);
    
    const defaultPermissions = {};
    Object.keys(permissionSections).forEach(category => {
      defaultPermissions[category] = {
        enabled: category === 'dashboard',
        sections: []
      };
    });
    setPermissions(defaultPermissions);
  };

  // Helper to get form data from refs
  const getFormDataFromRefs = () => {
    return {
      username: usernameRef.current?.value || '',
      email: emailRef.current?.value || '',
      firstName: firstNameRef.current?.value || '',
      lastName: lastNameRef.current?.value || '',
      password: passwordRef.current?.value || '',
      role: roleRef.current?.value || 'EXECUTOR',
      status: statusRef.current?.value || 'ACTIVE',
      projects: selectedProjects,
      permissions: permissions
    };
  };

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      
      const formData = getFormDataFromRefs();
      
      if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const response = await userManagement.users.create(formData);
      
      if (response.result) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        resetFormRefs();
        loadInitialData();
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
      
      const formData = getFormDataFromRefs();
      
      if (!formData.username || !formData.email || !formData.firstName || !formData.lastName) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const response = await userManagement.users.update(selectedUser.id, formData);
      
      if (response.result) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        resetFormRefs();
        loadInitialData();
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
        loadInitialData();
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
      
      const response = await userManagement.users.updatePermissions(selectedUser.id, permissions);
      
      if (response.result) {
        toast.success('Permissions updated successfully');
        setShowPermissionsModal(false);
        setSelectedUser(null);
        resetFormRefs();
        loadInitialData();
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
    
    // Set form ref values directly
    setTimeout(() => {
      if (usernameRef.current) usernameRef.current.value = user.username || '';
      if (emailRef.current) emailRef.current.value = user.email || '';
      if (firstNameRef.current) firstNameRef.current.value = user.firstName || '';
      if (lastNameRef.current) lastNameRef.current.value = user.lastName || '';
      if (roleRef.current) roleRef.current.value = user.role || 'EXECUTOR';
      if (statusRef.current) statusRef.current.value = user.status || 'ACTIVE';
    }, 0);
    
    setSelectedProjects(user.projects || []);
    
    const userPermissions = user.permissions || {};
    const mergedPermissions = {};
    
    Object.keys(permissionSections).forEach(category => {
      mergedPermissions[category] = {
        enabled: userPermissions[category]?.enabled || false,
        sections: userPermissions[category]?.sections || []
      };
    });
    
    setPermissions(mergedPermissions);
    setShowEditModal(true);
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    
    const userPermissions = user.permissions || {};
    const mergedPermissions = {};
    
    Object.keys(permissionSections).forEach(category => {
      mergedPermissions[category] = {
        enabled: userPermissions[category]?.enabled || false,
        sections: userPermissions[category]?.sections || []
      };
    });
    
    setPermissions(mergedPermissions);
    setShowPermissionsModal(true);
  };

  const togglePermissionSection = useCallback((category, section) => {
    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: prev[category]?.enabled || false,
        sections: (prev[category]?.sections || []).includes(section)
          ? (prev[category]?.sections || []).filter(s => s !== section)
          : [...(prev[category]?.sections || []), section]
      }
    }));
  }, []);

  const togglePermissionCategory = useCallback((category) => {
    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !(prev[category]?.enabled || false),
        sections: prev[category]?.sections || []
      }
    }));
  }, []);

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
        {Object.entries(roleConfiguration).map(([roleKey, roleData]) => (
          <div key={roleKey} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${roleData.color}`}>
                {roleData.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.roleDistribution?.[roleKey] || 0}
                </div>
                <div className="text-sm text-gray-600">{roleData.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 w-full sm:w-80"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-300 hover:border-gray-300"
            >
              <option value="all">All Roles</option>
              {Object.entries(roleConfiguration).map(([roleKey, roleData]) => (
                <option key={roleKey} value={roleKey}>{roleData.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-300 hover:border-gray-300"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <Button
            onClick={() => {
              resetFormRefs();
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <FiUserPlus className="h-5 w-5" />
            <span>Add New User</span>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Projects</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border-2 ${roleConfiguration[user.role]?.color}`}>
                      {roleConfiguration[user.role]?.icon}
                      <span>{roleConfiguration[user.role]?.label}</span>
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${
                      user.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      {user.projects?.length > 0 ? `${user.projects.length} projects` : 'No projects'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {canManageRole(user.role) && (
                        <>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openPermissionsModal(user)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Manage Permissions"
                          >
                            <FiShield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPasswordResetModal(true);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* FIXED Create User Modal with UNCONTROLLED INPUTS */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <FiUserPlus className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <p className="text-sm text-gray-500">Add a new user to your organization</p>
            </div>
          </div>
        }
        size="xl"
      >
        <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-emerald-500 p-2 rounded-xl">
                    <FiUser className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Personal Information</h4>
                    <p className="text-sm text-gray-600">Basic user details and contact information</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UncontrolledInput
                    label="Username"
                    placeholder="Enter unique username"
                    icon={FiUser}
                    required
                    inputRef={usernameRef}
                  />
                  <UncontrolledInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    icon={FiMail}
                    required
                    inputRef={emailRef}
                  />
                  <UncontrolledInput
                    label="First Name"
                    placeholder="Enter first name"
                    required
                    inputRef={firstNameRef}
                  />
                  <UncontrolledInput
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                    inputRef={lastNameRef}
                  />
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-500 p-2 rounded-xl">
                    <FiLock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Account Settings</h4>
                    <p className="text-sm text-gray-600">Security and access configuration</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UncontrolledInput
                    label="Password"
                    type="password"
                    placeholder="Enter secure password"
                    icon={FiLock}
                    required
                    inputRef={passwordRef}
                  />
                  <UncontrolledSelect
                    label="Role"
                    defaultValue="EXECUTOR"
                    options={roleOptions}
                    required
                    selectRef={roleRef}
                  />
                  <UncontrolledSelect
                    label="Status"
                    defaultValue="ACTIVE"
                    options={statusOptions}
                    required
                    selectRef={statusRef}
                  />
                </div>
              </div>

              {/* Project Assignment Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-500 p-2 rounded-xl">
                    <FiGrid className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Project Assignment</h4>
                    <p className="text-sm text-gray-600">Select projects this user can access</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableProjects.map((project) => {
                    const projectId = typeof project === 'string' ? project : project.projectId || project.id;
                    const projectName = typeof project === 'string' ? project : project.projectName || project.name;
                    
                    return (
                      <label key={projectId} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer border border-purple-200 hover:border-purple-300">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(projectId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects(prev => [...prev, projectId]);
                            } else {
                              setSelectedProjects(prev => prev.filter(p => p !== projectId));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">{projectName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex-shrink-0 flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200 bg-white">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
              className="px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FiUserPlus className="h-4 w-4" />
                  <span>Create User</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* FIXED Edit User Modal with UNCONTROLLED INPUTS */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FiEdit2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <p className="text-sm text-gray-500">Update user information for {selectedUser?.firstName} {selectedUser?.lastName}</p>
            </div>
          </div>
        }
        size="xl"
      >
        <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-emerald-500 p-2 rounded-xl">
                    <FiUser className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Personal Information</h4>
                    <p className="text-sm text-gray-600">Update user details and contact information</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UncontrolledInput
                    label="Username"
                    placeholder="Enter username"
                    icon={FiUser}
                    required
                    inputRef={usernameRef}
                  />
                  <UncontrolledInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    icon={FiMail}
                    required
                    inputRef={emailRef}
                  />
                  <UncontrolledInput
                    label="First Name"
                    placeholder="Enter first name"
                    required
                    inputRef={firstNameRef}
                  />
                  <UncontrolledInput
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                    inputRef={lastNameRef}
                  />
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-500 p-2 rounded-xl">
                    <FiLock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Account Settings</h4>
                    <p className="text-sm text-gray-600">Update role and status settings</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UncontrolledSelect
                    label="Role"
                    options={roleOptions}
                    required
                    selectRef={roleRef}
                  />
                  <UncontrolledSelect
                    label="Status"
                    options={statusOptions}
                    required
                    selectRef={statusRef}
                  />
                </div>
              </div>

              {/* Project Assignment Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-500 p-2 rounded-xl">
                    <FiGrid className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Project Assignment</h4>
                    <p className="text-sm text-gray-600">Update project access permissions</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableProjects.map((project) => {
                    const projectId = typeof project === 'string' ? project : project.projectId || project.id;
                    const projectName = typeof project === 'string' ? project : project.projectName || project.name;
                    
                    return (
                      <label key={projectId} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer border border-purple-200 hover:border-purple-300">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(projectId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects(prev => [...prev, projectId]);
                            } else {
                              setSelectedProjects(prev => prev.filter(p => p !== projectId));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">{projectName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex-shrink-0 flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200 bg-white">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
              className="px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FiEdit2 className="h-4 w-4" />
                  <span>Update User</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Permissions Modal - REDESIGNED FOR SCALABILITY */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <FiShield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Manage Permissions</h3>
              <p className="text-sm text-gray-500 mt-1">Configure access rights for {selectedUser?.firstName} {selectedUser?.lastName}</p>
            </div>
          </div>
        }
        size="4xl"
      >
        <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px]">
          {/* User Role Info - Fixed Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-purple-100">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {selectedUser?.firstName?.charAt(0)}{selectedUser?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </h4>
                <p className="text-sm text-gray-600">@{selectedUser?.username} • {selectedUser?.email}</p>
              </div>
              <div className={`px-6 py-3 rounded-2xl ${roleConfiguration[selectedUser?.role]?.color || 'bg-gray-100'}`}>
                <div className="flex items-center space-x-3">
                  {roleConfiguration[selectedUser?.role]?.icon}
                  <span className="font-semibold text-lg">{roleConfiguration[selectedUser?.role]?.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Permissions Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {Object.entries(permissionSections).map(([category, categoryData]) => (
                <div key={category} className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b-2 border-gray-200">
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={permissions[category]?.enabled || false}
                          onChange={() => togglePermissionCategory(category)}
                          className="rounded-xl border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 h-6 w-6 group-hover:border-indigo-400 transition-colors"
                        />
                        {permissions[category]?.enabled && (
                          <FiCheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 text-xl group-hover:text-indigo-600 transition-colors">
                          {categoryData.label}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Configure {categoryData.label.toLowerCase()} access and permissions
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Category Sections */}
                  {permissions[category]?.enabled && (
                    <div className="p-8 space-y-4 bg-gradient-to-br from-white to-gray-50">
                      <div className="space-y-3">
                        {Object.entries(categoryData.sections).map(([sectionKey, sectionLabel]) => (
                          <label key={sectionKey} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-white transition-all cursor-pointer group border border-gray-100 hover:border-indigo-200 hover:shadow-md">
                            <input
                              type="checkbox"
                              checked={permissions[category]?.sections?.includes(sectionKey) || false}
                              onChange={() => togglePermissionSection(category, sectionKey)}
                              className="rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5 group-hover:border-indigo-400 transition-colors"
                            />
                            <span className="text-base text-gray-700 font-medium group-hover:text-indigo-600 transition-colors flex-1">
                              {sectionLabel}
                            </span>
                            {permissions[category]?.sections?.includes(sectionKey) && (
                              <FiCheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Permission Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-500 p-3 rounded-2xl">
                  <FiSettings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Permission Summary</h4>
                  <p className="text-sm text-gray-600">Overview of enabled permissions and sections</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(permissions).map(([category, permission]) => (
                  <div key={category} className="text-center bg-white rounded-2xl p-6 border border-blue-200">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 ${
                      permission.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {permission.enabled ? <FiCheckCircle className="h-6 w-6" /> : <FiXCircle className="h-6 w-6" />}
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-1">
                      {permissionSections[category]?.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {permission.enabled ? `${permission.sections.length} sections` : 'Disabled'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex-shrink-0 flex justify-end space-x-4 pt-6 mt-6 border-t-2 border-gray-200 bg-white">
            <Button
              variant="secondary"
              onClick={() => setShowPermissionsModal(false)}
              disabled={isSubmitting}
              className="px-8 py-4 text-base font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={isSubmitting}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-base font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-3">
                  <FiRefreshCw className="h-5 w-5 animate-spin" />
                  <span>Updating Permissions...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <FiShield className="h-5 w-5" />
                  <span>Update Permissions</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiTrash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete User Account
            </h3>
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FiTrash2 className="h-4 w-4" />
                  <span>Delete User</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        title="Reset Password"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiKey className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset User Password
            </h3>
            <p className="text-gray-600">
              Generate a new temporary password for <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowPasswordResetModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  <span>Resetting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FiKey className="h-4 w-4" />
                  <span>Reset Password</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;