import { useState } from "react";
import { useGetAllEmployeeWorkStatsQuery } from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import { EmptyState } from "@/component/NoData";
import { format } from "date-fns";
import DateRangeSelector from "@/component/DateRangeSelector";
import "@/utils/attendanceList.css";
import AttendanceGraph from "./AttendanceGraph";
import { AttendanceFilters } from "./components";
import attendancePresent from "@/assets/attendance-present.svg";
import attendanceLeave from "@/assets/attendance-leave.svg";
import attendanceAbsent from "@/assets/attendance-absent.svg";
import LeaveIcon from "@/assets/Leave.png";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Tooltips from "@/component/Tooltip2";
import {
  CircleAlert,
  Clock,
  Calendar,
  Timer,
  ClockAlert,
  Filter, // added for filter toggle button
} from "lucide-react";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";

const MyAttendanceListPage = () => {
  const { id } = useParams();
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const user = useSelector((state) => state.userSlice.user);
  const today = new Date();
  const [showFilters, setShowFilters] = useState(false); // Add filter visibility state
  const [startDate, setStartDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd")
  );

  const handleDateRangeChange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Use the 'all' endpoint for filtering by employee and date
  const { data, isLoading, isError, error, refetch } =
    useGetAllEmployeeWorkStatsQuery(
      {
        employeeIds: id ? [id] : [user?.user?._id],
        startDate,
        endDate,
      },
      {
        refetchOnMountOrArgChange: true,
        skip: !id && !user?.user?._id,
      }
    );
  const employee = data?.employees?.[0];

  const isNightShift = employee?.employeeShift === "Night";

  const { data: adminConfig } = useGetAdminConfigQuery();
  const workHoursPerDay = isNightShift
    ? adminConfig?.workHourPerNight || 8
    : adminConfig?.workHourPerDay || 8;

  // ===================== UNIFIED CALCULATION LOGIC =====================
  // This function will be used across all components to ensure consistency
  const calculateAttendanceStats = (dailyStats) => {
    if (!dailyStats || dailyStats.length === 0) {
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

  // Use unified calculations
  const attendanceStats = calculateAttendanceStats(employee?.dailyStats);

  // Icon mapping for different statuses
  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return (
          <img src={attendancePresent} alt="Present" className="w-5 h-5" />
        );
      case "Grace":
        return <ClockAlert className="w-5 h-5 text-emerald-600" />;
      case "Late":
        return <Timer className="w-5 h-5 text-orange-600" />;
      case "Leave":
        return <img src={LeaveIcon} alt="Leave" className="w-5 h-5" />;
      case "Absent":
        return <img src={attendanceAbsent} alt="Absent" className="w-5 h-5" />;
      case "Weekend":
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case "Holiday":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      default:
        return <CircleAlert className="w-5 h-5 text-gray-500" />;
    }
  };

  // Group data by weeks for the timesheet display, starting from Sunday, skipping future dates
  const groupDataByWeeks = (employeeData) => {
    // console.log(employeeData);
    if (!employeeData || !employeeData.dailyStats) return [];
    const today = new Date();
    const filteredStats = employeeData.dailyStats.filter(
      (day) => new Date(day.date) <= today
    );
    const weeks = [];
    let currentWeek = [];
    let currentWeekNumber = -1;
    filteredStats.forEach((day) => {
      const date = new Date(day.date);
      // For Sunday start, we use date.getDay() directly (Sunday is 0, Monday is 1, etc.)
      // We use a week number calculation based on the day of month and day of week
      // where Sunday is the first day of the week (0)
      const weekNumber = Math.floor((date.getDate() - date.getDay()) / 7) + 1;

      if (weekNumber !== currentWeekNumber) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek);
        }
        currentWeek = [];
        currentWeekNumber = weekNumber;
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  };

  // Format time from milliseconds
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "MM/dd");
  };

  // Get day name
  const getDayName = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "EEE");
  };

  // Attendance breakdown for pie chart - Using unified calculations
  const {
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
  } = attendanceStats;

  const pieData = [
    { name: "Present", value: presentDays, color: "#00904B" },
    { name: "Grace", value: graceDays, color: "#28A745" },
    { name: "Late", value: lateDays, color: "#FFC107" },
    { name: "Leave", value: leaveDays, color: "#8A6642" },
    { name: "Absent", value: absentDays, color: "#F44336" },
  ];

  // Don't filter out zero values initially to see all categories
  const filteredPieData = pieData.filter((item) => item.value > 0);

  // If no data, show a placeholder
  const displayPieData =
    filteredPieData.length > 0
      ? filteredPieData
      : [{ name: "No Data", value: 1, color: "#E5E7EB" }];

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  if (isError) return <ErrorMessage error={error} refetch={refetch} />;
  if (!employee)
    return <EmptyState message="No attendance data found." refetch={refetch} />;

  return (
    <div className="p-4 md:pl-24 pb-20 lg:pb-4">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="flex items-center flex-grow">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Attendance Records
          </h1>
          <div className="ml-2 pt-2 cursor-pointer">
            <Tooltips
              text="View your monthly attendance summary and daily records.
Visualize present, absent, and leave days with charts.
Check your total hours, regular and overtime details.
Easily track your attendance status for each day."
              position={isMobile ? "bottom" : "right"}
            >
              <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </Tooltips>
          </div>
        </div>
        {/* Filter Toggle Button */}
        <div className="flex justify-end mb-4">
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

      <div className="mb-4 sm:mb-6">
        <AttendanceFilters
          showFilters={showFilters}
          onDateRangeChange={handleDateRangeChange}
          selectedDepartments={[]}
          setSelectedDepartments={() => {}}
          departmentsData={[]}
          departmentsLoading={false}
          selectedEmployees={[]}
          setSelectedEmployees={() => {}}
          employeeData={[]}
          employeesLoading={false}
          selectedStatus=""
          setSelectedStatus={() => {}}
          statusOptions={[]}
          showStatusFilter={false}
          isAdmin={false}
          className="max-w-md"
        />
      </div>
      {/* Attendance Graphs Row */}
      <div className="w-full flex flex-col xl:flex-row gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <AttendanceGraph
            dailyStats={employee.dailyStats}
            workHoursPerDay={workHoursPerDay}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="w-full h-full bg-white rounded-lg shadow-md">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-gray-800">
                Attendance Breakdown
              </h2>

              {/* Main Content - Pie Chart and Statistics in Row */}
              <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Pie Chart Section */}
                <div className="flex-1 flex items-center justify-center">
                  {/* Add extra top margin and z-index for chart container */}
                  <div
                    style={{
                      marginTop: 24,
                      position: "relative",
                      zIndex: 10,
                      width: "100%",
                    }}
                  >
                    {filteredPieData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height={isMobile ? 200 : 240}
                      >
                        <PieChart
                          margin={{ top: 24, right: 16, bottom: 8, left: 16 }} // increased top margin
                        >
                          <Pie
                            data={displayPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => {
                              // hide labels when rounding would show 0%
                              if (displayPieData[0].name === "No Data")
                                return "";
                              const p = (percent || 0) * 100;
                              return p < 1 ? "" : `${p.toFixed(0)}%`;
                            }}
                            outerRadius={isMobile ? 60 : 75} // slightly reduced radius
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {displayPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) =>
                              name === "No Data"
                                ? ["No attendance data", ""]
                                : [`${value} days`, name]
                            }
                          />
                          {filteredPieData.length > 0 && <Legend />}
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-2xl mb-2">📊</div>
                          <div className="text-sm font-medium">
                            No attendance data available
                          </div>
                          <div className="text-xs mt-1 opacity-70">
                            Total days checked:{" "}
                            {employee?.dailyStats?.length || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="flex-1 flex items-center">
                  <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                    <div className="grid grid-cols-1 gap-1 sm:gap-2">
                      {filteredPieData.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between bg-[#00904B]/10 rounded-md px-2 py-1 border-l-2 border-[#00904B]">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#00904B] rounded-full mr-1"></div>
                              <span className="text-gray-700 font-medium text-xs">
                                Present
                              </span>
                            </div>
                            <span className="font-bold text-[#00904B] text-base">
                              {presentDays}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-[#28A745]/10 rounded-md px-2 py-1 border-l-2 border-[#28A745]">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#28A745] rounded-full mr-1"></div>
                              <span className="text-gray-700 font-medium text-xs">
                                Grace
                              </span>
                            </div>
                            <span className="font-bold text-[#28A745] text-base">
                              {graceDays}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-[#FFC107]/10 rounded-md px-2 py-1 border-l-2 border-[#FFC107]">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-1"></div>
                              <span className="text-gray-700 font-medium text-xs">
                                Late
                              </span>
                            </div>
                            <span className="font-bold text-[#FFC107] text-base">
                              {lateDays}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-primary/10 rounded-md px-2 py-1 border-l-2 border-primary">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
                              <span className="text-gray-700 font-medium text-xs">
                                Leave
                              </span>
                            </div>
                            <span className="font-bold text-primary text-base">
                              {leaveDays}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-[#F44336]/10 rounded-md px-2 py-1 border-l-2 border-[#F44336]">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#F44336] rounded-full mr-1"></div>
                              <span className="text-gray-700 font-medium text-xs">
                                Absent
                              </span>
                            </div>
                            <span className="font-bold text-[#F44336] text-base">
                              {absentDays}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1 border-l-2 border-gray-400">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                              <span className="text-gray-700 font-semibold text-xs">
                                Total Work Days
                              </span>
                            </div>
                            <span className="font-bold text-gray-700 text-base">
                              {presentDays +
                                graceDays +
                                lateDays +
                                leaveDays +
                                absentDays}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                          <div className="text-xs font-medium mb-1">
                            No Record Found
                          </div>
                          <div className="text-xs space-y-1">
                            <div>
                              Present: {presentDays}, Grace: {graceDays}, Late:{" "}
                              {lateDays}
                            </div>
                            <div>
                              Leave: {leaveDays}, Absent: {absentDays}
                            </div>
                            <div className="font-medium mt-1">
                              Total Records: {employee?.dailyStats?.length || 0}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Monthly Summary Box - Modern Card Design */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-primary/10 to-white p-4 sm:p-6 rounded-t-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
            {employee.employeePhoto ? (
              <img
                src={employee.employeePhoto}
                alt={employee.employeeName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-base sm:text-xl font-bold text-primary">
                {employee.employeeName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {employee.employeeName}
            </h3>
            <div className="flex flex-col sm:flex-row text-gray-600 gap-1 sm:gap-2 font-semibold text-sm sm:text-base opacity-90">
              <span>{employee?.employeeDesignation}</span>
              <span className="hidden sm:inline">•</span>
              <span>{employee.department?.name}</span>
            </div>
          </div>
        </div>
        <div className="rounded-b-xl shadow-md bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 sm:px-8 py-6 gap-6 border border-gray-200">
          <div className="flex-1">
            <div className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Monthly Total Hours
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
              {totalHours.toFixed(2)}{" "}
              <span className="text-lg sm:text-xl lg:text-2xl text-gray-500">
                Hrs
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3 lg:gap-2">
            <div className="flex items-center justify-between text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-sm sm:text-base">
                Regular Hours:
              </span>
              <span className="font-semibold text-sm sm:text-base">
                {regularHours.toFixed(2)} Hrs
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-700 py-2 px-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-sm sm:text-base">
                Overtime Hours:
              </span>
              <span className="font-semibold text-blue-600 text-sm sm:text-base">
                {overtimeHours.toFixed(2)} Hrs
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-700 py-2 px-3 bg-rose-50 rounded-lg">
              <span className="font-medium text-sm sm:text-base">
                Leave Days:
              </span>
              <span className="font-semibold text-rose-600 text-sm sm:text-base">
                {leaveDays} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 bg-white rounded-lg shadow-md overflow-hidden">
        {/* Timesheet Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            Weekly Timesheet
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed attendance breakdown by week
          </p>
        </div>

        {/* Timesheet Table */}
        <div className="overflow-x-auto">
          {groupDataByWeeks(employee).map((week, weekIndex) => (
            <div key={weekIndex} className="mb-6 last:mb-0">
              {/* Week Header */}
              <div className="bg-gray-100 px-4 sm:px-6 py-3 border-b">
                <h4 className="font-semibold text-gray-700 text-sm sm:text-base">
                  Week {weekIndex + 1} ({week.length} days)
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-16 sm:w-20">
                        Day
                      </th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-16 sm:w-20">
                        Date
                      </th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-24 sm:w-32">
                        IN - OUT
                      </th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-20 sm:w-24">
                        CODE
                      </th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-16 sm:w-20">
                        HOURS
                      </th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-16 sm:w-20">
                        TOTAL
                      </th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-16 sm:w-20">
                        REG
                      </th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-16 sm:w-20">
                        OT
                      </th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-20 sm:w-24">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.map((day, dayIndex) => {
                      let status, color, payCode;

                      // Handle different day types and statuses based on actual data structure
                      if (day.isWeekend) {
                        status = "Weekend";
                        color = "text-purple-600";
                        payCode = "WEEKEND";
                      } else if (day.isHoliday) {
                        status = "Holiday";
                        color = "text-blue-600";
                        payCode = "HOLIDAY";
                      } else if (day.isLeaveDay) {
                        status = "Leave";
                        color = "text-primary"; // CHANGED from text-yellow-600
                        payCode = "LEAVE";
                      } else if (day.isGraced) {
                        status = "Grace";
                        color = "text-emerald-600";
                        payCode = "WORK";
                      } else if (day.isLate) {
                        status = "Late";
                        color = "text-orange-600";
                        payCode = "WORK";
                      } else if (day.checkIn && day.checkOut) {
                        status = "Present";
                        color = "text-green-700";
                        payCode = "WORK";
                      } else {
                        status = "Absent";
                        color = "text-red-600";
                        payCode = "ABSENT";
                      }

                      return (
                        <tr
                          key={dayIndex}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            day.isWeekend
                              ? "bg-purple-50/50"
                              : day.isHoliday
                              ? "bg-blue-50/50"
                              : day.isLeaveDay
                              ? "bg-primary/5" // CHANGED from bg-yellow-50/50
                              : "bg-white"
                          }`}
                        >
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-900">
                            {getDayName(day.date)}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700">
                            {formatDate(day.date)}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            {day.isWeekend || day.isHoliday ? (
                              <span className="text-gray-400 font-medium">
                                -
                              </span>
                            ) : day.checkIn && day.checkOut ? (
                              <div className="space-y-1">
                                <div className="font-medium text-green-600">
                                  {formatTime(day.checkIn)}
                                </div>
                                <div className="font-medium text-red-600">
                                  {formatTime(day.checkOut)}
                                </div>
                              </div>
                            ) : day.isLeaveDay ? (
                              <span className="text-primary font-medium text-xs">
                                ON LEAVE {/* CHANGED from text-yellow-600 */}
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium text-xs">
                                ABSENT
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-xs font-medium">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                payCode === "WORK"
                                  ? "bg-green-100 text-green-800"
                                  : payCode === "LEAVE"
                                  ? "bg-primary/10 text-primary" // CHANGED from bg-yellow-100 text-yellow-800
                                  : payCode === "WEEKEND"
                                  ? "bg-purple-100 text-purple-800"
                                  : payCode === "HOLIDAY"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {payCode}
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold">
                            {day.workedHours > 0 ? (
                              <span className="text-blue-600">
                                {day.workedHours.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold">
                            {day.workedHours > 0 ? (
                              <span className="text-blue-600">
                                {day.workedHours.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold">
                            {day.workedHours > 0 ? (
                              <span className="text-green-600">
                                {(day.workedHours >
                                (day?.attendanceShift === "Night"
                                  ? adminConfig?.workHourPerNight || 8
                                  : adminConfig?.workHourPerDay || 8)
                                  ? day?.attendanceShift === "Night"
                                    ? adminConfig?.workHourPerNight || 8
                                    : adminConfig?.workHourPerDay || 8
                                  : day.workedHours
                                ).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold">
                            {day.workedHours >
                            (day?.attendanceShift === "Night"
                              ? adminConfig?.workHourPerNight || 8
                              : adminConfig?.workHourPerDay || 8) ? (
                              <span className="text-orange-600">
                                {(
                                  day.workedHours -
                                  (day?.attendanceShift === "Night"
                                    ? adminConfig?.workHourPerNight || 8
                                    : adminConfig?.workHourPerDay || 8)
                                ).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-center">
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
                            >
                              <span className="hidden sm:inline">
                                {getStatusIcon(status)}
                              </span>
                              {status}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Weekly Total Row */}
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300">
                      <td
                        colSpan="4"
                        className="py-4 px-2 sm:px-4 text-right pr-4 font-bold text-gray-800 text-sm"
                      >
                        WEEK {weekIndex + 1} TOTALS
                      </td>
                      <td className="py-4 px-2 sm:px-4 text-center font-bold text-blue-600 text-sm">
                        {week
                          .reduce((total, day) => {
                            // Include all work hours including weekend/holiday work
                            return total + (day.workedHours || 0);
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-4 px-2 sm:px-4 text-center font-bold text-blue-600 text-sm">
                        {week
                          .reduce((total, day) => {
                            // Include all work hours including weekend/holiday work
                            return total + (day.workedHours || 0);
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-4 px-2 sm:px-4 text-center font-bold text-green-600 text-sm">
                        {week
                          .reduce((total, day) => {
                            // Regular hours calculation (max work hours per day)
                            const workHoursPerDay =
                              day?.attendanceShift === "Night"
                                ? adminConfig?.workHourPerNight || 8
                                : adminConfig?.workHourPerDay || 8;
                            const dayHours = day.workedHours || 0;
                            return (
                              total +
                              (dayHours > workHoursPerDay
                                ? workHoursPerDay
                                : dayHours)
                            );
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-4 px-2 sm:px-4 text-center font-bold text-orange-600 text-sm">
                        {week
                          .reduce((total, day) => {
                            // Overtime hours calculation (hours over work hours per day)
                            const workHoursPerDay =
                              day?.attendanceShift === "Night"
                                ? adminConfig?.workHourPerNight || 8
                                : adminConfig?.workHourPerDay || 8;
                            const dayHours = day.workedHours || 0;
                            return (
                              total +
                              (dayHours > workHoursPerDay
                                ? dayHours - workHoursPerDay
                                : 0)
                            );
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-4 px-2 sm:px-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyAttendanceListPage;
