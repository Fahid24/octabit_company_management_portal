/* eslint-disable react/prop-types */
import Button from "@/component/Button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";
import DateRangeSelector from "@/component/DateRangeSelector";
import SelectInput from "@/component/select/SelectInput";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import {
  useGetAllEmployeeWorkStatsQuery,
  useGetDashboardStatsQuery,
} from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import {
  Users,
  Building2,
  FolderOpen,
  CheckSquare,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  UserCheck,
  UserX,
  AlertCircle,
  Filter,
  Download,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import DashboardSkeleton from "./component/DashboardSkeleton";
import Tooltip from "@/component/Tooltip";
import { useSelector } from "react-redux";
import LeaveIcon from "@/assets/Leave.png";

function getPrevMonthLastDay() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .slice(0, 10);
}

function getCurrentMonthFirstLastDay() {
  const now = new Date();
  // 0th day of next month is last day of current month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Subtract 1 day for second last day
  lastDay.setDate(lastDay.getDate());
  return lastDay.toISOString().slice(0, 10);
}

const DashboardPage2 = () => {
  const user = useSelector((state) => state.userSlice.user.user);
  const [startDate, setStartDate] = useState(getPrevMonthLastDay());
  const [endDate, setEndDate] = useState(getCurrentMonthFirstLastDay());
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [temporaryDepartmentData, setTemporaryDepartmentData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Prepare departmentIds param for API
  const departmentIds =
    selectedDepartment !== "" && selectedDepartment
      ? [selectedDepartment]
      : undefined;

  const { data: dashboardStats, isLoading: isDashboardStatsLoading } =
    useGetDashboardStatsQuery({
      startDate,
      endDate,
      userId: user?._id,
      departmentIds,
      employeesId: selectedEmployee.length > 0 ? selectedEmployee : undefined,
    });

  const { data: departmentData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({
      page: 0,
      limit: 0,
      isPopulate: true,
      departmentHead: user?.role === "DepartmentHead" ? user?._id : "",
    });

  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 0,
      limit: 100000000000000,
      isPopulate: true,
      departmentHead: user?.role === "DepartmentHead" ? user?._id : "",
      department: selectedDepartment,
    }
  );

  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllEmployeeWorkStatsQuery({
    startDate,
    endDate,
    ...(departmentIds ? { departmentIds } : {}),
    ...(selectedEmployee.length > 0 ? { employeeIds: selectedEmployee } : {}),
  });

  const employees = useMemo(() => apiData?.employees || [], [apiData]);

  const departments = useMemo(() => {
    const deptMap = new Map();
    employees.forEach((emp) => {
      if (
        emp.department &&
        emp.department._id &&
        !deptMap.has(emp.department._id)
      ) {
        deptMap.set(emp.department._id, emp.department);
      }
    });
    return Array.from(deptMap.values());
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (!emp.department) return false;

      const matchesDepartment =
        selectedDepartment === "" || emp.department._id === selectedDepartment;
      const matchesSearch =
        emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesSearch;
    });
  }, [employees, selectedDepartment, searchTerm]);

  const aggregatedStats = useMemo(() => {
    const stats = filteredEmployees.map((emp) => {
      const filteredDays = (emp.dailyStats || []).filter((day) => {
        const date = new Date(day.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return date >= start && date <= end && !isNaN(date.getTime());
      });

      const totalHours = filteredDays.reduce(
        (sum, day) => sum + (day.workedHours || 0),
        0
      );
      const workingDays = filteredDays.filter(
        (day) => !day.isLeaveDay && (day.workedHours || 0) > 0
      ).length;
      const leaveDays = filteredDays.filter((day) => day.isLeaveDay).length;
      const averageHours = workingDays > 0 ? totalHours / workingDays : 0;

      return {
        ...emp,
        totalHours,
        workingDays,
        leaveDays,
        averageHours,
        filteredDays,
      };
    });

    const overallTotalHours = stats.reduce(
      (sum, emp) => sum + emp.totalHours,
      0
    );
    const overallWorkingDays = stats.reduce(
      (sum, emp) => sum + emp.workingDays,
      0
    );
    const overallLeaveDays = stats.reduce((sum, emp) => sum + emp.leaveDays, 0);
    const overallAverageHours =
      overallWorkingDays > 0 ? overallTotalHours / overallWorkingDays : 0;

    return {
      employeeStats: stats,
      overall: {
        totalHours: overallTotalHours,
        workingDays: overallWorkingDays,
        leaveDays: overallLeaveDays,
        averageHours: overallAverageHours,
        totalEmployees: stats.length,
      },
    };
  }, [filteredEmployees, startDate, endDate]);

  const exportToXLSX = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("All Employees Report");

      // Add meta info with styled design
      sheet.addRow([
        "Generated Date",
        new Date().toLocaleDateString(),
        "",
        "Generated Time",
        new Date().toLocaleTimeString(),
        "",
        "Total Employees",
        aggregatedStats.overall.totalEmployees.toString(),
      ]);
      sheet.addRow([
        "Date Range",
        `${startDate} to ${endDate}`,
        "",
        "Department Filter",
        selectedDepartment === ""
          ? "All Departments"
          : departments.find((d) => d._id === selectedDepartment)?.name ||
            "Unknown",
        "",
        "Total Hours",
        aggregatedStats.overall.totalHours.toFixed(2),
      ]);
      sheet.addRow([]); // Spacer row

      // Style the meta info rows (row 1 and 2) - NO background color
      const metaRows = [1, 2];
      metaRows.forEach((rowIdx) => {
        const row = sheet.getRow(rowIdx);
        row.height = 24;
        for (let i = 1; i <= 8; i += 3) {
          // Label cell
          const labelCell = row.getCell(i);
          labelCell.font = { bold: true };
          labelCell.alignment = { vertical: "middle", horizontal: "left" };
          labelCell.border = {};
          // Value cell
          const valueCell = row.getCell(i + 1);
          valueCell.font = { color: { argb: "FF22223B" } };
          valueCell.alignment = { vertical: "middle", horizontal: "left" };
          valueCell.border = {};
        }
      });
      // Add a bottom border to the last meta row for separation
      for (let i = 1; i <= 8; i++) {
        sheet.getRow(2).getCell(i).border = {
          bottom: { style: "thin", color: { argb: "FFB6B6B6" } },
        };
      }

      // Merge and style the next two rows for "Employee Details"
      const detailsRowIdx = sheet.lastRow.number + 1;
      sheet.addRow(["Employee Details"]);
      sheet.addRow([""]); // Add a second row for merging
      // Merge across 8 columns and 2 rows
      sheet.mergeCells(detailsRowIdx, 1, detailsRowIdx + 1, 8);
      const mergedCell = sheet.getCell(detailsRowIdx, 1);
      mergedCell.value = "Employee Details";
      mergedCell.alignment = { vertical: "middle", horizontal: "center" };
      mergedCell.font = { bold: true, size: 14 };
      mergedCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB6D7A8" }, // Light green background
      };

      // Header Row (make bold)
      const headerRow = sheet.addRow([
        "Name",
        "Email",
        "Role",
        "Department",
        "Total Hours",
        "Working Days",
        "Leave Days",
        "Average Hours",
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFCCE5FF" }, // Light blue background
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Add employee data rows
      aggregatedStats.employeeStats.forEach((emp, idx) => {
        const row = sheet.addRow([
          emp.employeeName || "",
          emp.employeeEmail || "",
          emp.employeeRole || "",
          emp.department?.name || "",
          emp.totalHours.toFixed(2),
          emp.workingDays.toString(),
          emp.leaveDays.toString(),
          emp.averageHours.toFixed(2),
        ]);
        row.height = 24;
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: idx % 2 === 0 ? "FFF6F8FC" : "FFFFFFFF" }, // Light gray for even, white for odd
          };
        });
      });

      // Set default row height for all rows
      sheet.properties.defaultRowHeight = 24;

      // Set row height for all rows (including meta, merged, header, etc.)
      sheet.eachRow((row) => {
        row.height = 24;
      });

      // Auto width
      sheet.columns.forEach((col) => {
        let maxLen = 10;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          maxLen = Math.max(maxLen, String(cell.value || "").length);
        });
        col.width = maxLen + 2;
      });

      // Create blob and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `all_employees_report_${startDate}_to_${endDate}.xlsx`);
    } catch (err) {
      console.error("Error exporting XLSX:", err);
      alert("Failed to export XLSX file");
    }
  };

  const employeeOptions = useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.map((emp) => ({
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName}`,
    }));
  }, [employeesData]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    trend,
    color = "bg-white",
  }) => (
    <div
      className={`${color} rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-center items-center sm:items-start`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br from-primary to-primary`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600 font-medium">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, total, color = "#8A6642" }) => {
    const percentage = (value / total) * 100;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">
            {value}/{total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
            }}
          />
        </div>
      </div>
    );
  };

  const CircularProgress = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = "#8A6642",
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${
      (percentage / 100) * circumference
    } ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="space-y-8">
        {/* Header */}
        <Card className="">
          <CardHeader className="">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters & Controls</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* <Button size="sm" 
                      onClick={exportToXLSX}
                       className="rounded-lg">
                        <Download />
                      </Button> */}
                <Tooltip text="Reset Filters" position="left">
                  <Button
                    size="sm"
                    type="button"
                    variant="reset"
                    onClick={() => {
                      setSelectedDepartment("");
                      setTemporaryDepartmentData({});
                    }}
                  >
                    <RotateCcw />
                  </Button>
                </Tooltip>
                {user?.role === "Admin" && (
                  <Tooltip text="Download Report" position="left">
                    <Button
                      size="sm"
                      type="button"
                      variant=""
                      onClick={exportToXLSX}
                      className="rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-4 mt-1">
                <DateRangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={({
                    startDate: newStart,
                    endDate: newEnd,
                  }) => {
                    setStartDate(newStart);
                    setEndDate(newEnd);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end col-span-12 lg:col-span-8">
                <div>
                  <SelectInput
                    label="Department"
                    // id="hidden-select"
                    isMulti={false}
                    value={
                      temporaryDepartmentData.label
                        ? temporaryDepartmentData
                        : null
                    }
                    onChange={(e) => {
                      setSelectedDepartment(e.value),
                        setTemporaryDepartmentData(e);
                      setSelectedEmployee([]);
                    }}
                    options={departmentData?.data?.map((dept) => ({
                      value: dept._id,
                      label: dept.name,
                    }))}
                    isLoading={isDeptLoading}
                  />
                </div>
                <div>
                  <SelectInput
                    label="Employee"
                    // id="hidden-select"
                    isMulti={true}
                    value={employeeOptions.filter((e) =>
                      selectedEmployee.includes(e.value)
                    )}
                    onChange={(options) => {
                      setSelectedEmployee(
                        options ? options.map((opt) => opt.value) : []
                      );
                      // setSearchTerm(e.label || "");
                    }}
                    options={employeeOptions}
                    isLoading={isEmpLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isDashboardStatsLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-3">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Employees"
                value={dashboardStats?.summaryStats.totalEmployees}
                icon={Users}
                subtitle="Active workforce"
                // trend="+5.2%"
              />
              <StatCard
                title="Departments"
                value={dashboardStats?.summaryStats.totalDepartments}
                icon={Building2}
                subtitle="Organizational units"
              />
              <StatCard
                title="Active Projects"
                value={dashboardStats?.summaryStats.totalProjects}
                icon={FolderOpen}
                subtitle={`${dashboardStats?.summaryStats.inProgressProjects} in progress`}
                // trend="+12%"
              />
              <StatCard
                title="Total Tasks"
                value={dashboardStats?.summaryStats.totalTasks}
                icon={CheckSquare}
                subtitle={`${dashboardStats?.summaryStats.completedTasks} completed`}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Project & Task Overview */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FolderOpen className="w-6 h-6 mr-3 text-primary" />
                    Project & Task Overview
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Project Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Project Status
                      </h3>
                      <div className="space-y-3">
                        <ProgressBar
                          label="In Progress"
                          value={
                            dashboardStats?.summaryStats.inProgressProjects
                          }
                          total={dashboardStats?.summaryStats.totalProjects}
                          color="#3941e3"
                        />
                        <ProgressBar
                          label="Not Started"
                          value={
                            dashboardStats?.summaryStats.notStartedProjects
                          }
                          total={dashboardStats?.summaryStats.totalProjects}
                          color="#F59E0B"
                        />
                        <ProgressBar
                          label="Completed"
                          value={dashboardStats?.summaryStats.completedProjects}
                          total={dashboardStats?.summaryStats.totalProjects}
                          color="#10B981"
                        />
                      </div>
                    </div>

                    {/* Task Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Task Status
                      </h3>
                      <div className="space-y-3">
                        <ProgressBar
                          label="To Do"
                          value={dashboardStats?.summaryStats.todoTasks}
                          total={dashboardStats?.summaryStats.totalTasks}
                          color="#6B7280"
                        />
                        <ProgressBar
                          label="In Progress"
                          value={dashboardStats?.summaryStats.inProgressTasks}
                          total={dashboardStats?.summaryStats.totalTasks}
                          color="#8A6642"
                        />
                        <ProgressBar
                          label="Completed"
                          value={dashboardStats?.summaryStats.completedTasks}
                          total={dashboardStats?.summaryStats.totalTasks}
                          color="#10B981"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Analytics */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-primary" />
                    Attendance Analytics
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-700">
                        {dashboardStats?.summaryStats.presentDays}
                      </div>
                      <div className="text-sm text-green-600">Present Days</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <UserX className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-700">
                        {dashboardStats?.summaryStats.absentDays}
                      </div>
                      <div className="text-sm text-red-600">Absent Days</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                      <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-700">
                        {dashboardStats?.summaryStats.lateDays}
                      </div>
                      <div className="text-sm text-yellow-600">Late Days</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-xl">
                      <img
                        src={LeaveIcon}
                        alt="Leave"
                        className="w-8 h-8 mx-auto mb-2"
                      />
                      <div className="text-2xl font-bold text-primary">
                        {dashboardStats?.summaryStats.onLeaveDays}
                      </div>
                      <div className="text-sm text-primary">On Leave</div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Average Work Hours
                        </h3>
                        <p className="text-3xl font-bold text-primary">
                          {dashboardStats?.summaryStats.avgWorkHours}h
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: {dashboardStats?.summaryStats.totalWorkedHours}
                          h
                        </p>
                      </div>
                      <CircularProgress
                        percentage={Math.round(
                          (dashboardStats?.summaryStats.avgWorkHours / 8) * 100
                        )}
                        color="#3941e3"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Project Completion Rate
                    </h2>
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        percentage={
                          dashboardStats?.summaryStats.projectCompletionRate
                        }
                        size={150}
                        color="#3941e3"
                      />
                    </div>
                    <p className="text-center text-gray-600 mt-4">
                      {dashboardStats?.summaryStats.completedProjects} out of{" "}
                      {dashboardStats?.summaryStats.totalProjects} projects
                      completed
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Task Completion Rate
                    </h2>
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        percentage={
                          dashboardStats?.summaryStats.taskCompletionRate
                        }
                        size={150}
                        color="#10B981"
                      />
                    </div>
                    <p className="text-center text-gray-600 mt-4">
                      {dashboardStats?.summaryStats.completedTasks} out of{" "}
                      {dashboardStats?.summaryStats.totalTasks} tasks completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Top Performers */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary" />
                    Top Performers
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        Most Present
                      </h3>
                      <div className="space-y-3">
                        {dashboardStats?.topPresentEmployees
                          .slice(0, 3)
                          .map((employee, index) => (
                            <div
                              key={employee.employeeId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    index === 0
                                      ? "bg-yellow-500"
                                      : index === 1
                                      ? "bg-gray-400"
                                      : "bg-orange-400"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {employee.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {employee.presentDays} days present
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        Task Champions
                      </h3>
                      <div className="space-y-3">
                        {dashboardStats?.topCompletedTaskEmployees.map(
                          (employee, index) => (
                            <div
                              key={employee.employeeId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {employee.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {employee.completedTasks} tasks completed
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Role Distribution
                  </h2>

                  <div className="space-y-4">
                    {dashboardStats?.roleDistribution.map((role, index) => {
                      const colors = [
                        "#3941e3",
                        "#F59E0B",
                        "#10B981",
                        "#6366F1",
                      ];
                      return (
                        <div
                          key={role.role}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: colors[index] }}
                            />
                            <span className="font-medium text-gray-700">
                              {role.role === "DepartmentHead"
                                ? "Department Head"
                                : role.role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {role.count}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${
                                    (role.count /
                                      dashboardStats?.summaryStats
                                        .totalEmployees) *
                                    100
                                  }%`,
                                  backgroundColor: colors[index],
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leave Management */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <img src={LeaveIcon} alt="Leave" className="w-5 h-5 mr-2" />
                    Leave Management
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">
                          {dashboardStats?.summaryStats.approvedLeaves}
                        </div>
                        <div className="text-xs text-green-600">Approved</div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-700">
                          {dashboardStats?.summaryStats.pendingLeaves}
                        </div>
                        <div className="text-xs text-yellow-600">Pending</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-700">
                          {dashboardStats?.summaryStats.rejectedLeaves}
                        </div>
                        <div className="text-xs text-red-600">Rejected</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Total Leave Requests
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {dashboardStats?.summaryStats.totalLeaves}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Rates */}
      </div>
    </div>
  );
};

export default DashboardPage2;
