import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiGrid, FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, 
  FiPlayCircle, FiBarChart2, FiDatabase, FiLayers,
  FiActivity, FiTarget, FiZap, FiAward, FiUsers, FiServer,
  FiCalendar, FiArrowRight, FiRefreshCw, FiAlertTriangle,
  FiMonitor, FiShield, FiEye, FiChevronDown, FiPlus,
  FiCpu, FiHeart, FiTrendingDown, FiPlay
} from "react-icons/fi";
import { 
  Card, Badge, Button, LoadingSpinner,
  MetricCard, QuickActionCard, TrendIndicator, EnhancedMetricCard,
  CompactMetricCard, EmptyChartState, EmptyPerformanceState,
  EmptyEnvironmentState, EnhancedDropdown, DaysSelector,
  ModernPerformanceChart
} from "../UI";
import Breadcrumb from "./Breadcrumb";
import { DashboardErrorBoundary } from "./DashboardErrorBoundary";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useDashboardData } from "../../hooks/useDashboardData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1');

  // Use React Query hook for optimized data fetching
  const {
    dashboardData,
    isLoading,
    isLoadingTrends,
    error,
    refetch,
    lastUpdated
  } = useDashboardData(selectedTimeRange);



  // Simple refresh function using React Query
  const handleRefresh = () => refetch();



  // Enhanced Dashboard Header Component
  const DashboardHeader = () => (
    <div className="relative bg-white border-b border-gray-200 rounded-2xl mb-8 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
      <div className="relative px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-gradient-primary rounded-full" />
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Monitor your API testing performance and track key metrics in real-time
            </p>
          </div>
          
          {/* Enhanced Controls */}
          <div className="flex items-center gap-3">
            <DaysSelector 
              selectedDays={selectedTimeRange}
              onDaysChange={setSelectedTimeRange}
              className="w-44"
            />
            
            <Button variant="ghost" onClick={handleRefresh}>
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            
            <Button variant="primary" onClick={() => navigate("/test-execution")}>
              <FiPlay className="w-4 h-4" />
              Run Tests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modern Performance Chart Component with ApexCharts
  const ModernPerformanceTrends = ({ trends }) => {
    const [selectedTrend, setSelectedTrend] = useState('successRate');
    
    const trendOptions = [
      { 
        key: 'successRate', 
        label: 'Success Rate', 
        data: trends.successRate || [], 
        icon: FiTrendingUp, 
        color: '#10b981',
        yAxisLabel: 'Success Rate (%)',
        unit: '%'
      },
      { 
        key: 'responseTime', 
        label: 'Response Time', 
        data: trends.responseTime || [], 
        icon: FiClock, 
        color: '#3b82f6',
        yAxisLabel: 'Response Time (ms)',
        unit: 'ms'
      },
      { 
        key: 'executionVolume', 
        label: 'Execution Volume', 
        data: trends.executionVolume || [], 
        icon: FiActivity, 
        color: '#8b5cf6',
        yAxisLabel: 'Tests Executed',
        unit: ''
      }
    ];

    const currentTrend = trendOptions.find(t => t.key === selectedTrend);
    const currentStats = trends.stats?.[selectedTrend];

    // Format stat values based on the metric type
    const formatStatValue = (value, unit) => {
      if (!value && value !== 0) return 'N/A';
      
      if (unit === '%') {
        return `${value.toFixed(1)}%`;
      } else if (unit === 'ms') {
        return `${Math.round(value)}ms`;
      } else {
        return Math.round(value).toLocaleString();
      }
    };

    return (
      <Card className="p-6 shadow-elegant h-full hover-lift transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Performance Trends</h3>
              <p className="text-sm text-gray-500">Interactive performance analytics</p>
            </div>
          </div>
          
          {/* Modern Metric Selector */}
          <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1 shadow-inner">
            {trendOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setSelectedTrend(option.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 relative
                  ${selectedTrend === option.key 
                    ? 'bg-white text-gray-900 shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
                {selectedTrend === option.key && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chart Container with Modern Styling */}
        <div className="relative">
          <div className="h-80 bg-gradient-to-br from-gray-50/50 to-white rounded-2xl border border-gray-100/50 p-1 shadow-inner">
            <div className="h-full bg-white rounded-xl p-4">
              {currentTrend?.data && currentTrend.data.length > 0 ? (
                <ModernPerformanceChart 
                  data={currentTrend.data}
                  color={currentTrend.color}
                  title={currentTrend.label}
                  yAxisLabel={currentTrend.yAxisLabel}
                  height={280}
                  showGrid={true}
                  showPoints={true}
                  gradient={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      {currentTrend?.icon && <currentTrend.icon className="w-8 h-8 text-gray-400" />}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h4>
                    <p className="text-sm text-gray-500 mb-4">Run some tests to see performance trends here</p>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate("/test-execution")}
                    >
                      <FiPlay className="w-4 h-4 mr-2" />
                      Start Testing
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Dynamic Chart Statistics */}
          {currentTrend?.data && currentTrend.data.length > 0 && currentStats && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">Average</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatStatValue(currentStats.average, currentTrend.unit)}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-2 uppercase tracking-wide">Best</p>
                <p className="text-xl font-bold text-green-900">
                  {formatStatValue(currentStats.best, currentTrend.unit)}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium mb-2 uppercase tracking-wide">Worst</p>
                <p className="text-xl font-bold text-red-900">
                  {formatStatValue(currentStats.worst, currentTrend.unit)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Enhanced Environment Performance with better design
  const EnhancedEnvironmentStatus = ({ environments }) => (
    <Card className="p-6 shadow-elegant h-fit hover-lift transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
          <FiServer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Environment Status</h3>
          <p className="text-xs text-gray-500">Real-time health monitoring</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {environments?.length > 0 ? (
          environments.map((env, index) => (
            <EnvironmentCard key={index} environment={env} />
          ))
        ) : (
          <EmptyEnvironmentState 
            onAddEnvironment={() => navigate("/admin/environment-setup")}
          />
        )}
      </div>
    </Card>
  );

  // Individual Environment Card with enhanced styling
  const EnvironmentCard = ({ environment }) => {
    const getStatusColor = (rate) => {
      if (rate >= 95) return 'success';
      if (rate >= 80) return 'warning';
      return 'error';
    };

    const status = getStatusColor(environment.successRate);
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'success' ? 'bg-green-500' : 
              status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            } animate-pulse`} />
            <div>
              <p className="font-semibold text-gray-900">{environment.name}</p>
              <p className="text-xs text-gray-500">{environment.tests} tests</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{environment.successRate}%</p>
            <span className={`text-xs px-2 py-1 rounded-full border ${colors[status]}`}>
              {status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Performance Leaders Component with better design
  const PerformanceLeaders = ({ topPerformers, topFailures }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Performers Card */}
      <Card className="p-6 shadow-elegant hover-lift transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-sm">
            <FiAward className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Top Performers</h3>
            <p className="text-sm text-gray-500">Highest success rates</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {topPerformers?.length > 0 ? (
            topPerformers.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.executionCount || 0} executions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">{item.successRate}%</p>
                  <div className="w-16 h-2 bg-green-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-success rounded-full transition-all duration-700"
                      style={{ width: `${item.successRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyChartState 
              icon={FiAward}
              title="No Performance Data"
              description="Run tests to see top performing test suites"
              actionText="Start Testing"
              onAction={() => navigate("/test-execution")}
              size="small"
              variant="success"
            />
          )}
        </div>
      </Card>

      {/* Needs Attention Card */}
      <Card className="p-6 shadow-elegant hover-lift transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-sm">
            <FiAlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Needs Attention</h3>
            <p className="text-sm text-gray-500">Tests requiring review</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {topFailures?.length > 0 ? (
            topFailures.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-warning rounded-full flex items-center justify-center shadow-sm">
                    <FiAlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.executionCount || 0} executions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">{item.successRate}%</p>
                  <div className="w-16 h-2 bg-red-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-warning rounded-full transition-all duration-700"
                      style={{ width: `${item.successRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <FiShield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">All Systems Healthy</h4>
              <p className="text-sm text-gray-600 mb-4">No critical issues detected in your test suites</p>
              <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Monitoring active</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Enhanced Recent Executions Component with better styling
  const RecentExecutions = ({ executions }) => (
    <Card className="p-6 shadow-elegant hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
            <FiActivity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Recent Executions</h3>
            <p className="text-sm text-gray-500">Latest test results</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-indigo-600 hover:bg-indigo-50"
          onClick={() => navigate("/test-results")}
        >
          <FiArrowRight className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {executions?.length > 0 ? (
          executions.slice(0, 5).map((execution, index) => (
            <div key={execution.executionId || index} className="p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={execution.executionStatus?.toLowerCase() === 'passed' ? "success" : 
                            execution.executionStatus?.toLowerCase() === 'failed' ? "danger" : "warning"}
                    className="shadow-sm"
                  >
                    {execution.executionStatus}
                  </Badge>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {execution.testPackageName || execution.testSuiteName || execution.testCaseName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {execution.executionType && `${execution.executionType} • `}
                      {execution.executionDate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{execution.successRate}%</p>
                  <p className="text-xs text-gray-500">{Number(execution.executionTimeMs || 0).toFixed(0)}ms</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium">Environment</span>
                  <p className="font-semibold text-gray-900">{execution.environmentName || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium">Tests</span>
                  <p className="font-semibold text-gray-900">{execution.totalTests || 0}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium">Passed</span>
                  <p className="font-semibold text-green-600">{execution.passedTests || 0}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium">Failed</span>
                  <p className="font-semibold text-red-600">{execution.failedTests || 0}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyChartState 
            icon={FiActivity}
            title="No Recent Executions"
            description="Test execution history will appear here"
            actionText="Run Your First Test"
            onAction={() => navigate("/test-execution")}
            variant="info"
          />
        )}
      </div>
    </Card>
  );

  // Show skeleton during initial load
  if (isLoading && !dashboardData?.metrics) {
    return (
      <div>
        <Breadcrumb />
        <DashboardSkeleton />
      </div>
    );
  }

  // Show error if complete failure and no cached data
  if (error && !dashboardData?.metrics) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <DashboardErrorBoundary>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FiAlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Dashboard</h3>
              <p className="text-gray-600 mb-4">{error?.message || error}</p>
              <Button onClick={handleRefresh} variant="primary">
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </DashboardErrorBoundary>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="dashboard-container min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Breadcrumb */}
      <div className="p-6 pb-0">
        <Breadcrumb />
      </div>
      
      {/* Enhanced Header */}
      <div className="px-6">
        <DashboardHeader />
      </div>

      <div className="px-6 pb-8">
        {/* Primary Metrics Grid with Enhanced Visual Hierarchy */}
        <DashboardErrorBoundary>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Primary Metric - Success Rate gets high priority */}
              <div className="lg:col-span-2">
                              <EnhancedMetricCard
                title="Overall Success Rate"
                value={`${metrics.successRate || 0}%`}
                subtitle="Last 7 days"
                trend={dashboardData?.trendPercentages?.successRate || 0}
                trendInfo={dashboardData?.trendInfo?.successRate}
                showChart={false}
                icon={FiCheckCircle}
                priority="high"
                status="success"
                onClick={() => navigate("/test-results")}
              />
              </div>
              
              {/* Secondary Metrics */}
              <EnhancedMetricCard
                title="Avg Response Time"
                value={`${metrics.averageResponseTime || 0}ms`}
                subtitle="Average response time"
                trend={dashboardData?.trendPercentages?.responseTime || 0}
                trendInfo={dashboardData?.trendInfo?.responseTime}
                showChart={false}
                icon={FiClock}
                priority="normal"
                status="info"
              />
              
              <EnhancedMetricCard
                title="Tests Executed"
                value={metrics.totalExecutions?.toLocaleString() || '0'}
                subtitle="Total executions"
                trend={dashboardData?.trendPercentages?.executionVolume || 0}
                trendInfo={dashboardData?.trendInfo?.executionVolume}
                showChart={false}
                icon={FiActivity}
                priority="normal"
                status="info"
                onClick={() => navigate("/test-execution")}
              />
            </div>
          </div>

          {/* Secondary Metrics Row - Compact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CompactMetricCard
              title="Total Projects"
              value={metrics.activeProjects || 0}
              icon={FiUsers}
              status="info"
              trend={0}
              onClick={() => navigate("/project-setup")}
            />
            <CompactMetricCard
              title="Failed Tests"
              value={metrics.failedExecutions?.toLocaleString() || '0'}
              icon={FiXCircle}
              status="warning"
              trend={dashboardData?.trendPercentages?.failedTests || 0}
              trendInfo={dashboardData?.trendInfo?.failedTests}
            />
            <CompactMetricCard
              title="Total Test Cases"
              value={metrics.totalTestCases?.toLocaleString() || '0'}
              icon={FiTarget}
              status="success"
              trend={dashboardData?.trendPercentages?.totalTestCases || 0}
              trendInfo={dashboardData?.trendInfo?.totalTestCases}
              onClick={() => navigate("/test-design/test-case")}
            />
            <CompactMetricCard
              title="Environments"
              value={(dashboardData?.environments?.length || 0).toString()}
              icon={FiServer}
              status="success"
              trend={0}
              onClick={() => navigate("/admin/environment-setup")}
            />
          </div>
        </DashboardErrorBoundary>

        {/* Charts Section with Better Layout */}
        <DashboardErrorBoundary>
          {isLoadingTrends ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              <div className="xl:col-span-2">
                <DashboardSkeleton.Charts />
              </div>
              <div>
                <DashboardSkeleton.Charts />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Performance Trends - Takes more space */}
              <div className="xl:col-span-2">
                <ModernPerformanceTrends trends={dashboardData?.trends || {}} />
              </div>
              
              {/* Environment Status - Compact sidebar */}
              <div>
                <EnhancedEnvironmentStatus environments={dashboardData?.environments} />
              </div>
            </div>
          )}
        </DashboardErrorBoundary>

        {/* Performance Leaders */}
        <DashboardErrorBoundary>
          <div className="mb-8">
            <PerformanceLeaders 
              topPerformers={dashboardData?.topPerformers} 
              topFailures={dashboardData?.topFailures} 
            />
          </div>
        </DashboardErrorBoundary>

        {/* Recent Executions */}
        <DashboardErrorBoundary>
          <div className="mb-8">
            <RecentExecutions executions={dashboardData?.recentExecutions} />
          </div>
        </DashboardErrorBoundary>

        {/* Quick Actions with Enhanced Design */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
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
      </div>
    </div>
  );
};

// Export Dashboard wrapped with error boundary for complete protection
const DashboardWithErrorBoundary = () => (
  <DashboardErrorBoundary>
    <Dashboard />
  </DashboardErrorBoundary>
);

export default DashboardWithErrorBoundary;
