import React from 'react';
import { Line } from 'react-chartjs-2';

const ProjectLineChart = ({ data }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Metrics Comparison</h3>
    <div className="h-auto">
      <Line 
        data={data} 
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Rate / Count'
              }
            }
          }
        }} 
      />
    </div>
  </div>
);

export default ProjectLineChart;
