import React from 'react';

const ExecutionOrderIndicator = ({ order, isEditing }) => {
  if (!isEditing) return null;

  return (
    <div className="execution-order-badge">
      {order}
    </div>
  );
};

export default ExecutionOrderIndicator;
