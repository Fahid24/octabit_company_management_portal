import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function DepartmentAnalysis({
  departments,
  selectedDepartment,
  onDepartmentChange,
}) {
  const navigate = useNavigate();
  
  const getPerformanceColor = (rate, thresholds = [50, 25]) => {
    if (rate >= thresholds[0]) return "text-green-600"
    if (rate >= thresholds[1]) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredDepartments =
    selectedDepartment === "all" ? departments : departments?.filter((dept) => dept?.departmentId === selectedDepartment)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Department Analysis</h2>
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Departments</option>
          {departments?.map((dept) => (
            <option key={dept?.departmentId} value={dept?.departmentId}>
              {dept?.departmentName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completion Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KPI Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDepartments?.map((dept) => (
              <tr key={dept?.departmentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{dept?.departmentName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dept?.stats?.totalEmployees}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {dept?.stats?.completedTasks}/{dept?.stats?.totalTasks}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getPerformanceColor(dept?.stats?.completionRate)}`}>
                    {dept?.stats?.completionRate.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getPerformanceColor(dept?.finalKpiScore, [20, 10])}`}>
                    {dept?.finalKpiScore.toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getPerformanceColor(dept?.stats?.attendanceRate, [90, 75])}`}>
                    {dept?.stats?.attendanceRate?.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => navigate(`/kpi-department/${dept?.departmentId}`)}
                    className="p-1 rounded-md hover:bg-gray-100 text-blue-600 hover:text-blue-700 transition-colors"
                    title="View Department KPI"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
