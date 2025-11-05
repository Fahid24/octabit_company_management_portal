// AttendanceGraph.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend,
  Bar,
  BarChart,
  ComposedChart,
  Scatter
} from "recharts";

const AttendanceGraph = ({ dailyStats = [], workHoursPerDay = 8 }) => {
  // Prepare data for the chart, skipping future dates and handling actual data structure
  const today = new Date();
  const chartData = Array.isArray(dailyStats)
    ? dailyStats
        .filter((day) => new Date(day.date) <= today)
        .map((day) => {
          // Handle different day types and statuses based on actual data structure
          let present = 0, grace = 0, late = 0, leave = 0, absent = 0, weekend = 0, holiday = 0;
          
          if (day.isWeekend) {
            weekend = 1;
          } else if (day.isHoliday) {
            holiday = 1;
          } else if (day.isLeaveDay) {
            leave = 1;
          } else if (day.isGraced) {
            grace = 1;
          } else if (day.isLate) {
            late = 1;
          } else if (day.checkIn && day.checkOut) {
            present = 1;
          } else {
            absent = 1;
          }
          
          return {
            date: new Date(day.date).getDate(),
            workedHours: Number(day.workedHours || 0).toFixed(2),
            present,
            grace,
            late,
            leave,
            absent,
            weekend,
            holiday,
          };
        })
    : [];

  return (
    <div className="w-full h-80 sm:h-96">
      <div className="w-full h-full bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">Attendance Overview</h2>
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(d) => `${d}`} 
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'Count / Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' } }}
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'workedHours') return [`${Number(value).toFixed(2)} hrs`, 'Worked Hours'];
                return [value, name];
              }} 
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="present" stackId="attendance" fill="#00904B" name="Present" />
            <Bar dataKey="grace" stackId="attendance" fill="#28A745" name="Grace" />
            <Bar dataKey="late" stackId="attendance" fill="#FFC107" name="Late" />
            <Bar dataKey="leave" stackId="attendance" fill="#8A6642" name="Leave" />
            <Bar dataKey="absent" stackId="attendance" fill="#F44336" name="Absent" />
            <Bar dataKey="weekend" stackId="attendance" fill="#6366f1" name="Weekend" />
            <Bar dataKey="holiday" stackId="attendance" fill="#3b82f6" name="Holiday" />
            <Line 
              type="monotone" 
              dataKey="workedHours" 
              stroke="#3a41e2" 
              strokeWidth={2} 
              name="Worked Hours" 
              dot={{ r: 3, fill: '#3a41e2' }}
              activeDot={{ r: 5, fill: '#3a41e2' }}
            />
            <ReferenceLine y={workHoursPerDay} label={{ value: `Target (${workHoursPerDay}h)`, position: "topRight", fontSize: 10 }} stroke="#3b82f6" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceGraph;
