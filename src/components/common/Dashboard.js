import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiGrid, FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, 
  FiPlayCircle, FiBarChart2, FiDatabase, FiLayers,
  FiActivity, FiTarget, FiZap, FiAward, FiUsers, FiServer,
  FiCalendar, FiArrowRight, FiRefreshCw, FiAlertTriangle,
  FiMonitor, FiShield, FiEye, FiChevronDown, FiPlus,
  FiCpu, FiHeart, FiTrendingDown
} from "react-icons/fi";
import { 
  Card, Badge, Button, LoadingSpinner, LineChart, 
  MetricCard, QuickActionCard, TrendIndicator
} from "../UI";
import Breadcrumb from "./Breadcrumb";
import { dashboard } from "../../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const timeRangeOptions = [
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' }
  ];

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        metricsResponse,
        summaryResponse,
        successTrendResponse,
        responseTrendResponse,
        volumeTrendResponse,
        environmentsResponse,
        recentExecutionsResponse,
        topPerformersResponse,
        topFailuresResponse,
        projectsResponse,
        systemHealthResponse
      ] = await Promise.all([
        dashboard.getMetrics(),
        dashboard.getSummary(),
        dashboard.getSuccessRateTrend(parseInt(selectedTimeRange)),
        dashboard.getResponseTimeTrend(parseInt(selectedTimeRange)),
        dashboard.getExecutionVolumeTrend(parseInt(selectedTimeRange)),
        dashboard.getEnvironmentMetrics(parseInt(selectedTimeRange)),
        dashboard.getRecentExecutions(15),
        dashboard.getTopPerformers(parseInt(selectedTimeRange), 10),
        dashboard.getTopFailures(parseInt(selectedTimeRange), 10),
        dashboard.getProjectMetrics(parseInt(selectedTimeRange)),
        dashboard.getSystemHealth()
      ]);

      const data = {
        metrics: metricsResponse.result?.data || {},
        summary: summaryResponse.result?.data || {},
        trends: {
          successRate: successTrendResponse.result?.data || [],
          responseTime: responseTrendResponse.result?.data || [],
          executionVolume: volumeTrendResponse.result?.data || []
        },
        environments: environmentsResponse.result?.data || [],
        recentExecutions: recentExecutionsResponse.result?.data || [],
        topPerformers: topPerformersResponse.result?.data || [],
        topFailures: topFailuresResponse.result?.data || [],
        projects: projectsResponse.result?.data || [],
        systemHealth: systemHealthResponse.result?.data || {}
      };
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data structure on error
      setDashboardData({
        metrics: {},
        summary: {},
        trends: { successRate: [], responseTime: [], executionVolume: [] },
        environments: [],
        recentExecutions: [],
        topPerformers: [],
        topFailures: [],
        projects: [],
        systemHealth: {}
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTimeRange]);

  // Auto-refresh dashboard data
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 300000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTimeRangeDropdown && !event.target.closest('.relative')) {
        setShowTimeRangeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimeRangeDropdown]);

  // Dashboard Header Component
  const DashboardHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text">
          API Testing Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Comprehensive insights into your testing ecosystem
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <FiCalendar className="w-4 h-4" />
            {timeRangeOptions.find(option => option.value === selectedTimeRange)?.label || 'Last 7 days'}
            <FiChevronDown className={`w-4 h-4 transition-transform ${showTimeRangeDropdown ? 'rotate-180' : ''}`} />
          </Button>
          
          {showTimeRangeDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    selectedTimeRange === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedTimeRange(option.value);
                    setShowTimeRangeDropdown(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );

  // Environment Performance Component
  const EnvironmentPerformance = ({ environments }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'healthy': return 'bg-dashboard-success';
        case 'warning': return 'bg-dashboard-warning';
        case 'error': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    };

    return (
      <Card className="p-6 shadow-card h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-info rounded-lg flex items-center justify-center">
            <FiServer className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Environment Performance</h3>
        </div>
        
        <div className="h-64 flex flex-col">
          <div className="space-y-4 flex-1 overflow-y-auto">
            {environments?.length > 0 ? (
              environments.map((env, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor('healthy')}`} />
                    <span className="font-medium">{env.environmentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{env.totalExecutions || 0} tests</span>
                    <Badge variant="outline" className="text-xs">
                      {env.successRate >= 90 ? 'healthy' : env.successRate >= 70 ? 'warning' : 'critical'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                {['Production', 'Staging', 'Development'].map((name) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-dashboard-success" />
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">0 tests</span>
                      <Badge variant="outline" className="text-xs">healthy</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Performance Chart Component
  const PerformanceChart = ({ trends }) => {
    const [selectedTrend, setSelectedTrend] = useState('successRate');
    
    const trendOptions = [
      { key: 'successRate', label: 'Success Rate', data: trends.successRate },
      { key: 'responseTime', label: 'Response Time', data: trends.responseTime },
      { key: 'executionVolume', label: 'Execution Volume', data: trends.executionVolume }
    ];

    const currentTrend = trendOptions.find(t => t.key === selectedTrend);

    return (
      <Card className="p-6 shadow-card h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-info rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Performance Trends</h3>
          </div>
          
          <select 
            value={selectedTrend}
            onChange={(e) => setSelectedTrend(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {trendOptions.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          {currentTrend?.data && currentTrend.data.length > 0 ? (
            <LineChart 
              data={currentTrend.data}
              title=""
              color="#3b82f6"
              height={200}
              showGrid={true}
              showPoints={true}
            />
          ) : (
            <div className="text-center text-gray-500">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">NO CHART DATA AVAILABLE</p>
              <p className="text-sm">Start running tests to see performance trends</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Performance Leaders Component
  const PerformanceLeaders = ({ topPerformers, topFailures }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
            <FiAward className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-dashboard-success">Top Performers</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          {topPerformers?.length > 0 ? (
            <div className="space-y-3">
              {topPerformers.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-200 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-green-700 font-semibold">{item.successRate}%</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <FiAward className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No performance data yet</p>
              <p className="text-sm">Run tests to see top performers</p>
            </>
          )}
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-warning rounded-lg flex items-center justify-center">
            <FiAlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-dashboard-warning">Needs Attention</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          {topFailures?.length > 0 ? (
            <div className="space-y-3">
              {topFailures.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiAlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-red-700 font-semibold">{item.successRate}%</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <FiAlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">All systems performing well</p>
              <p className="text-sm">No issues detected</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  // Recent Executions Component
  const RecentExecutions = ({ executions }) => (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Recent Executions</h3>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-indigo-600"
          onClick={() => navigate("/test-results")}
        >
          View All
        </Button>
      </div>
      
      <div>
        {executions?.length > 0 ? (
          <div className="space-y-4">
            {executions.slice(0, 5).map((execution, index) => (
              <div key={execution.executionId || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={execution.executionStatus?.toLowerCase() === 'passed' ? "success" : 
                              execution.executionStatus?.toLowerCase() === 'failed' ? "danger" : "warning"}
                    >
                      {execution.executionStatus}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">
                        {execution.testPackageName || execution.testSuiteName || execution.testCaseName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {execution.executionType && `${execution.executionType} • `}
                        {execution.executionDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{execution.successRate}%</p>
                    <p className="text-xs text-gray-500">{Number(execution.executionTimeMs || 0).toFixed(2)}ms</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Environment:</span>
                    <p className="font-medium">{execution.environmentName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Executed by:</span>
                    <p className="font-medium">{execution.executedBy || 'System'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Tests:</span>
                    <p className="font-medium">{execution.totalTestCases || execution.totalTests || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Execution ID:</span>
                    <p className="font-medium text-xs">{execution.executionId ? String(execution.executionId).substring(0, 8) + '...' : 'N/A'}</p>
                  </div>
                </div>
                
                {(execution.passed || execution.failed || execution.error) && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                    {execution.passed > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{execution.passed} passed</span>
                      </div>
                    )}
                    {execution.failed > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <FiXCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{execution.failed} failed</span>
                      </div>
                    )}
                    {execution.error > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <FiAlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">{execution.error} error</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiClock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No recent executions found</p>
            <p className="text-sm">Start your first test to see execution history</p>
          </div>
        )}
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading comprehensive dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiAlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchDashboardData()} variant="primary">
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Header */}
      <DashboardHeader />

      {/* Main Metrics Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Test Cases"
          value={metrics.totalTestCases?.toLocaleString() || '0'}
          icon={FiTarget}
          variant="purple"
          onClick={() => navigate("/test-design/test-case")}
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate || 0}%`}
          icon={FiCheckCircle}
          variant="success"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${Number(metrics.averageResponseTime || 0).toFixed(4)}ms`}
          icon={FiClock}
          variant="info"
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects || 0}
          icon={FiUsers}
          variant="orange"
          onClick={() => navigate("/project-setup")}
        />
      </div>

      {/* Secondary Metrics Grid - Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Executions"
          value={metrics.totalExecutions?.toLocaleString() || '0'}
          icon={FiPlayCircle}
          variant="pink"
          onClick={() => navigate("/test-execution")}
        />
        <MetricCard
          title="Passed Tests"
          value={metrics.passedExecutions?.toLocaleString() || '0'}
          icon={FiCheckCircle}
          variant="success"
        />
        <MetricCard
          title="Failed Tests"
          value={metrics.failedExecutions?.toLocaleString() || '0'}
          icon={FiXCircle}
          variant="warning"
        />
        <MetricCard
          title="Error Tests"
          value={metrics.errorExecutions?.toLocaleString() || '0'}
          icon={FiAlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Concurrent"
          value={metrics.concurrentExecutions || 0}
          icon={FiCpu}
          variant="cyan"
        />
      </div>

      {/* Performance Trends and Environment Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart trends={dashboardData?.trends || {}} />
        <EnvironmentPerformance environments={dashboardData?.environments} />
      </div>

      {/* Performance Leaders */}
      <div className="mb-8">
        <PerformanceLeaders 
          topPerformers={dashboardData?.topPerformers} 
          topFailures={dashboardData?.topFailures} 
        />
      </div>

      {/* Recent Executions */}
      <div className="mb-8">
        <RecentExecutions executions={dashboardData?.recentExecutions} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
          <p className="text-gray-600">Start testing with our most common workflows</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="Create API Test"
            subtitle="Add new endpoints"
            icon={FiPlus}
            variant="purple"
            onClick={() => navigate("/test-design/api-repository/create")}
          />
          <QuickActionCard
            title="Run Tests"
            subtitle="Execute test suites"
            icon={FiPlayCircle}
            variant="success"
            onClick={() => navigate("/test-execution")}
          />
          <QuickActionCard
            title="Create Suite"
            subtitle="Organize tests"
            icon={FiLayers}
            variant="info"
            onClick={() => navigate("/test-design/test-suite/create")}
          />
          <QuickActionCard
            title="View Results"
            subtitle="Analyze performance"
            icon={FiBarChart2}
            variant="orange"
            onClick={() => navigate("/test-results")}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <FiAlertTriangle className="h-4 w-4" />
            <span className="text-sm">Some data may not be current due to API issues: {error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
