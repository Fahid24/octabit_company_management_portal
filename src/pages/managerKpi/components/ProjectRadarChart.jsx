import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const ProjectRadarChart = ({ data }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Performance Radar</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Average Completion"
            dataKey="avgCompletion"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.6}
          />
          <Radar
            name="Completion Rate"
            dataKey="completionRate"
            stroke="#EC4899"
            fill="#EC4899"
            fillOpacity={0.6}
          />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ProjectRadarChart;
