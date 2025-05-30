import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';

export const useBreadcrumbs = () => {
  const location = useLocation();
  const { activeProject } = useProjectStore();

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Always start with home/dashboard
    const items = [
      { label: 'Dashboard', path: '/dashboard', icon: 'home' }
    ];

    // Route mapping for better labels and paths
    const routeMap = {
      'admin': {
        label: 'Admin',
        children: {
          'project-setup': { label: 'Project Setup', path: '/admin/project-setup' },
          'environment-setup': { label: 'Environment Setup', path: '/admin/environment-setup' },
          'user-settings': { label: 'User Settings', path: '/admin/user-settings' }
        }
      },
      'test-design': {
        label: 'Test Design',
        children: {
          'api-repository': { 
            label: 'API Repository', 
            path: '/test-design/api-repository',
            children: {
              'create': { label: 'Create API', path: '/test-design/api-repository/create' },
              'edit': { label: 'Edit API' }
            }
          },
          'test-case': { 
            label: 'Test Case', 
            path: '/test-design/test-case',
            children: {
              'create': { label: 'Create Test Case', path: '/test-design/test-case/create' },
              'edit': { label: 'Edit Test Case' }
            }
          },
          'test-suite': { 
            label: 'Test Suite', 
            path: '/test-design/test-suite',
            children: {
              'create': { label: 'Create Test Suite', path: '/test-design/test-suite/create' },
              'edit': { label: 'Edit Test Suite' }
            }
          },
          'test-package': { 
            label: 'Test Package', 
            path: '/test-design/test-package',
            children: {
              'create': { label: 'Create Test Package', path: '/test-design/test-package/create' },
              'edit': { label: 'Edit Test Package' }
            }
          },
          'functions-variables': { label: 'Functions & Variables', path: '/test-design/functions-variables' }
        }
      },
      'test-execution': {
        label: 'Test Execution',
        path: '/test-execution',
        children: {
          'results': { 
            label: 'Results',
            children: {
              '[executionId]': { 
                label: 'Execution Details',
                children: {
                  '[testCaseId]': { label: 'Test Case Details' }
                }
              }
            }
          }
        }
      },
      'test-results': {
        label: 'Test Results',
        path: '/test-results'
      }
    };

    // Build breadcrumbs based on current path
    let currentLevel = routeMap;
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      // Handle dynamic segments (like IDs)
      let routeConfig = currentLevel[segment];
      if (!routeConfig && currentLevel['[executionId]'] && /^exec-/.test(segment)) {
        routeConfig = currentLevel['[executionId]'];
        routeConfig = { ...routeConfig, label: `Execution ${segment}` };
      } else if (!routeConfig && currentLevel['[testCaseId]'] && segment.length > 0) {
        routeConfig = currentLevel['[testCaseId]'];
        routeConfig = { ...routeConfig, label: `Test Case ${segment}` };
      }

      if (routeConfig) {
        // Determine if this should be clickable (not the last item and has a path)
        const isLast = i === segments.length - 1;
        const hasPath = routeConfig.path || !isLast;
        
        items.push({
          label: routeConfig.label,
          path: hasPath && !isLast ? (routeConfig.path || currentPath) : null,
          active: isLast
        });

        // Move to next level
        currentLevel = routeConfig.children || {};
      } else {
        // Fallback for unknown routes
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        items.push({
          label,
          path: i === segments.length - 1 ? null : currentPath,
          active: i === segments.length - 1
        });
      }
    }

    return items;
  }, [location.pathname, activeProject]);

  return breadcrumbs;
}; 