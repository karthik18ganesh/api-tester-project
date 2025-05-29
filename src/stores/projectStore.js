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
        
        // Show success toast
        if (project) {
          toast.success(`Project "${project.name || project.projectName}" is now active`);
        }
        
        // Trigger storage event for backward compatibility with existing components
        window.dispatchEvent(new Event('storage'));
      },

      clearActiveProject: () => {
        set({ 
          activeProject: null,
          error: null 
        });
        
        // Trigger storage event for backward compatibility
        window.dispatchEvent(new Event('storage'));
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
        
        // Trigger storage event if active project was cleared
        if (activeProject?.id === projectId) {
          window.dispatchEvent(new Event('storage'));
        }
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

      // Migration helper for backward compatibility
      initializeFromLocalStorage: () => {
        const storedProject = localStorage.getItem('activeProject');
        if (storedProject) {
          try {
            const project = JSON.parse(storedProject);
            set({ activeProject: project });
          } catch (error) {
            console.error('Error parsing stored project:', error);
            localStorage.removeItem('activeProject');
          }
        }
      },

      // For backward compatibility - sync to localStorage
      syncToLocalStorage: () => {
        const { activeProject } = get();
        if (activeProject) {
          localStorage.setItem('activeProject', JSON.stringify(activeProject));
        } else {
          localStorage.removeItem('activeProject');
        }
      },
    }),
    {
      name: 'project-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeProject: state.activeProject,
        projects: state.projects,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync to old localStorage format for backward compatibility
        if (state?.activeProject) {
          localStorage.setItem('activeProject', JSON.stringify(state.activeProject));
        }
      },
    }
  )
); 