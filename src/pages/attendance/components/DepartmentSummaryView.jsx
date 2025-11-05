import DepartmentCard from "./DepartmentCard";

const DepartmentSummaryView = ({
  employeesByDepartment,
  departments,
  startDate,
  endDate,
  showAllDepartments,
  setShowAllDepartments,
  setSelectedDepartment,
  formatDateRangeText,
}) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employeesByDepartment
          .slice(0, showAllDepartments ? employeesByDepartment.length : 6)
          .map((dept, idx) => (
            <DepartmentCard
              key={dept.name}
              dept={dept}
              startDate={startDate}
              endDate={endDate}
              onClick={() => setSelectedDepartment([departments[idx]._id])}
              formatDateRangeText={formatDateRangeText}
            />
          ))}
      </div>

      {/* View More / View Less Button */}
      {employeesByDepartment.length > 6 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAllDepartments(!showAllDepartments)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {showAllDepartments ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                View Less
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                View More ({employeesByDepartment.length - 6} more departments)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DepartmentSummaryView;
