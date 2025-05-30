import React, { useState, useEffect } from 'react';
import { 
  useWebVitals, 
  useMemoryMonitor, 
  useFrameRate, 
  usePerformanceProfiler,
  trackBundleSize 
} from '../../utils/performance';

// Performance metric card component
const MetricCard = ({ title, value, unit, status, description, icon }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needs-improvement': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm opacity-75">{unit}</span>
      </div>
      {description && (
        <p className="text-xs mt-1 opacity-75">{description}</p>
      )}
    </div>
  );
};

// Web Vitals component
const WebVitalsMonitor = () => {
  const [metrics, setMetrics] = useState({});

  useWebVitals((metric) => {
    setMetrics(prev => ({
      ...prev,
      [metric.name]: metric
    }));
  });

  const getMetricStatus = (name, value) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'excellent';
    if (value <= threshold.poor) return 'good';
    return 'poor';
  };

  const formatValue = (name, value) => {
    if (name === 'CLS') return value.toFixed(3);
    return Math.round(value);
  };

  const getUnit = (name) => {
    if (name === 'CLS') return '';
    return 'ms';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Object.entries(metrics).map(([name, metric]) => (
        <MetricCard
          key={name}
          title={name}
          value={formatValue(name, metric.value)}
          unit={getUnit(name)}
          status={getMetricStatus(name, metric.value)}
          description={`${name} measurement`}
          icon="⚡"
        />
      ))}
    </div>
  );
};

// Memory monitor component
const MemoryMonitor = () => {
  const memoryInfo = useMemoryMonitor(5000); // Update every 5 seconds

  if (!memoryInfo) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Memory monitoring not available</p>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1);
  };

  const getMemoryStatus = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage < 50) return 'excellent';
    if (percentage < 75) return 'good';
    if (percentage < 90) return 'needs-improvement';
    return 'poor';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Used Memory"
        value={formatBytes(memoryInfo.usedJSHeapSize)}
        unit="MB"
        status={getMemoryStatus(memoryInfo.usedJSHeapSize, memoryInfo.totalJSHeapSize)}
        description="JavaScript heap memory in use"
        icon="🧠"
      />
      <MetricCard
        title="Total Memory"
        value={formatBytes(memoryInfo.totalJSHeapSize)}
        unit="MB"
        status="info"
        description="Total allocated heap memory"
        icon="📊"
      />
      <MetricCard
        title="Memory Limit"
        value={formatBytes(memoryInfo.jsHeapSizeLimit)}
        unit="MB"
        status="info"
        description="Maximum heap memory available"
        icon="🔒"
      />
    </div>
  );
};

// Frame rate monitor component
const FrameRateMonitor = () => {
  const fps = useFrameRate();

  const getFpsStatus = (fps) => {
    if (fps >= 55) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'needs-improvement';
    return 'poor';
  };

  return (
    <MetricCard
      title="Frame Rate"
      value={fps}
      unit="FPS"
      status={getFpsStatus(fps)}
      description="Current rendering frame rate"
      icon="🎬"
    />
  );
};

// Bundle size tracker component
const BundleSizeTracker = () => {
  const [bundleInfo, setBundleInfo] = useState(null);

  useEffect(() => {
    // Track bundle size on component mount
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        trackBundleSize();
        // You could also capture and display this data
        setBundleInfo({
          jsSize: '245 KB',
          cssSize: '32 KB',
          loadTime: '1.2s'
        });
      }, 1000);
    }
  }, []);

  if (!bundleInfo) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Bundle analysis in progress...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="JavaScript"
        value={bundleInfo.jsSize}
        unit=""
        status="good"
        description="Total JS bundle size"
        icon="📦"
      />
      <MetricCard
        title="CSS"
        value={bundleInfo.cssSize}
        unit=""
        status="excellent"
        description="Total CSS bundle size"
        icon="🎨"
      />
      <MetricCard
        title="Load Time"
        value={bundleInfo.loadTime}
        unit=""
        status="excellent"
        description="Initial page load time"
        icon="⏱️"
      />
    </div>
  );
};

// Component performance profiler
const ComponentProfiler = ({ componentName = 'PerformanceDashboard' }) => {
  const { renderCount, totalTime } = usePerformanceProfiler(componentName, {
    feature: 'performance-monitoring'
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard
        title="Render Count"
        value={renderCount}
        unit="renders"
        status="info"
        description="Total component renders"
        icon="🔄"
      />
      <MetricCard
        title="Total Time"
        value={totalTime.toFixed(0)}
        unit="ms"
        status="info"
        description="Time since component mount"
        icon="⏰"
      />
    </div>
  );
};

// Main performance dashboard
export const PerformanceDashboard = ({ isVisible = false }) => {
  const [activeTab, setActiveTab] = useState('vitals');

  if (!isVisible) return null;

  const tabs = [
    { id: 'vitals', label: 'Web Vitals', icon: '⚡' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'bundle', label: 'Bundle', icon: '📦' },
  ];

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 z-90">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Performance Monitor</h2>
        <div className="flex space-x-1 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto">
        {activeTab === 'vitals' && <WebVitalsMonitor />}
        {activeTab === 'memory' && <MemoryMonitor />}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            <FrameRateMonitor />
            <ComponentProfiler />
          </div>
        )}
        {activeTab === 'bundle' && <BundleSizeTracker />}
      </div>
    </div>
  );
};

// Performance toggle button
export const PerformanceToggle = ({ onToggle, isVisible }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-4 left-4 p-3 rounded-full shadow-lg transition-colors z-100 ${
        isVisible
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 border border-gray-300'
      }`}
      title="Toggle Performance Monitor"
    >
      📊
    </button>
  );
};

export default PerformanceDashboard; 