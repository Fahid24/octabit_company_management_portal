import { format } from "date-fns";

const DepartmentCard = ({
  dept,
  startDate,
  endDate,
  onClick,
  formatDateRangeText,
}) => {
  return (
    <div
      className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-primary cursor-pointer"
      onClick={onClick}
      title="Show all employees in this department"
    >
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-primary/10 to-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{dept.name}</h2>
          <p className="text-xs text-gray-500">
            {formatDateRangeText(startDate, endDate)}
          </p>
        </div>
        <div className="text-primary rounded-full p-2 bg-white shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Total Hours</p>
            <p className="text-xl font-bold text-primary">
              {dept.totalHours.toFixed(1)}
            </p>
            <div className="mt-1 text-xs text-gray-500">
              {startDate} - {endDate}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Average Hours</p>
            <p className="text-xl font-bold text-primary">
              {dept.avgHours.toFixed(1)}
            </p>
            <div className="mt-1 text-xs text-gray-500">Per Employee</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Attendance Rate</span>
            <span className="text-xs font-semibold text-primary">
              {dept.attendanceRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2"
              style={{
                width: `${dept.attendanceRate}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Today's attendance section */}
        <div className="mb-4 border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">
            Period Attendance Summary
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-green-50 rounded-md p-2 text-center">
              <span className="text-sm font-bold text-green-700">
                {dept.todayStats.present}
              </span>
              <p className="text-xs text-green-600">Present</p>
            </div>
            <div className="bg-emerald-50 rounded-md p-2 text-center">
              <span className="text-sm font-bold text-emerald-700">
                {dept.todayStats.grace}
              </span>
              <p className="text-xs text-emerald-600">Grace</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-amber-50 rounded-md p-2 text-center">
              <span className="text-sm font-bold text-amber-700">
                {dept.todayStats.late}
              </span>
              <p className="text-xs text-amber-600">Late</p>
            </div>
            <div className="bg-blue-50 rounded-md p-2 text-center">
              <span className="text-sm font-bold text-blue-700">
                {dept.todayStats.leave}
              </span>
              <p className="text-xs text-blue-600">Leave</p>
            </div>
            <div className="bg-red-50 rounded-md p-2 text-center">
              <span className="text-sm font-bold text-red-700">
                {dept.todayStats.absent}
              </span>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="bg-primary bg-opacity-10 px-3 py-1.5 rounded-full">
            <span className="text-sm text-primary font-medium">
              {dept.count} Employees
            </span>
          </div>
          <div className="flex items-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            <span className="text-xs">
              {format(new Date(startDate), "MMM d")} -{" "}
              {format(new Date(endDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
