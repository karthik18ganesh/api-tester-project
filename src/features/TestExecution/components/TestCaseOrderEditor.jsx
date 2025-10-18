import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import DraggableTestCase from './DraggableTestCase';

const TestCaseOrderEditor = ({ testCases, onOrderChange, isEditing, suiteId }) => {
  const [items, setItems] = useState(testCases);
  const [activeId, setActiveId] = useState(null);

  // Update items when testCases prop changes
  useEffect(() => {
    setItems(testCases);
  }, [testCases]);

  // Configure sensors for desktop-only drag (no touch)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update execution order based on new position
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          executionOrder: index + 1
        }));
        
        // Notify parent component of the change
        onOrderChange(updatedItems);
        return updatedItems;
      });
    }
    
    setActiveId(null);
  };

  const activeItem = items.find(item => item.id === activeId);

  if (!isEditing) {
    // Show normal test case list when not editing
    return (
      <div className="space-y-2">
        {items.map((testCase) => (
          <div
            key={testCase.id}
            className="flex items-center p-3 rounded-md border bg-white border-gray-200"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {testCase.name}
              </div>
              <div className="text-xs text-gray-500">
                ID: {testCase.caseId}
              </div>
            </div>
            <div className="ml-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((testCase) => (
            <DraggableTestCase 
              key={testCase.id} 
              testCase={testCase}
              isEditing={isEditing}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <DraggableTestCase 
            testCase={activeItem} 
            isEditing={isEditing}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TestCaseOrderEditor;
