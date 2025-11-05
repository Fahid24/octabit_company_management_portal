import { useState, useMemo } from "react";
import { useGetAllEmployeeWorkStatsQuery } from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import { EmptyState } from "@/component/NoData";
import { format } from "date-fns";
import SelectInput from "@/component/select/SelectInput";
import { useSelector } from "react-redux";
import ActiveFilters from "@/component/ActiveFilters";
import "@/utils/attendanceList.css";
import DateRangeSelector from "@/component/DateRangeSelector";
import Table from "@/component/Table";
import { AttendanceFilters } from "./components";
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
} from "recharts";
import attendancePresent from "@/assets/attendance-present.svg";
import attendanceLeave from "@/assets/attendance-leave.svg";
import attendanceAbsent from "@/assets/attendance-absent.svg";
import Tooltips from "@/component/Tooltip2";
import {
  CircleAlert,
  ChevronDown,
  ChevronUp,
  ClockAlert,
  Clock,
  Building2, // added
  ChartPie, // added
  Filter, // added for filter toggle button
} from "lucide-react";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook
import DownloadMonthlyAttendance from "./components/DownloadAttendanceExcel";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import LeaveIcon from "@/assets/Leave.png";

const AttendanceListPage = () => {
  // Get current state from Redux store
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  useSelector((state) => state.userSlice.user);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Add filter visibility state
  const [isEmployeeTableExpanded, setIsEmployeeTableExpanded] = useState(false);

  // Date range state
  const today = new Date();
  const [startDate, setStartDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd")
  );

  // Handle date range change from the date selector
  const handleDateRangeChange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    // Clamp endDate to today if it's in the future
    let safeEndDate =
      newEndDate && newEndDate > todayStr ? todayStr : newEndDate;
    setStartDate(newStartDate);
    setEndDate(safeEndDate);
  };

  // Query to fetch all employee work stats
  const { data, isLoading, isError, error, refetch } =
    useGetAllEmployeeWorkStatsQuery({
      startDate,
      endDate,
      ...(selectedDepartment.length > 0
        ? { departmentIds: selectedDepartment }
        : {}),
      ...(selectedEmployee.length > 0 ? { employeeIds: selectedEmployee } : {}),
    });

  // Fetch departments from API
  const { data: departmentData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({ page: 1, limit: 90000, isPopulate: true });

  // Fetch employees for filter, filtered by selectedDepartment (support multiple)
  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 1,
      limit: 10000000,
      isPopulate: true,
      department:
        selectedDepartment.length > 0
          ? selectedDepartment.join(",")
          : undefined, // pass all selected departments
    }
  );

  const { data: adminConfig } = useGetAdminConfigQuery();

  // Get list of employees
  const employees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees;
  }, [data]);

  // Get list of departments for filter
  const departments = useMemo(() => {
    if (!departmentData?.data) return [];
    return departmentData.data;
  }, [departmentData]);

  // Employee options for filter
  const employeeOptions = useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data
      .filter((emp) => emp.role !== "Admin")
      .map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName}`,
      }));
  }, [employeesData]);
  // Calculate department labels lookup map

  const departmentLabels = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d._id] = d.name;
    });
    return map;
  }, [departments]);

  // ===================== UNIFIED CALCULATION LOGIC =====================
  // This function will be used across all components to ensure consistency
  const calculateAttendanceStats = (dailyStats) => {
    if (!dailyStats || !Array.isArray(dailyStats) || dailyStats.length === 0) {
      return {
        presentDays: 0,
        graceDays: 0,
        lateDays: 0,
        leaveDays: 0,
        absentDays: 0,
        weekendDays: 0,
        holidayDays: 0,
        totalWorkDays: 0,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
      };
    }

    const today = new Date();

    let presentDays = 0;
    let graceDays = 0;
    let lateDays = 0;
    let leaveDays = 0;
    let absentDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;

    dailyStats.forEach((day) => {
      const dayDate = new Date(day.date);
      const workHoursPerDay =
        day?.attendanceShift === "Night"
          ? adminConfig?.workHourPerNight || 8
          : adminConfig?.workHourPerDay || 8;
      // Only process days up to today
      if (dayDate <= today) {
        if (day.isWeekend) {
          weekendDays++;
          // Include weekend work hours if any
          if (day.workedHours > 0) {
            totalHours += day.workedHours;
            regularHours +=
              day.workedHours > workHoursPerDay
                ? workHoursPerDay
                : day.workedHours;
            overtimeHours +=
              day.workedHours > workHoursPerDay
                ? day.workedHours - workHoursPerDay
                : 0;
          }
        } else if (day.isHoliday) {
          holidayDays++;
          // Include holiday work hours if any
          if (day.workedHours > 0) {
            totalHours += day.workedHours;
            regularHours +=
              day.workedHours > workHoursPerDay
                ? workHoursPerDay
                : day.workedHours;
            overtimeHours +=
              day.workedHours > workHoursPerDay
                ? day.workedHours - workHoursPerDay
                : 0;
          }
        } else if (day.isLeaveDay) {
          leaveDays++;
        } else {
          // Regular work days
          if (day.workedHours > 0) {
            totalHours += day.workedHours;
            regularHours +=
              day.workedHours > workHoursPerDay
                ? workHoursPerDay
                : day.workedHours;
            overtimeHours +=
              day.workedHours > workHoursPerDay
                ? day.workedHours - workHoursPerDay
                : 0;
          }

          if (day.isGraced) {
            graceDays++;
          } else if (day.isLate) {
            lateDays++;
          } else if (day.checkIn && day.checkOut) {
            presentDays++;
          } else {
            absentDays++;
          }
        }
      }
    });

    const totalWorkDays =
      presentDays + graceDays + lateDays + leaveDays + absentDays;

    return {
      presentDays,
      graceDays,
      lateDays,
      leaveDays,
      absentDays,
      weekendDays,
      holidayDays,
      totalWorkDays,
      totalHours,
      regularHours,
      overtimeHours,
    };
  };

  // Calculate the number of days in the selected date range
  const getTotalDaysInRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calculate total employees
  const getTotalEmployees = () => employees.length;

  // Calculate total present, leave, absent, grace, and late days
  const getTotalPresentDays = () =>
    employees.reduce(
      (total, emp) =>
        total + calculateAttendanceStats(emp.dailyStats).presentDays,
      0
    );
  const getTotalLeaveDays = () =>
    employees.reduce(
      (total, emp) =>
        total + calculateAttendanceStats(emp.dailyStats).leaveDays,
      0
    );
  const getTotalAbsentDays = () =>
    employees.reduce(
      (total, emp) =>
        total + calculateAttendanceStats(emp.dailyStats).absentDays,
      0
    );
  const getTotalGraceDays = () =>
    employees.reduce(
      (total, emp) =>
        total + calculateAttendanceStats(emp.dailyStats).graceDays,
      0
    );
  const getTotalLateDays = () =>
    employees.reduce(
      (total, emp) => total + calculateAttendanceStats(emp.dailyStats).lateDays,
      0
    );
  const getTotalWeekendDays = () =>
    employees.reduce(
      (total, emp) =>
        total + calculateAttendanceStats(emp.dailyStats).weekendDays,
      0
    );
  const getTotalHolidayDays = () =>
    employees.reduce(
      (total, emp) =>
        total + calculateAttendanceStats(emp.dailyStats).holidayDays,
      0
    );

  // Calculate averages
  const getAveragePresentDays = () => {
    const totalEmp = getTotalEmployees();
    return totalEmp > 0 ? (getTotalPresentDays() / totalEmp).toFixed(2) : 0;
  };
  const getAverageLeaveDays = () => {
    const totalEmp = getTotalEmployees();
    return totalEmp > 0 ? (getTotalLeaveDays() / totalEmp).toFixed(2) : 0;
  };
  const getAverageGraceDays = () => {
    const totalEmp = getTotalEmployees();
    return totalEmp > 0 ? (getTotalGraceDays() / totalEmp).toFixed(2) : 0;
  };
  const getAverageLateDays = () => {
    const totalEmp = getTotalEmployees();
    return totalEmp > 0 ? (getTotalLateDays() / totalEmp).toFixed(2) : 0;
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  // if (isError) return <ErrorMessage error={error} refetch={refetch} />;
  // if (!employees || employees.length === 0)
  //   return <EmptyState message="No attendance data found." refetch={refetch} />;

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div>
        <div className="flex justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 items-center">
            <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800 whitespace-nowrap">
              Employee Attendance Records
            </h1>
            <div className="cursor-pointer flex items-center">
              <Tooltips
                text="This Employee Attendance Records page shows overall and department-wise attendance statistics for a selected date range. It includes key metrics and individual employee data like total hours, presence, leave, absence, and attendance rate."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 sm:w-5 sm:h-5 md:w-5 md:h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center text-xs sm:text-sm md:text-base">
              <DownloadMonthlyAttendance data={data} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-xs md:text-sm font-medium rounded-md ${
                showFilters
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-white bg-primary hover:bg-primary/90"
              }`}
            >
              <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Filters
            </button>
          </div>
        </div>
        {/* Filters */}
        <AttendanceFilters
          showFilters={showFilters}
          onDateRangeChange={handleDateRangeChange}
          selectedDepartments={selectedDepartment}
          setSelectedDepartments={setSelectedDepartment}
          departmentsData={departments}
          departmentsLoading={isDeptLoading}
          selectedEmployees={selectedEmployee}
          setSelectedEmployees={setSelectedEmployee}
          employeeData={employeeOptions}
          employeeDataFormat="option"
          employeesLoading={isEmpLoading}
          selectedStatus=""
          setSelectedStatus={() => {}}
          statusOptions={[]}
          showStatusFilter={false}
          isAdmin={true}
          useCustomActiveFilters={true}
          customActiveFiltersComponent={
            <ActiveFilters
              filter={{
                department: selectedDepartment,
                employee: selectedEmployee,
              }}
              optionLabels={{
                department: departmentLabels,
                employee: employeeOptions.reduce((acc, e) => {
                  acc[e.value] = e.label;
                  return acc;
                }, {}),
              }}
              onRemove={(key, val) => {
                if (key === "department") {
                  const newDepartments = selectedDepartment.filter(
                    (id) => id !== val
                  );
                  setSelectedDepartment(newDepartments);
                  if (newDepartments.length > 0) {
                    // Find all employee IDs that are still valid for the remaining departments
                    const validEmployeeIds = (employeesData?.data || [])
                      .filter(
                        (emp) =>
                          emp.department &&
                          newDepartments.includes(emp.department._id)
                      )
                      .map((emp) => emp._id);
                    setSelectedEmployee(
                      selectedEmployee.filter((empId) =>
                        validEmployeeIds.includes(empId)
                      )
                    );
                  } else {
                    // If no departments selected, clear employees
                    setSelectedEmployee([]);
                  }
                }
                if (key === "employee")
                  setSelectedEmployee(
                    selectedEmployee.filter((id) => id !== val)
                  );
              }}
            />
          }
        />{" "}
      </div>

      {/* Employee Attendance Records */}
      <div className="grid grid-cols-1 gap-4">
        {/* Summary Cards */}

        {/* Company-wide attendance stats */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-center items-center shadow-md hover:shadow-lg transition-all col-span-6 md:col-span-3">
            <div className="text-2xl md:text-4xl font-extrabold text-primary mb-1">
              {getTotalDaysInRange()}
            </div>
            <div className="text-sm md:text-base text-gray-600 font-semibold">
              Total Days
            </div>
          </div>
          <div className="border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-center items-center shadow-md hover:shadow-lg transition-all col-span-6 md:col-span-3">
            <div className="text-2xl md:text-4xl font-extrabold text-primary mb-1">
              {getTotalEmployees()}
            </div>
            <div className="text-sm md:text-base text-gray-600 font-semibold">
              Total Employees
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-12 md:col-span-6">
            <div className="flex flex-row gap-4 justify-between w-full">
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {(() => {
                    const total =
                      getTotalPresentDays() +
                      getTotalGraceDays() +
                      getTotalLateDays() +
                      getTotalLeaveDays() +
                      getTotalAbsentDays();
                    return total > 0
                      ? ((getTotalPresentDays() / total) * 100).toFixed(1)
                      : 0;
                  })()}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">Present</div>
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-xl md:text-2xl font-bold text-emerald-600">
                  {(() => {
                    const total =
                      getTotalPresentDays() +
                      getTotalGraceDays() +
                      getTotalLateDays() +
                      getTotalLeaveDays() +
                      getTotalAbsentDays();
                    return total > 0
                      ? ((getTotalGraceDays() / total) * 100).toFixed(1)
                      : 0;
                  })()}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">Grace</div>
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-xl md:text-2xl font-bold text-orange-600">
                  {(() => {
                    const total =
                      getTotalPresentDays() +
                      getTotalGraceDays() +
                      getTotalLateDays() +
                      getTotalLeaveDays() +
                      getTotalAbsentDays();
                    return total > 0
                      ? ((getTotalLateDays() / total) * 100).toFixed(1)
                      : 0;
                  })()}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">Late</div>
              </div>
            </div>
            <div className="flex flex-row gap-4 justify-between w-full">
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-xl md:text-2xl font-bold text-yellow-600">
                  {(() => {
                    const total =
                      getTotalPresentDays() +
                      getTotalGraceDays() +
                      getTotalLateDays() +
                      getTotalLeaveDays() +
                      getTotalAbsentDays();
                    return total > 0
                      ? ((getTotalLeaveDays() / total) * 100).toFixed(1)
                      : 0;
                  })()}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">Leave</div>
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-2xl font-bold text-red-600">
                  {(() => {
                    const total =
                      getTotalPresentDays() +
                      getTotalGraceDays() +
                      getTotalLateDays() +
                      getTotalLeaveDays() +
                      getTotalAbsentDays();
                    return total > 0
                      ? ((getTotalAbsentDays() / total) * 100).toFixed(1)
                      : 0;
                  })()}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">Absent</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-lg sm:text-xl font-semibold text-primary">
                  {getAveragePresentDays()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Avg Present/Emp
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-lg sm:text-xl font-semibold text-primary">
                  {getAverageGraceDays()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Avg Grace/Emp
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-lg sm:text-xl font-semibold text-primary">
                  {getAverageLateDays()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Avg Late/Emp
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-lg sm:text-xl font-semibold text-primary">
                  {getAverageLeaveDays()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Avg Leave/Emp
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Summary with BarChart */}
          <div className=" rounded-2xl p-4 md:p-8 border bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <h4 className="text-xl md:text-2xl font-bold md:font-extrabold text mb-6 flex items-center gap-3">
              <span className="inline-block bg-[#d7d9f9] rounded-full p-3 shadow-sm">
                <Building2 className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </span>
              Department Summary
            </h4>
            <div className="h-52 md:h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(
                    employees.reduce((deptStats, emp) => {
                      const deptName = emp.department?.name || "Uncategorized";
                      if (!deptStats[deptName]) {
                        deptStats[deptName] = {
                          totalHours: 0,
                          presentDays: 0,
                          graceDays: 0,
                          lateDays: 0,
                          absentDays: 0,
                          leaveDays: 0,
                          weekendDays: 0,
                          holidayDays: 0,
                          employees: 0,
                        };
                      }
                      const stats = calculateAttendanceStats(emp.dailyStats);
                      deptStats[deptName].totalHours += stats.totalHours;
                      deptStats[deptName].presentDays += stats.presentDays;
                      deptStats[deptName].graceDays += stats.graceDays;
                      deptStats[deptName].lateDays += stats.lateDays;
                      deptStats[deptName].absentDays += stats.absentDays;
                      deptStats[deptName].leaveDays += stats.leaveDays;
                      deptStats[deptName].weekendDays += stats.weekendDays;
                      deptStats[deptName].holidayDays += stats.holidayDays;
                      deptStats[deptName].employees += 1;
                      return deptStats;
                    }, {})
                  ).map(([dept, stats]) => ({
                    name: dept,
                    totalHours: parseFloat(stats.totalHours.toFixed(1)),
                    presentDays: stats.presentDays,
                    graceDays: stats.graceDays,
                    lateDays: stats.lateDays,
                    absentDays: stats.absentDays,
                    leaveDays: stats.leaveDays,
                    weekendDays: stats.weekendDays,
                    holidayDays: stats.holidayDays,
                    employees: stats.employees,
                  }))}
                  margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#8a6642" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8a6642" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip
                    content={(props) => {
                      if (
                        props.active &&
                        props.payload &&
                        props.payload.length
                      ) {
                        const payload = props.payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-xl min-w-[180px] animate-fade-in">
                            <p className="font-bold text-primary text-lg mb-2">
                              {payload.name}
                            </p>
                            <div className="flex flex-col gap-1">
                              {(() => {
                                const total =
                                  payload.presentDays +
                                  payload.graceDays +
                                  payload.lateDays +
                                  payload.leaveDays +
                                  payload.absentDays;
                                const presentPercent =
                                  total > 0
                                    ? (
                                        (payload.presentDays / total) *
                                        100
                                      ).toFixed(1)
                                    : 0;
                                const gracePercent =
                                  total > 0
                                    ? (
                                        (payload.graceDays / total) *
                                        100
                                      ).toFixed(1)
                                    : 0;
                                const latePercent =
                                  total > 0
                                    ? (
                                        (payload.lateDays / total) *
                                        100
                                      ).toFixed(1)
                                    : 0;
                                const leavePercent =
                                  total > 0
                                    ? (
                                        (payload.leaveDays / total) *
                                        100
                                      ).toFixed(1)
                                    : 0;
                                const absentPercent =
                                  total > 0
                                    ? (
                                        (payload.absentDays / total) *
                                        100
                                      ).toFixed(1)
                                    : 0;
                                return (
                                  <>
                                    <span className="inline-flex items-center gap-1 text-green-700 text-sm font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                      Present:{" "}
                                      <span className="ml-1 font-bold">
                                        {presentPercent}%
                                      </span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                                      Grace:{" "}
                                      <span className="ml-1 font-bold">
                                        {gracePercent}%
                                      </span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-orange-600 text-sm font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                                      Late:{" "}
                                      <span className="ml-1 font-bold">
                                        {latePercent}%
                                      </span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-yellow-600 text-sm font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                                      Leave:{" "}
                                      <span className="ml-1 font-bold">
                                        {leavePercent}%
                                      </span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-red-600 text-sm font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                                      Absent:{" "}
                                      <span className="ml-1 font-bold">
                                        {absentPercent}%
                                      </span>
                                    </span>
                                  </>
                                );
                              })()}
                              <span className="inline-flex items-center gap-1 text-blue-700 text-sm font-semibold">
                                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                                Total Hours:{" "}
                                <span className="ml-1 font-bold">
                                  {payload.totalHours}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-gray-700 text-sm font-semibold">
                                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
                                Employees:{" "}
                                <span className="ml-1 font-bold">
                                  {payload.employees}
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontWeight: 700, fontSize: 14 }} />

                  <Bar
                    yAxisId="left"
                    dataKey="totalHours"
                    name="Total Hours"
                    fill="#8a6642"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="presentDays"
                    name="Present Days"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Date Range Overview with PieChart */}
          <div className=" rounded-2xl p-4 md:p-8 border bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <h4 className="text-xl md:text-2xl font-bold md:font-extrabold text mb-6 flex items-center gap-3">
              <span className="inline-block bg-[#d7d9f9] rounded-full p-3 shadow-sm">
                <ChartPie className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </span>
              Overall Attendance
            </h4>
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const totalPresent = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).presentDays,
                        0
                      );
                      const totalGrace = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).graceDays,
                        0
                      );
                      const totalLate = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).lateDays,
                        0
                      );
                      const totalLeave = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).leaveDays,
                        0
                      );
                      const totalAbsent = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).absentDays,
                        0
                      );
                      return [
                        {
                          name: "Present",
                          value: totalPresent,
                          color: "#10b981",
                        },
                        {
                          name: "Grace",
                          value: totalGrace,
                          color: "#10d9c4",
                        },
                        {
                          name: "Late",
                          value: totalLate,
                          color: "#f97316",
                        },
                        { name: "Leave", value: totalLeave, color: "#f59e0b" },
                        {
                          name: "Absent",
                          value: totalAbsent,
                          color: "#ef4444",
                        },
                      ].filter((item) => item.value > 0);
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const {
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      } = props;
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={14}
                          fontWeight="bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(() => {
                      const totalPresent = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).presentDays,
                        0
                      );
                      const totalGrace = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).graceDays,
                        0
                      );
                      const totalLate = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).lateDays,
                        0
                      );
                      const totalLeave = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).leaveDays,
                        0
                      );
                      const totalAbsent = employees.reduce(
                        (total, emp) =>
                          total +
                          calculateAttendanceStats(emp.dailyStats).absentDays,
                        0
                      );
                      return [
                        {
                          name: "Present",
                          value: totalPresent,
                          color: "#10b981",
                        },
                        {
                          name: "Grace",
                          value: totalGrace,
                          color: "#10d9c4",
                        },
                        {
                          name: "Late",
                          value: totalLate,
                          color: "#f97316",
                        },
                        { name: "Leave", value: totalLeave, color: "#f59e0b" },
                        {
                          name: "Absent",
                          value: totalAbsent,
                          color: "#ef4444",
                        },
                      ]
                        .filter((item) => item.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ));
                    })()}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      // Show only percent in tooltip
                      const total = employees.reduce((sum, emp) => {
                        const stats = calculateAttendanceStats(emp.dailyStats);
                        return (
                          sum +
                          stats.presentDays +
                          stats.graceDays +
                          stats.lateDays +
                          stats.leaveDays +
                          stats.absentDays
                        );
                      }, 0);
                      const percent =
                        total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return [`${percent}%`, null];
                    }}
                  />
                  <Legend
                    formatter={(value, entry) => {
                      const { color, payload } = entry;
                      // Show only percent in legend
                      const total = employees.reduce((sum, emp) => {
                        const stats = calculateAttendanceStats(emp.dailyStats);
                        return (
                          sum +
                          stats.presentDays +
                          stats.graceDays +
                          stats.lateDays +
                          stats.leaveDays +
                          stats.absentDays
                        );
                      }, 0);
                      const percent =
                        total > 0
                          ? ((payload.value / total) * 100).toFixed(1)
                          : 0;
                      return (
                        <span style={{ color }}>
                          {value} ({percent}%)
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Employee List using Table component */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Employee Attendance Records
              </h3>
              <button
                onClick={() =>
                  setIsEmployeeTableExpanded(!isEmployeeTableExpanded)
                }
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <span className="transition-all duration-200">
                  {isEmployeeTableExpanded ? "Collapse" : "Expand"}
                </span>
                <div
                  className={`transition-transform duration-300 ease-in-out ${
                    isEmployeeTableExpanded ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isEmployeeTableExpanded
                ? "max-h-none opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div
              className={`transition-all duration-300 ease-in-out ${
                isEmployeeTableExpanded
                  ? "transform translate-y-0"
                  : "transform -translate-y-4"
              }`}
            >
              <div className="p-5">
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      "Employee",
                      "Total Hours",
                      "Present",
                      "Grace",
                      "Late",
                      "Leave",
                      "Absent",
                      "Attendance Rate",
                    ]}
                    data={employees.map((employee) => {
                      const stats = calculateAttendanceStats(
                        employee.dailyStats
                      );
                      const attendanceRate =
                        stats.totalWorkDays > 0
                          ? Math.round(
                              ((stats.presentDays + stats.graceDays) /
                                stats.totalWorkDays) *
                                100
                            )
                          : 0;

                      return {
                        Employee: employee.employeeName,
                        "Total Hours": stats.totalHours.toFixed(1),
                        Present: stats.presentDays,
                        Grace: stats.graceDays,
                        Late: stats.lateDays,
                        Leave: stats.leaveDays,
                        Absent: stats.absentDays,
                        "Attendance Rate": `${attendanceRate}%`,
                        _rawData: { employee, stats, attendanceRate },
                      };
                    })}
                    isLoading={isLoading}
                    onRowClick={(row) => {
                      // Handle row click - could navigate to employee details
                      // console.log("Employee clicked:", row);
                    }}
                    renderCell={(colName, value, row) => {
                      switch (colName) {
                        case "Employee": {
                          const employee = row._rawData.employee;
                          return (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {employee.employeePhoto ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={employee.employeePhoto}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                    {employee.employeeName?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.employeeName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {employee.employeeRole}{" "}
                                  {employee.department?.name
                                    ? `• ${employee.department.name}`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        case "Present":
                          return (
                            <div className="text-center flex flex-col items-center gap-1">
                              <img
                                src={attendancePresent}
                                alt="Present"
                                className="w-6 h-6 mb-1 "
                              />
                              <div className="text-sm font-medium text-green-700">
                                {value}
                              </div>
                              <div className="text-xs text-gray-500">Days</div>
                            </div>
                          );
                        case "Grace":
                          return (
                            <div className="text-center flex flex-col items-center gap-1">
                              <div className="w-6 h-6 mb-1 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ClockAlert className="w-4 h-4 text-emerald-500" />{" "}
                                {/* changed icon */}
                              </div>
                              <div className="text-sm font-medium text-emerald-700">
                                {value}
                              </div>
                              <div className="text-xs text-gray-500">Days</div>
                            </div>
                          );
                        case "Late":
                          return (
                            <div className="text-center flex flex-col items-center gap-1">
                              <div className="w-6 h-6 mb-1 rounded-full bg-orange-100 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-orange-500" />{" "}
                                {/* changed icon */}
                              </div>
                              <div className="text-sm font-medium text-orange-700">
                                {value}
                              </div>
                              <div className="text-xs text-gray-500">Days</div>
                            </div>
                          );
                        case "Leave":
                          return (
                            <div className="text-center flex flex-col items-center gap-1">
                              <div className="w-6 h-6 mb-1 rounded-full bg-primary/10 flex items-center justify-center">
                                <img
                                  src={LeaveIcon}
                                  alt="Leave"
                                  className="w-4 h-4"
                                />
                              </div>
                              <div className="text-sm font-medium text-primary">
                                {value}
                              </div>
                              <div className="text-xs text-gray-500">Days</div>
                            </div>
                          );
                        case "Absent":
                          return (
                            <div className="text-center flex flex-col items-center gap-1">
                              <img
                                src={attendanceAbsent}
                                alt="Absent"
                                className="w-6 h-6 mb-1 animate-pulse"
                              />
                              <div className="text-sm font-medium text-red-600">
                                {value}
                              </div>
                              <div className="text-xs text-gray-500">Days</div>
                            </div>
                          );
                        case "Total Hours":
                          return (
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {value}
                              </div>
                              <div className="text-xs text-gray-500">Hours</div>
                            </div>
                          );
                        case "Attendance Rate": {
                          const attendanceRate = row._rawData.attendanceRate;
                          return (
                            <div className="flex items-center justify-center">
                              <div className="relative w-24 h-3 bg-gray-200 rounded-full mr-2">
                                <div
                                  className="absolute top-0 left-0 h-full rounded-full"
                                  style={{
                                    width: `${attendanceRate}%`,
                                    backgroundColor:
                                      attendanceRate > 80
                                        ? "#10b981"
                                        : attendanceRate > 50
                                        ? "#f59e0b"
                                        : "#ef4444",
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {value}
                              </span>
                            </div>
                          );
                        }
                        default:
                          return value;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceListPage;
