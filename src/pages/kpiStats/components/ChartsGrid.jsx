import DepartmentKpiChart from "./charts/DepartmentKpiChart"
import TaskCompletionChart from "./charts/TaskCompletionChart"
import EmployeePerformanceChart from "./charts/EmployeePerformanceChart"
import AttendanceChart from "./charts/AttendanceChart"
import ProjectPerformanceChart from "./charts/EmployeePerformanceChart"
import TopDepartments from "./TopDepartments"


export default function ChartsGrid({ data }) {
  return (
    <>
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Department KPI Scores</h2>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-600">KPI Score</span>
            </div>
          </div>
          <div className="h-80">
            <DepartmentKpiChart departments={data?.departmentBreakdown} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Task Completion Overview</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <TaskCompletionChart completedTasks={data?.completedTasks} totalTasks={data?.totalTasks} />
          </div>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Departments</h2>
          <TopDepartments departments={data?.departmentBreakdown} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Overview</h2>
          <div className="h-80">
            <AttendanceChart departments={data?.departmentBreakdown} />
          </div>
        </div>
      </div>

      {/* Project Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee Performance Analysis</h2>
        <div className="h-96">
          <ProjectPerformanceChart departments={data?.departmentBreakdown} />
        </div>
      </div>
    </>
  )
}
