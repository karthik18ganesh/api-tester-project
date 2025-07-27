import React, { useState, useEffect, useCallback } from "react";
import { 
  FiTrendingUp, FiUsers, FiTarget, FiActivity, FiServer, FiClock,
  FiBarChart2, FiPieChart, FiFilter, FiDownload, FiRefreshCw,
  FiCalendar, FiGlobe, FiZap, FiShield, FiAlertTriangle
} from "react-icons/fi";
import { 
  Card, Button, LineChart, BarChart, DonutChart, StatusRing, 
  ProgressBar, MetricCardWithChart, TrendIndicator, EnhancedDropdown, DaysSelector
} from "../UI";
import { dashboard } from "../../utils/api";
import { useProjectStore } from "../../stores/projectStore";

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [selectedMetric, setSelectedMetric] = useState('success-rate');
  
  // Get active project from store
  const { activeProject } = useProjectStore();

  // Helper function to extract trend percentage from delta string
  const getTrendPercentage = (trends, metricName) => {
    const trend = trends?.find(t => t.metricName === metricName);
    if (!trend) return 0;
    
    // Extract percentage from delta string (e.g., "+5.2%" -> 5.2)
    const deltaMatch = trend.delta.match(/([+-]?\d+\.?\d*)%/);
    return deltaMatch ? parseFloat(deltaMatch[1]) : 0;
  };

  // Fetch analytics data using unified API
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have an active project
      if (!activeProject?.id) {
        console.warn('No active project found');
        setIsLoading(false);
        return;
      }
      
      // Fetch both metrics and environment status in parallel
      const [metricsResponse, environmentResponse] = await Promise.all([
        dashboard.getMetrics(selectedTimeRange),
        dashboard.getEnvironmentStatus(activeProject.id, selectedTimeRange)
      ]);
      
      const data = metricsResponse.result?.data;
      const environmentData = environmentResponse.result?.data || [];

      if (data) {
        // Transform trends data for chart components
        const trends = data.trends || [];
        const successTrend = trends.find(t => t.metricName === 'Overall Success Rate');
        const responseTrend = trends.find(t => t.metricName === 'Avg Response Time');
        const volumeTrend = trends.find(t => t.metricName === 'Tests Executed');

        // Transform environment data from API response
        const transformedEnvironments = environmentData.map(env => ({
          environmentName: env.environment_name,
          successRate: env.success_rate,
          totalExecutions: env.total_executions,
          environmentId: env.environment_id,
          totalTestCases: env.total_test_cases
        }));

        setAnalyticsData({
          metrics: {
            ...data,
            // Calculate throughput from total executions
            throughputPerHour: Math.round(data.totalExecutions / 24),
            // Add system health score based on success rate
            systemHealth: {
              healthScore: Math.round(data.successRate || 0)
            },
            // Include trends for metric cards
            trends: data.trends
          },
          successTrend: successTrend?.currentWindowData || [],
          responseTrend: responseTrend?.currentWindowData || [],
          volumeTrend: volumeTrend?.currentWindowData || [],
          // Use real environment data from API
          environments: transformedEnvironments,
          // Mock top performers and failures until backend provides them
          topPerformers: [
            { name: 'User Management API', successRate: 98 },
            { name: 'Payment Gateway Tests', successRate: 96 },
            { name: 'Search API Suite', successRate: 94 }
          ],
          topFailures: [
            { name: 'Legacy Integration Tests', successRate: 45 },
            { name: 'Third-party API Tests', successRate: 62 }
          ]
        });
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange, activeProject?.id]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Transform data for charts
  const getExecutionStatusData = () => {
    if (!analyticsData?.metrics) return [];
    
    const { passedExecutions, failedExecutions, errorExecutions } = analyticsData.metrics;
    return [
      { label: 'Passed', value: passedExecutions, color: '#10b981' },
      { label: 'Failed', value: failedExecutions, color: '#ef4444' },
      { label: 'Error', value: errorExecutions, color: '#f59e0b' }
    ];
  };

  const getEnvironmentComparisonData = () => {
    if (!analyticsData?.environments) return [];
    
    return analyticsData.environments.map(env => ({
      label: env.environmentName,
      value: env.successRate,
      executions: env.totalExecutions,
      color: env.successRate >= 90 ? '#10b981' : env.successRate >= 70 ? '#f59e0b' : '#ef4444'
    }));
  };

  const getResponseTimeDistribution = () => {
    if (!analyticsData?.responseTrend) return [];
    
    // Create response time buckets
    const buckets = {
      'Fast (<500ms)': 0,
      'Good (500-1000ms)': 0,
      'Slow (1000-2000ms)': 0,
      'Very Slow (>2000ms)': 0
    };

    analyticsData.responseTrend.forEach(item => {
      const time = item.value;
      if (time < 500) buckets['Fast (<500ms)']++;
      else if (time < 1000) buckets['Good (500-1000ms)']++;
      else if (time < 2000) buckets['Slow (1000-2000ms)']++;
      else buckets['Very Slow (>2000ms)']++;
    });

    return Object.entries(buckets).map(([label, value]) => ({
      label,
      value,
      color: label.includes('Fast') ? '#10b981' : 
             label.includes('Good') ? '#3b82f6' :
             label.includes('Slow') && !label.includes('Very') ? '#f59e0b' : '#ef4444'
    }));
  };

  // Show message if no active project
  if (!activeProject?.id) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <FiTarget className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Project</h3>
          <p className="text-gray-600">
            Please select an active project to view analytics dashboard.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Deep insights into your API testing performance</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <DaysSelector 
            selectedDays={selectedTimeRange}
            onDaysChange={setSelectedTimeRange}
            className="w-44"
          />
          
          <Button variant="ghost" size="sm" onClick={fetchAnalyticsData}>
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardWithChart
          title="Success Rate Trend"
          value={`${analyticsData?.metrics?.successRate || 0}%`}
          subtitle="Average success rate"
          trend={getTrendPercentage(analyticsData?.metrics?.trends, 'Overall Success Rate')}
          chartData={analyticsData?.successTrend}
          chartType="line"
          icon={FiTrendingUp}
          color="green"
        />
        
        <MetricCardWithChart
          title="Response Time"
          value={`${analyticsData?.metrics?.averageResponseTime || 0}ms`}
          subtitle="Average response time"
          trend={getTrendPercentage(analyticsData?.metrics?.trends, 'Avg Response Time')}
          chartData={analyticsData?.responseTrend}
          chartType="line"
          icon={FiZap}
          color="blue"
        />
        
        <MetricCardWithChart
          title="Execution Volume"
          value={analyticsData?.metrics?.totalExecutions?.toLocaleString() || '0'}
          subtitle="Total executions"
          trend={getTrendPercentage(analyticsData?.metrics?.trends, 'Tests Executed')}
          chartData={analyticsData?.volumeTrend}
          chartType="bar"
          icon={FiActivity}
          color="purple"
        />
        
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-indigo-600 font-medium">System Health</p>
              <p className="text-2xl font-bold text-indigo-900">
                {analyticsData?.metrics?.systemHealth?.healthScore || 0}/100
              </p>
            </div>
            <FiShield className="h-8 w-8 text-indigo-600" />
          </div>
          <StatusRing 
            percentage={analyticsData?.metrics?.systemHealth?.healthScore || 0}
            size={60}
            strokeWidth={4}
            color="#4f46e5"
          />
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Execution Status Distribution</h3>
            <FiPieChart className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="flex items-center justify-center">
            <DonutChart 
              data={getExecutionStatusData()}
              size={200}
              strokeWidth={20}
            />
          </div>
          
          <div className="mt-6 space-y-3">
            {getExecutionStatusData().map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((item.value / analyticsData?.metrics?.totalExecutions) * 100 || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Environment Performance Comparison */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Environment Performance</h3>
            <FiServer className="h-5 w-5 text-gray-500" />
          </div>
          
          {analyticsData?.environments?.length > 0 ? (
            <>
              <BarChart 
                data={getEnvironmentComparisonData()}
                height={200}
                title=""
              />
              
              <div className="mt-6 space-y-3">
                {analyticsData.environments.map((env, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{env.environmentName}</span>
                      <span className="text-gray-500">{env.totalExecutions} executions</span>
                    </div>
                    <ProgressBar 
                      value={env.successRate}
                      height="h-2"
                      label=""
                      showPercentage={false}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-center">
              <div>
                <FiServer className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No environment data available</p>
                <p className="text-gray-400 text-xs mt-1">Execute some tests to see environment performance</p>
              </div>
            </div>
          )}
        </Card>

        {/* Response Time Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Response Time Distribution</h3>
            <FiClock className="h-5 w-5 text-gray-500" />
          </div>
          
          <BarChart 
            data={getResponseTimeDistribution()}
            height={150}
            title=""
          />
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {analyticsData?.metrics?.averageResponseTime || 0}ms
              </div>
              <div className="text-gray-500">Average</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {analyticsData?.metrics?.throughputPerHour || 0}
              </div>
              <div className="text-gray-500">Req/Hour</div>
            </div>
          </div>
        </Card>

        {/* Top Performers and Failures */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Leaders</h3>
            <FiTarget className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="space-y-6">
            {/* Top Performers */}
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Top Performers
              </h4>
              <div className="space-y-2">
                {analyticsData?.topPerformers?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-green-700 bg-green-200 w-5 h-5 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <TrendIndicator 
                      value={item.successRate} 
                      trend={item.successRate} 
                      size="sm" 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Failures */}
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Needs Attention
              </h4>
              <div className="space-y-2">
                {analyticsData?.topFailures?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiAlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <TrendIndicator 
                      value={item.successRate} 
                      trend={item.successRate - 100} 
                      size="sm" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
          <div className="flex items-center gap-2">
            <EnhancedDropdown
              options={[
                { value: 'success-rate', label: 'Success Rate' },
                { value: 'response-time', label: 'Response Time' },
                { value: 'execution-volume', label: 'Execution Volume' }
              ]}
              value={selectedMetric}
              onChange={setSelectedMetric}
              position="right"
              className="w-48"
            />
          </div>
        </div>
        
        <div className="h-64">
          {selectedMetric === 'success-rate' && analyticsData?.successTrend && (
            <LineChart 
              data={analyticsData.successTrend}
              title=""
              color="#10b981"
              height={250}
              showGrid={true}
              showPoints={true}
            />
          )}
          {selectedMetric === 'response-time' && analyticsData?.responseTrend && (
            <LineChart 
              data={analyticsData.responseTrend}
              title=""
              color="#3b82f6"
              height={250}
              showGrid={true}
              showPoints={true}
            />
          )}
          {selectedMetric === 'execution-volume' && analyticsData?.volumeTrend && (
            <BarChart 
              data={analyticsData.volumeTrend.map(item => ({
                label: item.date,
                value: item.value
              }))}
              title=""
              color="#8b5cf6"
              height={250}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard; 