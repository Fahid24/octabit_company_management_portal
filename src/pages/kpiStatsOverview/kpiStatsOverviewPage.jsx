import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetOverviewStatsQuery } from "@/redux/features/statsOverview/statsOverviewApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import Table from "@/component/Table";
import Pagination from "@/component/Pagination";
import { CircleAlert, Eye, Search } from "lucide-react";
import StatsCard from "./components/StatsCard";
import SelectInput from "@/component/select/SelectInput";
import ActiveFilters from "@/component/ActiveFilters";
import Loader from "@/component/Loader";
import { FloatingInput } from "@/component/FloatiingInput";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";

const KpiStatsOverviewPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // State for filters and pagination
  const [role, setRole] = useState("Employee");
  const [departmentId, setDepartmentId] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch data based on filters
  const { data, isLoading, isFetching } = useGetOverviewStatsQuery({
    role,
    departmentId,
    page,
    limit,
    search,
  });

  // Fetch departments for filtering
  const { data: departmentsData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({
      page: 0,
      limit: 0,
      isPopulate: false,
    });

  // Get departments for filter
  const departments = useMemo(() => {
    return departmentsData?.data || [];
  }, [departmentsData]);

  // Apply search when user presses Enter or clicks search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchTerm);
    setPage(1); // Reset to first page on new search
  };

  // Reset filters
  const handleResetFilters = () => {
    setRole("Employee");
    setDepartmentId("");
    setSearch("");
    setSearchTerm("");
    setPage(1);
  };

  // Get department name for display
  const getDepartmentName = (deptId) => {
    if (!deptId || !departments) return "";
    const dept = departments.find((d) => d._id === deptId);
    return dept?.name || "";
  };
  // Table columns
  const columns = [
    "Name",
    "Email",
    "Department",
    "Role",
    "Tasks",
    "Attendance",
    "Projects",
    "Actions",
  ];
  // Navigate to the appropriate KPI page based on role
  const handleViewKPI = (userId, role) => {
    if (role === "DepartmentHead") {
      navigate(`/kpi-deptHead/${userId}`);
    } else if (role === "Manager") {
      navigate(`/kpi-manager/${userId}`);
    } else if (role === "Employee") {
      navigate(`/kpi-employee/${userId}`);
    }
  };

  // Handle table row rendering
  const renderCell = (col, cellData, row) => {
    // console.log(row);
    switch (col) {
      case "Name":
        return row.name;
      case "Email":
        return row.email;
      case "Department":
        return row.departmentName || "N/A";
      case "Role":
        return row.role;
      case "Tasks":
        return (
          <div className="flex flex-col">
            <span className="text-xs mb-1">Assigned: {row.assignedTasks}</span>
            <span className="text-xs text-green-600">
              Completed: {row.completedTasks}
            </span>
          </div>
        );
      case "Attendance":
        return (
          <div className="flex flex-col">
            <span className="text-xs mb-1">Present: {row.presentDays}</span>
            <span className="text-xs text-blue-600">
              Leave: {row.approvedLeaves}
            </span>
          </div>
        );
      case "Projects":
        return (
          <div className="flex flex-col">
            <span className="text-xs mb-1">
              Assigned: {row.assignedProjects}
            </span>
            <span className="text-xs text-green-600">
              Completed: {row.completedProjects}
            </span>
          </div>
        );
      case "Actions":
        // Only show view button for Manager, DepartmentHead, and Employee roles
        if (["Manager", "DepartmentHead", "Employee"].includes(row.role)) {
          return (
            <Eye
              size={18}
              className="text-gray-600 hover:text-primary cursor-pointer transition-colors"
              onClick={() => handleViewKPI(row.id, row.role)}
            />
          );
        }
        return null;
      default:
        return cellData || "N/A";
    }
  };
  // Role options for filter
  const roleOptions = [
    { value: "DepartmentHead", label: "DepartmentHead" },
    { value: "Manager", label: "Manager" },
    { value: "Employee", label: "Employee" },
    { value: "Admin", label: "Admin" },
  ];

  // Prepare active filters for display
  const activeFilters = {
    ...(role ? { role: [role] } : {}),
    ...(departmentId ? { department: [departmentId] } : {}),
  };

  // Filter labels
  const filterLabels = {
    role: {
      DepartmentHead: "Department Head",
      Manager: "Manager",
      Employee: "Employee",
      Admin: "Admin",
    },
    department: departments.reduce((acc, dept) => {
      acc[dept._id] = dept.name;
      return acc;
    }, {}),
  };
  // Handle filter removal
  const handleRemoveFilter = (key) => {
    if (key === "role") {
      setRole("");
    } else if (key === "department") {
      setDepartmentId("");
    }
    setPage(1); // Reset to first page when clearing filters
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            KPI Stats Overview
          </h1>
          <div className="ml-2 pt-2 cursor-pointer">
            <Tooltips
              text="This page lets you view and manage individual employee performance metrics across departments.You can filter by role, search by name or email, and track key data like tasks assigned vs. completed, attendance, and project involvement."
              position={isMobile ? "bottom" : "right"}
            >
              <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </Tooltips>
          </div>
        </div>

        <p className="text-gray-600">
          View and manage KPI statistics across departments.
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4 items-center">
          {/* Role Filter */}
          <div className="flex flex-col md:flex-row items-center w-full gap-3 md:gap-6">
            <div>
              <SelectInput
                label="Role"
                value={roleOptions.find((r) => r.value === role) || null}
                onChange={(selected) => {
                  setRole(selected ? selected.value : "");
                  setPage(1);
                }}
                options={roleOptions}
                className={"min-w-64"}
              />
            </div>
            <div>
              <FloatingInput
                className="min-w-64 mt-0.5"
                label="Search by name or email..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition min-w-36 mt-5 md:mt-0"
            >
              Reset Filters
            </button>
          </div>

          {/* Department Filter
          <div>
            <SelectInput
              label="Department"
              value={departments.find(d => d._id === departmentId) 
                ? { value: departmentId, label: filterLabels.department[departmentId] }
                : null}
              onChange={(selected) => {
                setDepartmentId(selected ? selected.value : "");
                setPage(1);
              }}
              options={departments.map(dept => ({
                value: dept._id,
                label: dept.name
              }))}
              isLoading={isDeptLoading}
            />
          </div> */}

          {/* Search Filter */}
          {/* Reset Filters Button */}
          <div className="mt-4 flex justify-end md:justify-start"></div>
        </div>

        {/* Active Filters */}
        {(Object.keys(activeFilters).length > 0 || search) && (
          <div className="mb-4">
            <ActiveFilters
              filter={activeFilters}
              optionLabels={filterLabels}
              onRemove={handleRemoveFilter}
              searchTerm={search}
              onClearSearch={() => {
                setSearch("");
                setSearchTerm("");
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Summary Stats Cards
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value={data?.total || 0}
          icon="users"
          color="blue"
        />
        <StatsCard
          title="Department Heads"
          value={
            data?.data?.filter((item) => item.role === "DepartmentHead").length || 0
          }
          icon="building"
          color="green"
        />
        <StatsCard
          title="Managers"
          value={data?.data?.filter((item) => item.role === "Manager").length || 0}
          icon="briefcase"
          color="purple"
        />
        <StatsCard
          title="Employees"
          value={data?.data?.filter((item) => item.role === "Employee").length || 0}
          icon="user"
          color="orange"
        />
      </div> */}

      {/* Data Table */}
      {data?.data?.length > 0 ? (
        <div className="">
          <Table
            columns={columns}
            data={data?.data}
            isLoading={isLoading || isFetching}
            renderCell={renderCell}
          />
          <div className="mt-4">
            <Pagination
              totalCount={data?.total || 0}
              limit={limit}
              currentPage={page}
              setCurrentPage={setPage}
              setLimit={setLimit}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          {isLoading || isFetching ? (
            <Loader />
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default KpiStatsOverviewPage;
