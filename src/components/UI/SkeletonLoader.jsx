import React from 'react';

// Base skeleton component with customizable properties
const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded', 
  className = '',
  animate = true 
}) => {
  const baseClasses = `bg-gray-200 ${width} ${height} ${rounded} ${className}`;
  const animationClasses = animate ? 'animate-pulse' : '';
  
  return <div className={`${baseClasses} ${animationClasses}`} />;
};

// Advanced skeleton with shimmer effect
const ShimmerSkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded', 
  className = '' 
}) => {
  return (
    <div className={`relative ${width} ${height} ${rounded} ${className} overflow-hidden bg-gray-200`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white via-white to-transparent opacity-60" />
    </div>
  );
};

// Text skeleton variations
export const TextSkeleton = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-4"
          className="last:w-3/4"
        />
      ))}
    </div>
  );
};

// Card skeleton for API repository items
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton width="w-1/2" height="h-6" className="mb-2" />
          <Skeleton width="w-3/4" height="h-4" />
        </div>
        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      </div>
      
      <div className="space-y-2 mb-4">
        <TextSkeleton lines={2} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
          <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
        </div>
        <Skeleton width="w-24" height="h-8" rounded="rounded-md" />
      </div>
    </div>
  );
};

// Table skeleton for test results
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Table header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} width="w-20" height="h-4" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  width={colIndex === 0 ? 'w-32' : 'w-16'} 
                  height="h-4" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// List skeleton for navigation or menu items
export const ListSkeleton = ({ items = 6, showIcon = true, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
          {showIcon && (
            <Skeleton width="w-6" height="h-6" rounded="rounded" />
          )}
          <div className="flex-1">
            <Skeleton width="w-3/4" height="h-4" className="mb-1" />
            <Skeleton width="w-1/2" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form skeleton
export const FormSkeleton = ({ fields = 4, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton width="w-24" height="h-4" />
          <Skeleton width="w-full" height="h-10" rounded="rounded-md" />
        </div>
      ))}
      
      <div className="flex space-x-3 pt-4">
        <Skeleton width="w-24" height="h-10" rounded="rounded-md" />
        <Skeleton width="w-20" height="h-10" rounded="rounded-md" />
      </div>
    </div>
  );
};

// Chart/Graph skeleton
export const ChartSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="w-32" height="h-6" />
        <div className="flex space-x-2">
          <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
          <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
        </div>
      </div>
      
      {/* Chart area */}
      <div className="relative h-64 bg-gray-50 rounded">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around p-4 space-x-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              width="w-8"
              height={`h-${Math.floor(Math.random() * 32) + 8}`}
              className="flex-shrink-0"
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton width="w-3" height="h-3" rounded="rounded-full" />
            <Skeleton width="w-16" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Navigation skeleton
export const NavigationSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white border-r border-gray-200 h-full ${className}`}>
      <div className="p-4">
        <Skeleton width="w-32" height="h-8" className="mb-6" />
        
        <nav className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-md">
              <Skeleton width="w-5" height="h-5" />
              <Skeleton width="w-24" height="h-4" />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Test execution skeleton with status indicators
export const TestExecutionSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
          <div>
            <Skeleton width="w-32" height="h-5" className="mb-1" />
            <Skeleton width="w-24" height="h-4" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
          <Skeleton width="w-8" height="h-8" rounded="rounded-md" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <Skeleton width="w-20" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <Skeleton width="w-1/3" height="h-2" rounded="rounded-full" className="bg-blue-300" />
        </div>
      </div>
      
      {/* Test steps */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <Skeleton width="w-4" height="h-4" rounded="rounded-full" />
            <div className="flex-1">
              <Skeleton width="w-2/3" height="h-4" className="mb-1" />
              <Skeleton width="w-1/3" height="h-3" />
            </div>
            <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Page skeleton wrapper
export const PageSkeleton = ({ children, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Advanced loading skeleton with staggered animation
export const StaggeredSkeleton = ({ children, staggerDelay = 100, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div 
          style={{ 
            animationDelay: `${index * staggerDelay}ms` 
          }}
          className="animate-pulse"
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default Skeleton; 