import React from 'react';
import { FiBarChart2, FiTrendingUp, FiDatabase, FiPlay, FiSettings } from 'react-icons/fi';

// Enhanced Empty State Component for Charts and Data
export const EmptyChartState = ({ 
  icon: Icon,
  title = "No Data Available",
  description = "Start collecting data to see beautiful charts here",
  actionText = "Learn More",
  onAction,
  className = ""
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm hover-lift transition-all duration-300">
      {Icon ? (
        <Icon className="w-8 h-8 text-gray-400" />
      ) : (
        <FiBarChart2 className="w-8 h-8 text-gray-400" />
      )}
    </div>
    
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-xs leading-relaxed">{description}</p>
    
    {onAction && (
      <button
        onClick={onAction}
        className="btn btn-secondary btn-sm hover:btn-primary transition-all duration-300"
      >
        {actionText}
      </button>
    )}
  </div>
);

// Enhanced Empty State for Performance Data
export const EmptyPerformanceState = ({ 
  onStartTesting,
  className = ""
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-elegant hover-lift transition-all duration-300">
        <FiTrendingUp className="w-10 h-10 text-indigo-600" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-xs font-bold">!</span>
      </div>
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3">No Performance Data Yet</h3>
    <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
      Run your first test suite to unlock detailed performance analytics, trend analysis, and actionable insights.
    </p>
    
    <div className="flex flex-col sm:flex-row gap-3">
      {onStartTesting && (
        <button
          onClick={onStartTesting}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlay className="w-4 h-4" />
          Start Testing
        </button>
      )}
      <button className="btn btn-secondary">
        View Documentation
      </button>
    </div>
    
    {/* Benefits list */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span>Real-time metrics</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <span>Trend analysis</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
        <span>Performance insights</span>
      </div>
    </div>
  </div>
);

// Enhanced Empty State for Environment Data
export const EmptyEnvironmentState = ({ 
  onAddEnvironment,
  className = ""
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm hover-lift transition-all duration-300">
      <FiDatabase className="w-8 h-8 text-emerald-600" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Environments Found</h3>
    <p className="text-sm text-gray-600 mb-4 max-w-xs leading-relaxed">
      Add test environments to monitor their health and performance in real-time.
    </p>
    
    {onAddEnvironment && (
      <button
        onClick={onAddEnvironment}
        className="btn btn-success btn-sm flex items-center gap-2"
      >
        <FiSettings className="w-4 h-4" />
        Add Environment
      </button>
    )}
    
    <div className="mt-6 text-xs text-gray-400">
      Pro tip: Start with your development environment
    </div>
  </div>
);

// Generic Enhanced Empty State
export const EmptyState = ({ 
  icon: Icon = FiBarChart2,
  title = "No Data Available",
  description = "Get started by adding some data",
  actionText = "Get Started",
  onAction,
  variant = "default", // default, success, warning, info
  size = "medium", // small, medium, large
  className = ""
}) => {
  const variants = {
    default: {
      iconBg: "bg-gradient-to-br from-gray-100 to-gray-200",
      iconColor: "text-gray-400",
      button: "btn-secondary"
    },
    success: {
      iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
      iconColor: "text-green-600",
      button: "btn-success"
    },
    warning: {
      iconBg: "bg-gradient-to-br from-yellow-100 to-orange-100",
      iconColor: "text-yellow-600",
      button: "btn-warning"
    },
    info: {
      iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      button: "btn-primary"
    }
  };

  const sizes = {
    small: {
      container: "py-8 px-4",
      icon: "w-12 h-12",
      iconSize: "w-6 h-6",
      title: "text-base",
      description: "text-xs",
      button: "btn-sm"
    },
    medium: {
      container: "py-12 px-6",
      icon: "w-16 h-16",
      iconSize: "w-8 h-8",
      title: "text-lg",
      description: "text-sm",
      button: ""
    },
    large: {
      container: "py-16 px-8",
      icon: "w-20 h-20",
      iconSize: "w-10 h-10",
      title: "text-xl",
      description: "text-base",
      button: "btn-lg"
    }
  };

  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeStyles.container} ${className}`}>
      <div className={`${sizeStyles.icon} ${variantStyles.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-sm hover-lift transition-all duration-300`}>
        <Icon className={`${sizeStyles.iconSize} ${variantStyles.iconColor}`} />
      </div>
      
      <h3 className={`${sizeStyles.title} font-semibold text-gray-700 mb-2`}>{title}</h3>
      <p className={`${sizeStyles.description} text-gray-500 mb-4 max-w-xs leading-relaxed`}>{description}</p>
      
      {onAction && (
        <button
          onClick={onAction}
          className={`btn ${variantStyles.button} ${sizeStyles.button} transition-all duration-300`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Empty State for Dashboard Sections
export const DashboardEmptyState = ({ 
  section = "metrics",
  onAction,
  className = ""
}) => {
  const sections = {
    metrics: {
      icon: FiBarChart2,
      title: "No Metrics Available",
      description: "Start running tests to see key performance indicators",
      actionText: "Run Your First Test",
      variant: "info"
    },
    trends: {
      icon: FiTrendingUp,
      title: "No Trend Data",
      description: "Performance trends will appear after running multiple tests",
      actionText: "View Test History",
      variant: "default"
    },
    environments: {
      icon: FiDatabase,
      title: "No Environments",
      description: "Add environments to monitor their status and health",
      actionText: "Add Environment",
      variant: "success"
    }
  };

  const config = sections[section] || sections.metrics;

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      actionText={config.actionText}
      variant={config.variant}
      onAction={onAction}
      className={className}
    />
  );
};

export default EmptyState; 