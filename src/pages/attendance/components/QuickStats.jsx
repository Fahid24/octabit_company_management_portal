import {
  Users,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  ClockAlert,
} from "lucide-react";
import LeaveIcon from "@/assets/Leave.png";
export const QuickStats = ({ overallStats }) => {
  const attendanceRate =
    overallStats.total > 0
      ? ((overallStats.attending / overallStats.total) * 100).toFixed(1)
      : 0;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 mb-6">
      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-[#00904B]/10 rounded-lg">
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#00904B]" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Present</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.present}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-[#28A745]/10 rounded-lg">
            <ClockAlert className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#28A745]" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Grace Present</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.grace}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-[#FFC107]/10 rounded-lg">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#FFC107]" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Late</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.late}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-[#F44336]/10 rounded-lg">
            <UserX className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#F44336]" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Absent</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.absent}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-[#059669]/10 rounded-lg">
            <img
              src={LeaveIcon}
              alt="Paid Leave"
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
            />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Paid Leave</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.paidLeave || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-[#DC2626]/10 rounded-lg">
            <img
              src={LeaveIcon}
              alt="Unpaid Leave"
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 opacity-70"
            />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Unpaid Leave</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.unpaidLeave || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-purple-100 rounded-lg">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Total Attendance</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {overallStats.total}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200">
        <div className="flex items-center">
          <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <p className="text-xs text-gray-600 truncate">Rate</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {attendanceRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
