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

      // Actions
      login: (userData) => {
        set({
          user: userData.user,
          token: userData.token,
          userId: userData.userId,
          role: userData.role,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          userId: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Clear localStorage for backward compatibility
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('activeProject');
        
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
        
        if (token && userId) {
          set({
            token,
            userId,
            isAuthenticated: true,
            user: { id: userId }, // Basic user object
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
      }),
    }
  )
); 