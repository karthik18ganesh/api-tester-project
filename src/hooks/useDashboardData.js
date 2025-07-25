import { useQuery } from '@tanstack/react-query';
import { dashboard } from '../utils/api';
import { useProjectStore } from '../stores/projectStore';

// Helper function to extract trend percentage from delta string
const getTrendPercentage = (trends, metricName) => {
  const trend = trends?.find(t => t.metricName === metricName);
  if (!trend) return 0;
  
  // Extract percentage from delta string (e.g., "+5.2%" -> 5.2)
  const deltaMatch = trend.delta.match(/([+-]?\d+\.?\d*)%/);
  return deltaMatch ? parseFloat(deltaMatch[1]) : 0;
};

// Transform trend data for chart components
const transformTrendData = (trends) => {
  const successRateTrend = trends.find(t => t.metricName === 'Overall Success Rate');
  const responseTimeTrend = trends.find(t => t.metricName === 'Avg Response Time');
  const volumeTrend = trends.find(t => t.metricName === 'Tests Executed');

  return {
    successRate: successRateTrend?.currentWindowData || [],
    responseTime: responseTimeTrend?.currentWindowData || [],
    executionVolume: volumeTrend?.currentWindowData || []
  };
};

// Transform environment data from API response to expected format
const transformEnvironmentData = (environmentData) => {
  console.log('🔧 Transforming environment data:', environmentData);
  
  if (!environmentData || !Array.isArray(environmentData)) {
    console.log('⚠️ No environment data or not an array');
    return [];
  }
  
  const transformed = environmentData.map(env => ({
    name: env.environment_name,
    successRate: env.success_rate,
    tests: env.total_executions,
    environmentId: env.environment_id,
    totalTestCases: env.total_test_cases
  }));
  
  console.log('✅ Transformed environment data:', transformed);
  return transformed;
};

const getMockRecentExecutions = () => [
  {
    executionId: 'exec-1',
    testPackageName: 'API Regression Suite',
    executionStatus: 'Passed',
    successRate: 95,
    executionTimeMs: 2500,
    executionDate: new Date().toISOString().split('T')[0],
    environmentName: 'Production',
    totalTests: 25,
    passedTests: 24,
    failedTests: 1,
    executionType: 'Scheduled'
  },
  {
    executionId: 'exec-2', 
    testSuiteName: 'Authentication Tests',
    executionStatus: 'Failed',
    successRate: 72,
    executionTimeMs: 1800,
    executionDate: new Date().toISOString().split('T')[0],
    environmentName: 'Staging',
    totalTests: 18,
    passedTests: 13,
    failedTests: 5,
    executionType: 'Manual'
  }
];

const getMockTopPerformers = () => [
  { name: 'User Management API', successRate: 98, executionCount: 145 },
  { name: 'Payment Gateway Tests', successRate: 96, executionCount: 120 },
  { name: 'Search API Suite', successRate: 94, executionCount: 98 }
];

const getMockTopFailures = () => [
  { name: 'Legacy Integration Tests', successRate: 45, executionCount: 67 },
  { name: 'Third-party API Tests', successRate: 62, executionCount: 54 }
];

// Custom hook for unified dashboard data
export const useDashboardData = (timeRange = '1') => {
  // Get active project from store
  const { activeProject } = useProjectStore();
  
  console.log('🏗️ useDashboardData called:', { timeRange, activeProject: activeProject?.id ? `${activeProject.name} (${activeProject.id})` : 'No active project' });
  
  // Unified query for dashboard data including environment status
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'unified', timeRange, activeProject?.id],
    queryFn: async () => {
      console.log('🔄 Dashboard Data Fetch:', { timeRange, activeProjectId: activeProject?.id });
      
      const metricsPromise = dashboard.getMetrics(timeRange);
      
      // Only fetch environment data if we have an active project
      const environmentPromise = activeProject?.id 
        ? dashboard.getEnvironmentStatus(activeProject.id, timeRange)
        : Promise.resolve({ result: { data: [] } });
      
      console.log('📊 Fetching metrics and environment data...');
      
      const [metricsResponse, environmentResponse] = await Promise.all([
        metricsPromise,
        environmentPromise
      ]);
      
      console.log('✅ API Responses:', { 
        metricsData: metricsResponse.result?.data, 
        environmentData: environmentResponse.result?.data 
      });
      
      return {
        metrics: metricsResponse.result?.data,
        environments: environmentResponse.result?.data || []
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: true, // Always enable query, handle missing project in queryFn
  });

  // Transform and structure the data for existing UI components
  const transformedData = dashboardQuery.data?.metrics ? {
    // Core metrics from the unified response
    metrics: {
      totalTestCases: dashboardQuery.data.metrics.totalTestCases,
      successRate: dashboardQuery.data.metrics.successRate,
      averageResponseTime: dashboardQuery.data.metrics.averageResponseTime,
      totalProjects: dashboardQuery.data.metrics.totalProjects,
      totalExecutions: dashboardQuery.data.metrics.totalExecutions,
      passedExecutions: dashboardQuery.data.metrics.passedExecutions,
      failedExecutions: dashboardQuery.data.metrics.failedExecutions,
      errorExecutions: dashboardQuery.data.metrics.errorExecutions,
      activeProjects: dashboardQuery.data.metrics.totalProjects,
      throughputPerHour: Math.round(dashboardQuery.data.metrics.totalExecutions / 24) // Approximate
    },

    // Transform trends data for chart components
    trends: transformTrendData(dashboardQuery.data.metrics.trends || []),

    // Use real environment data from API
    environments: transformEnvironmentData(dashboardQuery.data.environments),
    
    // Use mock data for features not yet in unified response
    recentExecutions: getMockRecentExecutions(),
    topPerformers: getMockTopPerformers(),
    topFailures: getMockTopFailures(),

    // System health can be derived from success rate
    systemHealth: {
      healthScore: Math.round(dashboardQuery.data.metrics.successRate || 0)
    },

    // Additional metadata
    metricsGeneratedAt: dashboardQuery.data.metrics.metricsGeneratedAt,
    
    // Trend percentages for UI indicators
    trendPercentages: {
      successRate: getTrendPercentage(dashboardQuery.data.metrics.trends || [], 'Overall Success Rate'),
      responseTime: getTrendPercentage(dashboardQuery.data.metrics.trends || [], 'Avg Response Time'),
      executionVolume: getTrendPercentage(dashboardQuery.data.metrics.trends || [], 'Tests Executed'),
      failedTests: getTrendPercentage(dashboardQuery.data.metrics.trends || [], 'Failed Tests'),
      totalTestCases: getTrendPercentage(dashboardQuery.data.metrics.trends || [], 'Total Test Cases')
    }
  } : null;

  return {
    // Structured data for UI components
    dashboardData: transformedData,
    
    // Loading states
    isLoading: dashboardQuery.isLoading,
    isLoadingTrends: dashboardQuery.isLoading,
    isLoadingPerformance: dashboardQuery.isLoading,
    isLoadingProjects: dashboardQuery.isLoading,
    
    // Error states  
    error: dashboardQuery.error,
    
    // Individual query states for granular control
    queryStates: {
      metrics: {
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        isError: dashboardQuery.isError,
        isSuccess: dashboardQuery.isSuccess,
      },
      summary: {
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        isError: dashboardQuery.isError,
        isSuccess: dashboardQuery.isSuccess,
      },
      executions: {
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        isError: dashboardQuery.isError,
        isSuccess: dashboardQuery.isSuccess,
      },
      trends: {
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        isError: dashboardQuery.isError,
        isSuccess: dashboardQuery.isSuccess,
      },
      performance: {
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        isError: dashboardQuery.isError,
        isSuccess: dashboardQuery.isSuccess,
      },
    },
    
    // Refetch functions
    refetch: () => dashboardQuery.refetch(),
    refetchCore: () => dashboardQuery.refetch(),
    refetchTrends: () => dashboardQuery.refetch(),
    
    // Last updated
    lastUpdated: new Date(dashboardQuery.dataUpdatedAt || 0),
    
    // Cache status
    isCached: dashboardQuery.isSuccess && !dashboardQuery.isLoading,
              
    // Stale status
    isStale: dashboardQuery.isStale
  };
};

// Lightweight hook for just dashboard metrics (for header/nav usage)
export const useDashboardMetrics = (timeRange = '1') => {
  return useQuery({
    queryKey: ['dashboard', 'metrics', timeRange],
    queryFn: () => dashboard.getMetrics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    select: (data) => data?.result?.data || {}
  });
};

// Hook for recent executions only (for other components) 
export const useRecentExecutions = (timeRange = '1') => {
  return useQuery({
    queryKey: ['dashboard', 'recent-executions', timeRange],
    queryFn: () => dashboard.getMetrics(timeRange),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    select: (data) => getMockRecentExecutions() // Use mock data until backend provides this
  });
};

export default useDashboardData; 