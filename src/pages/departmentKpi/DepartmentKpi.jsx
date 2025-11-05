import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/card"
import { Progress } from "@/component/Progress"
import { Badge } from "@/component/badge"
import { Avatar, AvatarFallback } from "@/component/avater"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
} from "recharts"
import { Building2, Users, Target, TrendingUp, CheckCircle, Calendar, Award, Briefcase } from "lucide-react"
import { useGetDepartmentKpiStatsQuery } from "@/redux/features/kpiStats/kpiStatsApiSlice"
import Loader from "@/component/Loader"

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#6366f1",
  success: "#22c55e",
  muted: "#6b7280",
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#22c55e"]

export default function DepartmentKpi() {
  const params = useParams()
  const departmentId = params.departmentId
  const { data: departmentData, isLoading, isError, refetch } = useGetDepartmentKpiStatsQuery(departmentId)

  useEffect(() => {
    // Refetch data when departmentId changes
    if (departmentId) {
      refetch()
    }
  }, [departmentId, refetch])

  if (isLoading) {
    return <Loader/>
  }

  if (isError || !departmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">⚠️</div>
          <p className="mt-4 text-gray-600">Failed to load department data</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Prepare chart data from API response
  const kpiData = departmentData.kpiBreakdown.map((item) => ({
    name: item.criteria,
    weight: item.weightPercentage,
    completion: item.avgCompletion,
    weightedValue: item.weightedValue,
    actualValue: item.actualValue,
  }))

  const employeeData = departmentData.stats.employeeStats.map((emp) => ({
    name: emp.name.length > 12 ? emp.name.substring(0, 12) + "..." : emp.name,
    fullName: emp.name,
    assigned: emp.assigned,
    completed: emp.completed,
    completionRate: emp.completionRate,
    avgCompletion: emp.avgCompletion,
    presentDays: emp.presentDays,
  }))

  const projectData = departmentData.stats.projectBreakdown.map((project) => ({
    name: project.projectName.length > 15 ? project.projectName.substring(0, 15) + "..." : project.projectName,
    fullName: project.projectName,
    assigned: project.assigned,
    completed: project.completed,
    completionRate: project.completionRate,
    avgCompletion: project.avgCompletion,
  }))

  const kpiWeightData = departmentData.kpiBreakdown.map((item, index) => ({
    name: item.criteria,
    value: item.weightPercentage,
    weightedValue: item.weightedValue,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }))

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-yellow-600 bg-yellow-50"
    if (score >= 40) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getScoreLevel = (score) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Average"
    return "Needs Improvement"
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{departmentData.departmentName}</h1>
                <p className="text-gray-600">Department Performance Dashboard</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {departmentData.period.charAt(0).toUpperCase() + departmentData.period.slice(1)} Analysis
                  </Badge>
                  <Badge variant="secondary">{departmentData.stats.totalEmployees} Employees</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{departmentData.finalKpiScore}</div>
              <div className="text-sm text-gray-500">Department KPI Score</div>
              <Badge className={`mt-2 ${getPerformanceColor(departmentData.finalKpiScore)}`} variant="outline">
                {getScoreLevel(departmentData.finalKpiScore)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {departmentData.stats.completedTasks}/{departmentData.stats.totalTasks}
                  </div>
                  <div className="text-xs opacity-80">Tasks Completed</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{departmentData.stats.completionRate}%</div>
                  <div className="text-xs opacity-80">Success Rate</div>
                </div>
              </div>
              <Progress value={departmentData.stats.completionRate} className="mt-3 " />
            </CardContent>
          </Card>

          {/* <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white border-0"> */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{Math.round(departmentData.stats.attendanceRate)}%</div>
                  <div className="text-xs opacity-80">Overall Attendance</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{departmentData.stats.presentDays}</div>
                  <div className="text-xs opacity-80">Present Days</div>
                </div>
              </div>
              <Progress value={departmentData.stats.attendanceRate} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{departmentData.stats.avgCompletion.toFixed(1)}%</div>
                  <div className="text-xs opacity-80">Avg Completion</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{departmentData.stats.totalEmployees}</div>
                  <div className="text-xs opacity-80">Team Members</div>
                </div>
              </div>
              <Progress value={departmentData.stats.avgCompletion} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Award className="h-4 w-4" />
                KPI Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{departmentData.finalKpiScore}</div>
                  <div className="text-xs opacity-80">Final Score</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{departmentData.kpiBreakdown.length}</div>
                  <div className="text-xs opacity-80">KPI Criteria</div>
                </div>
              </div>
              <Progress value={departmentData.finalKpiScore} className="mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Breakdown */}
          <Card className="shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                KPI Performance Breakdown
              </CardTitle>
              <CardDescription>Weighted performance by criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={kpiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="weight" fill={COLORS.info} name="Weight %" radius={[4, 4, 0, 0]} />
                  <Bar
                    yAxisId="left"
                    dataKey="completion"
                    fill={COLORS.primary}
                    name="Completion %"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="weightedValue"
                    stroke={COLORS.success}
                    strokeWidth={3}
                    name="Weighted Value"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* KPI Weight Distribution */}
          <Card className="shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                KPI Weight Distribution
              </CardTitle>
              <CardDescription>Contribution of each KPI to final score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpiWeightData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {kpiWeightData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [`${value}%`, "Weight"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {kpiWeightData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.value}%</div>
                      <div className="text-xs text-gray-500">Weight: {item.weightedValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Performance */}
          <Card className="shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Employee Performance Comparison
              </CardTitle>
              <CardDescription>Individual employee task completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "completionRate" ? `${value}%` : value,
                      name === "completionRate" ? "Completion Rate" : name === "assigned" ? "Assigned" : "Completed",
                    ]}
                  />
                  <Bar dataKey="assigned" fill={COLORS.info} name="Assigned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill={COLORS.success} name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Performance */}
          <Card className="shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Project Performance
              </CardTitle>
              <CardDescription>Task completion across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "completionRate" ? `${value}%` : value,
                      name === "completionRate" ? "Completion Rate" : name === "assigned" ? "Assigned" : "Completed",
                    ]}
                  />
                  <Bar dataKey="assigned" fill={COLORS.warning} name="Assigned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill={COLORS.primary} name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Details */}
          <Card className="shadow-sm bg-white max-h-[48vh] overflow-auto">
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>Individual performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeData.map((emp, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {emp.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{emp.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {emp.completed}/{emp.assigned} tasks
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        emp.completionRate >= 80 ? "default" : emp.completionRate >= 50 ? "secondary" : "destructive"
                      }
                    >
                      {emp.completionRate}%
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">{emp.presentDays} days</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="shadow-sm bg-white max-h-[48vh] overflow-auto">
            <CardHeader>
              <CardTitle className="text-lg">Active Projects</CardTitle>
              <CardDescription>Project completion status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectData.map((project, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{project.fullName}</div>
                    <Badge
                      variant={
                        project.completionRate === 100
                          ? "default"
                          : project.completionRate >= 50
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {project.completionRate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Assigned: {project.assigned}</span>
                    <span>Completed: {project.completed}</span>
                  </div>
                  <Progress value={project.completionRate} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Avg completion: {project.avgCompletion}%</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Summary */}
          <Card className="shadow-sm bg-white max-h-[48vh] overflow-auto">
            <CardHeader>
              <CardTitle className="text-lg">Department Summary</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{departmentData.stats.totalTasks}</div>
                  <div className="text-xs text-blue-600">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{departmentData.stats.completedTasks}</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{departmentData.stats.onTimeTasks}</div>
                  <div className="text-xs text-purple-600">On Time</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{departmentData.stats.overdueTasks}</div>
                  <div className="text-xs text-orange-600">Overdue</div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Task Completion</span>
                  <span className="font-semibold">{departmentData.stats.completionRate}%</span>
                </div>
                <Progress value={departmentData.stats.completionRate} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="font-semibold">{Math.round(departmentData.stats.attendanceRate)}%</span>
                </div>
                <Progress value={departmentData.stats.attendanceRate} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Performance</span>
                  <span className="font-semibold">{departmentData.stats.avgCompletion.toFixed(1)}%</span>
                </div>
                <Progress value={departmentData.stats.avgCompletion} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
