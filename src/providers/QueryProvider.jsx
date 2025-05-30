import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Query client with optimized configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered "fresh"
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Cache time - how long data stays in cache after no observers
        gcTime: 10 * 60 * 1000, // 10 minutes
        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors except 408 (timeout)
          if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 408) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch configuration
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        // Global mutation configuration
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

export const QueryProvider = ({ children }) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Query keys factory for consistent caching
export const queryKeys = {
  // API Repository
  apiRepository: {
    all: ['apiRepository'],
    lists: () => [...queryKeys.apiRepository.all, 'list'],
    list: (filters) => [...queryKeys.apiRepository.lists(), filters],
    details: () => [...queryKeys.apiRepository.all, 'detail'],
    detail: (id) => [...queryKeys.apiRepository.details(), id],
  },
  // Test Cases
  testCases: {
    all: ['testCases'],
    lists: () => [...queryKeys.testCases.all, 'list'],
    list: (filters) => [...queryKeys.testCases.lists(), filters],
    details: () => [...queryKeys.testCases.all, 'detail'],
    detail: (id) => [...queryKeys.testCases.details(), id],
  },
  // Test Execution
  testExecution: {
    all: ['testExecution'],
    results: () => [...queryKeys.testExecution.all, 'results'],
    result: (id) => [...queryKeys.testExecution.results(), id],
    history: () => [...queryKeys.testExecution.all, 'history'],
  },
  // Projects & Environments
  projects: {
    all: ['projects'],
    lists: () => [...queryKeys.projects.all, 'list'],
    list: (filters) => [...queryKeys.projects.lists(), filters],
    detail: (id) => [...queryKeys.projects.all, 'detail', id],
  },
  environments: {
    all: ['environments'],
    lists: () => [...queryKeys.environments.all, 'list'],
    list: (filters) => [...queryKeys.environments.lists(), filters],
    detail: (id) => [...queryKeys.environments.all, 'detail', id],
  },
};

// Invalidation utilities
export const invalidateQueries = {
  apiRepository: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.apiRepository.all });
  },
  testCases: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.testCases.all });
  },
  testExecution: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.testExecution.all });
  },
  projects: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  },
  environments: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
  },
  all: (queryClient) => {
    queryClient.invalidateQueries();
  },
};

export default QueryProvider; 