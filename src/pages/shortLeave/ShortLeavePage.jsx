import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  Filter,
  Plus,
  CircleAlert,
  Clock,
  User,
  Building2,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  XCircle,
  MoreVertical,
  X,
} from "lucide-react";
import { format, parseISO, isAfter, startOfMonth } from "date-fns";
import Button from "@/component/Button";
import SelectInput from "@/component/select/SelectInput";
import DateRangeSelector from "@/component/DateRangeSelector";
import Pagination from "@/component/Pagination";
import Tooltips from "@/component/Tooltip2";
import Tooltip from "@/component/Tooltip";
import Table from "@/component/Table";
import Loader from "@/component/Loader";
import ConfirmDialog from "@/component/ConfirmDialog";
import useIsMobile from "@/hook/useIsMobile";
import { toast } from "@/component/Toast";
import {
  useGetShortLeavesQuery,
  useDeleteShortLeaveMutation,
} from "@/redux/features/shortLeave/shortLeaveApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";

// Import custom components
import CreateShortLeaveModal from "./component/CreateShortLeaveModal";
import ShortLeaveDetailsModal from "./component/ShortLeaveDetailsModal";
import ShortLeaveActionModal from "./component/ShortLeaveActionModal";
import ShortLeaveApprovalModal from "./component/ShortLeaveApprovalModal";
import ShortLeaveRejectModal from "./component/ShortLeaveRejectModal";
import ShortLeaveFilters from "./component/ShortLeaveFilters";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";

const ShortLeavePage = () => {
  const isMobile = useIsMobile();
  const { user } = useSelector((state) => state.userSlice);
  const loginRole = user?.user?.role;
  const loginUserId = user?.user?._id;
  const departmentId = user?.user?.department?._id;

  const isAdmin = loginRole === "Admin";
  const isDepartmentHead = loginRole === "DepartmentHead";

  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    employeeId: [], // Both Admin and DepartmentHead use arrays
    departmentIds: [],
    startDate: "",
    endDate: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  // API calls
  const {
    data: shortLeavesData,
    isLoading,
    refetch,
  } = useGetShortLeavesQuery({
    page: page,
    limit: limit,
    userId: loginUserId,
    employeeIds: (() => {
      if (loginRole === "Employee") return [loginUserId];
      if (isAdmin || isDepartmentHead) {
        if (
          Array.isArray(filters.employeeId) &&
          filters.employeeId.length > 0
        ) {
          return filters.employeeId;
        }
      }
      return undefined;
    })(),
    departmentIds:
      filters.departmentIds.length > 0 ? filters.departmentIds : undefined,
    status: filters.status,
    role: loginRole,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 1000,
    departmentHead: isDepartmentHead ? loginUserId : undefined,
  });

  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery({
      page: 1,
      limit: 1000,
      isPopulate: true,
      departmentHead: isDepartmentHead ? loginUserId : undefined,
    });

  const [deleteShortLeave] = useDeleteShortLeaveMutation();

  // Debug pagination
  useEffect(() => {
    // console.log('Pagination Data:', shortLeavesData?.pagination);
    // console.log('Current Page:', page);
  }, [shortLeavesData?.pagination, page]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedLeaveId && !event.target.closest(".action-dropdown")) {
        setSelectedLeaveId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedLeaveId]);

  // Status options based on role
  const getStatusOptions = () => {
    const baseOptions = [
      { value: "", label: "All Status" },
      { value: "approved", label: "Approved" },
      { value: "pending_admin", label: "Pending (Admin)" },
      { value: "pending_dept_head", label: "Pending (Dept Head)" },
      { value: "rejected", label: "Rejected" },
    ];
    return baseOptions;
  };

  // Event handlers
  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleAction = (leave) => {
    setSelectedLeave(leave);
    // Use the new approval modal for Admin and DepartmentHead
    if (loginRole === "Admin" || loginRole === "DepartmentHead") {
      setShowApprovalModal(true);
    } else {
      setShowActionModal(true);
    }
  };

  const handleEdit = (leave) => {
    setSelectedLeave(leave);
    setShowCreateModal(true);
  };

  const handleDelete = async (leave) => {
    setItemToDelete(leave);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteShortLeave(itemToDelete._id).unwrap();
        toast.success("Success", "Short leave request deleted successfully");
        refetch();
        setIsDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        toast.error(
          "Error",
          error?.data?.message || "Failed to delete short leave request"
        );
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleDepartmentToggle = (departmentId) => {
    setFilters((prev) => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(departmentId)
        ? prev.departmentIds.filter((id) => id !== departmentId)
        : [...prev.departmentIds, departmentId],
    }));
    setPage(1);
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFilters((prev) => ({
      ...prev,
      startDate: startDate || "",
      endDate: endDate || "",
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      employeeId: [], // Both Admin and DepartmentHead use arrays
      departmentIds: [],
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  // Get filter display labels for active filters
  const getFilterDisplayLabel = (key, value) => {
    switch (key) {
      case "status":
        return (
          getStatusOptions().find((opt) => opt.value === value)?.label || value
        );
      case "departmentIds":
        if (Array.isArray(value) && value.length > 0) {
          return value
            .map(
              (id) =>
                departmentsData?.find((dept) => dept._id === id)
                  ?.departmentName || id
            )
            .join(", ");
        }
        return value;
      case "employeeId":
        return employeesData?.find((emp) => emp._id === value)?.name || value;
      default:
        return value;
    }
  };

  const handleSuccess = () => {
    refetch();
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setShowActionModal(false);
    setShowApprovalModal(false);
    setShowRejectModal(false);
    setIsDialogOpen(false);
    setSelectedLeave(null);
    setSelectedLeaveId(null);
    setItemToDelete(null);
  };

  // New handlers for quick actions
  const handleQuickApprove = (leave) => {
    setSelectedLeave(leave);
    setShowApprovalModal(true);
    // Close dropdown after a small delay to ensure modal opens
    setTimeout(() => setSelectedLeaveId(null), 100);
  };

  const handleQuickReject = (leave) => {
    setSelectedLeave(leave);
    setShowRejectModal(true);
    // Close dropdown after a small delay to ensure modal opens
    setTimeout(() => setSelectedLeaveId(null), 100);
  };

  // Helper functions for table
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3.5 w-3.5" />,
      },
      pending_dept_head: {
        label: "Pending (Dept Head)",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3.5 w-3.5" />,
      },
      pending_admin: {
        label: "Pending (Admin)",
        color: "bg-blue-100 text-blue-800",
        icon: <Clock className="h-3.5 w-3.5" />,
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: <Clock className="h-3.5 w-3.5" />,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}
      >
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  // Prepare data for Table component
  const leaves = shortLeavesData?.data || [];
  const pagination = shortLeavesData?.pagination || {};

  const tableData = leaves.map((item) => ({
    Employee: {
      main: `${item.employeeId?.firstName} ${item.employeeId?.lastName}`,
      sub: item.employeeId?.email,
      photo: item.employeeId?.photoUrl,
    },
    Department: item.departmentId?.name,
    Date: {
      main: formatDate(item.date),
      sub: new Date(item.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
    Time: {
      main: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
      sub: `Duration: ${item.durationHours}h`,
    },
    Status: item, // Pass the full item object instead of just status
    Actions: item,
  }));

  // Custom cell renderer for Table component
  const renderCell = (column, value) => {
    switch (column) {
      case "Employee":
        return (
          <div className="flex items-center gap-3">
            {value.photo ? (
              <img
                src={value.photo}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {value.main}
              </div>
              <div className="text-xs text-gray-500">{value.sub}</div>
            </div>
          </div>
        );
      case "Department":
        return (
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        );
      case "Date":
        return (
          <div>
            <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              {value.main}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{value.sub}</div>
          </div>
        );
      case "Time":
        return (
          <div>
            <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              {value.main}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{value.sub}</div>
          </div>
        );
      case "Reason":
        return (
          <div className="max-w-xs">
            <p className="text-sm text-gray-900 truncate" title={value}>
              {value}
            </p>
          </div>
        );
      case "Status":
        const actions = [];
        // Add actions based on role and status - similar to ManageLeavesAdminPage
        if (
          (loginRole === "Admin" &&
            (value.status === "pending_admin" ||
              value.status === "pending_dept_head")) ||
          (loginRole === "DepartmentHead" &&
            value.status === "pending_dept_head")
        ) {
          actions.push(
            <>
              <button
                onClick={() => handleQuickApprove(value)}
                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => handleQuickReject(value)}
                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </>
          );
        }

        return (
          <div className="flex items-center gap-3 whitespace-nowrap action-dropdown">
            <div className="relative flex items-center w-[32px] h-[32px] justify-center">
              {actions.length > 0 ? (
                <>
                  <button
                    onClick={() =>
                      setSelectedLeaveId(
                        selectedLeaveId === value._id ? null : value._id
                      )
                    }
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  {selectedLeaveId === value._id && (
                    <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
                      <div className="py-1">{actions}</div>
                    </div>
                  )}
                </>
              ) : (
                // invisible placeholder to keep layout consistent
                <div className="w-4 h-4" />
              )}
            </div>

            <div className="flex items-center">
              {getStatusBadge(value.status)}
            </div>
          </div>
        );
      case "Actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip text="View Details" position="left">
              <button
                onClick={() => handleViewDetails(value)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </Tooltip>

            {/* Edit button - Admin can edit anytime, others only when pending_dept_head */}
            {(loginRole === "Admin" ||
              value.status === "pending_dept_head") && (
              <Tooltip text="Edit" position="left">
                <button
                  onClick={() => handleEdit(value)}
                  className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
              </Tooltip>
            )}

            {/* Delete button - Admin can delete anytime, others only when pending_dept_head */}
            {(loginRole === "Admin" ||
              value.status === "pending_dept_head") && (
              <Tooltip text="Delete" position="left">
                <button
                  onClick={() => handleDelete(value)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        );
      default:
        return value;
    }
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="border-b border-gray-200 py-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Short Leave Management
              </h1>
              <Tooltips
                text="Manage short leave requests. Employees can request short leaves, department heads can approve/reject them, and admins have full oversight."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  size={20}
                />
              </Tooltips>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Track and manage short leave requests efficiently
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-3 py-2 text-xs md:text-sm font-medium text-white bg-primary border border-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">New Short Leave</span>
              <span className="sm:hidden">New</span>
            </Button>
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
      </div>

      <div className="py-4 md:py-6">
        {/* Filters Panel */}
        <ShortLeaveFilters
          showFilters={showFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          onDateRangeChange={handleDateRangeChange}
          onDepartmentToggle={handleDepartmentToggle}
          onClearFilters={clearFilters}
          isAdmin={isAdmin}
          isDepartmentHead={isDepartmentHead}
          departmentId={departmentId}
          loginRole={loginRole}
          departmentsData={departmentsData}
          departmentsLoading={departmentsLoading}
          employeesData={employeesData}
          getStatusOptions={getStatusOptions}
        />

        {/* Table and Pagination */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex justify-center items-center min-h-[400px]">
            <Loader />
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Clock size={28} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No short leave requests found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {Object.values(filters).some(
                (filter) =>
                  filter && (Array.isArray(filter) ? filter.length > 0 : true)
              )
                ? "Try adjusting your filters to see more results."
                : "No short leave requests have been submitted yet. Click the New Short Leave button to create your first request."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={[
                "Employee",
                "Department",
                "Date",
                "Time",
                "Status",
                "Actions",
              ]}
              data={tableData}
              renderCell={renderCell}
            />

            <div className="">
              <Pagination
                totalCount={pagination.totalCount || 0}
                currentPage={pagination.page || 1}
                setCurrentPage={setPage}
                limit={pagination.limit || 10}
                setLimit={setLimit}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Create/Edit Short Leave Modal */}
      <CreateShortLeaveModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        onSuccess={handleSuccess}
      />

      {/* Details Modal */}
      <ShortLeaveDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
      />

      {/* Action Modal */}
      <ShortLeaveActionModal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        userRole={loginRole}
        onSuccess={handleSuccess}
      />

      {/* Approval Modal for Admin/DepartmentHead */}
      <ShortLeaveApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        userRole={loginRole}
        onSuccess={handleSuccess}
      />

      {/* Reject Modal for Admin/DepartmentHead */}
      <ShortLeaveRejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        userRole={loginRole}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this short leave request for ${
          itemToDelete?.employeeId?.firstName
        } ${itemToDelete?.employeeId?.lastName} on ${
          itemToDelete?.date
            ? new Date(itemToDelete.date).toLocaleDateString()
            : "N/A"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default ShortLeavePage;
