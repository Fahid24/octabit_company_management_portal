import { format } from "date-fns";
import {
    CircleAlert,
    Download,
    Eye,
    Clock,
    Calendar,
    Timer,
} from "lucide-react";
import attendancePresent from "@/assets/attendance-present.svg";
import attendanceLeave from "@/assets/attendance-leave.svg";
import attendanceAbsent from "@/assets/attendance-absent.svg";
import LeaveIcon from "@/assets/Leave.png";
import { is } from "date-fns/locale";

const WeeklyTimesheet = ({ employee, adminConfig, groupDataByWeeks }) => {
    const isNightShift = employee?.employeeShift === "Night";
    const workHoursPerDay = isNightShift ? adminConfig?.workHourPerNight || 8 : adminConfig?.workHourPerDay || 8;

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

    // Icon mapping for different statuses
    const getStatusIcon = (status) => {
        switch (status) {
            case "Present":
                return (
                    <img src={attendancePresent} alt="Present" className="w-5 h-5" />
                );
            case "Grace":
                return <img src={LeaveIcon} alt="Grace" className="w-5 h-5" />;
            case "Late":
                return <Timer className="w-5 h-5 text-orange-600" />;
            case "Leave":
                return <img src={attendanceLeave} alt="Leave" className="w-5 h-5" />;
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

    return (
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
                                            color = "text-yellow-600";
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
                                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${day.isWeekend
                                                    ? "bg-purple-50/50"
                                                    : day.isHoliday
                                                        ? "bg-blue-50/50"
                                                        : day.isLeaveDay
                                                            ? "bg-yellow-50/50"
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
                                                        <span className="text-gray-400 font-medium">-</span>
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
                                                        <span className="text-yellow-600 font-medium text-xs">
                                                            ON LEAVE
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-600 font-medium text-xs">
                                                            ABSENT
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 sm:px-4 text-xs font-medium">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${payCode === "WORK"
                                                            ? "bg-green-100 text-green-800"
                                                            : payCode === "LEAVE"
                                                                ? "bg-yellow-100 text-yellow-800"
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
                                                            {(day.workedHours > workHoursPerDay
                                                                ? workHoursPerDay
                                                                : day.workedHours
                                                            ).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">0.00</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold">
                                                    {day.workedHours > workHoursPerDay ? (
                                                        <span className="text-orange-600">
                                                            {(
                                                                day.workedHours - workHoursPerDay
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
    );
};

export default WeeklyTimesheet;
