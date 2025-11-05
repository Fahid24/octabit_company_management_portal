import React from 'react';

const BulkActions = ({ selectedCount, onBulkStatusChange, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
      <div className="text-sm text-blue-800">
        {selectedCount} employee(s) selected
      </div>
      <div className="flex gap-2">
        <select
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          onChange={(e) => {
            const newStatus = e.target.value;
            if (newStatus) {
              onBulkStatusChange(newStatus);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Update status to...</option>
          <option value="utilized">Utilized</option>
          <option value="wasted">Wasted</option>
          <option value="not_need">Not Needed</option>
        </select>
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActions;