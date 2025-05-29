// Export all stores
export { useAuthStore } from './authStore';
export { useProjectStore } from './projectStore';
export { useUIStore } from './uiStore';

// Store initialization helper
export const initializeStores = () => {
  // Import stores dynamically to avoid circular imports
  const { useAuthStore } = require('./authStore');
  const { useProjectStore } = require('./projectStore');
  
  // Initialize auth store from localStorage for migration
  const { initializeFromLocalStorage: initAuth } = useAuthStore.getState();
  const { initializeFromLocalStorage: initProject } = useProjectStore.getState();
  
  initAuth();
  initProject();
};

// Store cleanup helper (useful for testing or logout)
export const resetAllStores = () => {
  // Import stores dynamically to avoid circular imports
  const { useAuthStore } = require('./authStore');
  const { useProjectStore } = require('./projectStore');
  
  const { logout } = useAuthStore.getState();
  const { clearActiveProject } = useProjectStore.getState();
  
  logout();
  clearActiveProject();
}; 