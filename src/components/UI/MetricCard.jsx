import React from 'react';
import { LineChart, EnhancedLineChart, EnhancedBarChart } from './Charts';

// Enhanced Metric Card with Improved Design and Features
export const EnhancedMetricCard = ({ 
  title,
  value,
  subtitle,
  trend,
  chartData,
  chartType = "line",
  showChart = false, // Add explicit control for chart display
  icon: Icon,
  priority = "normal", // high, normal, low
  status = "success", // success, warning, error, info
  className = "",
  onClick
}) => {
  const priorityStyles = {
    high: {
      container: "bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-200 shadow-elegant",
      iconBg: "bg-gradient-primary",
      chartHeight: 80
    },
    normal: {
      container: "bg-white border border-gray-200 shadow-card hover-lift",
      iconBg: "bg-gradient-info",
      chartHeight: 60
    },
    low: {
      container: "bg-gray-50 border border-gray-100 shadow-sm",
      iconBg: "bg-gray-400",
      chartHeight: 40
    }
  };

  const statusColors = {
    success: { gradient: "bg-gradient-success", color: "#10b981" },
    warning: { gradient: "bg-gradient-warning", color: "#f59e0b" },
    error: { gradient: "bg-gradient-warning", color: "#ef4444" },
    info: { gradient: "bg-gradient-info", color: "#3b82f6" }
  };

  const styles = priorityStyles[priority];
  const colors = statusColors[status];

  const isClickable = typeof onClick === 'function';
  const baseClasses = `p-6 rounded-xl transition-all duration-300 ${styles.container} ${isClickable ? 'cursor-pointer' : ''} ${className}`;

  const cardContent = (
    <>
      {/* Header with enhanced visual hierarchy */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-3 rounded-xl ${styles.iconBg} hover-glow transition-all duration-300`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                  ${trend > 0 ? 'bg-green-100 text-green-700' : trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
                </div>
              )}
            </div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
      
      {/* Enhanced Chart - only show when explicitly enabled */}
      {showChart && chartData && chartData.length > 0 && (
        <div className="relative">
          <div 
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-50 to-gray-100"
            style={{ height: `${styles.chartHeight}px` }}
          >
            {chartType === "line" && (
              <EnhancedLineChart 
                data={chartData} 
                color={colors.color}
                height={styles.chartHeight}
                showGrid={priority === 'high'}
                showPoints={priority === 'high'}
                gradient={true}
                className="w-full h-full"
              />
            )}
            {chartType === "bar" && (
              <EnhancedBarChart 
                data={chartData} 
                color={colors.color}
                height={styles.chartHeight}
                showValues={priority === 'high'}
                gradient={true}
                className="w-full h-full"
              />
            )}
          </div>
          
          {/* Chart overlay for better visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none rounded-lg" />
        </div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
};

// Compact Metric Card for Secondary Metrics
export const CompactMetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  status = "info",
  trend = 0,
  className = "",
  onClick
}) => {
  const statusColors = {
    success: "border-green-200 bg-gradient-to-br from-green-50 to-green-100/50",
    warning: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50",
    error: "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50",
    info: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50"
  };

  const iconColors = {
    success: "text-green-600",
    warning: "text-yellow-600", 
    error: "text-red-600",
    info: "text-blue-600"
  };

  const isClickable = typeof onClick === 'function';
  const baseClasses = `p-5 rounded-xl border-2 ${statusColors[status]} hover-lift transition-all duration-300 ${isClickable ? 'cursor-pointer' : ''} ${className}`;

  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/70 backdrop-blur-sm ${iconColors[status]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      
      {trend !== 0 && (
        <div className={`text-xs font-semibold px-2 py-1 rounded-full
          ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
};

// Original MetricCard for backward compatibility
const MetricCard = ({
  title,
  value,
  icon: Icon,
  variant = 'purple',
  className = '',
  onClick,
  ...props
}) => {
  const variantClasses = {
    purple: 'bg-gradient-primary text-white',
    success: 'bg-gradient-success text-white',
    warning: 'bg-gradient-warning text-white',
    info: 'bg-gradient-info text-white',
    pink: 'bg-gradient-pink text-white',
    cyan: 'bg-gradient-cyan text-white',
    orange: 'bg-gradient-orange text-white'
  };

  const isClickable = typeof onClick === 'function';
  const baseClasses = `
    p-6 rounded-xl border-0 shadow-card transition-all duration-200 hover:scale-105 hover:shadow-elegant
    ${variantClasses[variant]}
    ${isClickable ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {Icon && (
        <div className="ml-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <div className={baseClasses} onClick={onClick} {...props}>
        {cardContent}
      </div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {cardContent}
    </div>
  );
};

export default MetricCard; 