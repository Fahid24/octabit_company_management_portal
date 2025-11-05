import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeTable = ({
  employeesInSelectedDept,
  getSortedFilteredEmployees,
  calculateAttendanceStats,
  handleSort,
  sortField,
  sortDirection,
  quickFilter,
  setQuickFilter,
}) => {
  const navigate = useNavigate();

  // Calculate color for efficiency bar
  const getEfficiencyColor = (value) => {
    if (value >= 85) return "bg-green-500";
    if (value >= 70) return "bg-blue-500";
    if (value >= 55) return "bg-yellow-500";
    if (value >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4 border border-gray-100">
      {/* Enhanced Table controls with modern design */}
      <div className="mb-6">
        {/* Status Guide with Card-based design */}
        <div className="mb-5">
          <h4 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Performance Status Guide
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 p-3 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center mb-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-md flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
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
                </div>
                <span className="font-semibold text-sm text-gray-800">
                  Excellent
                </span>
              </div>
              <span className="text-xs font-bold text-green-600 ml-8">
                85%+
              </span>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 p-3 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center mb-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-md flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-gray-800">
                  Good
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 ml-8">
                70-84%
              </span>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 p-3 rounded-lg border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center mb-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-md flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
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
                <span className="font-semibold text-sm text-gray-800">
                  Average
                </span>
              </div>
              <span className="text-xs font-bold text-yellow-600 ml-8">
                55-69%
              </span>
            </div>

            <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 p-3 rounded-lg border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center mb-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 shadow-md flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
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
                <span className="font-semibold text-sm text-gray-800">
                  Needs Improvement
                </span>
              </div>
              <span className="text-xs font-bold text-orange-600 ml-8">
                40-54%
              </span>
            </div>

            <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 p-3 rounded-lg border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center mb-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-red-500 to-red-400 shadow-md flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
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
                <span className="font-semibold text-sm text-gray-800">
                  Below Target
                </span>
              </div>
              <span className="text-xs font-bold text-red-600 ml-8">
                &lt;40%
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-100 pt-5">
          <h4 className="text-base font-semibold text-gray-700 mb-3 sm:mb-0 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter Employees
          </h4>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickFilter("all")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                quickFilter === "all"
                  ? "bg-primary text-white shadow-lg shadow-primary/20 transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-2 ${
                  quickFilter === "all" ? "text-white" : "text-gray-500"
                }`}
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
              All Employees
            </button>

            <button
              onClick={() => setQuickFilter("high-performers")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                quickFilter === "high-performers"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20 transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-2 ${
                  quickFilter === "high-performers"
                    ? "text-white"
                    : "text-gray-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              High Performers
            </button>

            <button
              onClick={() => setQuickFilter("leave-concerns")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                quickFilter === "leave-concerns"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20 transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-2 ${
                  quickFilter === "leave-concerns"
                    ? "text-white"
                    : "text-gray-500"
                }`}
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
              Leave Concerns
            </button>

            <button
              onClick={() => setQuickFilter("late-arrivals")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                quickFilter === "late-arrivals"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20 transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-2 ${
                  quickFilter === "late-arrivals"
                    ? "text-white"
                    : "text-gray-500"
                }`}
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
              Late Arrivals
            </button>
          </div>
        </div>
      </div>

      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-form-header-gradient text-gray-800 text-sm rounded-tl-lg rounded-tr-lg">
            <th className="px-6 py-4 text-left font-semibold rounded-tl-lg">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("employeeName")}
              >
                Employee
                {sortField === "employeeName" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-2 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
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
                )}
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("employeeDesignation")}
              >
                Role
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("totalHours")}
              >
                Total Hours
                {sortField === "totalHours" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-2 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
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
                )}
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("avgHours")}
              >
                Avg. Daily
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("presentDays")}
              >
                Present Days
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("graceDays")}
              >
                Grace Days
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("leaveDays")}
              >
                Leave Days
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("lateArrivals")}
              >
                Late Arrivals
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("efficiency")}
              >
                Efficiency
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status
              </div>
            </th>
            <th className="px-6 py-4 text-left font-semibold rounded-tr-lg">
              <div className="flex items-center cursor-pointer">Action</div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white text-gray-800">
          {employeesInSelectedDept.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="text-center py-10 text-gray-500 bg-gray-50 italic"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  No employees found in this department.
                </div>
              </td>
            </tr>
          ) : (
            getSortedFilteredEmployees(employeesInSelectedDept)?.map(
              (emp, index) => {
                const total =
                  emp?.dailyStats?.reduce((t, d) => t + d?.workedHours, 0) || 0;
                const workDays =
                  emp?.dailyStats?.filter((d) => d?.workedHours > 0).length ||
                  0;
                const dailyAvg =
                  workDays > 0 ? (total / workDays).toFixed(1) : "0.0";

                // Calculate attendance stats using unified logic
                const attendanceStats = calculateAttendanceStats(
                  emp.dailyStats
                );
                const presentDays = attendanceStats.presentDays;
                const graceDays = attendanceStats.graceDays;
                const leaveDays = attendanceStats.leaveDays;

                // Calculate late arrivals (assuming 9 AM start time)
                const lateArrivals =
                  emp?.dailyStats?.filter((day) => {
                    if (!day.checkIn || day.isLeaveDay) return false;
                    const checkInTime = new Date(day.checkIn);
                    return (
                      checkInTime.getHours() > 9 ||
                      (checkInTime.getHours() === 9 &&
                        checkInTime.getMinutes() > 15)
                    );
                  }).length || 0;

                // Calculate efficiency (example metric)
                const efficiency = Math.min(
                  100,
                  (total / (workDays * 8)) * 100
                ).toFixed(0);

                // Status based on hours worked, attendance, and punctuality
                const getStatus = () => {
                  const scoreTotal = parseFloat(efficiency);
                  const scorePunctual =
                    100 - (lateArrivals / Math.max(1, presentDays)) * 100;
                  const scoreLeave =
                    100 - (leaveDays / emp.dailyStats?.length) * 100;

                  const overallScore =
                    scoreTotal * 0.5 + scorePunctual * 0.3 + scoreLeave * 0.2;

                  if (overallScore >= 85)
                    return {
                      text: "Excellent",
                      class:
                        "bg-green-100 text-green-800 border border-green-200",
                    };
                  if (overallScore >= 70)
                    return {
                      text: "Good",
                      class: "bg-blue-50 text-blue-700 border border-blue-200",
                    };
                  if (overallScore >= 55)
                    return {
                      text: "Average",
                      class:
                        "bg-yellow-50 text-yellow-700 border border-yellow-200",
                    };
                  if (overallScore >= 40)
                    return {
                      text: "Needs Improvement",
                      class:
                        "bg-orange-100 text-orange-700 border border-orange-200",
                    };
                  return {
                    text: "Below Target",
                    class: "bg-red-50 text-red-700 border border-red-200",
                  };
                };
                const status = getStatus();

                return (
                  <tr
                    key={emp.employeeId}
                    className={`border-b hover:bg-[#f9f6f2] transition-colors ${
                      index === employeesInSelectedDept.length - 1
                        ? "rounded-b-lg"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-medium">
                          {emp.employeePhoto ? (
                            <img
                              src={emp.employeePhoto}
                              alt={emp.employeeName}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className={`text-xs font-medium text-primary ${
                              emp.employeePhoto ? "hidden" : "flex"
                            } items-center justify-center w-full h-full`}
                            style={{
                              display: emp.employeePhoto ? "none" : "flex",
                            }}
                          >
                            {emp.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </span>
                        </div>
                        <div className="font-medium">{emp.employeeName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {emp.employeeDesignation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold">
                        {total.toFixed(1)} hrs
                      </div>
                      <div className="text-xs text-gray-500">
                        Total for period
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {dailyAvg}{" "}
                      <span className="text-xs text-gray-500">hrs/day</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div>
                        <span>{presentDays} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 mr-2"></div>
                        <span className="text-emerald-700 font-medium">
                          {graceDays} days
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400 mr-2"></div>
                        <span className="text-amber-700 font-medium">
                          {leaveDays}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lateArrivals > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {lateArrivals} times
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          On time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`${getEfficiencyColor(
                              efficiency
                            )} h-2 rounded-full`}
                            style={{ width: `${efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">
                          {isNaN(efficiency) ? 0 : efficiency}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${status.class}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${status.class} flex items-center gap-1 hover:shadow cursor-pointer`}
                        onClick={() =>
                          navigate(`/attendance/employee/${emp.employeeId}`)
                        }
                        title="View Attendance"
                      >
                        <Eye className="h-4 w-4 inline-block mr-1" />
                      </button>
                    </td>
                  </tr>
                );
              }
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
