// Import all stores at the top level
import { useAuthStore } from './authStore';
import { useProjectStore } from './projectStore';

// Export all stores
export { useAuthStore } from './authStore';
export { useProjectStore } from './projectStore';
export { useUIStore } from './uiStore';

// Store initialization helper
export const initializeStores = () => {
  // Initialize auth store from localStorage for migration
  const { initializeFromLocalStorage: initAuth } = useAuthStore.getState();
  const { initializeFromLocalStorage: initProject } = useProjectStore.getState();
  
  initAuth();
  initProject();
};

// Store cleanup helper (useful for testing or logout)
export const resetAllStores = () => {
  const { logout } = useAuthStore.getState();
  const { clearActiveProject } = useProjectStore.getState();
  
  logout();
  clearActiveProject();
}; 