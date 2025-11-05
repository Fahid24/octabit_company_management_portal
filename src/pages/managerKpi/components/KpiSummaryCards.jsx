import React from 'react';

const KpiSummaryCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      <h3 className="text-lg font-semibold text-gray-700">Total Projects</h3>
      <p className="text-3xl font-bold text-blue-500">{stats.totalProjects}</p>
      <p className="text-sm text-gray-500 mt-1">Active projects under management</p>
    </div>
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
      <h3 className="text-lg font-semibold text-gray-700">Tasks Completed</h3>
      <p className="text-3xl font-bold text-green-500">{stats.completedTasks} / {stats.totalTasks}</p>
      <p className="text-sm text-gray-500 mt-1">Total completion progress</p>
    </div>
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
      <h3 className="text-lg font-semibold text-gray-700">Avg Completion</h3>
      <p className="text-3xl font-bold text-yellow-500">{stats.avgCompletion}%</p>
      <p className="text-sm text-gray-500 mt-1">Average task completion percentage</p>
    </div>
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
      <h3 className="text-lg font-semibold text-gray-700">Completion Rate</h3>
      <p className="text-3xl font-bold text-purple-500">{stats.completionRate}%</p>
      <p className="text-sm text-gray-500 mt-1">Tasks completed vs total tasks</p>
    </div>
  </div>
);

export default KpiSummaryCards;
