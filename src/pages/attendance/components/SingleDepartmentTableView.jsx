import DepartmentPerformanceSummary from "./DepartmentPerformanceSummary";
import EmployeeTable from "./EmployeeTable";

const SingleDepartmentTableView = ({
  selectedDeptObj,
  employeesInSelectedDept,
  deptTotalHours,
  deptAvgHours,
  calculateAttendanceStats,
  getSortedFilteredEmployees,
  handleSort,
  sortField,
  sortDirection,
  quickFilter,
  setQuickFilter,
  startDate,
  endDate,
}) => {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-primary rounded-full mr-2"></span>
        {selectedDeptObj?.name}{" "}
        <span className="text-lg font-normal text-gray-500">- Employees</span>
      </h2>

      <DepartmentPerformanceSummary
        employeesInSelectedDept={employeesInSelectedDept}
        deptTotalHours={deptTotalHours}
        deptAvgHours={deptAvgHours}
        calculateAttendanceStats={calculateAttendanceStats}
        startDate={startDate}
        endDate={endDate}
      />

      <EmployeeTable
        employeesInSelectedDept={employeesInSelectedDept}
        getSortedFilteredEmployees={getSortedFilteredEmployees}
        calculateAttendanceStats={calculateAttendanceStats}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
      />
    </div>
  );
};

export default SingleDepartmentTableView;
