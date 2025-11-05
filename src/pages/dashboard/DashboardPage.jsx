import { useState, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Users,
  Building2,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  BriefcaseIcon,
  User,
  RotateCcw,
  UsersRound,
  Network,
  FolderKanban,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import Button from "@/component/Button";
import { Badge } from "@/component/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/card";
import { FloatingInput } from "@/component/FloatiingInput";
import Loader from "@/component/Loader";
import { useGetAllEmployeeWorkStatsQuery, useGetDashboardStatsQuery } from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import ErrorMessage from "@/component/isError";
import { EmptyState } from "@/component/NoData";
import EmployeeTable from "./component/EmployeeTable";
import DateRangeSelector from "@/component/DateRangeSelector";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import SelectInput from "@/component/select/SelectInput";
import { set } from "date-fns";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import Tooltip from "@/component/Tooltip";

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

// Helper to get color class for hours/leave
function getHourColor(hours) {
  if (hours === 0) return "bg-gray-100 text-gray-500 border-gray-200";
  if (hours >= 8) return "bg-green-100 text-green-800 border-green-200";
  if (hours >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-orange-100 text-orange-800 border-orange-200";
}

const DashboardPage = () => {
  const [startDate, setStartDate] = useState(getPrevMonthLastDay());
  const [endDate, setEndDate] = useState(getCurrentMonthFirstLastDay());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [temporaryDepartmentData, setTemporaryDepartmentData] = useState({});
  // console.log(temporaryDepartmentData, selectedDepartment);
  // const [temporaryEmployeeData, setTemporaryEmployeeData] = useState({
  //   label: "",
  //   value: "",
  // });

  const { data: departmentData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({ page: 0, limit: 0, isPopulate: true });

  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 0,
      limit: 0,
      isPopulate: true,
      department: selectedDepartment,
    }
  );

  const employeeOptions = useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.map((emp) => ({
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName}`,
    }));
  }, [employeesData]);

  // Prepare departmentIds param for API
  const departmentIds =
    selectedDepartment !== "all" && selectedDepartment
      ? [selectedDepartment]
      : undefined;

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

  const { data: dashboardStats, isLoading: isDashboardStatsLoading } = useGetDashboardStatsQuery({
    startDate,
    endDate,
    departmentIds,
    employeeIds: selectedEmployee.length > 0 ? selectedEmployee : undefined,
  });

  // console.log(dashboardStats);

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
        selectedDepartment === "all" ||
        emp.department._id === selectedDepartment;
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

  const departmentStats = useMemo(() => {
    const deptMap = new Map();

    aggregatedStats.employeeStats.forEach((emp) => {
      if (!emp.department) return;

      const deptId = emp.department._id;
      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, {
          department: emp.department,
          totalHours: 0,
          employeeCount: 0,
          totalWorkingDays: 0,
        });
      }
      const dept = deptMap.get(deptId);
      dept.totalHours += emp.totalHours;
      dept.employeeCount += 1;
      dept.totalWorkingDays += emp.workingDays;
    });

    return Array.from(deptMap.values()).map((dept) => ({
      ...dept,
      averageHours:
        dept.totalWorkingDays > 0 ? dept.totalHours / dept.totalWorkingDays : 0,
    }));
  }, [aggregatedStats]);

  const dailyAggregatedData = useMemo(() => {
    const dateMap = new Map();

    aggregatedStats.employeeStats.forEach((emp) => {
      emp.filteredDays.forEach((day) => {
        const dateKey = day.date;
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            date: dateKey,
            totalHours: 0,
            employeeCount: 0,
            formattedDate: new Date(day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        }
        const dayData = dateMap.get(dateKey);
        dayData.totalHours += day.workedHours || 0;
        if ((day.workedHours || 0) > 0) dayData.employeeCount += 1;
      });
    });

    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((item) => !isNaN(new Date(item.date).getTime()));
  }, [aggregatedStats]);

  // --- Weekly Comparison Logic ---
  const weeklyAggregatedData = useMemo(() => {
    // Gather all filtered days from all employees
    const allDays = [];
    aggregatedStats.employeeStats.forEach((emp) => {
      emp.filteredDays.forEach((day) => {
        allDays.push({
          date: day.date,
          workedHours: day.workedHours || 0,
        });
      });
    });
    if (allDays.length === 0) return [];

    // Group by week (Sunday as start)
    const weekMap = {};
    allDays.forEach((item) => {
      const d = new Date(item.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().slice(0, 10);
      if (!weekMap[key]) {
        weekMap[key] = { week: key, totalHours: 0, days: 0 };
      }
      weekMap[key].totalHours += item.workedHours;
      weekMap[key].days += 1;
    });

    return Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));
  }, [aggregatedStats]);

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
        selectedDepartment === "all"
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

  const allFilteredDays = useMemo(() => {
    return aggregatedStats.employeeStats.flatMap(
      (emp) => emp.filteredDays || []
    );
  }, [aggregatedStats]);

  // Build calendarData for the selected date range
  const calendarData = useMemo(() => {
    if (!allFilteredDays.length) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Calendar grid: start from Sunday before start, end at Saturday after end
    const calendarStart = new Date(start);
    calendarStart.setDate(start.getDate() - start.getDay());
    const calendarEnd = new Date(end);
    calendarEnd.setDate(end.getDate() + (6 - end.getDay()));

    // Group allFilteredDays by date
    const groupedByDate = {};
    allFilteredDays.forEach((day) => {
      const dateStr = new Date(day.date).toISOString().slice(0, 10);
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(day);
    });

    const days = [];
    for (
      let d = new Date(calendarStart);
      d <= calendarEnd;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().slice(0, 10);
      const dayRecords = groupedByDate[dateStr] || [];
      const totalWorkedHours = dayRecords.reduce(
        (sum, rec) => sum + (rec.workedHours || 0),
        0
      );
      const isLeaveDay =
        dayRecords.length > 0 && dayRecords.every((rec) => rec.isLeaveDay);
      days.push({
        date: new Date(d),
        day: d.getDate(),
        workedHours: totalWorkedHours,
        isLeaveDay,
        isInRange: d >= start && d <= end && dayRecords.length > 0,
        employees: dayRecords.map((rec) => ({
          name: rec.employeeName,
          hours: rec.workedHours,
          isLeave: rec.isLeaveDay,
        })),
      });
    }
    return days;
  }, [allFilteredDays, startDate, endDate]);

  // Timeline: sorted filtered days in range (descending)
  const filteredData = useMemo(() => {
    return allFilteredDays
      .filter((d) => {
        const date = new Date(d.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return date >= start && date <= end && !isNaN(date.getTime());
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allFilteredDays, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage error={error} refetch={refetch} />;
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        message="No Data Available in the System."
        refetch={refetch}
        icon={<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
      />
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <Card className="">
        <CardHeader className="">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters & Controls</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tooltip text="Export Report" position="left">
              <Button size="sm" onClick={exportToXLSX} className="rounded-lg">
                <Download />
                {/* Export Report */}
              </Button>
              </Tooltip>
              <Tooltip text="Reset" position="left">
              <Button size="sm" type="button" variant="reset" onClick={() => {}}>
                <RotateCcw />
              </Button>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4">
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
              {/* <FloatingInput
                label="Department"
                name="department"
                type="select"
                icon={<BriefcaseIcon className="h-5 w-5" />}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                options={[
                  { value: "all", label: "All Departments" },
                  ...departments.map((d) => ({
                    value: d._id,
                    label: d.name,
                  })),
                ]}
                required
              /> */}
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
                  onChange={(options) =>
                    setSelectedEmployee(
                      options ? options.map((opt) => opt.value) : []
                    )
                  }
                  options={employeeOptions}
                  isLoading={isEmpLoading}
                />
              </div>
              {/* <FloatingInput
                label="Search Employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              /> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Departments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {/* {aggregatedStats.overall.totalEmployees} */}
                  {dashboardStats?.summaryStats?.totalDepartments}
                </p>
              </div>
              <Network className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {/* {aggregatedStats.overall.totalEmployees} */}
                  {dashboardStats?.summaryStats?.totalEmployees}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.summaryStats?.totalProjects}
                </p>
              </div>
              <FolderKanban className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Worked Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.summaryStats?.totalWorkedHours}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Project Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.summaryStats?.projectCompletionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Total Hours Trend</CardTitle>
            <CardDescription>
              Combined working hours across all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={dailyAggregatedData}
                margin={{ left: -30, right: 0, top: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}h`,
                    "Total Hours",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="totalHours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Hours</CardTitle>
            <CardDescription>Total hours worked by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={departmentStats}
                margin={{ left: -24, right: 0, top: 12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="department.name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `${value}h`}
                />{" "}
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}h`,
                    "Total Hours",
                  ]}
                  labelFormatter={(label) => `${label || "Department"}`}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />{" "}
                <defs>
                  <linearGradient
                    id="departmentBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#cd9761" stopOpacity={1} />
                    <stop offset="100%" stopColor="#b37e4c" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="totalHours"
                  name="Total Hours"
                  fill="url(#departmentBarGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  animationDuration={1500}
                  label={{
                    position: "top",
                    formatter: (value) => `${Number(value).toFixed(1)}h`,
                    fontSize: 11,
                    fill: "#a56d3b",
                    fontWeight: 500,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-[#000] text-base md:text-lg">
              Calendar Timeline
            </CardTitle>
            <CardDescription className="text-[#000] text-xs md:text-sm">
              Daily working hours
            </CardDescription>
          </CardHeader>
          <CardContent className="pt1 md:pt-1">
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm font-medium text-gray-500 p-1"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`
                    border-2 rounded-lg py-1 text-center transition-all hover:scale-105 relative
                    ${getHourColor(
                      day.workedHours / (day.employees.length || 1)
                    )}
                    ${!day.isInRange ? "opacity-30" : ""}
                  `}
                >
                  <div className="text-xs md:text-sm font-medium">
                    {day.day}
                  </div>
                  {day.isInRange && (
                    <div className="text-[10px] md:text-xs mt-0.5 md:mt-1 font-semibold">
                      {day.isLeaveDay
                        ? "Leave"
                        : `${day.workedHours.toFixed(1)}h`}
                    </div>
                  )}
                  {day.isInRange && day.employees.length > 0 && (
                    <div className="absolute left-1/2 z-10 hidden group-hover:block hover:block -translate-x-1/2 top-full mt-1 min-w-[120px] bg-white border border-gray-200 rounded shadow-lg p-2 text-xs text-left whitespace-nowrap pointer-events-none group-hover:pointer-events-auto">
                      <div className="font-bold mb-1">Employees:</div>
                      {day.employees.map((emp, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{emp.name || "-"}</span>
                          <span>
                            {emp.isLeave
                              ? "Leave"
                              : `${emp.hours?.toFixed(1) || 0}h`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-[#000] text-base md:text-lg">
              Activity Timeline
            </CardTitle>
            <CardDescription className="text-[#000] text-xs md:text-sm">
              All employees&#39; working hours by date
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 md:pt-4">
            <div className="space-y-2 md:space-y-4 max-h-[200px] md:max-h-[370px] overflow-y-auto">
              {(() => {
                const grouped = {};
                filteredData.forEach((d) => {
                  if (d.isLeaveDay) return; // skip leave days
                  const dateStr = new Date(d.date).toISOString().slice(0, 10);
                  if (!grouped[dateStr]) grouped[dateStr] = 0;
                  grouped[dateStr] += d.workedHours || 0;
                });
                const sortedDates = Object.keys(grouped).sort(
                  (a, b) => new Date(b) - new Date(a)
                );
                if (sortedDates.length === 0) {
                  return (
                    <div className="text-center text-gray-500">
                      No work records in this period.
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-gray-200 rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {" "}
                    {sortedDates.map((dateStr) => (
                      <div
                        key={dateStr}
                        className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                            <Calendar className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="font-semibold text-sm text-gray-800">
                            {new Date(dateStr).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 mr-1">
                            Total
                          </span>
                          <span className="text-lg font-bold text-blue-700">
                            {grouped[dateStr].toFixed(1)}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* {weeklyAggregatedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Comparison</CardTitle>
            <CardDescription>
              Total hours worked per week in the selected range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={weeklyAggregatedData}
                margin={{ left: -30, right: 0, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}h`, "Total Hours"]}
                  labelFormatter={(label) =>
                    `Week of ${new Date(label).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="totalHours"
                  stroke="#3a41e2"
                  strokeWidth={3}
                  dot={{ fill: "#3a41e2", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3a41e2", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )} */}

      {/* --- Department Statistics Section --- */}
      {/* {departmentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Department Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.map((dept) => (
                <Card
                  key={dept.department._id}
                  className="border-l-4 border-l-primary"
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {dept.department.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employees:</span>
                        <span className="font-medium">
                          {dept.employeeCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-medium">
                          {dept.totalHours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Hours/Day:</span>
                        <span className="font-medium">
                          {dept.averageHours.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Employee Details</CardTitle>
          <CardDescription>
            Individual employee statistics for the selected period
            {filteredEmployees.length !== employees.length && (
              <span className="text-blue-600">
                {" "}
                (Filtered: {filteredEmployees.length} of {employees.length})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={aggregatedStats.employeeStats}
            limit={5}
            columns={[
              {
                key: "employee",
                label: "Employee",
                render: (emp) => (
                  <div className="flex items-center space-x-3">
                    {emp.employeeImage ? (
                      <img
                        src={emp?.employeeImage}
                        alt={emp?.employeeName || "Employee"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">
                        {emp.employeeName || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {emp.employeeEmail || "No email"}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "department",
                label: "Department",
                render: (emp) => (
                  <Badge variant="outline">
                    {emp.department?.name || "No Department"}
                  </Badge>
                ),
              },
              {
                key: "employeeRole",
                label: "Role",
                render: (emp) => (
                  <Badge variant="secondary">
                    {emp.employeeRole || "No Role"}
                  </Badge>
                ),
              },
              {
                key: "totalHours",
                label: "Total Hours",
                render: (emp) => `${emp.totalHours?.toFixed(2) ?? "0.00"}h`,
              },
              {
                key: "workingDays",
                label: "Working Days",
              },
              {
                key: "leaveDays",
                label: "Leave Days",
              },
              {
                key: "averageHours",
                label: "Avg Hours/Day",
                render: (emp) => `${emp.averageHours?.toFixed(2) ?? "0.00"}h`,
              },
            ]}
            emptyMessage="No employees found matching the current filters."
          />
        </CardContent>
      </Card>

      {/* Employee Leave Section */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Employees by Leave Days</CardTitle>
          <CardDescription>
            Employees with the most leave days in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={aggregatedStats.employeeStats
              .filter((emp) => emp.leaveDays > 0)
              .sort((a, b) => b.leaveDays - a.leaveDays)}
            limit={5}
            columns={[
              {
                key: "employee",
                label: "Employee",
                render: (emp) => (
                  <div className="flex items-center space-x-3">
                    {emp.employeeImage ? (
                      <img
                        src={emp.employeeImage}
                        alt={emp.employeeName || "Employee"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">
                        {emp.employeeName || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {emp.employeeEmail || "No email"}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "department",
                label: "Department",
                render: (emp) => (
                  <Badge variant="outline">
                    {emp.department?.name || "No Department"}
                  </Badge>
                ),
              },
              {
                key: "leaveDays",
                label: "Leave Days",
              },
            ]}
            emptyMessage="No employee leave data available for the selected period."
          />
        </CardContent>
      </Card>

      {/* Today's Leave Employees Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Employees on Leave Today</CardTitle>
          <CardDescription>
            List of employees who are on leave today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={aggregatedStats.employeeStats.filter((emp) => {
              // Check if any filteredDays for this employee is today and isLeaveDay
              const today = new Date().toISOString().slice(0, 10);
              return emp.filteredDays?.some(
                (day) => day.date === today && day.isLeaveDay
              );
            })}
            columns={[
              {
                key: "employee",
                label: "Employee",
                render: (emp) => (
                  <div className="flex items-center space-x-3">
                    {emp.employeeImage ? (
                      <img
                        src={emp.employeeImage}
                        alt={emp.employeeName || "Employee"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">
                        {emp.employeeName || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {emp.employeeEmail || "No email"}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "department",
                label: "Department",
                render: (emp) => (
                  <Badge variant="outline">
                    {emp.department?.name || "No Department"}
                  </Badge>
                ),
              },
              {
                key: "employeeRole",
                label: "Role",
                render: (emp) => (
                  <Badge variant="secondary">
                    {emp.employeeRole || "No Role"}
                  </Badge>
                ),
              },
            ]}
            emptyMessage="No employees are on leave today."
          />
        </CardContent>
      </Card> */}

      {/* Today's Birthday Employees Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Birthdays</CardTitle>
          <CardDescription>Employees whose birthday is today</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = new Date();
            const todayStr =
              (today.getMonth() + 1).toString().padStart(2, "0") +
              "-" +
              today.getDate().toString().padStart(2, "0");
            const birthdayEmployees = aggregatedStats.employeeStats.filter(
              (emp) => {
                const dobRaw = emp?.employeeDob || emp?.dateOfBirth;
                if (!dobRaw) return false;
                const dob = new Date(dobRaw);
                const dobStr =
                  (dob.getMonth() + 1).toString().padStart(2, "0") +
                  "-" +
                  dob.getDate().toString().padStart(2, "0");
                return dobStr === todayStr;
              }
            );
            return birthdayEmployees.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No birthdays today.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {birthdayEmployees.map((emp) => (
                  <div
                    key={emp?.employeeId}
                    className="flex items-center space-x-3 bg-blue-50 rounded-lg px-4 py-2"
                  >
                    {emp?.employeeImage ? (
                      <img
                        src={emp?.employeeImage}
                        alt={emp?.employeeName || "Employee"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {emp?.employeeName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {emp?.employeeEmail || "No email"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card> */}

      {/* Next Day Birthday Employees Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Tomorrow&apos;s Birthdays</CardTitle>
          <CardDescription>
            Employees whose birthday is tomorrow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr =
              (tomorrow.getMonth() + 1).toString().padStart(2, "0") +
              "-" +
              tomorrow.getDate().toString().padStart(2, "0");
            const birthdayEmployees = aggregatedStats.employeeStats.filter(
              (emp) => {
                const dobRaw = emp?.employeeDob || emp?.dateOfBirth;
                if (!dobRaw) return false;
                const dob = new Date(dobRaw);
                const dobStr =
                  (dob.getMonth() + 1).toString().padStart(2, "0") +
                  "-" +
                  dob.getDate().toString().padStart(2, "0");
                return dobStr === tomorrowStr;
              }
            );
            return birthdayEmployees.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No birthdays tomorrow.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {birthdayEmployees.map((emp) => (
                  <div
                    key={emp?.employeeId}
                    className="flex items-center space-x-3 bg-green-50 rounded-lg px-4 py-2"
                  >
                    {emp?.employeeImage ? (
                      <img
                        src={emp?.employeeImage}
                        alt={emp?.employeeName || "Employee"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {emp?.employeeName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {emp?.employeeEmail || "No email"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card> */}
    </div>
  );
};

export default DashboardPage;
