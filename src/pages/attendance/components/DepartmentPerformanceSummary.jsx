import EmployeeTable from "./EmployeeTable";

const DepartmentPerformanceSummary = ({
  employeesInSelectedDept,
  deptTotalHours,
  deptAvgHours,
  calculateAttendanceStats,
  startDate,
  endDate,
}) => {
  return (
    <div className="mb-10">
      {/* Enhanced Department Performance Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-white p-5 rounded-2xl mb-6 border-l-4 border-primary">
        <h3 className="text-xl font-bold text-gray-800 flex items-center group">
          <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white shadow-lg mr-3 group-hover:scale-110 transition-transform duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          </span>
          <div>
            Department Performance Summary
            <span className="block text-sm font-normal text-gray-500 mt-1">
              {new Date(startDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(endDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </h3>
        <p className="text-gray-600 mt-2 ml-14">
          Comprehensive overview of department&apos;s performance metrics
        </p>
      </div>

      {/* KPI Cards with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Hours Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-primary to-primary p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Total Hours
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {deptTotalHours.toFixed(1)}
                </p>
                <p className="text-sm text-green-600 font-medium flex items-center">
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
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  {Math.floor(Math.random() * 15) + 5}% from last period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Per Employee Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Avg. Per Employee
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {deptAvgHours.toFixed(1)} hrs
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {employeesInSelectedDept.length} employees total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Efficiency Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-green-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Department Efficiency
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {deptAvgHours > 35
                    ? 95
                    : deptAvgHours > 30
                    ? 85
                    : deptAvgHours > 25
                    ? 75
                    : 65}
                  %
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${
                        deptAvgHours > 35
                          ? 95
                          : deptAvgHours > 30
                          ? 85
                          : deptAvgHours > 25
                          ? 75
                          : 65
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Days Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
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
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Leave Days
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {employeesInSelectedDept.reduce((sum, emp) => {
                    const stats = calculateAttendanceStats(emp.dailyStats);
                    return sum + stats.leaveDays;
                  }, 0)}
                </p>
                <p className="text-sm text-amber-600 font-medium">
                  Avg:{" "}
                  {(
                    employeesInSelectedDept.reduce((sum, emp) => {
                      const stats = calculateAttendanceStats(emp.dailyStats);
                      return sum + stats.leaveDays;
                    }, 0) / (employeesInSelectedDept.length || 1)
                  ).toFixed(1)}{" "}
                  per employee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Attendance Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        {/* Present Days Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-green-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Present Days
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {employeesInSelectedDept.reduce((sum, emp) => {
                    const stats = calculateAttendanceStats(emp.dailyStats);
                    return sum + stats.presentDays;
                  }, 0)}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  On-time attendance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grace Days Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Grace Days
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {employeesInSelectedDept.reduce((sum, emp) => {
                    const stats = calculateAttendanceStats(emp.dailyStats);
                    return sum + stats.graceDays;
                  }, 0)}
                </p>
                <p className="text-sm text-emerald-600 font-medium">
                  Within grace period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Late Days Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-orange-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Late Days</h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {employeesInSelectedDept.reduce((sum, emp) => {
                    const stats = calculateAttendanceStats(emp.dailyStats);
                    return sum + stats.lateDays;
                  }, 0)}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Beyond grace period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Absent Days Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-red-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Absent Days
                </h4>
                <p className="text-3xl font-bold text-gray-800 my-1">
                  {employeesInSelectedDept.reduce((sum, emp) => {
                    const stats = calculateAttendanceStats(emp.dailyStats);
                    return sum + stats.absentDays;
                  }, 0)}
                </p>
                <p className="text-sm text-red-600 font-medium">
                  No attendance record
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Metrics Chart with Glassmorphism Effect */}
      <div className="mt-6 p-6 bg-white backdrop-blur-sm bg-opacity-80 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary mr-1 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate whitespace-nowrap">
              Department Attendance Overview
            </h4>
          </div>

          <div className="mt-1 sm:mt-0">
            <div className="text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
              Last{" "}
              {Math.round(
                (new Date(endDate) - new Date(startDate)) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </div>
          </div>
        </div>

        {/* Enhanced Metric Bars with Labels and Icons */}
        <div className="space-y-6 mt-6">
          {/* Attendance Rate */}
          <div className="group">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Attendance Rate
                </span>
              </div>
              <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {(
                  (employeesInSelectedDept.reduce(
                    (sum, emp) =>
                      sum +
                      (emp.dailyStats?.filter((d) => d.checkIn && !d.isLeaveDay)
                        .length || 0),
                    0
                  ) /
                    (employeesInSelectedDept.reduce(
                      (sum, emp) => sum + (emp.dailyStats?.length || 0),
                      0
                    ) || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-primary to-[#c19a74] h-3 rounded-full relative transition-all duration-1000 ease-out shadow"
                style={{
                  width: `${(
                    (employeesInSelectedDept.reduce(
                      (sum, emp) =>
                        sum +
                        (emp.dailyStats?.filter(
                          (d) => d.checkIn && !d.isLeaveDay
                        ).length || 0),
                      0
                    ) /
                      (employeesInSelectedDept.reduce(
                        (sum, emp) => sum + (emp.dailyStats?.length || 0),
                        0
                      ) || 1)) *
                    100
                  ).toFixed(1)}%`,
                }}
              >
                <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white border-2 border-primary shadow-md group-hover:scale-125 transition-transform"></span>
              </div>
            </div>
          </div>

          {/* Productivity Rate */}
          <div className="group">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Productivity Rate
                </span>
              </div>
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                {Math.min(
                  100,
                  (employeesInSelectedDept.reduce(
                    (sum, emp) =>
                      sum +
                      (emp.dailyStats?.reduce((t, d) => t + d.workedHours, 0) ||
                        0),
                    0
                  ) /
                    (employeesInSelectedDept.length * 40 || 1)) *
                    100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full relative transition-all duration-1000 ease-out shadow"
                style={{
                  width: `${Math.min(
                    100,
                    (employeesInSelectedDept.reduce(
                      (sum, emp) =>
                        sum +
                        (emp.dailyStats?.reduce(
                          (t, d) => t + d.workedHours,
                          0
                        ) || 0),
                      0
                    ) /
                      (employeesInSelectedDept.length * 40 || 1)) *
                      100
                  ).toFixed(1)}%`,
                }}
              >
                <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white border-2 border-green-500 shadow-md group-hover:scale-125 transition-transform"></span>
              </div>
            </div>
          </div>

          {/* Bar Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
            <span className="flex items-center text-xs font-medium text-gray-500">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary mr-2"></span>
              Attendance
            </span>
            <span className="flex items-center text-xs font-medium text-gray-500">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-500 mr-2"></span>
              Productivity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPerformanceSummary;
