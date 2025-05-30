import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys, invalidateQueries } from '../providers/QueryProvider';
import { toast } from 'react-toastify';

// Base API configuration (replace with your actual API base URL)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Generic fetch function
const fetchData = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// API Repository Hooks
export const useAPIRepository = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.apiRepository.list(filters),
    queryFn: () => fetchData('/repository', { method: 'GET' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAPIRepositoryItem = (id) => {
  return useQuery({
    queryKey: queryKeys.apiRepository.detail(id),
    queryFn: () => fetchData(`/repository/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual items
  });
};

export const useCreateAPIRepositoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newItem) => fetchData('/repository', {
      method: 'POST',
      body: JSON.stringify(newItem),
    }),
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.apiRepository.all });
      
      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(queryKeys.apiRepository.lists());
      
      // Optimistically update to the new value
      if (previousItems) {
        queryClient.setQueryData(queryKeys.apiRepository.lists(), (old) => [
          ...old,
          { ...newItem, id: Date.now(), _isOptimistic: true }
        ]);
      }
      
      return { previousItems };
    },
    onError: (err, newItem, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(queryKeys.apiRepository.lists(), context.previousItems);
      toast.error('Failed to create API item');
    },
    onSuccess: () => {
      toast.success('API item created successfully');
    },
    onSettled: () => {
      // Always refetch after error or success
      invalidateQueries.apiRepository(queryClient);
    },
  });
};

export const useUpdateAPIRepositoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fetchData(`/repository/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
    onMutate: async ({ id, ...updateData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.apiRepository.detail(id) });
      
      const previousItem = queryClient.getQueryData(queryKeys.apiRepository.detail(id));
      
      queryClient.setQueryData(queryKeys.apiRepository.detail(id), (old) => ({
        ...old,
        ...updateData,
        _isOptimistic: true
      }));
      
      return { previousItem, id };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.apiRepository.detail(context.id), context.previousItem);
      toast.error('Failed to update API item');
    },
    onSuccess: () => {
      toast.success('API item updated successfully');
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiRepository.detail(id) });
      invalidateQueries.apiRepository(queryClient);
    },
  });
};

// Test Cases Hooks
export const useTestCases = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.testCases.list(filters),
    queryFn: () => fetchData('/test-cases', { method: 'GET' }),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useTestCase = (id) => {
  return useQuery({
    queryKey: queryKeys.testCases.detail(id),
    queryFn: () => fetchData(`/test-cases/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTestCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newTestCase) => fetchData('/test-cases', {
      method: 'POST',
      body: JSON.stringify(newTestCase),
    }),
    onSuccess: () => {
      invalidateQueries.testCases(queryClient);
      toast.success('Test case created successfully');
    },
    onError: () => {
      toast.error('Failed to create test case');
    },
  });
};

export const useExecuteTestCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ testCaseId, environment }) => fetchData('/test-execution/execute', {
      method: 'POST',
      body: JSON.stringify({ testCaseId, environment }),
    }),
    onSuccess: (data) => {
      // Invalidate test execution results
      invalidateQueries.testExecution(queryClient);
      toast.success('Test executed successfully');
      return data;
    },
    onError: () => {
      toast.error('Test execution failed');
    },
  });
};

// Test Execution Results Hooks
export const useTestExecutionResults = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.testExecution.results(),
    queryFn: () => fetchData('/test-execution/results'),
    staleTime: 1 * 60 * 1000, // 1 minute for fresh results
    refetchInterval: 30000, // Auto-refetch every 30 seconds for real-time updates
  });
};

export const useTestExecutionResult = (id) => {
  return useQuery({
    queryKey: queryKeys.testExecution.result(id),
    queryFn: () => fetchData(`/test-execution/results/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Projects Hooks
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: () => fetchData('/projects'),
    staleTime: 10 * 60 * 1000, // 10 minutes for projects
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => fetchData(`/projects/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Environments Hooks
export const useEnvironments = () => {
  return useQuery({
    queryKey: queryKeys.environments.lists(),
    queryFn: () => fetchData('/environments'),
    staleTime: 15 * 60 * 1000, // 15 minutes for environments
  });
};

// Prefetching utilities
export const usePrefetchTestCase = () => {
  const queryClient = useQueryClient();
  
  return (id) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.testCases.detail(id),
      queryFn: () => fetchData(`/test-cases/${id}`),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Background sync for offline capability
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  
  return {
    syncAll: () => {
      // Refetch all queries when coming back online
      queryClient.refetchQueries({ type: 'active' });
    },
    clearStale: () => {
      // Clear stale data
      queryClient.clear();
    },
  };
};

// Real-time updates using Server-Sent Events
export const useRealTimeTestExecution = (testExecutionId) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!testExecutionId) return;
    
    const eventSource = new EventSource(`${API_BASE_URL}/test-execution/${testExecutionId}/stream`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      // Update the specific test execution result
      queryClient.setQueryData(
        queryKeys.testExecution.result(testExecutionId),
        (oldData) => ({
          ...oldData,
          ...update,
          lastUpdated: new Date().toISOString(),
        })
      );
    };
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [testExecutionId, queryClient]);
}; 