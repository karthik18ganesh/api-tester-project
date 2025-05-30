import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-toastify';

export const useProjectStore = create(
  persist(
    (set, get) => ({
      // State
      activeProject: null,
      projects: [],
      isLoading: false,
      error: null,

      // Actions
      setActiveProject: (project) => {
        set({ 
          activeProject: project,
          error: null 
        });
      },

      clearActiveProject: () => {
        set({ 
          activeProject: null,
          error: null 
        });
      },

      setProjects: (projects) => {
        set({ 
          projects: Array.isArray(projects) ? projects : [],
          error: null 
        });
      },

      addProject: (project) => {
        const { projects } = get();
        set({ 
          projects: [...projects, project],
          error: null 
        });
      },

      updateProject: (updatedProject) => {
        const { projects, activeProject } = get();
        const updatedProjects = projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        );
        
        set({ 
          projects: updatedProjects,
          error: null,
          // Update active project if it's the one being updated
          activeProject: activeProject?.id === updatedProject.id ? updatedProject : activeProject
        });
      },

      removeProject: (projectId) => {
        const { projects, activeProject } = get();
        const updatedProjects = projects.filter(p => p.id !== projectId);
        
        set({ 
          projects: updatedProjects,
          error: null,
          // Clear active project if it's the one being removed
          activeProject: activeProject?.id === projectId ? null : activeProject
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // Computed getters
      hasActiveProject: () => {
        const { activeProject } = get();
        return !!activeProject;
      },

      getActiveProjectId: () => {
        const { activeProject } = get();
        return activeProject?.id || null;
      },

      getActiveProjectName: () => {
        const { activeProject } = get();
        return activeProject?.name || activeProject?.projectName || null;
      },

      // Cleanup method to remove old localStorage key
      cleanupOldLocalStorage: () => {
        localStorage.removeItem('activeProject');
      },
    }),
    {
      name: 'project-storage', // Zustand persistence key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeProject: state.activeProject,
        projects: state.projects,
      }),
    }
  )
); 