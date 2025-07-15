import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

// Simple Line Chart Component
export const LineChart = ({ 
  data, 
  title, 
  color = "#4f46e5", 
  height = 80, 
  showGrid = true,
  showPoints = true,
  className = ""
}) => {
  if (!data || data.length === 0) return null;

  const values = data.map(item => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - min) / range) * 80; // Leave 10% padding top/bottom
    return { x, y, value: item.value, date: item.date };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className={`p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>}
      
      <div className="relative">
        <svg width="100%" height={height} viewBox="0 0 100 100" className="overflow-visible">
          {/* Grid Lines */}
          {showGrid && (
            <g stroke="#f3f4f6" strokeWidth="0.2">
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} />
              ))}
              {[0, 25, 50, 75, 100].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" />
              ))}
            </g>
          )}
          
          {/* Area Fill */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={color}
            fillOpacity="0.1"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Points */}
          {showPoints && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="hover:r-3 transition-all duration-200"
            >
              <title>{`${point.date}: ${point.value}`}</title>
            </circle>
          ))}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-3">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
      
      {/* Value range */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Min: {min}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
};

// Progress Bar Chart
export const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  color = "bg-blue-500",
  backgroundColor = "bg-gray-200",
  showPercentage = true,
  height = "h-2",
  className = ""
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClass = (val) => {
    if (val >= 90) return "bg-green-500";
    if (val >= 70) return "bg-yellow-500";
    if (val >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const colorClass = color.startsWith('bg-') ? color : getColorClass(percentage);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">{label}</span>
          {showPercentage && (
            <span className="text-gray-500">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${backgroundColor} rounded-full ${height} overflow-hidden`}>
        <div 
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Metric Trend Indicator
export const TrendIndicator = ({ 
  value, 
  trend, 
  size = "md",
  showValue = true,
  className = ""
}) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const getTrendIcon = () => {
    if (!trend || trend === 0) return <FiMinus className={iconSizeClasses[size]} />;
    if (trend > 0) return <FiTrendingUp className={iconSizeClasses[size]} />;
    return <FiTrendingDown className={iconSizeClasses[size]} />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500 bg-gray-100';
    if (trend > 0) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${sizeClasses[size]} font-medium ${getTrendColor()} ${className}`}>
      {getTrendIcon()}
      {showValue && <span>{Math.abs(trend || 0)}%</span>}
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ 
  data, 
  size = 120, 
  strokeWidth = 10,
  className = ""
}) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercentage = 0;
  
  return (
    <div className={`relative inline-block ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        
        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
          
          accumulatedPercentage += percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color || "#4f46e5"}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
};

// Bar Chart Component
export const BarChart = ({ 
  data, 
  title,
  color = "#4f46e5",
  height = 120,
  showValues = true,
  className = ""
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className={`p-4 border rounded-xl bg-white shadow-sm ${className}`}>
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>}
      
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height;
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              {showValues && (
                <span className="text-xs text-gray-600 font-medium">
                  {item.value}
                </span>
              )}
              <div 
                className="w-full rounded-t-md transition-all duration-500 ease-out"
                style={{ 
                  height: `${barHeight}px`,
                  backgroundColor: item.color || color,
                  minHeight: '4px'
                }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-gray-500 text-center leading-tight">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Metric Card with Chart
export const MetricCardWithChart = ({ 
  title,
  value,
  subtitle,
  trend,
  chartData,
  chartType = "line",
  icon: Icon,
  color = "blue",
  className = ""
}) => {
  const colorClasses = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", chart: "#3b82f6" },
    green: { bg: "bg-green-50", text: "text-green-600", chart: "#10b981" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", chart: "#f59e0b" },
    red: { bg: "bg-red-50", text: "text-red-600", chart: "#ef4444" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", chart: "#8b5cf6" }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && <TrendIndicator value={trend} trend={trend} />}
      </div>
      
      {chartData && chartData.length > 0 && (
        <div className="mt-4">
          {chartType === "line" && (
            <LineChart 
              data={chartData} 
              color={colors.chart} 
              height={40}
              showGrid={false}
              showPoints={false}
            />
          )}
          {chartType === "bar" && (
            <BarChart 
              data={chartData} 
              color={colors.chart} 
              height={40}
              showValues={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Status Ring Chart
export const StatusRing = ({ 
  percentage, 
  size = 80, 
  strokeWidth = 6,
  label,
  color = "#10b981",
  className = ""
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-block ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color }}>
            {percentage}%
          </div>
          {label && <div className="text-xs text-gray-500">{label}</div>}
        </div>
      </div>
    </div>
  );
};

export default {
  LineChart,
  ProgressBar,
  TrendIndicator,
  DonutChart,
  BarChart,
  MetricCardWithChart,
  StatusRing
}; 