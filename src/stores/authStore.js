import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      userId: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
      rememberedUsername: '',
      permissions: {}, // Enhanced permissions
      assignedProjects: [], // User's assigned projects

      // Actions
      login: (userData) => {
        const permissions = userData.user?.permissions || {};
        const assignedProjects = Array.isArray(userData.user?.projects) ? userData.user.projects : [];
        set({
          user: userData.user,
          token: userData.token,
          userId: userData.userId,
          role: userData.role,
          isAuthenticated: true,
          isLoading: false,
          permissions,
          assignedProjects
        });
        // Keep localStorage in sync so guards work after reloads without re-login
        try {
          localStorage.setItem('permissions', JSON.stringify(permissions));
          localStorage.setItem('assignedProjects', JSON.stringify(assignedProjects));
          const current = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          localStorage.setItem('auth-storage', JSON.stringify({
            state: {
              ...(current.state || {}),
              token: userData.token,
              userId: userData.userId,
              user: userData.user,
              role: userData.role,
              isAuthenticated: true,
              permissions,
              assignedProjects
            },
            version: 0
          }));
        } catch (_) {
          // ignore persistence errors
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          userId: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          permissions: {},
          assignedProjects: []
        });
        
        // Clear localStorage for backward compatibility
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('activeProject');
        localStorage.removeItem('permissions');
        
        // Trigger storage event for backward compatibility
        window.dispatchEvent(new Event('storage'));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setRememberMe: (remember, username = '') => {
        set({ 
          rememberMe: remember,
          rememberedUsername: remember ? username : ''
        });
      },

      // Enhanced permission checking
      hasPermission: (category, section = null) => {
        const { permissions } = get();
        const categoryPermissions = permissions?.[category];
        
        // If category missing or disabled, deny
        if (!categoryPermissions || categoryPermissions.enabled !== true) {
          return false;
        }
        
        // If no section specified, category enabled is enough
        if (!section) {
          return true;
        }
        
        // Normalize sections to a safe array
        const sections = Array.isArray(categoryPermissions.sections)
          ? categoryPermissions.sections
          : [];
        
        // Empty sections or wildcard means all sections allowed
        if (sections.length === 0 || sections.includes('*')) {
          return true;
        }
        
        // Otherwise, require explicit section permission
        return sections.includes(section);
      },

      // Get user permissions
      getPermissions: () => {
        return get().permissions;
      },

      // Get assigned projects
      getAssignedProjects: () => {
        return get().assignedProjects;
      },

      // Computed getters
      getAuthHeaders: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      // Initialize from existing localStorage (migration helper)
      initializeFromLocalStorage: () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');
        const assignedProjects = JSON.parse(localStorage.getItem('assignedProjects') || '[]');
        
        if (token && userId) {
          set({
            token,
            userId,
            isAuthenticated: true,
            user: { id: userId }, // Basic user object
            permissions,
            assignedProjects
          });
        }
        
        if (rememberedUsername) {
          set({
            rememberMe: true,
            rememberedUsername,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        rememberedUsername: state.rememberedUsername,
        permissions: state.permissions,
        assignedProjects: state.assignedProjects,
      }),
    }
  )
); 