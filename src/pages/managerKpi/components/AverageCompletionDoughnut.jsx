import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const AverageCompletionDoughnut = ({ data, avgCompletion }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Average Completion Progress</h3>
    <div className="h-80 flex items-center justify-center">
      <div className="w-64 h-64">
        <Doughnut 
          data={data} 
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${value}%`;
                  }
                }
              }
            },
            cutout: '70%',
          }}
        />
        <div className="relative">
          <div 
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center" 
            style={{ marginTop: '-172px' }}
          >
            <div className="text-center">
              <span className="text-3xl font-bold text-blue-600">{avgCompletion}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AverageCompletionDoughnut;
