import { useState, useMemo, useCallback } from "react";
import { useGetAllEmployeeWorkStatsQuery } from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import { format } from "date-fns";
import SelectInput from "@/component/select/SelectInput";
import ActiveFilters from "@/component/ActiveFilters";
import DateRangeSelector from "@/component/DateRangeSelector";
import "@/utils/attendanceList.css";
import { CircleAlert, Filter } from "lucide-react";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import { downloadEmployeeAttendance } from "./components/excel-export";

// Import new components
import DepartmentSummaryView from "./components/DepartmentSummaryView";
import MultiDepartmentSummaryView from "./components/MultiDepartmentSummaryView";
import SingleDepartmentTableView from "./components/SingleDepartmentTableView";
import EmployeeDetailView from "./components/EmployeeDetailView";
import { AttendanceFilters } from "./components";

const DeptAttendanceListPage = () => {
  // Get current state from Redux store
  const isMobile = useIsMobile(); // Check if the device is mobile
  const today = new Date();
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Add filter visibility state
  const [startDate, setStartDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd")
  );

  // New state for sorting
  const [sortField, setSortField] = useState("employeeName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [quickFilter, setQuickFilter] = useState("all"); // all, high-performers, leave-concerns, late-arrivals

  // State for showing more/less departments in multi-department summary
  const [showAllDepartments, setShowAllDepartments] = useState(false);

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

  // Query to fetch departments
  const { data: departmentData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({ page: 1, limit: 900000, isPopulate: true });
  // Query to fetch employees
  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 1,
      limit: 900000000,
      isPopulate: true,
      department:
        selectedDepartment.length > 0
          ? selectedDepartment.join(",")
          : undefined,
    }
  );

  const { data: adminConfig } = useGetAdminConfigQuery();

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

  // Function to get sorted and filtered employee list
  const getSortedFilteredEmployees = useCallback(
    (employees) => {
      if (!employees || employees.length === 0) return [];

      // First apply quick filter
      let filteredEmployees = [...employees];

      if (quickFilter === "high-performers") {
        filteredEmployees = filteredEmployees.filter((emp) => {
          const total =
            emp?.dailyStats?.reduce((t, d) => t + d?.workedHours, 0) || 0;
          const workDays =
            emp?.dailyStats?.filter((d) => d?.workedHours > 0).length || 0;
          const efficiency = Math.min(
            100,
            (total / (workDays * data?.workHours)) * 100
          );
          return efficiency >= 80;
        });
      } else if (quickFilter === "leave-concerns") {
        filteredEmployees = filteredEmployees?.filter((emp) => {
          const leaveDays =
            emp?.dailyStats?.filter((d) => d?.isLeaveDay).length || 0;
          return leaveDays > 2; // More than 2 leave days in the period
        });
      } else if (quickFilter === "late-arrivals") {
        filteredEmployees = filteredEmployees?.filter((emp) => {
          const lateCount =
            emp?.dailyStats?.filter((day) => {
              if (!day?.checkIn || day?.isLeaveDay) return false;
              const checkInTime = new Date(day?.checkIn);
              return (
                checkInTime.getHours() > 9 ||
                (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 15)
              );
            }).length || 0;
          return lateCount > 1; // More than 1 late arrival
        });
      }

      // Then sort by selected field
      return filteredEmployees.sort((a, b) => {
        let valueA, valueB;

        switch (sortField) {
          case "employeeName":
            valueA = a?.employeeName?.toLowerCase() || "";
            valueB = b?.employeeName?.toLowerCase() || "";
            break;
          case "totalHours":
            valueA = a?.dailyStats?.reduce((t, d) => t + d.workedHours, 0) || 0;
            valueB = b?.dailyStats?.reduce((t, d) => t + d.workedHours, 0) || 0;
            break;
          case "presentDays":
            valueA = calculateAttendanceStats(a?.dailyStats).presentDays;
            valueB = calculateAttendanceStats(b?.dailyStats).presentDays;
            break;
          case "graceDays":
            valueA = calculateAttendanceStats(a?.dailyStats).graceDays;
            valueB = calculateAttendanceStats(b?.dailyStats).graceDays;
            break;
          case "leaveDays":
            valueA = calculateAttendanceStats(a?.dailyStats).leaveDays;
            valueB = calculateAttendanceStats(b?.dailyStats).leaveDays;
            break;
          case "lateArrivals":
            valueA =
              a?.dailyStats?.filter((day) => {
                if (!day?.checkIn || day.isLeaveDay) return false;
                const checkInTime = new Date(day.checkIn);
                return (
                  checkInTime.getHours() > 9 ||
                  (checkInTime.getHours() === 9 &&
                    checkInTime.getMinutes() > 15)
                );
              }).length || 0;
            valueB =
              b.dailyStats?.filter((day) => {
                if (!day.checkIn || day.isLeaveDay) return false;
                const checkInTime = new Date(day.checkIn);
                return (
                  checkInTime.getHours() > 9 ||
                  (checkInTime.getHours() === 9 &&
                    checkInTime.getMinutes() > 15)
                );
              }).length || 0;
            break;
          case "efficiency": {
            const totalA =
              a.dailyStats?.reduce((t, d) => t + d.workedHours, 0) || 0;
            const workDaysA =
              a.dailyStats?.filter((d) => d.workedHours > 0).length || 0;
            const totalB =
              b.dailyStats?.reduce((t, d) => t + d.workedHours, 0) || 0;
            const workDaysB =
              b.dailyStats?.filter((d) => d.workedHours > 0).length || 0;

            const effA =
              workDaysA > 0
                ? Math.min(100, (totalA / (workDaysA * data?.workHours)) * 100)
                : 0;
            const effB =
              workDaysB > 0
                ? Math.min(100, (totalB / (workDaysB * data?.workHours)) * 100)
                : 0;

            valueA = effA;
            valueB = effB;
            break;
          }
        }

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortField, sortDirection, quickFilter, data?.workHours]
  );

  // Memoized list of employees
  const employees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees;
  }, [data]);

  // Memoized list of departments
  const departments = useMemo(() => {
    if (!departmentData?.data) return [];
    return departmentData.data;
  }, [departmentData]);

  // Memoized employee options for select input
  const employeeOptions = useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data
      .filter((emp) => emp.role !== "Admin")
      .map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName}`,
      }));
  }, [employeesData]);

  // Memoized department labels for active filters
  const departmentLabels = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d._id] = d.name;
    });
    return map;
  }, [departments]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  if (isError) return <ErrorMessage error={error} refetch={refetch} />;

  // Group data by weeks for the timesheet display
  const groupDataByWeeks = (employeeData) => {
    if (!employeeData || !employeeData.dailyStats) return [];

    const weeks = [];
    let currentWeek = [];
    let currentWeekNumber = -1;

    employeeData.dailyStats.forEach((day) => {
      const date = new Date(day.date);
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

  // Group employees by department
  const employeesByDepartment = departments.map((dept) => {
    const deptEmployees = employees.filter(
      (emp) => emp.department?._id === dept._id
    );

    // Calculate department-wide statistics using unified logic
    let totalPresentDays = 0;
    let totalGraceDays = 0;
    let totalLateDays = 0;
    let totalLeaveDays = 0;
    let totalAbsentDays = 0;
    let totalHours = 0;

    deptEmployees.forEach((emp) => {
      const stats = calculateAttendanceStats(emp.dailyStats);
      totalPresentDays += stats.presentDays;
      totalGraceDays += stats.graceDays;
      totalLateDays += stats.lateDays;
      totalLeaveDays += stats.leaveDays;
      totalAbsentDays += stats.absentDays;
      totalHours += stats.totalHours;
    });

    const avgHours =
      deptEmployees.length > 0 ? totalHours / deptEmployees.length : 0;

    // Calculate proper attendance rate including Grace
    const totalWorkDays =
      totalPresentDays +
      totalGraceDays +
      totalLateDays +
      totalLeaveDays +
      totalAbsentDays;
    const attendanceRate =
      totalWorkDays > 0
        ? Math.round(
            ((totalPresentDays + totalGraceDays) / totalWorkDays) * 100
          )
        : 0;

    return {
      name: dept.name,
      count: deptEmployees.length,
      totalHours,
      avgHours,
      attendanceRate,
      totalPresentDays,
      totalGraceDays,
      totalLateDays,
      totalLeaveDays,
      totalAbsentDays,
      // Use total stats for the period instead of just today
      todayStats: {
        present: totalPresentDays,
        grace: totalGraceDays,
        late: totalLateDays,
        leave: totalLeaveDays,
        absent: totalAbsentDays,
      },
    };
  });

  // Special design conditions
  const showDepartmentSummary =
    selectedDepartment.length === 0 && selectedEmployee.length === 0;
  const showSelectedDeptTable =
    selectedDepartment.length === 1 && selectedEmployee.length === 0;
  const showMultiDeptSummary =
    selectedDepartment.length > 1 && selectedEmployee.length === 0;

  // Employees for selected department (for summary table)
  const selectedDeptObj = departments.find(
    (dept) => dept._id === selectedDepartment[0]
  );
  const employeesInSelectedDept =
    selectedDepartment.length === 1
      ? employees.filter((emp) => emp.department?._id === selectedDepartment[0])
      : [];
  const deptTotalHours = employeesInSelectedDept.reduce(
    (sum, emp) =>
      sum + (emp.dailyStats?.reduce((t, d) => t + d.workedHours, 0) || 0),
    0
  );
  const deptAvgHours =
    employeesInSelectedDept.length > 0
      ? deptTotalHours / employeesInSelectedDept.length
      : 0;

  // For multi-department summary
  const selectedDepartments = departments.filter((dept) =>
    selectedDepartment.includes(dept._id)
  );
  const employeesBySelectedDepartment = selectedDepartments.map((dept) => {
    const deptEmployees = employees.filter(
      (emp) => emp.department?._id === dept._id
    );

    // Calculate department-wide statistics using unified logic
    let totalPresentDays = 0;
    let totalGraceDays = 0;
    let totalLateDays = 0;
    let totalLeaveDays = 0;
    let totalAbsentDays = 0;
    let totalHours = 0;

    deptEmployees.forEach((emp) => {
      const stats = calculateAttendanceStats(emp.dailyStats);
      totalPresentDays += stats.presentDays;
      totalGraceDays += stats.graceDays;
      totalLateDays += stats.lateDays;
      totalLeaveDays += stats.leaveDays;
      totalAbsentDays += stats.absentDays;
      totalHours += stats.totalHours;
    });

    const avgHours =
      deptEmployees.length > 0 ? totalHours / deptEmployees.length : 0;

    // Calculate proper attendance rate including Grace
    const totalWorkDays =
      totalPresentDays +
      totalGraceDays +
      totalLateDays +
      totalLeaveDays +
      totalAbsentDays;
    const attendanceRate =
      totalWorkDays > 0
        ? Math.round(
            ((totalPresentDays + totalGraceDays) / totalWorkDays) * 100
          )
        : 0;

    return {
      name: dept.name,
      count: deptEmployees.length,
      totalHours,
      avgHours,
      attendanceRate,
      // Use total stats for the period instead of just today
      todayStats: {
        present: totalPresentDays,
        grace: totalGraceDays,
        late: totalLateDays,
        leave: totalLeaveDays,
        absent: totalAbsentDays,
      },
    };
  });

  // Format a date range with friendly text like Today, Yesterday, This Week, etc.
  const formatDateRangeText = (startDateStr, endDateStr) => {
    // Thorough check for invalid or missing date values
    if (
      !startDateStr ||
      !endDateStr ||
      startDateStr === "Invalid Date" ||
      endDateStr === "Invalid Date" ||
      startDateStr === "null" ||
      endDateStr === "null"
    ) {
      return "Select Date Range";
    }

    let start, end;

    try {
      start = new Date(startDateStr);
      end = new Date(endDateStr);

      // Check for epoch dates (Jan 1, 1970) or invalid dates
      if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime()) ||
        start.getFullYear() < 2000 ||
        end.getFullYear() < 2000 ||
        start.toString() === "Invalid Date" ||
        end.toString() === "Invalid Date"
      ) {
        return "Select Valid Date Range";
      }

      // Check if dates are reasonable (not default dates often used in error cases)
      const epochStart = new Date(0); // Jan 1, 1970
      if (
        start.getTime() === epochStart.getTime() ||
        end.getTime() === epochStart.getTime()
      ) {
        return "Select Valid Date Range";
      }
    } catch (error) {
      console.error("Date parsing error:", error);
      return "Select Valid Date Range";
    }

    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);

    // Helper functions
    function isThisWeek(date) {
      const todayDay = currentDate.getDay() || 7; // Convert Sunday from 0 to 7
      const firstDayOfWeek = new Date(currentDate);
      firstDayOfWeek.setDate(currentDate.getDate() - todayDay + 1); // Monday
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Sunday
      firstDayOfWeek.setHours(0, 0, 0, 0);
      lastDayOfWeek.setHours(23, 59, 59, 999);
      date.setHours(12, 0, 0, 0); // Mid-day to avoid timezone issues
      return date >= firstDayOfWeek && date <= lastDayOfWeek;
    }

    function isLastWeek(date) {
      const lastWeekToday = new Date(currentDate);
      lastWeekToday.setDate(lastWeekToday.getDate() - 7);
      const lastWeekDay = lastWeekToday.getDay() || 7;
      const firstDayOfLastWeek = new Date(lastWeekToday);
      firstDayOfLastWeek.setDate(lastWeekToday.getDate() - lastWeekDay + 1);
      const lastDayOfLastWeek = new Date(firstDayOfLastWeek);
      lastDayOfLastWeek.setDate(firstDayOfLastWeek.getDate() + 6);
      firstDayOfLastWeek.setHours(0, 0, 0, 0);
      lastDayOfLastWeek.setHours(23, 59, 59, 999);
      date.setHours(12, 0, 0, 0); // Mid-day to avoid timezone issues
      return date >= firstDayOfLastWeek && date <= lastDayOfLastWeek;
    }

    // Format date range to always display alongside friendly names
    const dateRangeStr =
      start.getFullYear() === end.getFullYear()
        ? start.getMonth() === end.getMonth() &&
          start.getDate() === end.getDate()
          ? format(start, "MMM d, yyyy") // Same day
          : start.getMonth() === end.getMonth()
          ? `${format(start, "MMM d")} - ${format(end, "d, yyyy")}` // Same month
          : `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}` // Different months, same year
        : `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`; // Different years

    // Format as "Today" if the range is just today
    if (
      format(start, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd")
    ) {
      return `Today's Statistics (${dateRangeStr})`;
    }
    // Format as "Yesterday" if the range is just yesterday
    else if (
      format(start, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
    ) {
      return `Yesterday's Statistics (${dateRangeStr})`;
    }
    // Format as "This Week" if the range is the current week
    else if (isThisWeek(new Date(start)) && isThisWeek(new Date(end))) {
      return `This Week's Statistics (${dateRangeStr})`;
    }
    // Format as "Last Week" if the range is last week
    else if (isLastWeek(new Date(start)) && isLastWeek(new Date(end))) {
      return `Last Week's Statistics (${dateRangeStr})`;
    }
    // If same month and year
    else if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      // This Month
      if (
        start.getMonth() === currentDate.getMonth() &&
        start.getFullYear() === currentDate.getFullYear() &&
        start.getDate() === 1 &&
        end.getDate() >= 28
      ) {
        return `This Month's Statistics (${dateRangeStr})`;
      }
      // Last Month
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      if (
        start.getMonth() === lastMonth.getMonth() &&
        start.getFullYear() === lastMonth.getFullYear() &&
        start.getDate() === 1 &&
        end.getDate() >= 28
      ) {
        return `Last Month's Statistics (${dateRangeStr})`;
      }
      return `${format(start, "MMMM yyyy")} Statistics (${dateRangeStr})`;
    }
    // Just show the date range for other periods
    else {
      return dateRangeStr;
    }
  };

  // Function to handle sort changes
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDownload = async (employee) => {
    try {
      await downloadEmployeeAttendance({ employee, workHours: data.workHours });
    } catch (error) {
      console.error("Error downloading attendance report:", error);
      alert("Failed to download attendance report. Please try again.");
    }
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="flex items-center">
        <div className="flex items-center flex-grow">
          <h1 className="text-2xl font-bold mb-4">
            Employee Attendance Records
          </h1>
          <div className="ml-2 pt-2 mb-4 cursor-pointer">
            <Tooltips
              text="View and manage department attendance records.
Track daily presence, absences, and leaves.
Ensure accurate attendance for all team members."
              position={isMobile ? "bottom" : "right"}
            >
              <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </Tooltips>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-3 py-2 mb-4 text-xs md:text-sm font-medium rounded-md ${
            showFilters
              ? "text-primary bg-primary/10 border border-primary/20"
              : "text-white bg-primary hover:bg-primary/90"
          }`}
        >
          <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          Filters
        </button>
      </div>

      {/* Filters */}
      <AttendanceFilters
        showFilters={showFilters}
        onDateRangeChange={({ startDate, endDate }) => {
          // When dates are cleared, reset to the current month
          if (startDate === null || endDate === null) {
            const today = new Date();
            setStartDate(
              format(
                new Date(today.getFullYear(), today.getMonth(), 1),
                "yyyy-MM-dd"
              )
            );
            setEndDate(
              format(
                new Date(today.getFullYear(), today.getMonth() + 1, 0),
                "yyyy-MM-dd"
              )
            );
          } else {
            setStartDate(startDate);
            setEndDate(endDate);
          }
        }}
        selectedDepartments={selectedDepartment}
        setSelectedDepartments={(departments) => {
          if (!departments || departments.length === 0) {
            setSelectedDepartment([]);
          } else {
            // Keep only the last selected item for this page's specific logic
            const lastSelected = departments[departments.length - 1];
            setSelectedDepartment([lastSelected]);
          }
        }}
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
      />

      {/* Conditional Rendering of Different Views */}
      {showDepartmentSummary && (
        <DepartmentSummaryView
          employeesByDepartment={employeesByDepartment}
          departments={departments}
          startDate={startDate}
          endDate={endDate}
          showAllDepartments={showAllDepartments}
          setShowAllDepartments={setShowAllDepartments}
          setSelectedDepartment={setSelectedDepartment}
          formatDateRangeText={formatDateRangeText}
        />
      )}

      {showMultiDeptSummary && (
        <MultiDepartmentSummaryView
          employeesBySelectedDepartment={employeesBySelectedDepartment}
          startDate={startDate}
          endDate={endDate}
          formatDateRangeText={formatDateRangeText}
        />
      )}

      {showSelectedDeptTable && (
        <SingleDepartmentTableView
          selectedDeptObj={selectedDeptObj}
          employeesInSelectedDept={employeesInSelectedDept}
          deptTotalHours={deptTotalHours}
          deptAvgHours={deptAvgHours}
          calculateAttendanceStats={calculateAttendanceStats}
          getSortedFilteredEmployees={getSortedFilteredEmployees}
          handleSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          startDate={startDate}
          endDate={endDate}
        />
      )}

      {!showDepartmentSummary &&
        !showMultiDeptSummary &&
        !showSelectedDeptTable && (
          <EmployeeDetailView
            employees={employees}
            handleDownload={handleDownload}
            groupDataByWeeks={groupDataByWeeks}
            adminConfig={adminConfig}
          />
        )}
    </div>
  );
};

export default DeptAttendanceListPage;
