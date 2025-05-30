import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiGrid, FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, 
  FiPlayCircle, FiBarChart2, FiDatabase, FiFileText, FiLayers,
  FiArchive, FiActivity, FiTarget, FiZap, FiAward, FiUsers,
  FiCalendar, FiArrowRight, FiRefreshCw
} from "react-icons/fi";
import { Card, Badge, Button } from "../UI";
import Breadcrumb from "./Breadcrumb";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalTests: 247,
      passRate: 94.2,
      executionTime: 2.3,
      activeProjects: 3
    },
    recentExecutions: [
      { id: 1, name: "API Authentication Tests", status: "passed", time: "2 hours ago", duration: "1.2s" },
      { id: 2, name: "User Management Suite", status: "failed", time: "4 hours ago", duration: "3.4s" },
      { id: 3, name: "Payment Gateway Tests", status: "passed", time: "6 hours ago", duration: "0.8s" },
      { id: 4, name: "Data Validation Suite", status: "passed", time: "1 day ago", duration: "2.1s" }
    ],
    quickStats: {
      apiEndpoints: 89,
      testSuites: 23,
      testCases: 156,
      testPackages: 12
    }
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const MetricCard = ({ icon: Icon, title, value, subtitle, trend, color = "indigo" }) => {
    const colorClasses = {
      indigo: "bg-indigo-600 text-white",
      green: "bg-green-600 text-white",
      blue: "bg-blue-600 text-white",
      orange: "bg-orange-600 text-white"
    };

    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <Card.Body>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
              </div>
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <FiTrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color = "indigo" }) => {
    const colorClasses = {
      indigo: "hover:bg-indigo-50 hover:border-indigo-200",
      green: "hover:bg-green-50 hover:border-green-200",
      blue: "hover:bg-blue-50 hover:border-blue-200",
      orange: "hover:bg-orange-50 hover:border-orange-200"
    };

    const iconColorClasses = {
      indigo: "bg-indigo-600",
      green: "bg-green-600",
      blue: "bg-blue-600",
      orange: "bg-orange-600"
    };

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 border-gray-200 ${colorClasses[color]} group`}
        onClick={onClick}
      >
        <Card.Body className="text-center p-6">
          <div className={`mx-auto w-12 h-12 rounded-lg ${iconColorClasses[color]} flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform duration-200`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-700">
            <span className="text-sm font-medium">Get Started</span>
            <FiArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Card.Body>
      </Card>
    );
  };

  const RecentActivityItem = ({ execution }) => {
    const getStatusBadge = (status) => {
      switch (status) {
        case 'passed':
          return <Badge variant="success" icon={FiCheckCircle}>Passed</Badge>;
        case 'failed':
          return <Badge variant="error" icon={FiXCircle}>Failed</Badge>;
        default:
          return <Badge variant="gray">Unknown</Badge>;
      }
    };

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            execution.status === 'passed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {execution.status === 'passed' ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{execution.name}</h4>
            <p className="text-sm text-gray-500">{execution.time} • Duration: {execution.duration}</p>
          </div>
        </div>
        {getStatusBadge(execution.status)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiRefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-gray-800 font-inter">
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Header Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
            <p className="text-gray-600">Here's what's happening with your API testing today.</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">{dashboardData.metrics.passRate}%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">{dashboardData.metrics.totalTests}</div>
              <div className="text-sm text-gray-500">Total Tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={FiTarget}
          title="Total Test Cases"
          value={dashboardData.metrics.totalTests}
          subtitle="Active test scenarios"
          trend={12}
          color="indigo"
        />
        <MetricCard
          icon={FiAward}
          title="Success Rate"
          value={`${dashboardData.metrics.passRate}%`}
          subtitle="Last 30 days"
          trend={5.2}
          color="green"
        />
        <MetricCard
          icon={FiZap}
          title="Avg Response Time"
          value={`${dashboardData.metrics.executionTime}s`}
          subtitle="Per test execution"
          trend={-8}
          color="blue"
        />
        <MetricCard
          icon={FiUsers}
          title="Active Projects"
          value={dashboardData.metrics.activeProjects}
          subtitle="Currently testing"
          trend={15}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FiGrid className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </Card.Title>
              <Card.Description>Start testing with these common tasks</Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionCard
                  icon={FiDatabase}
                  title="Create API Test"
                  description="Add new API endpoints for testing"
                  onClick={() => navigate("/test-design/api-repository/create")}
                  color="indigo"
                />
                <QuickActionCard
                  icon={FiPlayCircle}
                  title="Run Test Suite"
                  description="Execute your test collections"
                  onClick={() => navigate("/test-execution")}
                  color="green"
                />
                <QuickActionCard
                  icon={FiLayers}
                  title="Create Test Suite"
                  description="Organize tests into suites"
                  onClick={() => navigate("/test-design/test-suite/create")}
                  color="blue"
                />
                <QuickActionCard
                  icon={FiBarChart2}
                  title="View Results"
                  description="Analyze test execution results"
                  onClick={() => navigate("/test-results")}
                  color="orange"
                />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Test Assets Summary */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FiActivity className="h-5 w-5 text-indigo-600" />
                Test Assets
              </Card.Title>
              <Card.Description>Your testing resources</Card.Description>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiDatabase className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-gray-700">API Endpoints</span>
                </div>
                <span className="font-bold text-indigo-600">{dashboardData.quickStats.apiEndpoints}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiFileText className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-700">Test Cases</span>
                </div>
                <span className="font-bold text-green-600">{dashboardData.quickStats.testCases}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiLayers className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-700">Test Suites</span>
                </div>
                <span className="font-bold text-blue-600">{dashboardData.quickStats.testSuites}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiArchive className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-gray-700">Test Packages</span>
                </div>
                <span className="font-bold text-orange-600">{dashboardData.quickStats.testPackages}</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title className="flex items-center gap-2">
                <FiClock className="h-5 w-5 text-indigo-600" />
                Recent Test Executions
              </Card.Title>
              <Card.Description>Latest test runs and their results</Card.Description>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/test-results")}
              className="flex items-center gap-2"
            >
              View All
              <FiArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="divide-y divide-gray-100">
            {dashboardData.recentExecutions.map((execution) => (
              <RecentActivityItem key={execution.id} execution={execution} />
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
