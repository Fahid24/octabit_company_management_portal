import React from 'react';

const PerformanceInsights = ({ stats }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Insights</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Strongest Project</h4>
        {stats.projectBreakdown.length > 0 ? (
          <>
            <p className="text-lg font-bold text-blue-600">{
              stats.projectBreakdown.reduce((prev, current) => 
                (prev.completionRate > current.completionRate) ? prev : current
              ).projectName
            }</p>
            <p className="text-sm text-gray-500 mt-1">Highest completion rate among all projects</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">No project data available</p>
        )}
      </div>
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Needs Improvement</h4>
        {stats.projectBreakdown.length > 0 ? (
          <>
            <p className="text-lg font-bold text-red-600">{
              stats.projectBreakdown.reduce((prev, current) => 
                (prev.completionRate < current.completionRate) ? prev : current
              ).projectName
            }</p>
            <p className="text-sm text-gray-500 mt-1">Lowest completion rate among all projects</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">No project data available</p>
        )}
      </div>
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Overall Performance</h4>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                stats.completionRate >= 75 ? 'bg-green-600' : 
                stats.completionRate >= 50 ? 'bg-yellow-400' : 'bg-red-600'
              }`}
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700">{stats.completionRate}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Task completion rate across all projects</p>
      </div>
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Productivity Score</h4>
        <p className="text-lg font-bold text-purple-600">
          {Math.round((stats.avgCompletion * 0.4) + (stats.completionRate * 0.6))}/100
        </p>
        <p className="text-sm text-gray-500 mt-1">Combined score based on completion metrics</p>
      </div>
    </div>
  </div>
);

export default PerformanceInsights;
