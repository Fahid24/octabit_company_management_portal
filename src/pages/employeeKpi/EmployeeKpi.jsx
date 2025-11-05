import { useParams } from "react-router-dom";
import { useGetEmployeeKpiStatsQuery } from "@/redux/features/kpiStats/kpiStatsApiSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/card";
import { Badge } from "@/component/badge";
import { Avatar } from "@/component/avater";
import { Clock, Target, CheckCircle, Calendar, User } from "lucide-react";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
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
  Legend,
} from "recharts";
import { useSelector } from "react-redux";
import { Progress } from "@/component/Progress";

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}${
              entry.dataKey === "avgCompletion" ? "%" : ""
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie chart tooltip
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {`Value: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function EmployeeKpi() {
  const user = useSelector((state) => state.userSlice.user);

  const { employeeId } = useParams();
  const {
    data: employeeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEmployeeKpiStatsQuery(employeeId || user?.user?._id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage error={error} refetch={refetch} />;
  }

  if (!employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">No KPI data found for this employee.</p>
        </div>
      </div>
    );
  }

  const attendanceData = [
    {
      name: "Present",
      value: employeeData.attendance?.present || 0,
      color: "#10b981",
    },
    {
      name: "Late",
      value: employeeData.attendance?.late || 0,
      color: "#f59e0b",
    },
    {
      name: "On Leave",
      value: employeeData.attendance?.onLeave || 0,
      color: "#6366f1",
    },
    {
      name: "Absent",
      value: employeeData.attendance?.absent || 0,
      color: "#ef4444",
    },
  ];

  const priorityData = [
    {
      name: "Low",
      value: employeeData.dailyTasks?.priorityBreakdown?.low || 0,
      color: "#10b981",
    },
    {
      name: "Medium",
      value: employeeData.dailyTasks?.priorityBreakdown?.medium || 0,
      color: "#f59e0b",
    },
    {
      name: "High",
      value: employeeData.dailyTasks?.priorityBreakdown?.high || 0,
      color: "#ef4444",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24">
                {user?.photoUrl ? (
                  <img
                    src={user?.photoUrl}
                    alt={user?.firstName}
                    className="w-24 h-24"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employeeData.employee?.name || "Employee"}
                </h1>
                <p className="text-gray-600">
                  {employeeData.employee?.role || "Employee"}
                </p>
                <Badge variant="outline" className="mt-1">
                  {employeeData.period?.charAt(0).toUpperCase() +
                    employeeData.period?.slice(1) || "Lifetime"}{" "}
                  Performance
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600">
                {employeeData.finalKpi || 0}
              </div>
              <p className="text-sm text-gray-600">Overall KPI Score</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white">
            <CardHeader className=" flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Task Completion
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeData.projectTasks?.completionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {employeeData.projectTasks?.completed || 0} of{" "}
                {employeeData.projectTasks?.assigned || 0} tasks
              </p>
              <Progress
                value={employeeData.projectTasks?.completionRate || 0}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <Calendar className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeData.attendance?.attendanceRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {employeeData.attendance?.present || 0} present days
              </p>
              <Progress
                value={employeeData.attendance?.attendanceRate || 0}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Tasks</CardTitle>
              <Target className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeData.dailyTasks?.assigned || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {employeeData.dailyTasks?.completed || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Work Hours
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeData.attendance?.avgWorkHours || 0}h
              </div>
              <p className="text-xs text-muted-foreground">Per working day</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Breakdown Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>KPI Performance by Criteria</CardTitle>
              <CardDescription>
                Average completion percentage across different skill areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeData.projectTasks?.kpiBreakdown || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="criteria"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={false}                 // removed gray hover rectangle
                      wrapperStyle={{ outline: "none", boxShadow: "none" }}
                    />
                    <Bar
                      dataKey="avgCompletion"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Breakdown */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Attendance Breakdown</CardTitle>
              <CardDescription>
                Distribution of attendance status over{" "}
                {employeeData.attendance?.total || 0} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomPieTooltip />}
                      cursor={false} // ensure no hover block
                      wrapperStyle={{ outline: "none", boxShadow: "none" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Contributions */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Project Contributions</CardTitle>
            <CardDescription>
              Task completion status across all assigned projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeData.projectTasks?.projectContribution?.map(
                (project, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {project.projectName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {project.completed} of {project.assigned} tasks
                        completed
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {project.completionRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Completion Rate
                        </div>
                      </div>
                      <div className="w-24">
                        <Progress value={project.completionRate} />
                      </div>
                    </div>
                  </div>
                )
              ) || (
                <div className="text-center py-8 text-gray-500">
                  No project contributions available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Tasks Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Daily Tasks Priority</CardTitle>
              <CardDescription>
                Current task distribution by priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomPieTooltip />}
                      cursor={false}
                      wrapperStyle={{ outline: "none", boxShadow: "none" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key performance indicators overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Average Task Completion
                </span>
                <span className="text-sm text-gray-600">
                  {employeeData.projectTasks?.avgCompletion || 0}%
                </span>
              </div>
              <Progress value={employeeData.projectTasks?.avgCompletion || 0} />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Average Completion Time
                </span>
                <span className="text-sm text-gray-600">
                  {employeeData.projectTasks?.avgCompletionTimeHours || 0}h
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Leave Balance</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {Math.abs(employeeData.leaves?.approvedLeaveDays) || 0} days
                    used
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700">
                    {employeeData.finalKpi || 0}
                  </div>
                  <div className="text-sm text-emerald-600">
                    Final KPI Score
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
