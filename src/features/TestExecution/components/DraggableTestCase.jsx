import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RxDragHandleDots2 } from 'react-icons/rx';
import ExecutionOrderIndicator from './ExecutionOrderIndicator';

const DraggableTestCase = ({ testCase, isEditing, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: testCase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isSortableDragging || isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 rounded-md border transition-all duration-200 ${
        isCurrentlyDragging
          ? 'test-case-dragging opacity-50 border-dashed border-indigo-500 bg-indigo-50'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Drag Handle - only visible in edit mode */}
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="drag-handle mr-3 p-1 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <RxDragHandleDots2 className="h-4 w-4" />
        </div>
      )}

      {/* Execution Order Badge - only visible in edit mode */}
      <ExecutionOrderIndicator 
        order={testCase.executionOrder} 
        isEditing={isEditing} 
      />

      {/* Test Case Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {testCase.name}
        </div>
        <div className="text-xs text-gray-500">
          ID: {testCase.caseId}
        </div>
      </div>

      {/* Status indicator */}
      <div className="ml-2">
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
};

export default DraggableTestCase;
