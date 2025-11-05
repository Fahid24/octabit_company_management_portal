import React from "react";
import { Filter, X } from "lucide-react";
import DateRangeSelector from "@/component/DateRangeSelector";
import SelectInput from "@/component/select/SelectInput";

const AttendanceFilters = ({
  // Filter visibility state
  showFilters = true, // default to true for pages without toggle

  // Date range props
  onDateRangeChange,

  // Department filter props
  selectedDepartments = [],
  setSelectedDepartments,
  departmentsData = [],
  departmentsLoading = false,

  // Employee filter props
  selectedEmployees = [],
  setSelectedEmployees,
  employeeData = [],
  employeesLoading = false,
  employeeDataFormat = "object", // "object" for {_id, firstName, lastName} or "option" for {value, label}

  // Status filter props
  selectedStatus = "",
  setSelectedStatus,
  statusOptions = [
    { value: "present", label: "Present" },
    { value: "graced", label: "Grace Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
    { value: "paid leave", label: "Paid Leave" },
    { value: "unpaid leave", label: "Unpaid Leave" },
  ],
  showStatusFilter = true, // control whether to show status filter

  // Admin permission
  isAdmin = false,

  // Additional props
  className = "",

  // Optional custom clear function
  onClearAllFilters,

  // Optional custom department/employee toggle functions
  onDepartmentToggle,
  onEmployeeToggle,

  // Optional additional filters (for extensibility)
  additionalFilters = null,

  // Custom active filters component (for pages that use ActiveFilters component)
  useCustomActiveFilters = false,
  customActiveFiltersComponent = null,
}) => {
  // Default clear all filters function
  const handleClearAllFilters = () => {
    if (onClearAllFilters) {
      onClearAllFilters();
    } else {
      setSelectedDepartments([]);
      setSelectedEmployees([]);
      setSelectedStatus("");
    }
  };

  // Default department toggle function
  const handleDepartmentToggle = (department) => {
    if (onDepartmentToggle) {
      onDepartmentToggle(department);
    } else {
      setSelectedDepartments((prev) =>
        prev.includes(department)
          ? prev.filter((d) => d !== department)
          : [...prev, department]
      );
    }
  };

  // Default employee toggle function
  const handleEmployeeToggle = (employeeId) => {
    if (onEmployeeToggle) {
      onEmployeeToggle(employeeId);
    } else {
      setSelectedEmployees((prev) =>
        prev.includes(employeeId)
          ? prev.filter((id) => id !== employeeId)
          : [...prev, employeeId]
      );
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedDepartments.length > 0 ||
    selectedEmployees.length > 0 ||
    (showStatusFilter && selectedStatus);

  return (
    <div className={`${className}`}>
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="z-50 min-w-[300px]">
              <DateRangeSelector
                onDateRangeChange={onDateRangeChange}
                label="Date Range"
              />
            </div>

            {/* Department Filter */}
            {isAdmin && (
              <div className="relative z-40">
                <SelectInput
                  id="department-select"
                  label="Department"
                  isMulti={true}
                  value={departmentsData
                    .filter((d) => selectedDepartments.includes(d._id))
                    .map((d) => ({ value: d._id, label: d.name }))}
                  onChange={(options) =>
                    setSelectedDepartments(
                      options ? options.map((opt) => opt.value) : []
                    )
                  }
                  options={departmentsData.map((dept) => ({
                    value: dept._id,
                    label: dept.name,
                  }))}
                  isLoading={departmentsLoading}
                />
              </div>
            )}

            {/* Employee Filter */}
            {isAdmin && (
              <div className="relative z-30">
                <SelectInput
                  id="employee-select"
                  label="Employee"
                  isMulti={true}
                  value={
                    employeeDataFormat === "option"
                      ? employeeData.filter((e) =>
                          selectedEmployees.includes(e.value)
                        )
                      : employeeData
                          .filter((e) => selectedEmployees.includes(e._id))
                          .map((e) => ({
                            value: e._id,
                            label: e.firstName + " " + e.lastName,
                          }))
                  }
                  onChange={(options) =>
                    setSelectedEmployees(
                      options ? options.map((opt) => opt.value) : []
                    )
                  }
                  options={
                    employeeDataFormat === "option"
                      ? employeeData
                      : employeeData.map((emp) => ({
                          value: emp._id,
                          label: emp.firstName + " " + emp.lastName,
                        }))
                  }
                  isLoading={employeesLoading}
                />
              </div>
            )}

            {/* Status Filter */}
            {showStatusFilter && (
              <div>
                <SelectInput
                  id="status-select"
                  label="Status"
                  isMulti={false}
                  value={
                    statusOptions.find((opt) => opt.value === selectedStatus) ||
                    null
                  }
                  onChange={(option) => setSelectedStatus(option?.value || "")}
                  options={statusOptions}
                  placeholder="Select Status"
                />
              </div>
            )}

            {/* Additional Filters Slot */}
            {additionalFilters}
          </div>

          {/* Active Filters - use custom component if provided, otherwise use default */}
          {!useCustomActiveFilters && hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">Active filters:</span>

                {/* Department Filters */}
                {isAdmin &&
                  selectedDepartments.map((dept) => (
                    <span
                      key={dept}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {departmentsData.find(
                        (d) => d._id.toString() === dept.toString()
                      )?.name || dept}
                      <button
                        onClick={() => handleDepartmentToggle(dept)}
                        className="ml-1 hover:text-primary/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                {/* Employee Filters */}
                {isAdmin &&
                  selectedEmployees.map((empId) => {
                    const emp =
                      employeeDataFormat === "option"
                        ? employeeData.find((e) => e.value === empId)
                        : employeeData.find((e) => e._id === empId);
                    const empLabel =
                      employeeDataFormat === "option"
                        ? emp?.label
                        : emp
                        ? `${emp.firstName} ${emp.lastName}`
                        : empId;

                    return (
                      <span
                        key={empId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {empLabel}
                        <button
                          onClick={() => handleEmployeeToggle(empId)}
                          className="ml-1 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                {/* Status Filter */}
                {showStatusFilter && selectedStatus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    {statusOptions.find((opt) => opt.value === selectedStatus)
                      ?.label || selectedStatus}
                    <button
                      onClick={() => setSelectedStatus("")}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Clear All Button */}
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render custom active filters outside the main panel if provided */}
      {useCustomActiveFilters && showFilters && customActiveFiltersComponent}
    </div>
  );
};

export default AttendanceFilters;
