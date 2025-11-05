import React from "react";
import { Filter, X } from "lucide-react";
import SelectInput from "@/component/select/SelectInput";
import DateRangeSelector from "@/component/DateRangeSelector";

const ShortLeaveFilters = ({
  showFilters,
  filters,
  onFilterChange,
  onDateRangeChange,
  onDepartmentToggle,
  onClearFilters,
  // Role-based props
  isAdmin,
  isDepartmentHead,
  departmentId,
  loginRole,
  // Data props
  departmentsData,
  departmentsLoading,
  employeesData,
  // Status options
  getStatusOptions,
}) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-gray-500" />
        <h3 className="font-medium text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        {/* Date Range */}
        <div className="relative z-50">
          <DateRangeSelector
            onDateRangeChange={onDateRangeChange}
            label="Date Range"
          />
        </div>

        {/* Status Filter */}
        <div className="relative z-40">
          <SelectInput
            label="Status"
            value={{
              value: filters.status,
              label:
                getStatusOptions().find((opt) => opt.value === filters.status)
                  ?.label || "All Status",
            }}
            onChange={(option) => onFilterChange("status", option?.value || "")}
            options={getStatusOptions()}
          />
        </div>

        {/* Department Filter - Multi-select for Admin, Single department for DepartmentHead */}
        {(isAdmin || isDepartmentHead) && (
          <div className="relative z-30">
            <SelectInput
              id="department-select"
              label="Department"
              isMulti={isAdmin} // Only Admin can select multiple departments
              value={
                isAdmin
                  ? departmentsData?.data
                      ?.filter((d) => filters.departmentIds.includes(d._id))
                      ?.map((d) => ({ value: d._id, label: d.name })) || []
                  : filters.departmentIds.length > 0 && departmentsData?.data
                  ? {
                      value: filters.departmentIds[0],
                      label:
                        departmentsData.data.find(
                          (d) => d._id === filters.departmentIds[0]
                        )?.name || "Department",
                    }
                  : null
              }
              onChange={(options) => {
                if (isAdmin) {
                  onFilterChange(
                    "departmentIds",
                    options ? options.map((opt) => opt.value) : []
                  );
                } else {
                  onFilterChange(
                    "departmentIds",
                    options ? [options.value] : []
                  );
                }
              }}
              options={
                departmentsData?.data?.map((dept) => ({
                  value: dept._id,
                  label: dept.name,
                })) || []
              }
              isLoading={departmentsLoading}
              placeholder={isAdmin ? "Select Departments" : "Select Department"}
              isDisabled={
                isDepartmentHead && departmentsData?.data?.length === 1
              } // Disable if dept head has only one department
            />
          </div>
        )}

        {/* Employee Filter - Role-based access */}
        {(isAdmin || isDepartmentHead) && (
          <div className="relative z-20">
            <SelectInput
              label="Employee"
              isMulti={true} // Both Admin and DepartmentHead can select multiple employees
              value={
                filters.employeeId && Array.isArray(filters.employeeId)
                  ? filters.employeeId
                      .map((empId) => {
                        const emp = employeesData?.data?.find(
                          (e) => e._id === empId
                        );
                        return emp
                          ? {
                              value: emp._id,
                              label: `${emp.firstName} ${emp.lastName}`,
                              department:
                                emp.department?.name || "No Department",
                            }
                          : null;
                      })
                      .filter(Boolean)
                  : filters.employeeId
                  ? [
                      employeesData?.data?.find(
                        (emp) => emp._id === filters.employeeId
                      ),
                    ]
                      .filter(Boolean)
                      .map((emp) => ({
                        value: emp._id,
                        label: `${emp.firstName} ${emp.lastName}`,
                        department: emp.department?.name || "No Department",
                      }))
                  : []
              }
              onChange={(option) => {
                // Both Admin and DepartmentHead: handle multiple selection
                onFilterChange(
                  "employeeId",
                  option ? option.map((opt) => opt.value) : []
                );
              }}
              options={[
                ...(employeesData?.data?.map((emp) => ({
                  value: emp._id,
                  label: `${emp.firstName} ${emp.lastName}`,
                  department: emp.department?.name || "No Department",
                })) || []),
              ]}
              placeholder={
                isAdmin
                  ? "Select Employees (All Departments)"
                  : "Select Employees (Your Department)"
              }
              formatOptionLabel={
                isAdmin
                  ? (option) => (
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-gray-500">
                          {option.department}
                        </div>
                      </div>
                    )
                  : undefined
              }
            />
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(filters.departmentIds.length > 0 ||
        filters.employeeId.length > 0 ||
        filters.status) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>

            {/* Department Filters */}
            {filters.departmentIds.map((deptId) => (
              <span
                key={deptId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {departmentsData?.data?.find(
                  (d) => d._id.toString() === deptId.toString()
                )?.name || deptId}
                <button
                  onClick={() => onDepartmentToggle(deptId)}
                  className="ml-1 hover:text-primary/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Employee Filter */}
            {filters.employeeId && (
              <>
                {Array.isArray(filters.employeeId) ? (
                  filters.employeeId.map((empId) => (
                    <span
                      key={empId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00904B]/10 text-[#00904B] border border-[#00904B]/20"
                    >
                      {employeesData?.data?.find((emp) => emp._id === empId)
                        ?.firstName +
                        " " +
                        employeesData?.data?.find((emp) => emp._id === empId)
                          ?.lastName}
                      <button
                        onClick={() => {
                          const newEmployeeIds = filters.employeeId.filter(
                            (id) => id !== empId
                          );
                          onFilterChange("employeeId", newEmployeeIds);
                        }}
                        className="ml-1 hover:text-[#00904B]/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00904B]/10 text-[#00904B] border border-[#00904B]/20">
                    {employeesData?.data?.find(
                      (emp) => emp._id === filters.employeeId
                    )?.firstName +
                      " " +
                      employeesData?.data?.find(
                        (emp) => emp._id === filters.employeeId
                      )?.lastName}
                    <button
                      onClick={() => onFilterChange("employeeId", [])}
                      className="ml-1 hover:text-[#00904B]/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </>
            )}

            {/* Status Filter */}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                {
                  getStatusOptions().find((opt) => opt.value === filters.status)
                    ?.label
                }
                <button
                  onClick={() => onFilterChange("status", "")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Date Range Filter */}
            {/* {(filters.startDate || filters.endDate) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                {filters.startDate && filters.endDate 
                  ? `${filters.startDate} to ${filters.endDate}`
                  : filters.startDate 
                  ? `From ${filters.startDate}`
                  : `Until ${filters.endDate}`
                }
                <button onClick={() => onDateRangeChange({ startDate: '', endDate: '' })} className="ml-1 hover:text-purple-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )} */}

            <button
              onClick={onClearFilters}
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

export default ShortLeaveFilters;
