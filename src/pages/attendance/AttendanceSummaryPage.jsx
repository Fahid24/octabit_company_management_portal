import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Filter,
  Download,
  Building2,
  ChevronDown,
  ChevronRight,
  Calendar,
  X,
  Sun,
  Moon,
  Eye,
  Edit,
  Edit3,
  LogOut,
  PlusCircle,
  ClockAlert, // added
  Timer, // added for short leave
} from "lucide-react";
import {
  useGetAttendanceSummaryQuery,
  useGetAttendanceByIdQuery,
  useUpdateAttendanceMutation,
} from "@/redux/features/attendance/attendanceApiSlice";
import { exportAttendanceReport } from "@/utils/exportAttendanceReport";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import RecentActivity from "./components/RecentActivity";
import { QuickStats } from "./components/QuickStats";
import DepartmentSummary from "./components/DepartmentSummary";
import CreateAttendanceModal from "./components/CreateAttendanceModal";
import AttendanceViewModal from "./components/AttendanceViewModal";
import AttendanceEditModal from "./components/AttendanceEditModal";
import DateRangeSelector from "@/component/DateRangeSelector";
import {
  format,
  parseISO,
  isAfter,
  startOfMonth,
  endOfMonth,
  set,
} from "date-fns";
import SelectInput from "@/component/select/SelectInput";
import Loader from "@/component/Loader";
import Tooltip from "@/component/Tooltip";
import Tooltips from "@/component/Tooltip2";
import { CircleAlert } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "@/component/Toast";
import DownloadMonthlyAttendanceSummary from "./components/DownloadMonthlyAttendanceSummary";
import Button from "@/component/Button";
import Modal from "@/component/Modal";
import { FloatingInput } from "@/component/FloatiingInput";
import LeaveIcon from "@/assets/Leave.png";
import { AttendanceFilters } from "./components";

const AttendanceSummaryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // console.log(isModalOpen);
  const loginUser = useSelector((state) => state.userSlice.user);

  // Helper function to determine if employee works night shift
  const isEmployeeNightShift = (employee) => {
    return employee?.shift === "Night";
  };

  const [dateFrom, setDateFrom] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDay, setExpandedDay] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  // State for create attendance modal
  const [createAttendanceModal, setCreateAttendanceModal] = useState({
    open: false,
    employee: null,
    date: null,
  });

  // API related states
  const [allDepartments, setAllDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  // Check if user is admin (handles different possible role formats)
  const isAdmin =
    loginUser?.user?.role?.toLowerCase() === "admin" ||
    loginUser?.user?.role === "Admin" ||
    loginUser?.user?.userType?.toLowerCase() === "admin";

  // API hook for getting single attendance record
  const {
    data: selectedAttendance,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useGetAttendanceByIdQuery(selectedAttendanceId, {
    skip: !selectedAttendanceId,
  });

  const [updateAttendance, { isLoading: isUpdatingAttendance }] =
    useUpdateAttendanceMutation();

  const {
    data: attendanceData,
    isLoading,
    error,
    refetch,
  } = useGetAttendanceSummaryQuery({
    employeeIds: isAdmin ? selectedEmployees : [loginUser?.user?._id],
    departmentIds: selectedDepartments,
    startDate: dateFrom,
    endDate: dateTo,
  });

  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery({
      page: 1,
      limit: 1000,
      isPopulate: true,
    });

  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetAllEmployeesQuery({
      page: 1,
      limit: 9000000,
    });

  useEffect(() => {
    if (!attendanceData) return;
    // Extract departments and employees
    const depts = new Set();
    const employeeMap = new Map();

    attendanceData.dailySummaries?.forEach((day) => {
      day.employees?.forEach((emp) => {
        if (emp.department && emp.department.trim()) {
          depts.add(emp.department);
        }
        if (!employeeMap.has(emp.employeeId)) {
          employeeMap.set(emp.employeeId, {
            id: emp.employeeId,
            name: emp.name,
            department: emp.department,
          });
        }
      });
    });

    setAllDepartments(Array.from(depts).sort());
    setAllEmployees(
      Array.from(employeeMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
  }, [attendanceData]);

  // Filter data based on frontend status filter only
  const filteredData = useMemo(() => {
    if (!attendanceData?.dailySummaries) return [];

    return attendanceData.dailySummaries
      .map((day) => ({
        ...day,
        employees:
          day.employees?.filter((emp) => {
            const statusMatch =
              !selectedStatus || emp.status === selectedStatus;
            return statusMatch;
          }) || [],
      }))
      .map((day) => ({
        ...day,
        counts: {
          present: day.employees.filter((e) => e.status === "present").length,
          grace: day.employees.filter((e) => e.status === "graced").length,
          late: day.employees.filter((e) => e.status === "late").length,
          absent: day.employees.filter((e) => e.status === "absent").length,
          onLeave: day.employees.filter(
            (e) =>
              e.status === "on leave" ||
              e.status === "paid leave" ||
              e.status === "unpaid leave"
          ).length,
          paidLeave: day.employees.filter((e) => e.status === "paid leave")
            .length,
          unpaidLeave: day.employees.filter((e) => e.status === "unpaid leave")
            .length,
        },
      }))
      .filter(
        (day) =>
          day.employees.length > 0 ||
          (!selectedStatus && (day.isWeekend || day.isHoliday))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceData, selectedStatus]);

  // Calculate overall stats from filtered data (excluding holidays and weekends)
  const overallStats = useMemo(() => {
    const stats = {
      present: 0,
      grace: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
      paidLeave: 0,
      unpaidLeave: 0,
      total: 0,
      attending: 0,
    };
    filteredData.forEach((day) => {
      if (!day.isHoliday && !day.isWeekend) {
        stats.present += day.counts.present;
        stats.grace += day.counts.grace;
        stats.late += day.counts.late;
        stats.absent += day.counts.absent;
        stats.onLeave += day.counts.onLeave;
        stats.paidLeave += day.counts.paidLeave || 0;
        stats.unpaidLeave += day.counts.unpaidLeave || 0;
      }
    });
    stats.total =
      stats.present + stats.grace + stats.late + stats.absent + stats.onLeave;
    stats.attending = stats.present + stats.grace + stats.late;
    return stats;
  }, [filteredData]);

  // Department summary data with detailed breakdown
  const departmentSummary = useMemo(() => {
    const deptStats = {};

    allDepartments.forEach((dept) => {
      deptStats[dept] = {
        present: 0,
        grace: 0,
        late: 0,
        absent: 0,
        onLeave: 0,
        paidLeave: 0,
        unpaidLeave: 0,
        total: 0,
      };
    });

    filteredData.forEach((day) => {
      if (!day.isHoliday && !day.isWeekend) {
        day.employees.forEach((emp) => {
          if (deptStats[emp.department]) {
            deptStats[emp.department].total++;
            if (emp.status === "present") {
              deptStats[emp.department].present++;
            } else if (emp.status === "graced") {
              deptStats[emp.department].grace++;
            } else if (emp.status === "late") {
              deptStats[emp.department].late++;
            } else if (emp.status === "absent") {
              deptStats[emp.department].absent++;
            } else if (emp.status === "on leave") {
              deptStats[emp.department].onLeave++;
            } else if (emp.status === "paid leave") {
              deptStats[emp.department].paidLeave++;
              deptStats[emp.department].onLeave++;
            } else if (emp.status === "unpaid leave") {
              deptStats[emp.department].unpaidLeave++;
              deptStats[emp.department].onLeave++;
            }
          }
        });
      }
    });

    return Object.entries(deptStats)
      .map(([dept, stats]) => ({
        department: dept,
        present: stats.present,
        grace: stats.grace,
        late: stats.late,
        absent: stats.absent,
        onLeave: stats.onLeave,
        paidLeave: stats.paidLeave,
        unpaidLeave: stats.unpaidLeave,
        total: stats.total,
        attending: stats.present + stats.grace + stats.late,
        percentage:
          stats.total > 0
            ? (
                ((stats.present + stats.grace + stats.late) / stats.total) *
                100
              ).toFixed(0)
            : 0,
      }))
      .filter((item) => item.total > 0);
  }, [filteredData, allDepartments]);

  // Enhanced Export functionality using ExcelJS
  const handleExport = () => {
    exportAttendanceReport({
      attendanceData,
      filteredData,
      overallStats,
      departmentSummary,
      dateFrom,
      dateTo,
    });
  };

  // Function to get the display status considering short leave
  const getDisplayStatus = (employee) => {
    if (employee.shortLeave?.isCurrentlyOnShortLeave) {
      return "ShortTime";
    }
    return employee.status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-white bg-[#00904B] border-[#00904B]";
      case "graced":
        return "text-white bg-[#28A745] border-[#28A745]";
      case "late":
        return "text-black bg-[#FFC107] border-[#FFC107]";
      case "absent":
        return "text-white bg-[#F44336] border-[#F44336]";
      case "on leave":
        return "text-white bg-primary border-primary";
      case "paid leave":
        return "text-white bg-[#059669] border-[#059669]"; // Green for paid leave
      case "unpaid leave":
        return "text-white bg-[#DC2626] border-[#DC2626]"; // Red for unpaid leave
      case "ShortTime":
        return "text-white bg-[#9333EA] border-[#9333EA]"; // Purple for short leave
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <UserCheck className="w-3 h-3" />;
      case "graced":
        return <ClockAlert className="w-3 h-3" />;
      case "late":
        return <Clock className="w-3 h-3" />;
      case "absent":
        return <UserX className="w-3 h-3" />;
      case "on leave":
        return <img src={LeaveIcon} alt="Leave" className="w-3 h-3" />;
      case "paid leave":
        return <img src={LeaveIcon} alt="Leave" className="w-3 h-3" />;
      case "unpaid leave":
        return <img src={LeaveIcon} alt="Leave" className="w-3 h-3" />;
      case "ShortTime":
        return <Timer className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
  };

  const formatDateShort = (dateString) => {
    return format(parseISO(dateString), "EEE, MMM d");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const toggleDay = (date) => {
    setExpandedDay(expandedDay === date ? "" : date);
  };

  const handleDepartmentToggle = (department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedEmployees([]);
    setSelectedStatus("");
  };

  // Modal handlers
  const handleViewAttendance = (attendanceId) => {
    if (attendanceId) {
      setSelectedAttendanceId(attendanceId);
      setViewModalOpen(true);
    } else {
      console.error("No valid attendance ID provided");
      return;
    }
  };

  const handleEditAttendance = (attendanceId) => {
    if (attendanceId) {
      setSelectedAttendanceId(attendanceId);
      setEditModalOpen(true);
    } else {
      console.error("No valid attendance ID provided");
      return;
    }
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedAttendanceId(null);
  };

  const handleUpdateAttendance = async (updateData) => {
    const attendanceId = selectedAttendanceId;
    if (!attendanceId) {
      console.error("No attendance ID available for update");
      return;
    }

    try {
      await updateAttendance({
        id: attendanceId,
        ...updateData,
      }).unwrap();

      // Force refetch the attendance summary to get fresh data
      await refetch();

      // Show success message
      toast.success("Attendance updated successfully");

      // console.log('Attendance updated successfully');
    } catch (error) {
      console.error("Failed to update attendance:", error);
      toast.error("Failed to update attendance. Please try again.");
      throw error;
    }
  };

  const getDayTypeDisplay = (day) => {
    if (day.isHoliday && day.isWeekend) {
      return {
        text: "Holiday & Weekend",
        icon: <Sun className="w-4 h-4 text-orange-500" />,
        bgColor: "bg-gradient-to-r from-orange-50 to-blue-50",
      };
    } else if (day.isHoliday) {
      return {
        text: "Holiday",
        icon: <Sun className="w-4 h-4 text-orange-500" />,
        bgColor: "bg-orange-50",
      };
    } else if (day.isWeekend) {
      return {
        text: "Weekend",
        icon: <Moon className="w-4 h-4 text-blue-500" />,
        bgColor: "bg-blue-50",
      };
    }
    return null;
  };

  const handleDateRangeChange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }) => {
    const today = new Date();

    let safeEndDate = newEndDate;
    if (newEndDate && isAfter(parseISO(newEndDate), today)) {
      safeEndDate = format(today, "yyyy-MM-dd"); // clamp to today
    }

    setDateFrom(newStartDate);
    setDateTo(safeEndDate);
  };

  const statusOptions = [
    { value: "present", label: "Present" },
    { value: "graced", label: "Grace Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
    { value: "paid leave", label: "Paid Leave" },
    { value: "unpaid leave", label: "Unpaid Leave" },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-red-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              Error Loading Data
            </h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          {/* <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#00904B] border border-[#00904B] rounded-md hover:bg-[#00904B]/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button> */}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Attendance Summary
              </h1>
              <Tooltips
                text="View and analyze attendance records. Filter by date, department, employee, or status. Export reports and manage attendance efficiently."
                position="right"
              >
                <CircleAlert
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  size={20}
                />
              </Tooltips>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {filteredData.length > 1
                ? `${formatDateShort(dateTo)} - ${formatDateShort(dateFrom)} (${
                    filteredData.length
                  } days)`
                : filteredData.length === 1
                ? formatDate(filteredData[0].date)
                : "No data selected"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-md"
              >
                Download Attendance Summary
              </Button>
            )}

            <button
              onClick={handleExport}
              disabled={isLoading || !attendanceData}
              className="flex items-center px-3 py-2 text-xs md:text-sm font-medium text-white bg-[#00904B] border border-[#00904B] rounded-md hover:bg-[#00904B]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </button>
            {/* Filter Toggle Button */}
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
      </div>

      <div className="py-4 md:py-6">
        {/* Attendance Filters Component */}
        <AttendanceFilters
          showFilters={showFilters}
          onDateRangeChange={handleDateRangeChange}
          selectedDepartments={selectedDepartments}
          setSelectedDepartments={setSelectedDepartments}
          departmentsData={departmentsData?.data || []}
          departmentsLoading={departmentsLoading}
          selectedEmployees={selectedEmployees}
          setSelectedEmployees={setSelectedEmployees}
          employeeData={employeeData?.data || []}
          employeeDataFormat="object"
          employeesLoading={isLoadingEmployee}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusOptions={statusOptions}
          isAdmin={isAdmin}
          onClearAllFilters={clearAllFilters}
          onDepartmentToggle={handleDepartmentToggle}
          onEmployeeToggle={handleEmployeeToggle}
        />

        {/* Quick Stats */}
        <QuickStats overallStats={overallStats} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Daily Sections */}
          <div className="lg:w-3/4 space-y-4">
            {filteredData.map((day) => {
              const dayTypeDisplay = getDayTypeDisplay(day);

              return (
                <div
                  key={day.date}
                  className="bg-white rounded-lg border border-gray-200"
                >
                  <div
                    className={`px-6 py-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      dayTypeDisplay
                        ? `${dayTypeDisplay.bgColor} hover:opacity-80`
                        : "bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15"
                    }`}
                    onClick={() => toggleDay(day.date)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          {expandedDay === day.date ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                          <Calendar className="w-5 h-5 text-primary ml-2 mr-3" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {formatDate(day.date)}
                            </h3>
                            {dayTypeDisplay && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 border">
                                {dayTypeDisplay.icon}
                                <span className="text-xs font-medium text-gray-700">
                                  {dayTypeDisplay.text}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {dayTypeDisplay
                              ? "No attendance tracking"
                              : `${day.employees.length} employees`}
                          </p>
                        </div>
                      </div>
                      {!dayTypeDisplay && (
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="flex items-center text-[#00904B]">
                            <UserCheck className="w-4 h-4 mr-1" />
                            <span className="font-medium">
                              {day.counts.present}
                            </span>
                          </span>
                          <span className="flex items-center text-[#28A745]">
                            <ClockAlert className="w-4 h-4 mr-1" />{" "}
                            {/* replaced Clock */}
                            <span className="font-medium">
                              {day.counts.grace}
                            </span>
                          </span>
                          <span className="flex items-center text-[#FFC107]">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="font-medium">
                              {day.counts.late}
                            </span>
                          </span>
                          <span className="flex items-center text-[#F44336]">
                            <UserX className="w-4 h-4 mr-1" />
                            <span className="font-medium">
                              {day.counts.absent}
                            </span>
                          </span>
                          <span className="flex items-center text-[#059669]">
                            <img
                              src={LeaveIcon}
                              alt="Paid Leave"
                              className="w-4 h-4 mr-1"
                            />
                            <span className="font-medium">
                              {day.counts.paidLeave || 0}
                            </span>
                          </span>
                          <span className="flex items-center text-[#DC2626]">
                            <img
                              src={LeaveIcon}
                              alt="Unpaid Leave"
                              className="w-4 h-4 mr-1 opacity-70"
                            />
                            <span className="font-medium">
                              {day.counts.unpaidLeave || 0}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {expandedDay === day.date && (
                    <div className="overflow-x-auto">
                      {dayTypeDisplay ? (
                        <div className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            {dayTypeDisplay.icon}
                            <h4 className="text-lg font-medium text-gray-700">
                              {dayTypeDisplay.text}
                            </h4>
                            <p className="text-sm text-gray-500">
                              No attendance data available for this day
                            </p>
                          </div>
                        </div>
                      ) : (
                        <table className="min-w-full w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Check In
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Check Out
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hours
                              </th>
                              {isAdmin && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {day.employees.map((employee) => (
                              <tr
                                key={employee.employeeId}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary/10">
                                      {employee.photoUrl ? (
                                        <img
                                          src={employee.photoUrl}
                                          alt={employee.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                              "flex";
                                          }}
                                        />
                                      ) : null}
                                      <span
                                        className={`text-xs font-medium text-primary ${
                                          employee.photoUrl ? "hidden" : "flex"
                                        } items-center justify-center w-full h-full`}
                                        style={{
                                          display: employee.photoUrl
                                            ? "none"
                                            : "flex",
                                        }}
                                      >
                                        {employee.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .substring(0, 2)}
                                      </span>
                                    </div>
                                    <div className="ml-3 max-w-[160px] md:max-w-[200px]">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {employee.name}
                                        {isEmployeeNightShift(employee) && (
                                          <Tooltip
                                            text="Night Shift Employee"
                                            position="top"
                                          >
                                            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800">
                                              <Moon className="w-3 h-3" />
                                            </span>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        <span className="truncate">
                                          {employee.department}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        getDisplayStatus(employee)
                                      )}`}
                                    >
                                      {getStatusIcon(
                                        getDisplayStatus(employee)
                                      )}
                                      <span className="ml-1 capitalize">
                                        {employee.shortLeave
                                          ?.isCurrentlyOnShortLeave
                                          ? "Short Leave"
                                          : employee.status}
                                      </span>
                                    </span>
                                    {employee.isUpdated &&
                                      !employee.manuallyCreated && (
                                        <div className="relative group">
                                          <Edit3 className="w-4 h-4 text-orange-500" />
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Manually Updated
                                          </div>
                                        </div>
                                      )}
                                    {employee.manuallyCreated && (
                                      <div className="relative group">
                                        <PlusCircle className="w-4 h-4 text-green-500" />
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                          Manually Created
                                        </div>
                                      </div>
                                    )}
                                    {employee.shortLeave
                                      ?.hasShortLeaveToday && (
                                      <div className="relative group">
                                        <Timer className="w-4 h-4 text-purple-500 cursor-help" />
                                        <div className="absolute right-0 top-0 transform translate-x-full -translate-y-1/2 ml-2 px-3 py-2 bg-white border border-gray-200 shadow-lg text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-48 max-w-sm">
                                          <div className="text-left text-gray-700">
                                            <div className="flex flex-row border-b border-gray-100 pb-1 mb-2">
                                              <div className="font-semibold text-purple-600">
                                                Short Leave{" "}
                                              </div>
                                              <div>
                                                <span className="font-medium">
                                                  {" "}
                                                  (Duration:
                                                </span>{" "}
                                                {employee.shortLeave.duration}h)
                                              </div>
                                            </div>
                                            <div className="flex flex-row justify-between">
                                              {employee.shortLeave
                                                .startTime && (
                                                <>
                                                  <div>
                                                    <span className="font-medium">
                                                      Start:
                                                    </span>{" "}
                                                    {formatTime(
                                                      employee.shortLeave
                                                        .startTime
                                                    )}
                                                  </div>
                                                  {employee.shortLeave
                                                    .endTime && (
                                                    <div>
                                                      <span className="font-medium">
                                                        End:
                                                      </span>{" "}
                                                      {formatTime(
                                                        employee.shortLeave
                                                          .endTime
                                                      )}
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </div>
                                          {/* Arrow pointer */}
                                          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-gray-200 rotate-45"></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatTime(employee.checkIn)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center gap-2">
                                    {formatTime(employee.checkOut)}
                                    {employee.isAutoCheckout && (
                                      <Tooltip
                                        text="Auto checkout by system"
                                        position="top"
                                      >
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 ml-1">
                                          <LogOut className="w-3 h-3 mr-1" />
                                          Auto
                                        </span>
                                      </Tooltip>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {employee.hoursWorked > 0
                                    ? `${employee.hoursWorked}h`
                                    : "-"}
                                </td>
                                {isAdmin && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                      {(() => {
                                        // Try multiple possible ID fields
                                        const attendanceId =
                                          employee.attendanceId ||
                                          employee._id ||
                                          employee.id;
                                        const hasValidId =
                                          attendanceId &&
                                          employee.employeeId &&
                                          day.date;

                                        // Only render buttons if there's valid attendance data
                                        if (!hasValidId) return null;

                                        return (
                                          <>
                                            <Tooltip
                                              text="View Details"
                                              position="left"
                                            >
                                              <button
                                                onClick={() => {
                                                  handleViewAttendance(
                                                    attendanceId
                                                  );
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View Details"
                                              >
                                                <Eye size={16} />
                                              </button>
                                            </Tooltip>
                                            <Tooltip
                                              text="Edit Attendance"
                                              position="left"
                                            >
                                              <button
                                                onClick={() => {
                                                  handleEditAttendance(
                                                    attendanceId
                                                  );
                                                }}
                                                className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                                                title="Edit Attendance"
                                              >
                                                <Edit size={16} />
                                              </button>
                                            </Tooltip>
                                          </>
                                        );
                                      })()}
                                      {/* Show create attendance button for absent employees (admin only) */}
                                      {employee.status === "absent" &&
                                        !employee.attendanceId && (
                                          <Tooltip
                                            text="Create Attendance"
                                            position="left"
                                          >
                                            <button
                                              onClick={() =>
                                                setCreateAttendanceModal({
                                                  open: true,
                                                  employee,
                                                  date: day.date,
                                                })
                                              }
                                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                              title="Create Attendance"
                                            >
                                              <PlusCircle size={16} />
                                            </button>
                                          </Tooltip>
                                        )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredData.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No attendance records found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your date range or filters to see more results.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            {/* Department Summary */}
            <DepartmentSummary departmentSummary={departmentSummary} />

            {/* Recent Activity */}
            <RecentActivity filteredData={filteredData} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAttendanceModal
        isOpen={createAttendanceModal.open}
        onClose={() =>
          setCreateAttendanceModal({ open: false, employee: null, date: null })
        }
        employee={createAttendanceModal.employee}
        date={createAttendanceModal.date}
        onSuccess={refetch}
        loginUser={loginUser}
      />
      <AttendanceViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        attendance={selectedAttendance?.data}
        isLoading={isLoadingAttendance}
      />

      <AttendanceEditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        attendance={selectedAttendance?.data}
        onSave={handleUpdateAttendance}
        isLoading={isLoadingAttendance}
        loginUser={loginUser}
      />

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md relative">
            {/* <button
                className="absolute top-4 right-4 text-red-500 "
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                <X size={18} strokeWidth={4} />
              </button> */}
            <h2 className="text-2xl font-semibold mb-6">
              Select Date to Download Attendance Report
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose a date to download an attendance report containing both
              monthly summary and daily attendance for the selected date.
            </p>
            <div className="space-y-4">
              <FloatingInput
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                {/* shared button style */}
                <Button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="action-btn-cancel w-full sm:w-auto rounded-md px-5 py-2.5 text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-1"
                >
                  Cancel
                </Button>

                <DownloadMonthlyAttendanceSummary
                  date={selectedDate}
                  setModal={setIsModalOpen}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceSummaryPage;
