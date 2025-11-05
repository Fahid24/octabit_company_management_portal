import Loader from "@/component/Loader";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import {
  useGetLeaveAdminStatsQuery,
  useGetLeaveStatsQuery,
} from "@/redux/features/manageLeaves/manageLeavesApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Clock,
  CheckCircle,
  XCircle,
  CircleAlert,
  RotateCcw,
  Filter,
  Users,
  Calendar,
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Pagination from "@/component/Pagination";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import EmployeeLeaveStats from "./component/EmployeeLeaveStats";
import LeaveFilterSection from "./component/LeaveFilterSection";

const LeaveAdminStatsPage = () => {
  const isMobile = useIsMobile();
  const loginUser = useSelector((state) => state.userSlice.user);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [isLeaveTypeExpanded, setIsLeaveTypeExpanded] = useState(false);

  // Build params without nulls so "All" filters don't break API queries
  const statsParams = {
    year: selectedYear,
    userId: loginUser?.user?._id || null,
    page: currentPage,
    limit: limit,
    ...(selectedEmployee?.value ? { employeeId: selectedEmployee.value } : {}),
    ...(selectedDepartment?.value
      ? { departmentId: selectedDepartment.value }
      : {}),
    ...(selectedRole?.value ? { role: selectedRole.value } : {}),
  };

  const { data, error, isLoading } = useGetLeaveAdminStatsQuery(statsParams);

  // Add leave stats query for overall statistics
  const { data: leaveStats, isLoading: statsLoading } = useGetLeaveStatsQuery({
    departmentHeadId:
      loginUser?.user?.role === "DepartmentHead" ? loginUser?.user?._id : "",
  });

  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 1,
      limit: 900000000,
      isPopulate: true,
      ...(loginUser?.user?.role === "DepartmentHead" && {
        departmentHead: loginUser?.user?._id,
      }),
      ...(selectedDepartment?.value
        ? { department: selectedDepartment.value }
        : {}),
      ...(selectedRole?.value ? { role: selectedRole.value } : {}),
    }
  );

  const { data: departmentsData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({
      page: 1,
      limit: 9000,
      isPopulate: false,
      ...(loginUser?.user?.role === "DepartmentHead" && {
        departmentHead: loginUser?.user?._id,
      }),
    });

  const { data: configData, isLoading: isConfigLoading } =
    useGetAdminConfigQuery();

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedDepartment(null);
    setSelectedRole(null);
    setSelectedEmployee(null);
    setSelectedYear(new Date().getFullYear());
    setCurrentPage(1);
  };

  if (isLoading || isConfigLoading || isDeptLoading || statsLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  // Enhanced stats using API data with proper ordering
  const stats = [
    {
      title: "Total Requests",
      value: leaveStats?.leaveStats?.total?.requests || 0,
      subValue: `${leaveStats?.leaveStats?.total?.days || 0} days`,
      icon: <Users className="h-5 w-5" />,
      color: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      textColor: "text-blue-700",
      description: "All time off requests",
    },
    {
      title: "Approved Requests",
      value: leaveStats?.leaveStats?.approved?.requests || 0,
      subValue: `${leaveStats?.leaveStats?.approved?.days || 0} days`,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconBg: "bg-green-500",
      iconColor: "text-white",
      textColor: "text-green-700",
      description: "Successfully processed",
    },
    {
      title: "Pending Requests",
      value: leaveStats?.leaveStats?.pending?.requests || 0,
      subValue: `${leaveStats?.leaveStats?.pending?.days || 0} days`,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-500",
      iconColor: "text-white",
      textColor: "text-yellow-700",
      description: "Awaiting approval",
    },
    {
      title: "Rejected Requests",
      value: leaveStats?.leaveStats?.rejected?.requests || 0,
      subValue: `${leaveStats?.leaveStats?.rejected?.days || 0} days`,
      icon: <XCircle className="h-5 w-5" />,
      color: "bg-gradient-to-br from-red-50 to-red-100",
      borderColor: "border-red-200",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      textColor: "text-red-700",
      description: "Denied requests",
    },
  ];

  const leaveTypeStats = [
    {
      title: "Annual Leave",
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-primary",
      lightColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      textColor: "text-primary",
      borderColor: "border-orange-200",
      data: leaveStats?.leaveStats?.annualLeave || {
        total: { requests: 0, days: 0 },
        pending: { requests: 0, days: 0 },
        approved: { requests: 0, days: 0 },
        rejected: { requests: 0, days: 0 },
      },
    },
    {
      title: "Casual Leave",
      icon: <CircleAlert className="h-4 w-4" />,
      color: "bg-primary",
      lightColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      textColor: "text-primary",
      borderColor: "border-orange-200",
      data: leaveStats?.leaveStats?.casualLeave || {
        total: { requests: 0, days: 0 },
        pending: { requests: 0, days: 0 },
        approved: { requests: 0, days: 0 },
        rejected: { requests: 0, days: 0 },
      },
    },
    {
      title: "Medical Leave",
      icon: <Activity className="h-4 w-4" />,
      color: "bg-primary",
      lightColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      textColor: "text-primary",
      borderColor: "border-orange-200",
      data: leaveStats?.leaveStats?.medicalLeave || {
        total: { requests: 0, days: 0 },
        pending: { requests: 0, days: 0 },
        approved: { requests: 0, days: 0 },
        rejected: { requests: 0, days: 0 },
      },
    },
  ];

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold leading-tight text-gray-900">
              Leave Analytics Dashboard
            </h1>
            <div className="ml-2 pt-2 cursor-pointer relative">
              <Tooltips
                text="Comprehensive leave statistics and employee reports. View detailed analytics for all employees or filter by specific employee and year. Monitor leave patterns, approval rates, and departmental insights."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive leave statistics and employee reports for{" "}
            {selectedYear}
          </p>
        </div>
        <div>
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

      {/* Filter Section */}
      <LeaveFilterSection
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedStatus={null}
        setSelectedStatus={null}
        selectedLeaveType={null}
        setSelectedLeaveType={null}
        onResetFilters={handleResetFilters}
        loginUser={loginUser}
        showLeaveType={false}
        showStatus={false}
        showRole={true}
        showFilters={showFilters}
      />

      {/* Leave Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-md ${stat.iconBg}`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Type Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
          onClick={() => setIsLeaveTypeExpanded(!isLeaveTypeExpanded)}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-medium text-gray-800">
              Leave Type Breakdown
            </h2>
          </div>
          {isLeaveTypeExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {isLeaveTypeExpanded && (
          <div className="px-4 pt-2 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {leaveTypeStats.map((leaveType, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-primary">{leaveType.icon}</div>
                    <h3 className="text-sm font-medium text-gray-700">
                      {leaveType.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-semibold">
                        {leaveType.data.total.requests} (
                        {leaveType.data.total.days}d)
                      </p>
                    </div>

                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Approved</p>
                      <p className="text-sm font-semibold text-green-700">
                        {leaveType.data.approved.requests} (
                        {leaveType.data.approved.days}d)
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="text-sm font-semibold text-yellow-700">
                        {leaveType.data.pending.requests} (
                        {leaveType.data.pending.days}d)
                      </p>
                    </div>

                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Rejected</p>
                      <p className="text-sm font-semibold text-red-700">
                        {leaveType.data.rejected.requests} (
                        {leaveType.data.rejected.days}d)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Employee Leave Statistics - Using EmployeeLeaveStats Component */}
      {data?.leaveStats && (
        <div className="space-y-4 mb-6">
          {data.leaveStats.map((employee) => (
            <EmployeeLeaveStats
              key={employee.employeeId}
              leaveStats={employee}
              configData={configData}
              selectedYear={selectedYear}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && (
        <div className="mt-6 mb-6">
          <Pagination
            totalCount={data.pagination.totalDocs || 0}
            currentPage={data.pagination.page || 1}
            setCurrentPage={setCurrentPage}
            limit={data.pagination.limit || 10}
            setLimit={setLimit}
          />
        </div>
      )}
    </div>
  );
};

export default LeaveAdminStatsPage;
