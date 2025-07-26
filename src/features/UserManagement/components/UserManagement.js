import React, { useState, useMemo } from 'react';
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical,
  FiShield,
  FiKey,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiUserCheck,
  FiLock
} from 'react-icons/fi';
import { 
  FaUserShield, 
  FaUserTie, 
  FaUserCog, 
  FaUser,
  FaCrown,
  FaProjectDiagram
} from 'react-icons/fa';
import { useAuthStore } from '../../../stores/authStore';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import Badge from '../../../components/UI/Badge';

// Mock data for users
const mockUsers = [
  {
    id: 1,
    username: 'superadmin',
    email: 'superadmin@apitest.com',
    firstName: 'Super',
    lastName: 'Administrator',
    role: 'SUPER_ADMIN',
    status: 'active',
    lastLogin: '2024-01-20T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    projects: ['Project Alpha', 'Project Beta', 'Project Gamma'],
    permissions: {
      testDesign: { enabled: true, sections: ['api-repository', 'test-case', 'test-suite', 'test-package', 'functions-variables'] },
      testExecution: { enabled: true, sections: ['execution', 'results'] },
      admin: { enabled: true, sections: ['project-setup', 'environment-setup', 'user-settings'] },
      dashboard: { enabled: true }
    }
  },
  {
    id: 2,
    username: 'admin1',
    email: 'admin@apitest.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'ADMIN',
    status: 'active',
    lastLogin: '2024-01-19T14:20:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    projects: ['Project Alpha', 'Project Beta'],
    permissions: {
      testDesign: { enabled: true, sections: ['api-repository', 'test-case', 'test-suite', 'test-package'] },
      testExecution: { enabled: true, sections: ['execution', 'results'] },
      admin: { enabled: true, sections: ['project-setup', 'environment-setup'] },
      dashboard: { enabled: true }
    }
  },
  {
    id: 3,
    username: 'designer1',
    email: 'designer@apitest.com',
    firstName: 'Sarah',
    lastName: 'Designer',
    role: 'TEST_DESIGNER',
    status: 'active',
    lastLogin: '2024-01-20T09:15:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    projects: ['Project Alpha'],
    permissions: {
      testDesign: { enabled: true, sections: ['api-repository', 'test-case', 'test-suite'] },
      testExecution: { enabled: true, sections: ['execution', 'results'] },
      admin: { enabled: false, sections: [] },
      dashboard: { enabled: true }
    }
  },
  {
    id: 4,
    username: 'executor1',
    email: 'executor@apitest.com',
    firstName: 'Mike',
    lastName: 'Executor',
    role: 'EXECUTOR',
    status: 'active',
    lastLogin: '2024-01-20T11:45:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    projects: ['Project Alpha', 'Project Beta'],
    permissions: {
      testDesign: { enabled: false, sections: [] },
      testExecution: { enabled: true, sections: ['execution', 'results'] },
      admin: { enabled: false, sections: [] },
      dashboard: { enabled: true }
    }
  },
  {
    id: 5,
    username: 'designer2',
    email: 'designer2@apitest.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    role: 'TEST_DESIGNER',
    status: 'inactive',
    lastLogin: '2024-01-15T16:30:00Z',
    createdAt: '2024-01-08T00:00:00Z',
    projects: ['Project Beta'],
    permissions: {
      testDesign: { enabled: true, sections: ['api-repository', 'test-case'] },
      testExecution: { enabled: true, sections: ['execution'] },
      admin: { enabled: false, sections: [] },
      dashboard: { enabled: true }
    }
  }
];

const roleHierarchy = {
  'SUPER_ADMIN': 4,
  'ADMIN': 3,
  'TEST_DESIGNER': 2,
  'EXECUTOR': 1
};

const roleConfig = {
  'SUPER_ADMIN': {
    label: 'Super Admin',
    icon: <FaCrown className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Full system access with all privileges'
  },
  'ADMIN': {
    label: 'Admin',
    icon: <FaUserShield className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Administrative access with user management'
  },
  'TEST_DESIGNER': {
    label: 'Test Designer',
    icon: <FaUserCog className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Test creation and design capabilities'
  },
  'EXECUTOR': {
    label: 'Executor',
    icon: <FaUser className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Test execution and viewing results only'
  }
};

const availableProjects = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta'];

const permissionSections = {
  testDesign: {
    label: 'Test Design',
    sections: {
      'api-repository': 'API Repository',
      'test-case': 'Test Case',
      'test-suite': 'Test Suite',
      'test-package': 'Test Package',
      'functions-variables': 'Functions & Variables'
    }
  },
  testExecution: {
    label: 'Test Execution',
    sections: {
      'execution': 'Test Execution',
      'results': 'Test Results'
    }
  },
  admin: {
    label: 'Administration',
    sections: {
      'project-setup': 'Project Setup',
      'environment-setup': 'Environment Setup',
      'user-settings': 'User Management'
    }
  }
};

const UserManagement = () => {
  const { role: currentUserRole } = useAuthStore();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'EXECUTOR',
    status: 'active',
    projects: [],
    permissions: {
      testDesign: { enabled: false, sections: [] },
      testExecution: { enabled: false, sections: [] },
      admin: { enabled: false, sections: [] },
      dashboard: { enabled: true }
    }
  });

  // Check if current user can manage other users
  const canManageUsers = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN';
  
  // Check if current user can manage a specific role
  const canManageRole = (targetRole) => {
    if (currentUserRole === 'SUPER_ADMIN') return true;
    if (currentUserRole === 'ADMIN') return targetRole !== 'SUPER_ADMIN';
    return false;
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'EXECUTOR',
      status: 'active',
      projects: [],
      permissions: {
        testDesign: { enabled: false, sections: [] },
        testExecution: { enabled: false, sections: [] },
        admin: { enabled: false, sections: [] },
        dashboard: { enabled: true }
      }
    });
  };

  const handleCreateUser = () => {
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      ...formData,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    setUsers([...users, newUser]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditUser = () => {
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...selectedUser, ...formData }
        : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handlePasswordReset = () => {
    // In real implementation, this would call an API
    console.log('Password reset for user:', selectedUser.username);
    setShowPasswordResetModal(false);
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      projects: user.projects,
      permissions: user.permissions
    });
    setShowEditModal(true);
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      permissions: user.permissions
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
          sections: prev.permissions[category].sections.includes(section)
            ? prev.permissions[category].sections.filter(s => s !== section)
            : [...prev.permissions[category].sections, section]
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
          enabled: !prev.permissions[category].enabled
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
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-indigo-100 text-sm">Total Users</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(roleConfig).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length;
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
              {Object.entries(roleConfig).map(([role, config]) => (
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
                    <Badge className={roleConfig[user.role].color}>
                      <span className="flex items-center">
                        {roleConfig[user.role].icon}
                        <span className="ml-1">{roleConfig[user.role].label}</span>
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={user.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                    }>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.projects.slice(0, 2).map((project, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          {project}
                        </Badge>
                      ))}
                      {user.projects.length > 2 && (
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
                            <FiEdit className="h-4 w-4" />
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(roleConfig).map(([role, config]) => (
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!formData.username || !formData.email || !formData.firstName || !formData.lastName}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal - Similar structure to Create Modal */}
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
                {Object.entries(roleConfig).map(([role, config]) => (
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
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
              <div className={`p-2 rounded-lg ${roleConfig[selectedUser?.role]?.color || 'bg-gray-100'}`}>
                {roleConfig[selectedUser?.role]?.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900">{roleConfig[selectedUser?.role]?.label}</div>
                <div className="text-sm text-gray-600">{roleConfig[selectedUser?.role]?.description}</div>
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
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUsers(users.map(user => 
                  user.id === selectedUser.id 
                    ? { ...user, permissions: formData.permissions }
                    : user
                ));
                setShowPermissionsModal(false);
              }}
            >
              Save Permissions
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
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
            >
              Delete User
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
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement; 