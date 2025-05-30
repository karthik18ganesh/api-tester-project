import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Virtual List component for large datasets
export const VirtualList = ({
  items,
  itemHeight = 80,
  containerHeight = 400,
  renderItem,
  estimateSize,
  className = '',
  overscan = 5,
  onScroll,
  ...props
}) => {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => itemHeight),
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleScroll = (e) => {
    if (onScroll) onScroll(e);
  };

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem({ item, index: virtualRow.index, virtualRow })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Specialized virtual list for test results
export const VirtualTestResultsList = ({ testResults, onResultClick, className = '' }) => {
  const renderTestResult = ({ item: result, index }) => (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onResultClick?.(result)}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex-shrink-0">
          <div
            className={`w-3 h-3 rounded-full ${
              result.status === 'passed'
                ? 'bg-green-400'
                : result.status === 'failed'
                ? 'bg-red-400'
                : result.status === 'pending'
                ? 'bg-yellow-400'
                : 'bg-gray-400'
            }`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {result.testName || `Test ${index + 1}`}
            </h4>
            <span className="text-xs text-gray-500">
              #{result.id || index}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {result.description || 'No description'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm text-gray-900">
            {result.duration ? `${result.duration}ms` : '-'}
          </p>
          <p className="text-xs text-gray-500">
            {result.timestamp ? new Date(result.timestamp).toLocaleDateString() : '-'}
          </p>
        </div>
        
        <div className="flex space-x-1">
          {result.tags?.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <VirtualList
      items={testResults}
      itemHeight={80}
      renderItem={renderTestResult}
      className={`bg-white border border-gray-200 rounded-lg ${className}`}
      containerHeight={600}
    />
  );
};

// Virtual list for API repository items
export const VirtualAPIList = ({ apiItems, onItemClick, className = '' }) => {
  const renderAPIItem = ({ item: apiItem, index }) => (
    <div
      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onItemClick?.(apiItem)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {apiItem.name || `API ${index + 1}`}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                apiItem.method === 'GET'
                  ? 'bg-green-100 text-green-800'
                  : apiItem.method === 'POST'
                  ? 'bg-blue-100 text-blue-800'
                  : apiItem.method === 'PUT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : apiItem.method === 'DELETE'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {apiItem.method || 'GET'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-2">
            {apiItem.endpoint || apiItem.url || 'No endpoint specified'}
          </p>
          
          <p className="text-xs text-gray-500 truncate">
            {apiItem.description || 'No description available'}
          </p>
        </div>

        <div className="ml-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {apiItem.lastTested && (
              <span className="text-xs text-gray-500">
                Last tested: {new Date(apiItem.lastTested).toLocaleDateString()}
              </span>
            )}
            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VirtualList
      items={apiItems}
      itemHeight={100}
      renderItem={renderAPIItem}
      className={`bg-white border border-gray-200 rounded-lg ${className}`}
      containerHeight={500}
    />
  );
};

// Virtual grid for card layouts
export const VirtualGrid = ({
  items,
  itemHeight = 200,
  itemWidth = 300,
  columns = 3,
  gap = 16,
  renderItem,
  className = '',
  containerHeight = 600,
}) => {
  const parentRef = useRef();

  // Calculate rows needed
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 2,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const endIndex = Math.min(startIndex + columns, items.length);
          const rowItems = items.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="flex"
                style={{
                  gap: `${gap}px`,
                  height: `${itemHeight}px`,
                  paddingBottom: `${gap}px`,
                }}
              >
                {rowItems.map((item, columnIndex) => (
                  <div
                    key={startIndex + columnIndex}
                    style={{ width: `${itemWidth}px`, flexShrink: 0 }}
                  >
                    {renderItem({
                      item,
                      index: startIndex + columnIndex,
                      rowIndex: virtualRow.index,
                      columnIndex,
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Virtual table component
export const VirtualTable = ({
  data,
  columns,
  rowHeight = 50,
  containerHeight = 400,
  className = '',
  onRowClick,
}) => {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          {columns.map((column, index) => (
            <div
              key={index}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1"
              style={{ minWidth: column.width || 'auto' }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Table Body */}
      <div
        ref={parentRef}
        className="overflow-auto bg-white"
        style={{ height: containerHeight }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className={`absolute top-0 left-0 w-full border-b border-gray-200 hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(row, virtualRow.index)}
              >
                <div className="flex h-full items-center">
                  {columns.map((column, columnIndex) => (
                    <div
                      key={columnIndex}
                      className="px-4 py-2 text-sm text-gray-900 flex-1 truncate"
                      style={{ minWidth: column.width || 'auto' }}
                    >
                      {column.accessor
                        ? typeof column.accessor === 'function'
                          ? column.accessor(row, virtualRow.index)
                          : row[column.accessor]
                        : '-'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Hook for virtual scrolling with search and filtering
export const useVirtualizedData = (data, searchTerm = '', filterFn = null) => {
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (searchTerm) {
      result = result.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply custom filter
    if (filterFn) {
      result = result.filter(filterFn);
    }

    return result;
  }, [data, searchTerm, filterFn]);

  return filteredData;
};

export default VirtualList; 