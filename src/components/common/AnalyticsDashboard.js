import React, { useState, useEffect, useCallback } from "react";
import { 
  FiTrendingUp, FiUsers, FiTarget, FiActivity, FiServer, FiClock,
  FiBarChart2, FiPieChart, FiFilter, FiDownload, FiRefreshCw,
  FiCalendar, FiGlobe, FiZap, FiShield, FiAlertTriangle
} from "react-icons/fi";
import { 
  Card, Button, LineChart, BarChart, DonutChart, StatusRing, 
  ProgressBar, MetricCardWithChart, TrendIndicator 
} from "../UI";
import { dashboard } from "../../utils/api";

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [selectedMetric, setSelectedMetric] = useState('success-rate');

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch multiple data sources in parallel
      const [
        metricsResponse,
        successTrendResponse,
        responseTrendResponse,
        volumeTrendResponse,
        environmentResponse,
        topPerformersResponse,
        topFailuresResponse
      ] = await Promise.all([
        dashboard.getMetrics(),
        dashboard.getSuccessRateTrend(parseInt(selectedTimeRange)),
        dashboard.getResponseTimeTrend(parseInt(selectedTimeRange)),
        dashboard.getExecutionVolumeTrend(parseInt(selectedTimeRange)),
        dashboard.getEnvironmentMetrics(parseInt(selectedTimeRange)),
        dashboard.getTopPerformers(parseInt(selectedTimeRange), 10),
        dashboard.getTopFailures(parseInt(selectedTimeRange), 10)
      ]);

      setAnalyticsData({
        metrics: metricsResponse.data,
        successTrend: successTrendResponse.data,
        responseTrend: responseTrendResponse.data,
        volumeTrend: volumeTrendResponse.data,
        environments: environmentResponse.data,
        topPerformers: topPerformersResponse.data,
        topFailures: topFailuresResponse.data
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

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
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
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
          trend={analyticsData?.successTrend?.[0]?.changePercentage}
          chartData={analyticsData?.successTrend}
          chartType="line"
          icon={FiTrendingUp}
          color="green"
        />
        
        <MetricCardWithChart
          title="Response Time"
          value={`${analyticsData?.metrics?.averageResponseTime || 0}ms`}
          subtitle="Average response time"
          chartData={analyticsData?.responseTrend}
          chartType="line"
          icon={FiZap}
          color="blue"
        />
        
        <MetricCardWithChart
          title="Execution Volume"
          value={analyticsData?.metrics?.totalExecutions?.toLocaleString() || '0'}
          subtitle="Total executions"
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
          
          <BarChart 
            data={getEnvironmentComparisonData()}
            height={200}
            title=""
          />
          
          <div className="mt-6 space-y-3">
            {analyticsData?.environments?.map((env, index) => (
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
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="success-rate">Success Rate</option>
              <option value="response-time">Response Time</option>
              <option value="execution-volume">Execution Volume</option>
            </select>
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