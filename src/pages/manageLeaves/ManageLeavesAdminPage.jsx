import {
  useGetLeaveStatsQuery,
  useGetLeavesQuery,
  useAdminActionMutation,
  useGetLeavesForDepartmentHeadQuery,
  useDeptHeadActionMutation,
  useDeleteLeaveMutation,
} from "@/redux/features/manageLeaves/manageLeavesApiSlice";

import {
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCcw,
  CircleAlert,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";
import LeaveTable from "./component/LeaveTable";
import { toast } from "@/component/Toast";
import Button from "@/component/Button";
import { useSelector } from "react-redux";
import Modal from "@/component/Modal";
import Loader from "@/component/Loader";
import Tooltips from "@/component/Tooltip2";
import Tooltip from "@/component/Tooltip";
import useIsMobile from "@/hook/useIsMobile";
import Pagination from "@/component/Pagination";
import { formatUTCToModalInput } from "@/utils/dateUtils";
import LeaveDetailsModal from "./component/LeaveDetailsModal";
import EditLeaveModal from "./component/EditLeaveModal";
import LeaveApprovalModal from "./component/LeaveApprovalModal";
import LeaveRejectModal from "./component/LeaveRejectModal";
import ConfirmDialog from "@/component/ConfirmDialog";
import LeaveFilterSection from "./component/LeaveFilterSection";

const statusMap = {
  pending_dept_head: {
    label: "Pending Dept Head",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  pending_admin: {
    label: "Pending Admin",
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

const ManageLeaves = () => {
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const loginUser = useSelector((state) => state.userSlice.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

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
  const {
    data: leavesData,
    isLoading: leavesLoading,
    isFetching,
    refetch,
  } = useGetLeavesQuery({
    page: currentPage,
    limit,
    employeeIds: selectedEmployee?.value ? [selectedEmployee.value] : undefined,
    departmentIds: selectedDepartment?.value
      ? [selectedDepartment.value]
      : undefined,
    status: selectedStatus?.value || undefined,
    leaveType: selectedLeaveType?.value || undefined,
    year: selectedYear || undefined,
  });
  const [adminAction] = useAdminActionMutation();
  const [deptHeadAction] = useDeptHeadActionMutation();
  const [deleteLeave, { isLoading: deleteLeaveLoading }] =
    useDeleteLeaveMutation();

  const handleAdminAction = async (leave, action, comment = "") => {
    try {
      let payload = {
        leaveId: leave._id,
        adminId: loginUser?.user?._id,
        action,
        comment,
      };
      if (action === "approved") {
        payload.startDate = editDates.startDate || leave.startDate;
        payload.endDate = editDates.endDate || leave.endDate;
      }

      // await deptHeadAction(payload).unwrap();
      if (action === "rejected") {
        payload = {
          ...payload,
          deptHeadAction: "rejected",
          deptHeadId: loginUser?.user?._id,
        };
      } else {
        await adminAction(payload).unwrap();
      }

      toast.success("Success", `Leave ${action} by admin`);
      setSelectedLeaveId(null);
      setCommentModal({ open: false, leave: null, action: null });
      setCommentText("");
      setEditDates({ startDate: "", endDate: "" });
      refetch();
    } catch (err) {
      toast.error("Error", err?.data?.message || `Failed to ${action} leave`);
    }
  };

  // New action handlers for view, edit, delete
  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleEdit = (leave) => {
    setSelectedLeave(leave);
    setShowEditModal(true);
  };

  const handleDelete = (leave) => {
    setItemToDelete(leave);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteLeave(itemToDelete._id).unwrap();
        toast.success("Success", "Leave request deleted successfully");
        refetch();
        setIsDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        toast.error(
          "Error",
          error?.data?.message || "Failed to delete leave request"
        );
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSuccess = () => {
    refetch();
    setShowDetailsModal(false);
    setShowEditModal(false);
    setSelectedLeave(null);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedDepartment(null);
    setSelectedRole(null);
    setSelectedEmployee(null);
    setSelectedYear(new Date().getFullYear());
    setSelectedStatus(null);
    setSelectedLeaveType(null);
    setCurrentPage(1);
  };

  // Quick approve handler
  const handleQuickApprove = (leave) => {
    setSelectedLeave(leave);
    setShowApprovalModal(true);
  };

  // Quick reject handler
  const handleQuickReject = (leave) => {
    setSelectedLeave(leave);
    setShowRejectModal(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    refetch();
    setShowApprovalModal(false);
    setShowRejectModal(false);
    setSelectedLeave(null);
  };

  if (leavesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold leading-tight text-gray-900">
              Time Off Requests Management
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="Review and manage all employee leave requests.
Track pending, approved, and rejected leaves at a glance.
View approval status from department heads and admins.
Easily process, approve, or reject time off requests."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage employee Time Off requests and approvals
          </p>
        </div>
        <div>
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
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedLeaveType={selectedLeaveType}
        setSelectedLeaveType={setSelectedLeaveType}
        onResetFilters={handleResetFilters}
        loginUser={loginUser}
        showLeaveType={true}
        showStatus={true}
        showFilters={showFilters}
      />

      <div className="p-0">
        <LeaveTable
          leavesData={leavesData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          leavesLoading={leavesLoading}
          isFetching={isFetching}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onQuickApprove={handleQuickApprove}
          onQuickReject={handleQuickReject}
          selectedLeaveId={selectedLeaveId}
          setSelectedLeaveId={setSelectedLeaveId}
          loginRole={loginUser?.user?.role}
          loginUserId={loginUser?.user?._id}
        />
      </div>

      {/* Leave Approval Modal */}
      <LeaveApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        userRole={loginUser?.user?.role}
        onSuccess={handleModalSuccess}
      />

      {/* Leave Reject Modal */}
      <LeaveRejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        userRole={loginUser?.user?.role}
        onSuccess={handleModalSuccess}
      />

      {/* Leave Details Modal */}
      <LeaveDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
      />

      {/* Edit Leave Modal */}
      <EditLeaveModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this leave request for ${itemToDelete?.employeeId?.firstName} ${itemToDelete?.employeeId?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteLeaveLoading}
      />
    </div>
  );
};

export default ManageLeaves;
