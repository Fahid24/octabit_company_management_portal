import React from "react";

const DepartmentsSummaryTable = ({ departmentsData, getScoreColor, getProgressColor, onRowClick }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
    <h3 className="font-medium text-gray-700 mb-4">Departments Summary</h3>
    <table className="min-w-full divide-y divide-gray-200 border">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KPI Score</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {departmentsData.map((dept, idx) => (
          <tr
            key={dept.departmentId || idx}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowClick(dept)}
          >
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{dept.departmentName || "-"}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
              <span className={getScoreColor(dept.finalKpiScore)}>
                {typeof dept.finalKpiScore === "number" ? dept.finalKpiScore.toFixed(1) : 0}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">{dept.stats?.totalEmployees || 0}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">{dept.stats?.totalTasks || 0}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">{dept.stats?.completedTasks || 0}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
              <div className="flex items-center">
                <span className="mr-2">
                  {dept.stats?.completionRate !== undefined && dept.stats?.completionRate !== null
                    ? dept.stats.completionRate.toFixed(2)
                    : 0}%
                </span>
                <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${getProgressColor(dept.stats?.completionRate)}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, dept.stats?.completionRate || 0))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
              <div className="flex items-center">
                <span className="mr-2">
                  {dept.stats?.attendanceRate !== undefined && dept.stats?.attendanceRate !== null
                    ? dept.stats.attendanceRate.toFixed(2)
                    : 0}%
                </span>
                <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${getProgressColor(dept.stats?.attendanceRate)}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, dept.stats?.attendanceRate || 0))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DepartmentsSummaryTable;
