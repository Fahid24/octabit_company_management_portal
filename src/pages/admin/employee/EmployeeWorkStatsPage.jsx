import React, { useMemo, useState } from "react";
import { useGetAllEmployeeWorkStatsQuery } from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import { EmptyState } from "@/component/NoData";
import { GridIcon, ListIcon, Search, Filter, CircleAlert } from "lucide-react";
import Button from "@/component/Button";
import EmployeeCard from "./component/EmployeeCard";
import TeamStats from "./component/TeamStats";
import { FloatingInput } from "@/component/FloatiingInput";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useSelector } from "react-redux";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook
import SelectInput from "@/component/select/SelectInput";

const ViewMode = {
  GRID: "grid",
  COMPACT: "compact",
};

const EmployeeWorkStatsPage = () => {
  const loginUser = useSelector((state) => state.userSlice.user);
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const deptId =
    loginUser?.user?.role === "DepartmentHead" ? loginUser?.user?._id : "";

  const [viewMode, setViewMode] = useState(ViewMode.GRID);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery({
      page: 1,
      limit: 1000,
      isPopulate: true,
      departmentHead: deptId,
    });
  const departmentOptions = Array.isArray(departmentsData?.data)
    ? departmentsData.data.filter((d) => !d.isDeleted).map((dept) => dept._id)
    : [];
  const { data, isLoading, isError, error, refetch } =
    useGetAllEmployeeWorkStatsQuery({
      // employeeIds,
      departmentIds: departmentOptions.join(","),
    });
  const employees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees;
  }, [data]);

  // Get list of departments for filter
  const departments = useMemo(() => {
    const deptMap = new Map();
    employees.forEach((emp) => {
      if (emp.department && emp.department._id) {
        deptMap.set(emp.department._id, emp.department);
      }
    });
    return Array.from(deptMap.values());
  }, [employees]);

  // Filter employees based on search and department
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDepartment =
        selectedDepartment === "all" ||
        (emp.department && emp.department._id === selectedDepartment);

      const matchesSearch =
        !searchTerm ||
        emp.employeeName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        emp.employeeEmail?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        emp.employeeRole?.toLowerCase().includes(searchTerm?.toLowerCase());

      return matchesDepartment && matchesSearch;
    });
  }, [employees, searchTerm, selectedDepartment]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <Loader />
      </div>
    );
  // if (isError) return <ErrorMessage error={error} refetch={refetch} />;
  // if (!employees.length)
  //   return (
  //     <EmptyState message="No employee work stats found." refetch={refetch} />
  //   );

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mb-4">Employee Work Hour Stats</h1>

        <div className="ml-2 mb-2 cursor-pointer">
          <Tooltips
            text="This page shows a summary of employee work hours, work days, and leave days. You can view each employee's work calendar, total hours, and department info. Use the search and filter to find specific employees, and switch between Grid or Compact views for better display."
            position={isMobile ? "bottom" : "right"}
          >
            <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </Tooltips>
        </div>
      </div>

      {/* Team Overview Stats */}
      <TeamStats employees={filteredEmployees} />

      {/* Filters and View Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <FloatingInput
            type="text"
            label="Search employees..."
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-shrink-0 md:w-64">
          <SelectInput
            label="Department"
            isMulti={false}
            value={
              [
                { value: "all", label: "All Departments" },
                ...departments.map((dept) => ({
                  value: dept._id,
                  label: dept.name,
                })),
              ].find((opt) => opt.value === selectedDepartment) || null
            }
            onChange={(selected) =>
              setSelectedDepartment(selected?.value || "all")
            }
            options={[
              { value: "all", label: "All Departments" },
              ...departments.map((dept) => ({
                value: dept._id,
                label: dept.name,
              })),
            ]}
            icon={<Filter size={18} />}
          />
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ">
          <Button
            onClick={() => setViewMode(ViewMode.GRID)}
            variant={viewMode === ViewMode.GRID ? "primary" : "outline"}
            size="sm"
            icon={GridIcon}
          >
            Grid
          </Button>
          <Button
            onClick={() => setViewMode(ViewMode.COMPACT)}
            variant={viewMode === ViewMode.COMPACT ? "primary" : "outline"}
            size="sm"
            icon={ListIcon}
          >
            Compact
          </Button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div
        className={`grid gap-6 ${
          viewMode === ViewMode.GRID
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.employeeId}
            employee={employee}
            isCompact={viewMode === ViewMode.COMPACT}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <p className="text-gray-500">No employees match your filters.</p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedDepartment("all");
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmployeeWorkStatsPage;
