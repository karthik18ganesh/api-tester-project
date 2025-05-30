import React from 'react';

const SkeletonLoader = ({ 
  variant = 'text',
  width = '100%',
  height,
  lines = 3,
  className = '',
  animate = true
}) => {
  const baseClasses = [
    'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded',
    animate && 'animate-shimmer',
    className
  ].filter(Boolean).join(' ');

  const variants = {
    text: () => (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4`}
            style={{
              width: index === lines - 1 ? '75%' : width
            }}
          />
        ))}
      </div>
    ),
    
    title: () => (
      <div className={`${baseClasses} h-8 mb-4`} style={{ width }} />
    ),
    
    paragraph: () => (
      <div className="space-y-2">
        <div className={`${baseClasses} h-6 mb-3`} style={{ width: '60%' }} />
        <div className={`${baseClasses} h-4`} style={{ width: '100%' }} />
        <div className={`${baseClasses} h-4`} style={{ width: '90%' }} />
        <div className={`${baseClasses} h-4`} style={{ width: '75%' }} />
      </div>
    ),
    
    card: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className={`${baseClasses} h-6 mb-4`} style={{ width: '70%' }} />
        <div className="space-y-2">
          <div className={`${baseClasses} h-4`} style={{ width: '100%' }} />
          <div className={`${baseClasses} h-4`} style={{ width: '85%' }} />
          <div className={`${baseClasses} h-4`} style={{ width: '60%' }} />
        </div>
        <div className="mt-6 flex justify-between">
          <div className={`${baseClasses} h-8 w-20`} />
          <div className={`${baseClasses} h-8 w-16`} />
        </div>
      </div>
    ),
    
    list: () => (
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`${baseClasses} h-12 w-12 rounded-full flex-shrink-0`} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClasses} h-4`} style={{ width: '60%' }} />
              <div className={`${baseClasses} h-3`} style={{ width: '40%' }} />
            </div>
            <div className={`${baseClasses} h-6 w-16`} />
          </div>
        ))}
      </div>
    ),
    
    table: () => (
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${baseClasses} h-4`} />
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: lines }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div key={colIndex} className={`${baseClasses} h-4`} />
            ))}
          </div>
        ))}
      </div>
    ),
    
    metric: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${baseClasses} h-12 w-12 rounded-xl`} />
            <div className="space-y-2">
              <div className={`${baseClasses} h-4 w-24`} />
              <div className={`${baseClasses} h-6 w-16`} />
            </div>
          </div>
          <div className={`${baseClasses} h-6 w-12 rounded-full`} />
        </div>
      </div>
    ),
    
    avatar: () => (
      <div className={`${baseClasses} rounded-full`} 
           style={{ 
             width: height || '48px', 
             height: height || '48px' 
           }} 
      />
    ),
    
    button: () => (
      <div className={`${baseClasses} h-10 rounded-lg`} style={{ width }} />
    ),
    
    custom: () => (
      <div 
        className={baseClasses}
        style={{ 
          width, 
          height: height || '1rem' 
        }}
      />
    )
  };

  const SkeletonComponent = variants[variant];
  
  return SkeletonComponent ? <SkeletonComponent /> : variants.custom();
};

// Compound components for common patterns
SkeletonLoader.Dashboard = ({ cardCount = 4 }) => (
  <div className="space-y-8">
    {/* Hero Section */}
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8">
      <div className="space-y-4">
        <SkeletonLoader variant="title" width="40%" />
        <SkeletonLoader variant="text" lines={2} />
      </div>
    </div>
    
    {/* Metrics Grid */}
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(cardCount, 4)} gap-6`}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <SkeletonLoader key={index} variant="metric" />
      ))}
    </div>
    
    {/* Content Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonLoader variant="card" />
      </div>
      <div>
        <SkeletonLoader variant="list" lines={4} />
      </div>
    </div>
  </div>
);

SkeletonLoader.Table = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    {/* Table Header */}
    <div className="bg-gray-50 p-4">
      <div className={`grid grid-cols-${columns} gap-4`}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} variant="custom" height="16px" width="80%" />
        ))}
      </div>
    </div>
    
    {/* Table Body */}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className={`grid grid-cols-${columns} gap-4`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} variant="custom" height="16px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

SkeletonLoader.Form = ({ fields = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <SkeletonLoader variant="custom" height="16px" width="25%" />
        <SkeletonLoader variant="button" height="44px" />
        <SkeletonLoader variant="custom" height="14px" width="60%" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <SkeletonLoader variant="button" width="120px" />
      <SkeletonLoader variant="button" width="80px" />
    </div>
  </div>
);

export default SkeletonLoader; 