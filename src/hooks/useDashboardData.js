import { useQuery } from '@tanstack/react-query';
import { dashboard } from '../utils/api';
import { useProjectStore } from '../stores/projectStore'; // Updated import

// Helper function to extract trend percentage from delta string
const getTrendPercentage = (trends, metricName) => {
  const trend = trends?.find((t) => t.metricName === metricName);
  if (!trend) return 0;

  // Extract percentage from delta string (e.g., "+5.2%" -> 5.2)
  const deltaMatch = trend.delta.match(/([+-]?\d+\.?\d*)%/);
  return deltaMatch ? parseFloat(deltaMatch[1]) : 0;
};

// Enhanced helper function to extract full trend information including color and direction
const getTrendInfo = (trends, metricName) => {
  const trend = trends?.find((t) => t.metricName === metricName);
  if (!trend)
    return { percentage: 0, direction: 'STABLE', color: 'gray', icon: '→' };

  // Extract percentage from delta string (e.g., "+5.2%" -> 5.2)
  const deltaMatch = trend.delta.match(/([+-]?\d+\.?\d*)%/);
  const percentage = deltaMatch ? parseFloat(deltaMatch[1]) : 0;

  return {
    percentage,
    direction: trend.trendDirection,
    color: trend.trendColor,
    icon: trend.trendIcon,
    delta: trend.delta,
  };
};

// Helper function to fill missing dates with 0 values
const fillMissingDates = (data, fromDate, toDate) => {
  if (!data || data.length === 0) return [];

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const filledData = [];
  const dataMap = new Map(data.map((item) => [item.label, item.value]));

  // Generate all dates in range
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    filledData.push({
      label: dateStr,
      value: dataMap.get(dateStr) || 0.0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledData;
};

// Helper function to calculate statistics from data
const calculateStats = (data) => {
  if (!data || data.length === 0) {
    return { average: 0, best: 0, worst: 0 };
  }

  const values = data
    .map((item) => item.value)
    .filter((val) => val != null && !isNaN(val));
  if (values.length === 0) {
    return { average: 0, best: 0, worst: 0 };
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / values.length;
  const best = Math.max(...values);
  const worst = Math.min(...values);

  return { average, best, worst };
};

// Transform trend data for chart components with date filling
const transformTrendData = (trends, timeRange = '1') => {
  const successRateTrend = trends.find(
    (t) => t.metricName === 'Overall Success Rate'
  );
  const responseTimeTrend = trends.find(
    (t) => t.metricName === 'Avg Response Time'
  );
  const volumeTrend = trends.find((t) => t.metricName === 'Tests Executed');

  // Calculate date range for filling missing dates
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - parseInt(timeRange));

  const fromDateStr = fromDate.toISOString().split('T')[0];
  const toDateStr = toDate.toISOString().split('T')[0];

  // Fill missing dates and calculate stats
  const successRateData = fillMissingDates(
    successRateTrend?.currentWindowData || [],
    fromDateStr,
    toDateStr
  );
  const responseTimeData = fillMissingDates(
    responseTimeTrend?.currentWindowData || [],
    fromDateStr,
    toDateStr
  );
  const executionVolumeData = fillMissingDates(
    volumeTrend?.currentWindowData || [],
    fromDateStr,
    toDateStr
  );

  return {
    successRate: successRateData,
    responseTime: responseTimeData,
    executionVolume: executionVolumeData,
    // Add statistics for each metric
    stats: {
      successRate: calculateStats(successRateData),
      responseTime: calculateStats(responseTimeData),
      executionVolume: calculateStats(executionVolumeData),
    },
  };
};

// Transform environment data from API response to expected format
const transformEnvironmentData = (environmentData) => {
  console.log('🔧 Transforming environment data:', environmentData);

  if (!environmentData || !Array.isArray(environmentData)) {
    console.log('⚠️ No environment data or not an array');
    return [];
  }

  const transformed = environmentData.map((env) => ({
    name: env.environment_name,
    successRate: env.success_rate,
    tests: env.total_executions,
    environmentId: env.environment_id,
    totalTestCases: env.total_test_cases,
  }));

  console.log('✅ Transformed environment data:', transformed);
  return transformed;
};

// Transform recent executions data from API response to expected format
const transformRecentExecutionsData = (executionsData) => {
  console.log('🔧 Transforming recent executions data:', executionsData);

  if (!executionsData || !Array.isArray(executionsData)) {
    console.log('⚠️ No executions data or not an array');
    return [];
  }

  const transformed = executionsData.map((execution) => ({
    executionId: execution.executionId,
    testPackageName: execution.testPackageName || 'Test Execution',
    executionStatus: execution.executionStatus, // PASSED/FAILED from API
    successRate: execution.successRate,
    executionTimeMs: execution.executionTimeMs,
    executionDate: execution.executionDate,
    environmentName: execution.environmentName,
    totalTests: execution.totalTests,
    passedTests: execution.passedTests,
    failedTests: execution.failedTests,
    errorTests: execution.errorTests,
    executedBy: execution.executedBy,
    executionType: 'API', // Default type since not provided in API
  }));

  console.log('✅ Transformed recent executions data:', transformed);
  return transformed;
};

// Transform suite performers data into top performers and needs attention
const transformSuitePerformers = (suiteData) => {
  console.log('🔧 Transforming suite performers data:', suiteData);

  if (!suiteData || !Array.isArray(suiteData)) {
    console.log('⚠️ No suite data or not an array');
    return { topPerformers: [], needsAttention: [] };
  }

  // Sort by success rate descending
  const sortedSuites = suiteData.sort((a, b) => b.successRate - a.successRate);

  // Categorize based on success rate (>65 = top performers, <=65 = needs attention)
  const topPerformers = sortedSuites
    .filter((suite) => suite.successRate > 65)
    .map((suite) => ({
      id: suite.id,
      name: suite.name,
      successRate: Math.round(suite.successRate * 100) / 100, // Round to 2 decimal places
      executionCount: suite.totalExecutions,
      totalTestCases: suite.totalTestCases,
      averageResponseTime: suite.averageResponseTime,
      type: suite.type,
    }));

  const needsAttention = sortedSuites
    .filter((suite) => suite.successRate <= 65)
    .map((suite) => ({
      id: suite.id,
      name: suite.name,
      successRate: Math.round(suite.successRate * 100) / 100, // Round to 2 decimal places
      executionCount: suite.totalExecutions,
      totalTestCases: suite.totalTestCases,
      averageResponseTime: suite.averageResponseTime,
      type: suite.type,
    }));

  console.log('✅ Transformed suite performers:', {
    topPerformers: topPerformers.length,
    needsAttention: needsAttention.length,
  });

  return { topPerformers, needsAttention };
};

// Main hook for unified dashboard data
const useDashboardData = (timeRange = '7') => {
  const { activeProject } = useProjectStore();

  console.log('📍 Dashboard Data Hook:', {
    timeRange,
    activeProject: activeProject
      ? `${activeProject.name} (${activeProject.id})`
      : 'No active project',
  });

  // Unified query for dashboard data including environment status
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'unified', timeRange, activeProject?.id],
    queryFn: async () => {
      console.log('🔄 Dashboard Data Fetch:', {
        timeRange,
        activeProjectId: activeProject?.id,
      });

      const metricsPromise = dashboard.getMetrics(timeRange);

      // Only fetch environment data if we have an active project
      const environmentPromise = activeProject?.id
        ? dashboard.getEnvironmentStatus(activeProject.id, timeRange)
        : Promise.resolve({ result: { data: [] } });

      // Fetch suite performers data
      const suitePerformersPromise = dashboard.getSuitePerformers(timeRange);

      // NEW: Fetch recent executions data
      const recentExecutionsPromise = dashboard.getRecentExecutions(10);

      console.log(
        '📊 Fetching metrics, environment, suite performers, and recent executions data...'
      );

      const [
        metricsResponse,
        environmentResponse,
        suitePerformersResponse,
        recentExecutionsResponse,
      ] = await Promise.all([
        metricsPromise,
        environmentPromise,
        suitePerformersPromise,
        recentExecutionsPromise,
      ]);

      console.log('✅ API Responses:', {
        metricsData: metricsResponse.result?.data,
        environmentData: environmentResponse.result?.data,
        suitePerformersData: suitePerformersResponse.result?.data,
        recentExecutionsData: recentExecutionsResponse.result?.data,
      });

      return {
        metrics: metricsResponse.result?.data,
        environments: environmentResponse.result?.data || [],
        suitePerformers: suitePerformersResponse.result?.data || [],
        recentExecutions: recentExecutionsResponse.result?.data || [],
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
  const transformedData = dashboardQuery.data?.metrics
    ? {
        // Core metrics from the unified response
        metrics: {
          totalTestCases: dashboardQuery.data.metrics.totalTestCases,
          successRate: dashboardQuery.data.metrics.successRate,
          averageResponseTime: dashboardQuery.data.metrics.averageResponseTime,
          totalProjects: dashboardQuery.data.metrics.totalProjects,
          totalExecutions: dashboardQuery.data.metrics.totalExecutedTests, // Updated field name
          passedExecutions:
            (dashboardQuery.data.metrics.totalExecutedTests || 0) -
            (dashboardQuery.data.metrics.failedTests || 0), // Calculated
          failedExecutions: dashboardQuery.data.metrics.failedTests,
          errorExecutions: 0, // Not provided in new API, set to 0
          activeProjects: dashboardQuery.data.metrics.totalProjects,
          throughputPerHour: Math.round(
            (dashboardQuery.data.metrics.totalExecutedTests || 0) / 24
          ), // Approximate, using new field name
        },

        // Transform trends data for chart components with timeRange
        trends: transformTrendData(
          dashboardQuery.data.metrics.trends || [],
          timeRange
        ),

        // Use real environment data from API
        environments: transformEnvironmentData(
          dashboardQuery.data.environments
        ),

        // Transform suite performers data
        ...(() => {
          const performers = transformSuitePerformers(
            dashboardQuery.data.suitePerformers
          );
          return {
            topPerformers: performers.topPerformers,
            topFailures: performers.needsAttention, // Rename for UI compatibility
          };
        })(),

        // NEW: Use real recent executions data instead of mock data
        recentExecutions: transformRecentExecutionsData(
          dashboardQuery.data.recentExecutions
        ),

        // System health can be derived from success rate
        systemHealth: {
          healthScore: Math.round(dashboardQuery.data.metrics.successRate || 0),
        },

        // Additional metadata
        metricsGeneratedAt: dashboardQuery.data.metrics.metricsGeneratedAt,

        // Trend percentages for UI indicators (backward compatibility)
        trendPercentages: {
          successRate: getTrendPercentage(
            dashboardQuery.data.metrics.trends || [],
            'Overall Success Rate'
          ),
          responseTime: getTrendPercentage(
            dashboardQuery.data.metrics.trends || [],
            'Avg Response Time'
          ),
          executionVolume: getTrendPercentage(
            dashboardQuery.data.metrics.trends || [],
            'Tests Executed'
          ),
          failedTests: getTrendPercentage(
            dashboardQuery.data.metrics.trends || [],
            'Failed Tests'
          ),
          totalTestCases: getTrendPercentage(
            dashboardQuery.data.metrics.trends || [],
            'Total Test Cases'
          ),
        },

        // Enhanced trend information with direction, color, and icons
        trendInfo: {
          successRate: getTrendInfo(
            dashboardQuery.data.metrics.trends || [],
            'Overall Success Rate'
          ),
          responseTime: getTrendInfo(
            dashboardQuery.data.metrics.trends || [],
            'Avg Response Time'
          ),
          executionVolume: getTrendInfo(
            dashboardQuery.data.metrics.trends || [],
            'Tests Executed'
          ),
          failedTests: getTrendInfo(
            dashboardQuery.data.metrics.trends || [],
            'Failed Tests'
          ),
          totalTestCases: getTrendInfo(
            dashboardQuery.data.metrics.trends || [],
            'Total Test Cases'
          ),
        },
      }
    : null;

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
    isStale: dashboardQuery.isStale,
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
    select: (data) => data?.result?.data || {},
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
    select: (data) => transformRecentExecutionsData(data?.result?.data || []),
  });
};

// Export as named export (this is what Dashboard.js is importing)
export { useDashboardData };

// Also export as default for backward compatibility
export default useDashboardData;
