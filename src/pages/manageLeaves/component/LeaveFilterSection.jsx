import { useMemo } from "react";
import { Filter, X } from "lucide-react";
import SelectInput from "@/component/select/SelectInput";
import YearPicker from "@/component/YearPicker";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";

const LeaveFilterSection = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
  selectedEmployee,
  setSelectedEmployee,
  selectedYear,
  setSelectedYear,
  selectedStatus,
  setSelectedStatus,
  selectedLeaveType,
  setSelectedLeaveType,
  onResetFilters,
  loginUser,
  showDepartment = true,
  showEmployee = true,
  showRole = false,
  showLeaveType = true,
  showStatus = true,
  className = "",
  showFilters = true, // New prop for controlling filter visibility
}) => {
  // Fetch departments
  const { data: departmentsData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({
      page: 1,
      limit: 9000,
      isPopulate: false,
      ...(loginUser?.user?.role === "DepartmentHead" && {
        departmentHead: loginUser?.user?._id,
      }),
    });

  // Fetch employees (filtered by department and role)
  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 1,
      limit: 900000000,
      isPopulate: true,
      ...(loginUser?.user?.role === "DepartmentHead" && {
        departmentHead: loginUser?.user?._id,
      }),
      ...(selectedDepartment?.value && {
        department: selectedDepartment.value,
      }),
      ...(selectedRole?.value && { role: selectedRole.value }),
    }
  );

  // Memoized department options for select input
  const departmentOptions = useMemo(() => {
    if (!departmentsData?.data) return [];
    return [
      { value: null, label: "All Departments" },
      ...departmentsData.data.map((dept) => ({
        value: dept._id,
        label: dept.name,
        description: dept.description,
      })),
    ];
  }, [departmentsData]);

  // Role options for select input
  const roleOptions = useMemo(
    () => [
      { value: null, label: "All Roles" },
      { value: "Admin", label: "Admin" },
      { value: "DepartmentHead", label: "Department Head" },
      { value: "Manager", label: "Manager" },
      { value: "Employee", label: "Employee" },
    ],
    []
  );

  // Memoized employee options for select input (backend filtered)
  const employeeOptions = useMemo(() => {
    if (!employeesData?.data) return [];

    return [
      { value: null, label: "All Employees" },
      ...employeesData.data.map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department?.name,
        role: emp.role,
      })),
    ];
  }, [employeesData]);

  // Status options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending_dept_head", label: "Pending Dept Head" },
    { value: "pending_admin", label: "Pending Admin" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  // Leave type options
  const leaveTypeOptions = [
    { value: "", label: "All Leave Types" },
    { value: "Annual", label: "Annual Leave" },
    { value: "Casual", label: "Casual Leave" },
    { value: "Medical", label: "Medical Leave" },
  ];

  // Handle department change and reset employee selection
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setSelectedEmployee(null); // Reset employee selection when department changes
  };

  // Handle role change and reset employee selection
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSelectedEmployee(null); // Reset employee selection when role changes
  };

  // Check if any filter is active
  const hasActiveFilters =
    selectedDepartment ||
    selectedRole ||
    selectedEmployee ||
    selectedStatus ||
    selectedLeaveType;

  // Function to get display name for status
  const getStatusDisplayName = (statusValue) => {
    const option = statusOptions.find(
      (opt) => opt.value === statusValue?.value
    );
    return option ? option.label : "Unknown";
  };

  // Function to get display name for leave type
  const getLeaveTypeDisplayName = (leaveTypeValue) => {
    const option = leaveTypeOptions.find(
      (opt) => opt.value === leaveTypeValue?.value
    );
    return option ? option.label : "Unknown";
  };

  // Return null if filters shouldn't be shown
  if (!showFilters) return null;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
      </div>

      {/* Filter options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Status Filter */}
        {showStatus && (
          <div className="z-10">
            <SelectInput
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </div>
        )}

        {/* Leave Type Filter */}
        {showLeaveType && (
          <div className="z-10">
            <SelectInput
              label="Leave Type"
              value={selectedLeaveType}
              onChange={setSelectedLeaveType}
              options={leaveTypeOptions}
            />
          </div>
        )}

        {/* Department Filter */}
        {showDepartment && (
          <div className="z-50">
            <SelectInput
              label="Department"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              options={departmentOptions}
              isLoading={isDeptLoading}
            />
          </div>
        )}

        {/* Role Filter */}
        {showRole && (
          <div className="z-40">
            <SelectInput
              label="Role"
              value={selectedRole}
              onChange={handleRoleChange}
              options={roleOptions}
            />
          </div>
        )}

        {/* Employee Filter */}
        {showEmployee && (
          <div className="z-30">
            <SelectInput
              label="Employee"
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              options={employeeOptions}
              isLoading={isEmpLoading}
            />
          </div>
        )}

        {/* Year Filter */}
        <div className="z-20">
          <YearPicker
            label="Year"
            value={selectedYear}
            onChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>

            {/* Department Filter */}
            {selectedDepartment && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {selectedDepartment.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDepartment(null);
                  }}
                  className="ml-1 hover:text-primary/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Role Filter */}
            {selectedRole && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {selectedRole.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRole(null);
                  }}
                  className="ml-1 hover:text-primary/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Employee Filter */}
            {selectedEmployee && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00904B]/10 text-[#00904B] border border-[#00904B]/20">
                {selectedEmployee.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(null);
                  }}
                  className="ml-1 hover:text-[#00904B]/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Status Filter */}
            {selectedStatus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {getStatusDisplayName(selectedStatus)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStatus(null);
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Leave Type Filter */}
            {selectedLeaveType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                {getLeaveTypeDisplayName(selectedLeaveType)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLeaveType(null);
                  }}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Year Filter */}
            {/* {selectedYear && selectedYear !== new Date().getFullYear().toString() && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                Year: {selectedYear}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedYear(new Date().getFullYear().toString());
                                    }}
                                    className="ml-1 hover:text-purple-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )} */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onResetFilters();
              }}
              className="text-primary hover:text-primary/80 text-xs underline ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveFilterSection;
