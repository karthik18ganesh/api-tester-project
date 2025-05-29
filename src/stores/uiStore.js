import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Global Loading States
  globalLoading: false,
  loadingMessages: {},

  // Modal States
  modals: {
    confirmation: {
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'danger', // 'danger', 'warning', 'info'
    },
    globalSearch: {
      isOpen: false,
      searchTerm: '',
      searchResults: [],
      isSearching: false,
      selectedIndex: -1,
    },
  },

  // Navigation & Breadcrumbs
  breadcrumbs: [],
  currentPage: '',

  // Notifications
  notifications: {
    count: 0,
    items: [],
  },

  // Theme & Preferences
  sidebarCollapsed: false,
  theme: 'light',

  // Actions for Loading States
  setGlobalLoading: (loading, message = '') => {
    set({ 
      globalLoading: loading,
      loadingMessages: loading && message ? 
        { ...get().loadingMessages, global: message } : 
        { ...get().loadingMessages }
    });
  },

  setComponentLoading: (componentId, loading, message = '') => {
    const { loadingMessages } = get();
    const newMessages = { ...loadingMessages };
    
    if (loading) {
      newMessages[componentId] = message || 'Loading...';
    } else {
      delete newMessages[componentId];
    }
    
    set({ loadingMessages: newMessages });
  },

  isComponentLoading: (componentId) => {
    const { loadingMessages } = get();
    return !!loadingMessages[componentId];
  },

  getLoadingMessage: (componentId) => {
    const { loadingMessages } = get();
    return loadingMessages[componentId] || '';
  },

  // Actions for Confirmation Modal
  openConfirmationModal: (config) => {
    set({
      modals: {
        ...get().modals,
        confirmation: {
          isOpen: true,
          title: config.title || 'Confirm Action',
          message: config.message || 'Are you sure?',
          onConfirm: config.onConfirm || (() => {}),
          onCancel: config.onCancel || (() => {}),
          confirmText: config.confirmText || 'Confirm',
          cancelText: config.cancelText || 'Cancel',
          type: config.type || 'danger',
        },
      },
    });
  },

  closeConfirmationModal: () => {
    set({
      modals: {
        ...get().modals,
        confirmation: {
          ...get().modals.confirmation,
          isOpen: false,
        },
      },
    });
  },

  // Actions for Global Search Modal
  openSearchModal: () => {
    set({
      modals: {
        ...get().modals,
        globalSearch: {
          ...get().modals.globalSearch,
          isOpen: true,
        },
      },
    });
  },

  closeSearchModal: () => {
    set({
      modals: {
        ...get().modals,
        globalSearch: {
          isOpen: false,
          searchTerm: '',
          searchResults: [],
          isSearching: false,
          selectedIndex: -1,
        },
      },
    });
  },

  setSearchTerm: (term) => {
    set({
      modals: {
        ...get().modals,
        globalSearch: {
          ...get().modals.globalSearch,
          searchTerm: term,
          selectedIndex: -1,
        },
      },
    });
  },

  setSearchResults: (results) => {
    set({
      modals: {
        ...get().modals,
        globalSearch: {
          ...get().modals.globalSearch,
          searchResults: results,
          selectedIndex: -1,
        },
      },
    });
  },

  setSearching: (isSearching) => {
    set({
      modals: {
        ...get().modals,
        globalSearch: {
          ...get().modals.globalSearch,
          isSearching,
        },
      },
    });
  },

  setSearchSelectedIndex: (index) => {
    set({
      modals: {
        ...get().modals,
        globalSearch: {
          ...get().modals.globalSearch,
          selectedIndex: index,
        },
      },
    });
  },

  // Actions for Breadcrumbs
  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },

  addBreadcrumb: (breadcrumb) => {
    const { breadcrumbs } = get();
    set({ breadcrumbs: [...breadcrumbs, breadcrumb] });
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  // Actions for Notifications
  setNotificationCount: (count) => {
    set({
      notifications: {
        ...get().notifications,
        count,
      },
    });
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    
    set({
      notifications: {
        count: notifications.count + 1,
        items: [newNotification, ...notifications.items],
      },
    });
  },

  markNotificationAsRead: (notificationId) => {
    const { notifications } = get();
    const updatedItems = notifications.items.map(item =>
      item.id === notificationId ? { ...item, read: true } : item
    );
    const unreadCount = updatedItems.filter(item => !item.read).length;
    
    set({
      notifications: {
        count: unreadCount,
        items: updatedItems,
      },
    });
  },

  clearAllNotifications: () => {
    set({
      notifications: {
        count: 0,
        items: [],
      },
    });
  },

  // Actions for Sidebar
  toggleSidebar: () => {
    set({ sidebarCollapsed: !get().sidebarCollapsed });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  // Actions for Theme
  setTheme: (theme) => {
    set({ theme });
  },

  toggleTheme: () => {
    const { theme } = get();
    set({ theme: theme === 'light' ? 'dark' : 'light' });
  },
})); 