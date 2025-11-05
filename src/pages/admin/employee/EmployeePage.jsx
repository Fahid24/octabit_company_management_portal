import { useMemo, useState, useEffect, useCallback } from "react";
import {
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "../../../redux/features/admin/employee/employeeApiSlice";
import Table from "../../../component/Table";
import Pagination from "../../../component/Pagination";
import Button from "@/component/Button";
import {
  ClipboardList,
  Eye,
  FileEdit,
  PlusCircle,
  MoreVertical,
  Filter,
  Calendar,
  Plus,
  CircleAlert,
  UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Error from "@/component/Error";
import FilterPanel from "../../../component/FilterPanel"; // Import FilterPanel
import ActiveFilters from "@/component/ActiveFilters";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import Tooltip from "@/component/Tooltip";
import { useSelector } from "react-redux";
import { FloatingInput } from "@/component/FloatiingInput";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook
import { designationOptions } from "./component/const";
import { toast } from "@/component/Toast";

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-500">{title}</h3>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold text-2xl"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const EmployeePage = () => {
  const loginUser = useSelector((state) => state.userSlice.user);
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const isAdmin = loginUser?.user?.role === "Admin";
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'status' or 'role'
  const [filterPanelOpen, setFilterPanelOpen] = useState(false); // State for filter panel visibility
  const [search, setSearch] = useState(""); // State for search input
  const [filter, setFilter] = useState({
    department: [],
    role: [],
    status: [],
    workLocation: [],
    employmentType: [],
  }); // State for selected filters
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [pendingUpdate, setPendingUpdate] = useState({
    employeeId: null,
    field: null,
    value: null,
    displayValue: null,
  });

  const navigate = useNavigate();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const deptId =
    loginUser?.user?.role === "DepartmentHead" ? loginUser?.user?._id : "";

  const { data, error, isLoading, isFetching, refetch } = useGetEmployeesQuery({
    page: currentPage,
    limit,
    search,
    departmentHead: deptId,
    department: filter.department.join(","),
    role: filter.role.join(","),
    status: filter.status.join(","),
    workLocation: filter.workLocation.join(","),
    employmentType: filter.employmentType.join(","),
  });
  // console.log(data);

  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery({
      page: 1,
      limit: 1000,
      isPopulate: true,
      departmentHead: deptId,
    });
  const departmentOptions = Array.isArray(departmentsData?.data)
    ? departmentsData.data
        .filter((d) => !d.isDeleted)
        .map((dept) => ({ id: dept._id, name: dept.name }))
    : [];

  const handleUpdate = useCallback(
    async (employeeId, field, value) => {
      try {
        // First verify the input matches the value
        const formattedValue = value?.toLowerCase();
        const formattedConfirmation = confirmationInput?.toLowerCase();

        if (formattedConfirmation !== formattedValue) {
          toast.error(
            "Validation Error",
            `Please type "${value}" exactly to confirm the change.`
          );
          return;
        }

        const updateData = {
          id: employeeId,
          [field]: value,
        };

        if (
          field === "status" &&
          (value === "Resigned" || value === "Terminated")
        ) {
          updateData.terminationDate = new Date().toISOString();
        }
        if (
          field === "status" &&
          (value === "Active" || value === "OnLeave" || value === "Pending")
        ) {
          updateData.terminationDate = null;
        }

        await updateEmployee(updateData).unwrap();
        setOpenMenuId(null);
        setShowConfirmationModal(false);
        setConfirmationInput("");
        refetch();
      } catch (err) {
        toast.error(
          "Update Failed",
          err?.data?.error ||
            "Failed to update employee details. Please try again."
        );
        console.error("Failed to update:", err);
      }
    },
    [updateEmployee, refetch, confirmationInput]
  );

  const handleUpdateClick = (employeeId, field, value, displayValue) => {
    // console.log({ employeeId, field, value, displayValue });
    setPendingUpdate({
      employeeId,
      field,
      value,
      displayValue,
    });
    setShowConfirmationModal(true);
    setConfirmationInput("");
  };

  const toggleMenu = useCallback(
    (id, type) => {
      if (openMenuId === id && menuType === type) {
        setOpenMenuId(null);
        setMenuType(null);
      } else {
        setOpenMenuId(id);
        setMenuType(type);
      }
    },
    [openMenuId, menuType]
  ); // Wrapped in useCallback with dependencies

  // Close menu when clicking outside
  useEffect(() => {
    refetch();
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-menu")) {
        setOpenMenuId(null);
        setMenuType(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refetch]); // Added 'refetch' to the dependency array

  const getFilteredStatusOptions = (currentStatus) => {
    const allStatuses = [
      "Active",
      "Terminated",
      "Resigned",
      "OnLeave",
      "Pending",
    ];
    return allStatuses.filter((status) => status !== currentStatus);
  };

  const roleHierarchy = {
    Admin: ["DepartmentHead", "Manager", "Employee"],
    DepartmentHead: ["Admin", "Manager", "Employee"],
    Manager: ["Admin", "DepartmentHead", "Employee"],
    Employee: ["Admin", "DepartmentHead", "Manager"],
  };

  const getFilteredRoleOptions = (currentRole) => {
    return roleHierarchy[currentRole] || [];
  };

  const getFilteredTypeOptions = (currentType) => {
    const allTypes = [
      "FullTime",
      "PartTime",
      "Probation",
      "Contractual",
      "Intern",
    ];
    return allTypes.filter((employmentType) => employmentType !== currentType);
  };

  const tableData = useMemo(() => {
    return (
      data?.data?.map((employee) => ({
        // Name: (
        //   <div className="flex items-center gap-2 font-medium text-gray-900">

        //     <p>
        //       {employee?.firstName} {employee?.lastName}
        //     </p>
        //   </div>
        // ),
        Details: (
          <div className="flex items-center gap-2">
            {employee?.photoUrl ? (
              <img
                src={employee.photoUrl}
                alt="User"
                className="rounded-full w-10 md:w-11 h-10 md:h-11 object-cover border border-primary p-0.5"
              />
            ) : (
              <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
                <UserIcon className="text-white w-5 h-5" />
              </div>
            )}
            <div className="text-sm text-gray-500">
              <p className="text-black">
                {employee?.firstName} {employee?.lastName}
              </p>
              <p className="truncate">{employee.email}</p>
            </div>
          </div>
        ),
        Department: (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {employee?.department?.name
              ? employee?.department?.name
              : "---------------"}
          </div>
        ),
        Status: (
          <div className="flex items-center">
            {isAdmin && (
              <div className="relative ml-2 dropdown-menu">
                <Tooltip
                  text={`Change status (current: ${employee.role})`}
                  position="left"
                >
                  <button
                    onClick={() => toggleMenu(employee._id, "status")}
                    className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                  >
                    <MoreVertical size={14} className="mt-1" />
                  </button>
                </Tooltip>
                {openMenuId === employee._id && menuType === "status" && (
                  <div className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {getFilteredStatusOptions(employee.status).map(
                        (option) => (
                          <button
                            key={option}
                            onClick={() =>
                              handleUpdateClick(
                                employee._id,
                                "status",
                                option,
                                option
                              )
                            }
                            className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                          >
                            {option}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                employee.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : employee.status === "Terminated"
                  ? "bg-red-100 text-red-800"
                  : employee.status === "Resigned"
                  ? "bg-red-100 text-orange-800"
                  : employee.status === "OnLeave"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {employee?.status}
            </span>
          </div>
        ),
        Role: (
          <div className="flex items-center">
            {isAdmin && (
              <div className="relative ml-2 dropdown-menu">
                <Tooltip
                  text={`Change role (current: ${employee.role})`}
                  position="left"
                >
                  {
                    <button
                      // disabled={(loginUser?.user?.role === employee?.role)}
                      onClick={() => toggleMenu(employee._id, "role")}
                      className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                    >
                      <MoreVertical size={14} className="mt-1" />
                    </button>
                  }
                </Tooltip>
                {openMenuId === employee._id && menuType === "role" && (
                  <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {getFilteredRoleOptions(employee.role).map((option) => (
                        <button
                          key={option}
                          // disabled={loginUser?.user?.role === employee?.role}
                          onClick={() =>
                            handleUpdateClick(
                              employee._id,
                              "role",
                              option,
                              option
                            )
                          }
                          className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 capitalize"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <span className="text-sm text-gray-700 capitalize">
              {employee?.role || "N/A"}
            </span>
          </div>
        ),
        Designation: (
          <div className="flex items-center">
            {isAdmin && (
              <div className="relative ml-2 dropdown-menu">
                <Tooltip
                  text={`Change designation (current: ${employee?.designation})`}
                  position="left"
                >
                  {
                    <button
                      onClick={() => toggleMenu(employee._id, "designation")}
                      className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                    >
                      <MoreVertical size={14} className="mt-1" />
                    </button>
                  }
                </Tooltip>
                {openMenuId === employee._id && menuType === "designation" && (
                  <div className="absolute right-0 z-10 mt-2 min-w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {designationOptions
                        .filter((opt) => opt.value !== employee?.designation)
                        .map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleUpdateClick(
                                employee._id,
                                "designation",
                                option.value,
                                option.label
                              )
                            }
                            className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 capitalize"
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <span className="text-sm text-gray-700 capitalize">
              {employee?.designation || "N/A"}
            </span>
          </div>
        ),
        Type: (
          <div className="flex items-center">
            {isAdmin && (
              <div className="relative ml-2 dropdown-menu">
                <Tooltip
                  text={`Change type (current: ${employee.role})`}
                  position="left"
                >
                  <button
                    // disabled={loginUser?.user?.role === employee?.role}
                    onClick={() => toggleMenu(employee._id, "employmentType")}
                    className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                  >
                    <MoreVertical size={14} className="mt-1" />
                  </button>
                </Tooltip>
                {openMenuId === employee._id &&
                  menuType === "employmentType" && (
                    <div className="absolute  right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {getFilteredTypeOptions(employee.employmentType).map(
                          (option) => (
                            <button
                              key={option}
                              onClick={() =>
                                handleUpdateClick(
                                  employee._id,
                                  "employmentType",
                                  option,
                                  option
                                )
                              }
                              className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
            <span className="text-sm text-gray-700 capitalize">
              {employee?.employmentType
                ? employee?.employmentType
                : "---------"}
            </span>
          </div>
        ),
        Actions: (
          <div className="flex">
            <Tooltip text="View Profile" position="left">
              <button
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => navigate(`/profile/${employee._id}`)}
              >
                <Eye size={18} />
              </button>
            </Tooltip>
            <Tooltip text="View Attendance" position="left">
              <button
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-yellow-700 transition-colors"
                onClick={() => navigate(`/attendance/employee/${employee._id}`)}
              >
                <Calendar size={18} />
              </button>
            </Tooltip>
            <Tooltip text="View Work Details" position="left">
              <button
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-green-600 transition-colors"
                onClick={() => navigate(`/working-details/${employee._id}`)}
              >
                <ClipboardList size={18} />
              </button>
            </Tooltip>

            {isAdmin && (
              <Tooltip text="Edit Employee" position="left">
                <button
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-orange-600 transition-colors"
                  title="Edit Employee"
                  onClick={() =>
                    navigate("/employee-edit", { state: { employee } })
                  }
                >
                  <FileEdit size={18} />
                </button>
              </Tooltip>
            )}
          </div>
        ),
      })) || []
    );
  }, [data, openMenuId, menuType, handleUpdate, navigate, toggleMenu]); // Added missing dependencies

  const handleFilterChange = (updatedFilter) => {
    setFilter(updatedFilter);
    refetch();
  };

  if (data && error) {
    return <Error />;
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold leading-tight text-gray-900">
              Employee Management
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="This page lets you manage your organization's employees. You can view their contact details, department, status, role, and job type. Use the Add Employee button to add new staff. Search or filter employees by name or email. Click the icons on the right to view, edit, or manage leave details."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage your organization&apos;s employees and their details
          </p>
        </div>

        <Button
          onClick={() => navigate("/employee-add")}
          variant="primary"
          className="bg-primary hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span> Add Employee</span>
          </div>
        </Button>
      </div>

      {/* Sort, Search, and Filter Controls - Responsive for Mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-6">
        {/* <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="font-medium mb-1 sm:mb-0 sm:mr-2">Sort by:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1 w-full sm:w-auto"
          >
            <option value="lastName">Last name</option>
            <option value="firstName">First name</option>
            <option value="status">Status</option>
          </select>
        </div> */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-6 w-full sm:w-auto">
          <FloatingInput
            className=""
            label="Search by name or email"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <button
            className="border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => setFilterPanelOpen(true)}
            type="button"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>
      {/* Filter Panel */}
      {filterPanelOpen && (
        <FilterPanel
          filter={filter}
          setFilter={handleFilterChange}
          setFilterPanelOpen={setFilterPanelOpen}
          filterOptions={{
            department: departmentOptions,
            role:
              loginUser?.user?.role === "Admin"
                ? ["Admin", "Manager", "DepartmentHead", "Employee"]
                : ["Manager", "DepartmentHead", "Employee"],
            status: ["Active", "Terminated", "Resigned", "OnLeave", "Pending"],
            employmentType: [
              "FullTime",
              "PartTime",
              "Probation",
              "Contractual",
              "Intern",
            ],
            workLocation: ["Offline", "Remote"],
          }}
          optionLabels={{
            department: departmentOptions.reduce((acc, d) => {
              acc[d.id] = d.name;
              return acc;
            }, {}),
            role: {
              DepartmentHead: "Department Head",
            },
          }}
        />
      )}

      {/* Show selected filters above the table with remove option (now using ActiveFilters) */}
      <ActiveFilters
        filter={filter}
        onRemove={(key, val) => {
          const updated = { ...filter };
          updated[key] = updated[key].filter((v) => v !== val);
          handleFilterChange(updated);
        }}
        optionLabels={{
          department: departmentOptions.reduce((acc, d) => {
            acc[d.id] = d.name;
            return acc;
          }, {}),
          role: {
            DepartmentHead: "Department Head",
          },
        }}
      />

      <div className="">
        <Table
          isLoading={isLoading || isFetching}
          data={tableData}
          columns={[
            // "Name",
            "Details",
            "Department",
            "Status",
            "Role",
            "Designation",
            "Type",
            "Actions",
          ]}
        />
      </div>

      {data?.pagination && (
        <div className="mt-6 px-4 sm:px-0">
          <Pagination
            currentCount={tableData.length}
            totalCount={data.pagination.totalDocs}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      )}

      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title={`Confirm ${
          pendingUpdate?.field?.charAt(0)?.toUpperCase() +
          pendingUpdate.field?.slice(1)
        } Change`}
      >
        <div className="space-y-4">
          <p className="font-sem">
            Are you sure you want to change this employee&apos;s{" "}
            {pendingUpdate.field} to{" "}
            <span className="font-bold text-red-600">
              {pendingUpdate.displayValue}
            </span>
            ?
          </p>
          <p>
            Type <span className="font-bold">{pendingUpdate.displayValue}</span>{" "}
            below to confirm:
          </p>
          <FloatingInput
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={`Type "${pendingUpdate.displayValue}"`}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmationModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                handleUpdate(
                  pendingUpdate.employeeId,
                  pendingUpdate.field,
                  pendingUpdate.value
                )
              }
              disabled={
                confirmationInput?.toLowerCase() !==
                pendingUpdate.displayValue?.toLowerCase()
              }
            >
              {isUpdating ? "Updating..." : "Confirm Change"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeePage;
