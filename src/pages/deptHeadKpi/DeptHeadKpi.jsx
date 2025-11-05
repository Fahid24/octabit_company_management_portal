import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { useGetDepartmentHeadKpiStatsQuery } from "@/redux/features/statsDeptHead/statsDeptHeadApiSlice";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import DateRangeSelector from "@/component/DateRangeSelector";
import DepartmentCard from "./components/DepartmentCard";
import DepartmentsSummaryTable from "./components/DepartmentsSummaryTable";
import KpiBarChart from "./components/KpiBarChart";
// Import chart libraries
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Line,
} from "recharts";
import { useSelector } from "react-redux";

const DeptHeadKpi = () => {
  const user = useSelector((state) => state.userSlice.user);

  const { deptHeadId } = useParams();
  const headId = deptHeadId || user?.user?._id;
  // console.log("Department Head ID:", headId);
  const today = new Date();
  const [from, setFrom] = useState(
    format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")
  );
  const [to, setTo] = useState(
    format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd")
  );
  const [departmentsData, setDepartmentsData] = useState([]);
  const [activeDept, setActiveDept] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllDepts, setShowAllDepts] = useState(true); // Added state for showing all departments

  const { data, isLoading, isError, error, refetch } =
    useGetDepartmentHeadKpiStatsQuery({ headId, from, to });
  useEffect(() => {
    if (data && data.departments) {
      const processedData = data.departments.map((dept) => ({
        ...dept,
        period:
          typeof dept.period === "object"
            ? JSON.stringify(dept.period)
            : dept.period,
      }));
      setDepartmentsData(processedData);

      // Set first department as active by default if none selected
      if (!activeDept && processedData.length > 0) {
        setActiveDept(processedData[0].departmentId);
      }
    }
  }, [data, activeDept]);

  const handleDateRangeChange = ({ startDate, endDate }) => {
    const fromStr =
      typeof startDate === "object"
        ? format(startDate, "yyyy-MM-dd")
        : startDate;
    const toStr =
      typeof endDate === "object" ? format(endDate, "yyyy-MM-dd") : endDate;

    setFrom(fromStr);
    setTo(toStr);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getChartColor = (percentage) => {
    if (percentage >= 80) return "#10b981"; // green-500
    if (percentage >= 60) return "#3b82f6"; // blue-500
    if (percentage >= 40) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  // Chart utility functions
  const prepareKpiChartData = (kpiData) => {
    return (
      kpiData?.map((item) => ({
        name: item.criteria || "Unnamed KPI",
        weight: item.weightPercentage || item.weight || 0,
        completion: item.completionRate || 0,
        actual: item.actualValue || 0,
        weighted: item.weightedValue || 0,
        fill: getChartColor(item.completionRate || 0),
      })) || []
    );
  };

  const prepareEmployeeChartData = (empData) => {
    return (
      empData?.map((emp) => ({
        name: emp.name || "Unknown",
        completion: emp.completionRate || 0,
        assigned: emp.assigned || 0,
        completed: emp.completed || 0,
        present: emp.presentDays || 0,
        absent: emp.approvedLeaveDays || 0,
      })) || []
    );
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#3a41e2",
    "#8884d8",
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  if (isError) return <ErrorMessage error={error} refetch={refetch} />;
  if (!departmentsData || departmentsData.length === 0)
    return (
      <div className="text-center py-20 text-gray-500">No KPI data found.</div>
    );

  const activeDeprtment =
    departmentsData.find((dept) => dept.departmentId === activeDept) ||
    departmentsData[0];
  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Department Head KPI Dashboard
          </h1>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateRangeSelector
            onDateRangeChange={handleDateRangeChange}
            label="Date Range"
          />
          <div className="flex items-center">
            <button
              onClick={() => setShowAllDepts(!showAllDepts)}
              className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center ${
                showAllDepts
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {showAllDepts ? "All Departments View" : "Single Department View"}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {departmentsData.map((dept) => (
          <DepartmentCard
            key={dept.departmentId}
            dept={dept}
            activeDept={activeDept}
            onClick={() => {
              setActiveDept(dept.departmentId);
              setActiveTab("overview");
              setShowAllDepts(false);
            }}
            getScoreColor={getScoreColor}
            getProgressColor={getProgressColor}
          />
        ))}
      </div>

      {/* All Departments Overview Section */}
      {showAllDepts && departmentsData.length > 0 && (
        <div className="space-y-6">
          <div className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-white p-5 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold">All Departments Overview</h2>
              <p className="">
                Period:{" "}
                {from
                  ? new Date(from).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}{" "}
                to{" "}
                {to
                  ? new Date(to).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>

            {/* Departments Comparison Charts */}
            <div className="mt-6 space-y-6">
              {/* Department Stats Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Completion Chart */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Task Completion by Department
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentsData.map((dept) => ({
                          completed: dept.stats?.completedTasks || 0,
                          total: dept.stats?.totalTasks || 0,
                          rate: dept.stats?.completionRate || 0,
                          name: dept.departmentName,
                        }))}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={false} // Hide axis labels
                        />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 100]}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="total"
                          name="Total Tasks"
                          fill="#8884d8"
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="completed"
                          name="Completed Tasks"
                          fill="#82ca9d"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="rate"
                          name="Completion %"
                          stroke="#ff7300"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart for All Departments */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Department KPI Metrics Radar
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        outerRadius={150}
                        data={departmentsData.map((dept) => ({
                          subject: dept.departmentName || "Unknown",
                          kpiScore: dept.finalKpiScore || 0,
                          completion: dept.stats?.completionRate || 0,
                          attendance: dept.stats?.attendanceRate || 0,
                        }))}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="KPI Score"
                          dataKey="kpiScore"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Completion %"
                          dataKey="completion"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Attendance %"
                          dataKey="attendance"
                          stroke="#ffc658"
                          fill="#ffc658"
                          fillOpacity={0.3}
                        />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                {/* Employee Distribution */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Employee Distribution by Department
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentsData.map((dept) => ({
                            name: dept.departmentName || "Unknown",
                            value: dept.stats?.totalEmployees || 0,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {departmentsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}`, "Employees"]}
                        />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Attendance Rate Chart */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Attendance Rate by Department
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentsData.map((dept) => ({
                            name: dept.departmentName || "Unknown",
                            value: dept.stats?.attendanceRate || 0,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) =>
                            `${name}: ${value.toFixed(1)}%`
                          }
                        >
                          {departmentsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value.toFixed(1)}%`,
                            "Attendance Rate",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* KPI Score Comparison */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-gray-700 mb-4">
                  Department KPI Score Comparison
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentsData.map((dept) => ({
                        name: dept.departmentName || "Unknown",
                        score: dept.finalKpiScore || 0,
                        fill: getChartColor(dept.finalKpiScore || 0),
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toFixed(1)}`,
                          "KPI Score",
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="score"
                        name="KPI Score"
                        fill="#8884d8"
                        label={{
                          position: "right",
                          formatter: (val) => `${val.toFixed(1)}`,
                        }}
                      >
                        {departmentsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getChartColor(entry.finalKpiScore)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Departments Summary Table */}
              <DepartmentsSummaryTable
                departmentsData={departmentsData}
                getScoreColor={getScoreColor}
                getProgressColor={getProgressColor}
                onRowClick={(dept) => {
                  setActiveDept(dept.departmentId);
                  setActiveTab("overview");
                  setShowAllDepts(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Department Detail Section */}
      {activeDeprtment && !showAllDepts && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-white p-5 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {activeDeprtment.departmentName}
                </h2>
                <p className="">
                  Period:{" "}
                  {from
                    ? new Date(from).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}{" "}
                  to{" "}
                  {to
                    ? new Date(to).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {typeof activeDeprtment.finalKpiScore === "number"
                    ? activeDeprtment.finalKpiScore.toFixed(1)
                    : 0}
                </div>
                <div className="text-xs">Final KPI Score</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-50 px-5 border-b">
            <div className="flex overflow-x-auto">
              <button
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "kpi"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("kpi")}
              >
                KPI Breakdown
              </button>
              {activeDeprtment.stats?.projectBreakdown &&
                activeDeprtment.stats.projectBreakdown.length > 0 && (
                  <button
                    className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "projects"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("projects")}
                  >
                    Projects
                  </button>
                )}
              {activeDeprtment.stats?.employeeStats &&
                activeDeprtment.stats.employeeStats.length > 0 && (
                  <button
                    className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "employees"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("employees")}
                  >
                    Employees
                  </button>
                )}
              <button
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "all"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("all");
                  setShowAllDepts(true);
                }}
              >
                All Departments
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {" "}
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Total Employees
                        </h4>
                        <div className="mt-1 text-2xl font-bold">
                          {activeDeprtment.stats?.totalEmployees || 0}
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-indigo-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Tasks
                        </h4>
                        <div className="mt-1 flex items-end gap-2">
                          <div className="text-2xl font-bold">
                            {activeDeprtment.stats?.completedTasks || 0}
                          </div>
                          <div className="text-gray-500 text-sm pb-0.5">
                            / {activeDeprtment.stats?.totalTasks || 0}
                          </div>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Completion Rate
                        </h4>
                        <div className="mt-1 text-2xl font-bold">
                          {activeDeprtment.stats?.completionRate
                            ? activeDeprtment.stats.completionRate.toFixed(2)
                            : 0}
                          %
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Attendance Rate
                        </h4>
                        <div className="mt-1 text-2xl font-bold">
                          {activeDeprtment.stats?.attendanceRate
                            ? activeDeprtment.stats.attendanceRate.toFixed(2)
                            : 0}
                          %
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-amber-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Chart: KPI Performance */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium text-gray-700 mb-4">
                      KPI Performance
                    </h3>
                    <div className="h-64">
                      <KpiBarChart
                        data={prepareKpiChartData(activeDeprtment.kpiBreakdown)}
                        bars={[
                          {
                            dataKey: "weight",
                            name: "Weight %",
                            fill: "#8884d8",
                          },
                          {
                            dataKey: "completion",
                            name: "Completion %",
                            fill: "#82ca9d",
                          },
                        ]}
                        height={"100%"}
                      />
                    </div>
                  </div>

                  {/* Chart: Score Distribution */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium text-gray-700 mb-4">
                      KPI Score Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={
                              activeDeprtment.kpiBreakdown?.map(
                                (kpi, index) => ({
                                  name: kpi.criteria || `KPI ${index + 1}`,
                                  value: kpi.weightedValue || 0,
                                })
                              ) || []
                            }
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {activeDeprtment.kpiBreakdown?.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value.toFixed(1)}`,
                              "Score",
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-700 mb-3">
                    KPI Breakdown
                  </h3>
                  <div className="space-y-4">
                    {(activeDeprtment.kpiBreakdown || []).map((kpi, idx) => (
                      <div key={kpi.kpiId || idx} className="relative">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">
                            {kpi.criteria || `KPI ${idx + 1}`}
                          </span>
                          <span className="text-gray-600">
                            {kpi.weightPercentage || kpi.weight || 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(
                              kpi.completionRate
                            )}`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, kpi.completionRate || 0)
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-500">
                          <span>
                            Weight: {kpi.weightPercentage || kpi.weight || 0}%
                          </span>
                          <span>Completion: {kpi.completionRate || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employee Performance Chart (if there are employees) */}
                {activeDeprtment.stats?.employeeStats &&
                  activeDeprtment.stats.employeeStats.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-4 mt-6">
                      <h3 className="font-medium text-gray-700 mb-4">
                        Team Performance
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={activeDeprtment.stats.employeeStats.map(
                              (emp) => ({
                                name: emp.name,
                                completion: emp.completionRate || 0,
                                assigned: emp.assigned || 0,
                                completed: emp.completed || 0,
                              })
                            )}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis
                              yAxisId="left"
                              orientation="left"
                              stroke="#8884d8"
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#82ca9d"
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="assigned"
                              name="Assigned"
                              fill="#8884d8"
                            />
                            <Bar
                              yAxisId="left"
                              dataKey="completed"
                              name="Completed"
                              fill="#82ca9d"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="completion"
                              name="Completion %"
                              stroke="#ff7300"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
              </div>
            )}{" "}
            {/* KPI Breakdown Tab */}
            {activeTab === "kpi" && (
              <div>
                {/* KPI Radar Chart */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <h3 className="font-medium text-gray-700 mb-4">
                    KPI Radar Analysis
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        outerRadius={90}
                        data={
                          activeDeprtment.kpiBreakdown?.map((kpi) => ({
                            subject: kpi.criteria || "KPI",
                            weight: kpi.weightPercentage || kpi.weight || 0,
                            completion: kpi.completionRate || 0,
                            actual: kpi.actualValue || 0,
                            weighted: kpi.weightedValue || 0,
                          })) || []
                        }
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Weight %"
                          dataKey="weight"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name="Completion %"
                          dataKey="completion"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.2}
                        />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* KPI Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-700 mb-4">
                    KPI Details
                  </h3>
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Criteria
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Weight
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Assigned
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Completed
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Completion %
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Avg Completion
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actual
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Weighted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(activeDeprtment.kpiBreakdown || []).map((kpi, idx) => (
                        <tr key={kpi.kpiId || idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.criteria || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.weightPercentage || kpi.weight || "-"}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.assignedTasks ?? "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.completedTasks ?? "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="mr-2">
                                {kpi.completionRate !== undefined &&
                                kpi.completionRate !== null
                                  ? kpi.completionRate.toFixed(2)
                                  : 0}
                                %
                              </span>
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full ${getProgressColor(
                                    kpi.completionRate
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(0, kpi.completionRate || 0)
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.avgCompletion ?? "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.actualValue ?? "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {kpi.weightedValue ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}{" "}
            {/* Projects Tab */}
            {activeTab === "projects" &&
              activeDeprtment.stats?.projectBreakdown && (
                <div>
                  {/* Projects Chart */}
                  <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h3 className="font-medium text-gray-700 mb-4">
                      Project Completion Summary
                    </h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={activeDeprtment.stats.projectBreakdown.map(
                            (proj) => ({
                              name: proj.projectName || `Unknown Project`,
                              assigned: proj.assigned || 0,
                              completed: proj.completed || 0,
                              completion: proj.completionRate || 0,
                              average: proj.avgCompletion || 0,
                            })
                          )}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={false} />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 100]}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="assigned"
                            name="Assigned Tasks"
                            fill="#8884d8"
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="completed"
                            name="Completed Tasks"
                            fill="#82ca9d"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="completion"
                            name="Completion %"
                            stroke="#ff7300"
                            activeDot={{ r: 8 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Project Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {activeDeprtment.stats.projectBreakdown.map((proj, idx) => (
                      <div
                        key={proj.projectId || idx}
                        className="bg-white rounded-lg shadow p-4 border-t-4 border-primary"
                      >
                        <h4
                          className="text-lg font-medium text-gray-800 truncate"
                          title={proj.projectName}
                        >
                          {proj.projectName || "-"}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className=" p-2 rounded">
                            <div className="text-xs text-gray-500">
                              Assigned
                            </div>
                            <div className="text-xl font-semibold">
                              {proj.assigned || 0}
                            </div>
                          </div>
                          <div className=" p-2 rounded">
                            <div className="text-xs text-gray-500">
                              Completed
                            </div>
                            <div className="text-xl font-semibold">
                              {proj.completed || 0}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Completion Rate</span>
                            <span>{proj.completionRate || 0}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                proj.completionRate
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, proj.completionRate || 0)
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Average Completion:{" "}
                          <span className="font-semibold">
                            {proj.avgCompletion || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Projects Table */}
                  <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium text-gray-700 mb-4">
                      Project Details
                    </h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Project
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Assigned
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completed
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completion %
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Avg Completion
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeDeprtment.stats.projectBreakdown.map(
                          (proj, idx) => (
                            <tr
                              key={proj.projectId || idx}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                {proj.projectName || "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {proj.assigned ?? "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {proj.completed ?? "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex items-center">
                                  <span className="mr-2">
                                    {proj.completionRate !== undefined &&
                                    proj.completionRate !== null
                                      ? proj.completionRate.toFixed(2)
                                      : 0}
                                    %
                                  </span>
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                                    <div
                                      className={`h-1.5 rounded-full ${getProgressColor(
                                        proj.completionRate
                                      )}`}
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(0, proj.completionRate || 0)
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {proj.avgCompletion ?? "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            {/* Employees Tab */}
            {activeTab === "employees" &&
              activeDeprtment.stats?.employeeStats && (
                <div>
                  {/* Employee Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="font-medium text-gray-700 mb-4">
                        Employee Performance
                      </h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={prepareEmployeeChartData(
                              activeDeprtment.stats.employeeStats
                            )}
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Completion"]}
                            />
                            <Legend />
                            <Bar
                              dataKey="completion"
                              fill="#8884d8"
                              label={{
                                position: "right",
                                formatter: (val) => `${val.toFixed(2)}%`,
                              }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="font-medium text-gray-700 mb-4">
                        Attendance Overview
                      </h3>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={activeDeprtment.stats.employeeStats.map(
                              (emp) => ({
                                name: emp.name || "Unknown",
                                present: emp.presentDays || 0,
                                leave: emp.approvedLeaveDays || 0,
                              })
                            )}
                            margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="name" tick={false} />

                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="present"
                              name="Present Days"
                              fill="#82ca9d"
                            />
                            <Bar
                              dataKey="leave"
                              name="Leave Days"
                              fill="#ffc658"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Employee Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {activeDeprtment.stats.employeeStats.map((emp, idx) => (
                      <div
                        key={emp.employeeId || idx}
                        className="bg-white rounded-lg shadow p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-bold">
                              {emp.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-800">
                            {emp.name || "-"}
                          </h4>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Task Completion</span>
                              <span>{emp.completionRate || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(
                                  emp.completionRate
                                )}`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, emp.completionRate || 0)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-50 rounded text-center">
                              <div className="text-xs text-gray-500">
                                Assigned
                              </div>
                              <div className="font-bold">
                                {emp.assigned || 0}
                              </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded text-center">
                              <div className="text-xs text-gray-500">
                                Completed
                              </div>
                              <div className="font-bold">
                                {emp.completed || 0}
                              </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded text-center">
                              <div className="text-xs text-gray-500">
                                Present Days
                              </div>
                              <div className="font-bold">
                                {emp.presentDays || 0}
                              </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded text-center">
                              <div className="text-xs text-gray-500">
                                Leave Days
                              </div>
                              <div className="font-bold">
                                {emp.approvedLeaveDays || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Employees Table */}
                  <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium text-gray-700 mb-4">
                      Employee Details
                    </h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Assigned
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completed
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completion %
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Avg Completion
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Present Days
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Leave Days
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeDeprtment.stats.employeeStats.map((emp, idx) => (
                          <tr
                            key={emp.employeeId || idx}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              {emp.name || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {emp.assigned ?? "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {emp.completed ?? "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {emp.completionRate !== undefined &&
                                  emp.completionRate !== null
                                    ? emp.completionRate.toFixed(2)
                                    : 0}
                                  %
                                </span>
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                                  <div
                                    className={`h-1.5 rounded-full ${getProgressColor(
                                      emp.completionRate
                                    )}`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, emp.completionRate || 0)
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {emp.avgCompletion ?? "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {emp.presentDays ?? "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {emp.approvedLeaveDays ?? "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}{" "}
            {/* All Departments Tab */}
            {activeTab === "all" && (
              <div>
                {/* All Departments Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {departmentsData.map((dept) => (
                    <div
                      key={dept.departmentId}
                      className={`bg-white p-6 rounded-xl shadow-sm border-b-4 cursor-pointer transition-all hover:shadow-md
                          ${
                            activeDept === dept.departmentId
                              ? "border-indigo-600 shadow-md"
                              : "border-gray-200"
                          }
                        `}
                      onClick={() => {
                        setActiveDept(dept.departmentId);
                        setActiveTab("overview");
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <h3
                          className="font-semibold text-gray-800 truncate"
                          title={dept.departmentName}
                        >
                          {dept.departmentName}
                        </h3>
                        <div
                          className={`font-bold text-lg ${getScoreColor(
                            dept.finalKpiScore
                          )}`}
                        >
                          {typeof dept.finalKpiScore === "number"
                            ? dept.finalKpiScore.toFixed(1)
                            : 0}
                        </div>
                      </div>

                      <div className="mt-3 h-1 bg-gray-200 rounded-full">
                        <div
                          className={`h-1 rounded-full ${getProgressColor(
                            dept.finalKpiScore
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, dept.finalKpiScore || 0)
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
                        <span>
                          Employees: {dept.stats?.totalEmployees || 0}
                        </span>
                        <span>Tasks: {dept.stats?.totalTasks || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptHeadKpi;
