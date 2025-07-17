import React from 'react';
import { Card } from '../UI';

// Base skeleton component
const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`} />
);

// Skeleton for metric cards
const MetricSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" className="rounded-lg" />
        <div>
          <Skeleton width="w-20" height="h-4" className="mb-2" />
          <Skeleton width="w-16" height="h-3" />
        </div>
      </div>
      <Skeleton width="w-8" height="h-8" className="rounded-full" />
    </div>
    <div className="flex items-end gap-2">
      <Skeleton width="w-16" height="h-8" />
      <Skeleton width="w-12" height="h-4" />
    </div>
  </Card>
);

// Skeleton for chart components
const ChartSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton width="w-32" height="h-6" />
      <Skeleton width="w-20" height="h-4" />
    </div>
    <div className="relative h-48 bg-gray-100 rounded-lg">
      <div className="absolute bottom-4 left-4 right-4 h-32">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bottom-0 bg-gray-300 rounded-t animate-pulse" 
            style={{ 
              left: `${i * 16}%`, 
              width: '8%', 
              height: `${30 + (i * 10)}%`,
              animationDelay: `${i * 0.1}s`
            }} 
          />
        ))}
      </div>
    </div>
  </Card>
);

// Skeleton for performance leaders
const PerformanceLeadersSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(2)].map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton width="w-10" height="h-10" className="rounded-lg" />
          <Skeleton width="w-32" height="h-6" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton width="w-6" height="h-6" className="rounded-full" />
                <Skeleton width="w-24" height="h-4" />
              </div>
              <Skeleton width="w-12" height="h-4" />
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// Skeleton for recent executions
const RecentExecutionsSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" className="rounded-lg" />
        <Skeleton width="w-32" height="h-6" />
      </div>
      <Skeleton width="w-20" height="h-4" />
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton width="w-16" height="h-6" className="rounded-full" />
              <div>
                <Skeleton width="w-32" height="h-4" className="mb-2" />
                <Skeleton width="w-24" height="h-3" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton width="w-20" height="h-4" className="mb-2" />
              <Skeleton width="w-16" height="h-3" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            {[...Array(4)].map((_, j) => (
              <div key={j}>
                <Skeleton width="w-16" height="h-3" className="mb-1" />
                <Skeleton width="w-20" height="h-4" />
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center gap-1">
                <Skeleton width="w-4" height="h-4" className="rounded-full" />
                <Skeleton width="w-16" height="h-3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Main dashboard skeleton
const DashboardSkeleton = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton width="w-24" height="h-4" className="mb-2" />
        <Skeleton width="w-48" height="h-8" className="mb-2" />
        <Skeleton width="w-96" height="h-5" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton width="w-40" height="h-10" className="rounded-lg" />
        <Skeleton width="w-24" height="h-10" className="rounded-lg" />
      </div>
    </div>

    {/* Main Metrics Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <MetricSkeleton key={i} />
      ))}
    </div>

    {/* Secondary Metrics Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {[...Array(5)].map((_, i) => (
        <MetricSkeleton key={i} />
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>

    {/* Performance Leaders Skeleton */}
    <div className="mb-8">
      <PerformanceLeadersSkeleton />
    </div>

    {/* Recent Executions Skeleton */}
    <div className="mb-8">
      <RecentExecutionsSkeleton />
    </div>

    {/* Quick Actions Skeleton */}
    <div className="mb-8">
      <Skeleton width="w-32" height="h-8" className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton width="w-10" height="h-10" className="rounded-lg" />
              <div>
                <Skeleton width="w-24" height="h-4" className="mb-2" />
                <Skeleton width="w-20" height="h-3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Export individual skeletons for partial loading
DashboardSkeleton.Metrics = MetricSkeleton;
DashboardSkeleton.Charts = ChartSkeleton;
DashboardSkeleton.RecentExecutions = RecentExecutionsSkeleton;
DashboardSkeleton.PerformanceLeaders = PerformanceLeadersSkeleton;

export { DashboardSkeleton, MetricSkeleton, ChartSkeleton, RecentExecutionsSkeleton, PerformanceLeadersSkeleton };
export default DashboardSkeleton; 