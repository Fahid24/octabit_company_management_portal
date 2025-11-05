import { useSelector } from "react-redux";
import { useState } from "react";
import {
  useGetLeavesByUserIdQuery,
  useDeleteLeaveMutation,
} from "@/redux/features/manageLeaves/manageLeavesApiSlice";
import Pagination from "@/component/Pagination";
import Loader from "@/component/Loader";
import Error from "@/component/Error";
import Modal from "@/component/Modal";
import Button from "@/component/Button";
import Table from "@/component/Table";
import LeaveRequestForm from "@/pages/manageLeaves/component/LeaveRequestForm";
import LeaveDetailsModal from "./component/LeaveDetailsModal";
import EditLeaveModal from "./component/EditLeaveModal";
import ConfirmDialog from "@/component/ConfirmDialog";
import LeaveFilterSection from "./component/LeaveFilterSection";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Plus,
  CircleAlert,
  Edit,
  Trash2,
  RotateCcw,
  Filter,
} from "lucide-react";
import Tooltip from "@/component/Tooltip";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook
import YearlyLeaveStats from "./component/YearlyLeaveStats";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import { toast } from "@/component/Toast";

const UserLeaveRequestsPage = () => {
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const { user } = useSelector((state) => state.userSlice);
  const userId = user?.user?._id;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null); // Track selected leave for viewing

  // Filter states
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [modals, setModals] = useState({
    viewDetails: false,
    edit: false,
    delete: false,
  });

  const [deleteLeave, { isLoading: deleteLeaveLoading }] =
    useDeleteLeaveMutation();

  // Action handlers
  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setModals((prev) => ({ ...prev, viewDetails: true }));
  };

  const handleEdit = (leave) => {
    const userRole = user?.user?.role;

    // Admin can edit at any time
    if (userRole === "Admin") {
      setSelectedLeave(leave);
      setModals((prev) => ({ ...prev, edit: true }));
      return;
    }

    // Other users can only edit when status is pending_dept_head (no approval action taken yet)
    if (leave.status !== "pending_dept_head") {
      toast.error(
        "Cannot edit this leave request. Only pending requests (before any approval) can be edited."
      );
      return;
    }

    setSelectedLeave(leave);
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const handleDelete = (leave) => {
    const userRole = user?.user?.role;

    // Admin can delete at any time
    if (userRole === "Admin") {
      setSelectedLeave(leave);
      setModals((prev) => ({ ...prev, delete: true }));
      return;
    }

    // Other users can only delete when status is pending_dept_head (no approval action taken yet)
    if (leave.status !== "pending_dept_head") {
      toast.error(
        "Cannot delete this leave request. Only pending requests (before any approval) can be deleted."
      );
      return;
    }

    setSelectedLeave(leave);
    setModals((prev) => ({ ...prev, delete: true }));
  };

  const confirmDelete = async () => {
    if (!selectedLeave) return;
    try {
      await deleteLeave(selectedLeave._id).unwrap();
      toast.success("Leave request deleted successfully");
      setModals((prev) => ({ ...prev, delete: false }));
      setSelectedLeave(null);
      await refetch(); // refresh list after delete
    } catch (error) {
      toast.error(error?.data?.error || "Failed to delete leave request");
    }
  };

  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedStatus(null);
    setSelectedLeaveType(null);
    setPage(1);
  };

  const { data, isLoading, error } = useGetLeavesByUserIdQuery(
    {
      userId,
      page,
      limit,
      year: selectedYear,
      status: selectedStatus?.value,
      leaveType: selectedLeaveType?.value,
    },
    { skip: !userId }
  );
  const { data: configData, isLoading: isConfigLoading } =
    useGetAdminConfigQuery();

  if (!userId) return <Error message="User not found." />;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error)
    return (
      <Error message={error?.data?.error || "Failed to load leave requests."} />
    );

  const leaves = data?.data || [];
  const pagination = data?.pagination || {};

  // Function to format status text
  const formatStatusText = (status) => {
    if (!status) return status;

    if (status.includes("_")) {
      const parts = status.split("_");
      const firstPart = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const secondPart = parts
        .slice(1)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      return `${firstPart} (${secondPart})`;
    }

    // For single words, just capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Status badge (styled like admin)
  const getStatusBadge = (status) => {
    const map = {
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
    };
    const s = map[status] || {
      label: formatStatusText(status),
      color: "",
      icon: <Clock className="h-3.5 w-3.5" />,
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 w-fit ${s.color}`}
      >
        {s.icon}
        {s.label}
      </span>
    );
  };

  // Prepare data for Table component
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Add 1 to include both start and end dates
    return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const tableData = leaves.map((req) => {
    const duration =
      req?.duration?.workingDays ||
      calculateDuration(req.startDate, req.endDate);
    return {
      Type: (
        <div className="font-medium text-gray-900 whitespace-nowrap">
          {req.leaveType}
        </div>
      ),
      Dates: {
        main: `${new Date(req.startDate).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${new Date(req.endDate).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
        sub: new Date(req.startDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      },
      Duration: (
        <div className="flex flex-roe gap-2 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {duration} {duration === 1 ? "day" : "days"}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip
              text="Paid Leave: Days covered by company with full salary"
              position="top"
            >
              <div className="flex items-center gap-1 cursor-help">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700">
                  {req.paidLeave || 0}
                </span>
              </div>
            </Tooltip>
            <Tooltip
              text="Unpaid Leave: Days without salary compensation"
              position="top"
            >
              <div className="flex items-center gap-1 cursor-help">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-700">
                  {req.unpaidLeave || 0}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>
      ),
      Status: req.status, // Pass raw status for badge rendering
      Approvals: {
        deptHeadAction: req.deptHeadAction,
        adminAction: req.adminAction,
      },

      Actions: req, // Pass the whole request for the view button
    };
  });
  // Custom cell renderer for Table component
  const renderCell = (column, value) => {
    switch (column) {
      case "Dates":
        return (
          <div>
            <div className="text-sm text-gray-700 font-semibold">
              {value.main}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{value.sub}</div>
          </div>
        );
      case "Status":
        return getStatusBadge(value);
      case "Approvals":
        return (
          <div className="flex flex-col gap-1.5 overflow-x-auto">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  value.deptHeadAction === "approved"
                    ? "bg-green-500"
                    : value.deptHeadAction === "rejected"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <span className="text-xs text-gray-600 font-semibold">
                Dept. Head:{" "}
                {value.deptHeadAction
                  ? value.deptHeadAction.charAt(0).toUpperCase() +
                    value.deptHeadAction.slice(1)
                  : "Pending"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  value.adminAction === "approved"
                    ? "bg-green-500"
                    : value.adminAction === "rejected"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <span className="text-xs text-gray-600 font-semibold">
                Admin:{" "}
                {value.adminAction
                  ? value.adminAction.charAt(0).toUpperCase() +
                    value.adminAction.slice(1)
                  : "Pending"}
              </span>
            </div>
          </div>
        );
      case "Actions":
        const userRole = user?.user?.role;
        const canEditDelete =
          userRole === "Admin" || value.status === "pending_dept_head";

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

            {canEditDelete && (
              <>
                <Tooltip text="Edit" position="left">
                  <button
                    onClick={() => handleEdit(value)}
                    className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                </Tooltip>

                <Tooltip text="Delete" position="left">
                  <button
                    onClick={() => handleDelete(value)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        );
      default:
        return value;
    }
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold leading-tight text-gray-900">
              My Time Off Requests
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="View all your submitted time off requests in one place.
Track approval status from department head and admin.
See details for approved, pending, and rejected requests.
Easily add new leave requests and monitor your leave history."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track your time off requests
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            className="bg-primary hover:bg-primary/90"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Request</span>
            </div>
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
      {/* Filter Section */}
      <LeaveFilterSection
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedLeaveType={selectedLeaveType}
        setSelectedLeaveType={setSelectedLeaveType}
        onResetFilters={handleResetFilters}
        loginUser={user}
        showDepartment={false}
        showEmployee={false}
        showLeaveType={true}
        showStatus={true}
        showFilters={showFilters}
      />
      {/* Stats summary cards */}
      {/*
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">14 days</p>
              <p className="text-xs text-primary mt-1 flex items-center">
                Based on company policy
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={20} />
            </div>
          </div>
        </div>
        <div className="col-span-1 bg-gradient-to-r from-primary to-primary text-white rounded-xl p-5 border border-primary shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white">Leaves Taken</p>
              <p className="text-3xl font-bold mt-1">
                {leaves.filter((l) => l.status === "Approved").length} days
              </p>
              <p className="text-xs text-white mt-1">This year so far</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
        <div className="col-span-1 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-3xl font-bold text-amber-500 mt-1">
                {leaves.filter((l) => l.status === "Pending").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
          </div>
        </div>
      </div>
      */}
      {/* New Stats summary cards based on provided data */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

        <div className="col-span-1 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {leaves.length}
              </p>
              <p className="text-xs text-primary mt-1 flex items-center">
                All time
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-green-100 text-green-800 rounded-xl p-5 border border-green-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm">Approved Days</p>
              <p className="text-3xl font-bold mt-1">
                {leaves
                  .filter((l) => l.status === "approved")
                  .reduce(
                    (acc, l) =>
                      acc +
                      (Math.floor(
                        (new Date(l.endDate) - new Date(l.startDate)) /
                          (1000 * 60 * 60 * 24)
                      ) +
                        1),
                    0
                  )}
                <span className="text-base font-normal ml-1">days</span>
              </p>
              <p className="text-xs mt-1">This year so far</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-yellow-100 text-yellow-800 rounded-xl p-5 border border-yellow-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm">Pending Requests</p>
              <p className="text-3xl font-bold mt-1">
                {
                  leaves.filter(
                    (l) =>
                      l.status === "pending_dept_head" ||
                      l.status === "pending_admin"
                  ).length
                }
              </p>
              <p className="text-xs mt-1">Awaiting approval</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-200 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-red-100 text-red-800 rounded-xl p-5 border border-red-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm">Rejected Requests</p>
              <p className="text-3xl font-bold mt-1">
                {leaves.filter((l) => l.status === "rejected").length}
              </p>
              <p className="text-xs mt-1">This year so far</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
              <XCircle size={20} />
            </div>
          </div>
        </div>
      </div> */}
      <YearlyLeaveStats
        leaveStats={data?.leaveStats}
        configData={configData}
        selectedYear={selectedYear}
      />
      {/* Leave requests list */}{" "}
      {leaves.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No leave requests found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            You haven&apos;t submitted any leave requests yet. Click the Add
            Request button to create your first request.
          </p>
          {/* <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            className="bg-primary hover:bg-primary/90"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <span>New Leave Request</span>
            </div>
          </Button> */}
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Use the Table component */}
          <Table
            columns={[
              "Type",
              "Dates",
              "Duration",
              "Status",
              "Approvals",
              "Actions",
            ]}
            data={tableData}
            isLoading={isLoading}
            renderCell={renderCell}
          />

          <div className="">
            <Pagination
              totalCount={pagination.totalDocs || 0}
              currentPage={pagination.page || 1}
              setCurrentPage={setPage}
              limit={pagination.limit || 10}
              setLimit={setLimit}
            />
          </div>
        </div>
      )}{" "}
      {/* Approved leaves section */}
      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLeave(null);
        }}
        className="p-0 max-w-xl rounded-xl overflow-hidden"
      >
        {selectedLeave ? (
          <div>
            <div className="bg-form-header-gradient text-gray-800 p-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar size={20} />
                Leave Request Details
              </h2>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <span className="font-semibold">Type:</span>{" "}
                {selectedLeave.leaveType}
              </div>
              <div>
                <span className="font-semibold">Dates:</span>{" "}
                {new Date(selectedLeave.startDate).toLocaleDateString()} -{" "}
                {new Date(selectedLeave.endDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Duration:</span>{" "}
                {calculateDuration(
                  selectedLeave.startDate,
                  selectedLeave.endDate
                )}{" "}
                days
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                {getStatusBadge(selectedLeave.status)}
              </div>
              <div>
                <span className="font-semibold">Reason:</span>{" "}
                {selectedLeave.reason || "-"}
              </div>
              <div>
                <span className="font-semibold">Department:</span>{" "}
                {selectedLeave.departmentId?.name}
              </div>
              <div>
                <span className="font-semibold">
                  Dept. Head{selectedLeave.deptHeadIds?.length > 1 ? "s" : ""}:
                </span>{" "}
                {Array.isArray(selectedLeave.deptHeadIds) &&
                selectedLeave.deptHeadIds.length > 0 ? (
                  selectedLeave.deptHeadIds.map((head, index) => (
                    <span key={head._id || index}>
                      {head.firstName} {head.lastName} ({head.email})
                      {index < selectedLeave.deptHeadIds.length - 1 ? ", " : ""}
                    </span>
                  ))
                ) : (
                  <span className="italic text-gray-500">N/A</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Dept. Head Action:</span>{" "}
                {selectedLeave.deptHeadAction || "Pending"}
              </div>
              <div>
                <span className="font-semibold">Dept. Head Comment:</span>{" "}
                {selectedLeave.deptHeadComment || "-"}
              </div>
              <div>
                <span className="font-semibold">Dept. Head Action At:</span>{" "}
                {selectedLeave.deptHeadActionAt
                  ? new Date(selectedLeave.deptHeadActionAt).toLocaleString()
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">Admin:</span>{" "}
                {selectedLeave.adminId
                  ? `${selectedLeave.adminId.firstName} ${selectedLeave.adminId.lastName} (${selectedLeave.adminId.email})`
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">Admin Action:</span>{" "}
                {selectedLeave.adminAction || "Pending"}
              </div>
              <div>
                <span className="font-semibold">Admin Comment:</span>{" "}
                {selectedLeave.adminComment || "-"}
              </div>
              <div>
                <span className="font-semibold">Admin Action At:</span>{" "}
                {selectedLeave.adminActionAt
                  ? new Date(selectedLeave.adminActionAt).toLocaleString()
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">Created At:</span>{" "}
                {selectedLeave.createdAt
                  ? new Date(selectedLeave.createdAt).toLocaleString()
                  : "-"}
              </div>
              {/* All info and comments are shown above */}
            </div>
          </div>
        ) : (
          <div>
            <LeaveRequestForm hideLayout onClose={() => setModalOpen(false)} />
          </div>
        )}
      </Modal>
      {/* View Details Modal */}
      {selectedLeave && (
        <LeaveDetailsModal
          isOpen={modals.viewDetails}
          onClose={() => {
            setModals((prev) => ({ ...prev, viewDetails: false }));
            setSelectedLeave(null);
          }}
          leave={selectedLeave}
        />
      )}
      {/* Edit Modal */}
      {selectedLeave && (
        <EditLeaveModal
          isOpen={modals.edit}
          onClose={() => {
            setModals((prev) => ({ ...prev, edit: false }));
            setSelectedLeave(null);
          }}
          leave={selectedLeave}
        />
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={modals.delete} // changed from isOpen
        title="Delete Leave Request"
        message={`Are you sure you want to delete this leave request?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          // replaces onClose
          setModals((prev) => ({ ...prev, delete: false }));
          setSelectedLeave(null);
        }}
        isLoading={deleteLeaveLoading}
      />
    </div>
  );
};

export default UserLeaveRequestsPage;
