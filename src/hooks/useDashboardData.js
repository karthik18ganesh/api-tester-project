import { useQuery, useQueries } from '@tanstack/react-query';
import { dashboard } from '../utils/api';

// Custom hook for dashboard data with React Query
export const useDashboardData = (timeRange = '7') => {
  // Core dashboard queries that don't depend on time range
  const coreQueries = useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'metrics'],
        queryFn: dashboard.getMetrics,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      {
        queryKey: ['dashboard', 'summary'],
        queryFn: dashboard.getSummary,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      {
        queryKey: ['dashboard', 'recent-executions'],
        queryFn: () => dashboard.getRecentExecutions(15),
        staleTime: 30 * 1000, // 30 seconds
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      {
        queryKey: ['dashboard', 'system-health'],
        queryFn: dashboard.getSystemHealth,
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      }
    ]
  });

  // Time-dependent trends data
  const trendsQuery = useQuery({
    queryKey: ['dashboard', 'trends', timeRange],
    queryFn: async () => {
      const [successTrend, responseTrend, volumeTrend] = await Promise.all([
        dashboard.getSuccessRateTrend(parseInt(timeRange)),
        dashboard.getResponseTimeTrend(parseInt(timeRange)),
        dashboard.getExecutionVolumeTrend(parseInt(timeRange))
      ]);
      return {
        successRate: successTrend.result?.data || [],
        responseTime: responseTrend.result?.data || [],
        executionVolume: volumeTrend.result?.data || []
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
    enabled: !!timeRange,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Environment and performance data
  const performanceQuery = useQuery({
    queryKey: ['dashboard', 'performance', timeRange],
    queryFn: async () => {
      const [environments, topPerformers, topFailures] = await Promise.all([
        dashboard.getEnvironmentMetrics(parseInt(timeRange)),
        dashboard.getTopPerformers(parseInt(timeRange), 10),
        dashboard.getTopFailures(parseInt(timeRange), 10)
      ]);
      return {
        environments: environments.result?.data || [],
        topPerformers: topPerformers.result?.data || [],
        topFailures: topFailures.result?.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!timeRange,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Project metrics query
  const projectsQuery = useQuery({
    queryKey: ['dashboard', 'projects', timeRange],
    queryFn: () => dashboard.getProjectMetrics(parseInt(timeRange)),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!timeRange,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Extract data from queries
  const [metricsQuery, summaryQuery, executionsQuery, healthQuery] = coreQueries;

  return {
    // Data
    dashboardData: {
      metrics: metricsQuery.data?.result?.data || {},
      summary: summaryQuery.data?.result?.data || {},
      recentExecutions: executionsQuery.data?.result?.data || [],
      systemHealth: healthQuery.data?.result?.data || {},
      trends: trendsQuery.data || { successRate: [], responseTime: [], executionVolume: [] },
      environments: performanceQuery.data?.environments || [],
      topPerformers: performanceQuery.data?.topPerformers || [],
      topFailures: performanceQuery.data?.topFailures || [],
      projects: projectsQuery.data?.result?.data || []
    },
    
    // Loading states
    isLoading: coreQueries.some(q => q.isLoading),
    isLoadingTrends: trendsQuery.isLoading,
    isLoadingPerformance: performanceQuery.isLoading,
    isLoadingProjects: projectsQuery.isLoading,
    
    // Error states  
    error: coreQueries.find(q => q.error)?.error || 
           trendsQuery.error || 
           performanceQuery.error ||
           projectsQuery.error,
    
    // Individual query states for granular control
    queryStates: {
      metrics: {
        isLoading: metricsQuery.isLoading,
        error: metricsQuery.error,
        isError: metricsQuery.isError,
        isSuccess: metricsQuery.isSuccess,
      },
      summary: {
        isLoading: summaryQuery.isLoading,
        error: summaryQuery.error,
        isError: summaryQuery.isError,
        isSuccess: summaryQuery.isSuccess,
      },
      executions: {
        isLoading: executionsQuery.isLoading,
        error: executionsQuery.error,
        isError: executionsQuery.isError,
        isSuccess: executionsQuery.isSuccess,
      },
      trends: {
        isLoading: trendsQuery.isLoading,
        error: trendsQuery.error,
        isError: trendsQuery.isError,
        isSuccess: trendsQuery.isSuccess,
      },
      performance: {
        isLoading: performanceQuery.isLoading,
        error: performanceQuery.error,
        isError: performanceQuery.isError,
        isSuccess: performanceQuery.isSuccess,
      },
    },
    
    // Refetch functions
    refetch: () => {
      coreQueries.forEach(q => q.refetch());
      trendsQuery.refetch();
      performanceQuery.refetch();
      projectsQuery.refetch();
    },
    
    refetchCore: () => {
      coreQueries.forEach(q => q.refetch());
    },
    
    refetchTrends: () => {
      trendsQuery.refetch();
      performanceQuery.refetch();
    },
    
    // Last updated
    lastUpdated: new Date(Math.min(
      ...coreQueries.map(q => q.dataUpdatedAt || 0).filter(Boolean),
      trendsQuery.dataUpdatedAt || 0,
      performanceQuery.dataUpdatedAt || 0,
      projectsQuery.dataUpdatedAt || 0
    )),
    
    // Cache status
    isCached: coreQueries.every(q => q.isSuccess && !q.isLoading) &&
              trendsQuery.isSuccess && !trendsQuery.isLoading &&
              performanceQuery.isSuccess && !performanceQuery.isLoading,
              
    // Stale status
    isStale: coreQueries.some(q => q.isStale) ||
             trendsQuery.isStale ||
             performanceQuery.isStale
  };
};

// Lightweight hook for just dashboard metrics (for header/nav usage)
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: dashboard.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    select: (data) => data?.result?.data || {}
  });
};

// Hook for recent executions only (for other components)
export const useRecentExecutions = (limit = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-executions', limit],
    queryFn: () => dashboard.getRecentExecutions(limit),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    select: (data) => data?.result?.data || []
  });
};

export default useDashboardData; 