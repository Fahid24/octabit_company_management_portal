import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const ProjectBarChart = ({ data }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Breakdown</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="assigned" name="Tasks Assigned" fill="#3B82F6" />
          <Bar dataKey="completed" name="Tasks Completed" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ProjectBarChart;
