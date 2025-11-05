import React from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Table from "@/component/Table";
import Pagination from "@/component/Pagination";
import Tooltip from "@/component/Tooltip";
import Loader from "@/component/Loader";

const LeaveTable = ({
  tableData,
  leavesData,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  leavesLoading,
  isFetching,
  onViewDetails,
  onEdit,
  onDelete,
  onQuickApprove,
  onQuickReject,
  selectedLeaveId,
  setSelectedLeaveId,
  loginRole,
  loginUserId,
}) => {
  // Helper functions for formatting
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${startStr} - ${endStr}`;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  // Prepare data for custom table rendering
  const preparedTableData = (leavesData?.data || []).map((leave) => ({
    Employee: {
      main: `${leave.employee?.firstName || leave.employeeId?.firstName || ''} ${leave.employee?.lastName || leave.employeeId?.lastName || ''}`.trim(),
      sub: leave.employee?.email || leave.employeeId?.email || '',
      photo: leave.employee?.photoUrl || leave.employeeId?.photoUrl,
    },
    Department: leave.department?.name || leave.departmentId?.name || 'No Department',
    "Leave Type": leave.leaveType,
    "Leave Period": {
      main: formatDateRange(leave.startDate, leave.endDate),
      sub: `${leave.duration?.workingDays || calculateDuration(leave.startDate, leave.endDate)} ${leave.duration?.workingDays === 1 || calculateDuration(leave.startDate, leave.endDate) === 1 ? 'day' : 'days'}`,
      paid: leave.paidLeave || 0,
      unpaid: leave.unpaidLeave || 0,
    },
    Status: leave, // Pass the full leave object for status rendering
    Actions: leave, // Pass the full leave object for actions
  }));

  // Custom cell renderer
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
              <div className="text-sm font-medium text-gray-900">{value.main}</div>
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
      case "Leave Type":
        return (
          <div className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
            {value}
          </div>
        );
      case "Leave Period":
        return (
          <div>
            <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              {value.main}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                {value.sub}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip text="Paid Leave: Days covered by company with full salary" position="top">
                  <div className="flex items-center gap-1 cursor-help">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700">
                      {value.paid}
                    </span>
                  </div>
                </Tooltip>
              </div>
              <Tooltip text="Unpaid Leave: Days without salary compensation" position="top">
                <div className="flex items-center gap-1 cursor-help">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-700">
                    {value.unpaid}
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        );
      case "Status":
        const actions = [];
        // Add quick actions based on role and status
        if (((loginRole === 'Admin' && (value.status === 'pending_admin' || value.status === 'pending_dept_head')) ||
             (loginRole === 'DepartmentHead' && value.status === 'pending_dept_head'))) {
          actions.push(
            <>
              <button
                onClick={() => onQuickApprove?.(value)}
                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => onQuickReject?.(value)}
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
                      setSelectedLeaveId?.(
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
                onClick={() => onViewDetails?.(value)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </Tooltip>
            
            {/* Edit button for appropriate roles */}
            {((loginRole === 'Employee' && (value.employee?._id === loginUserId || value.employeeId?._id === loginUserId) && value.status === 'pending_dept_head') ||
              (loginRole === 'Admin' || loginRole === 'DepartmentHead')) && (
              <Tooltip text="Edit" position="left">
                <button
                  onClick={() => onEdit?.(value)}
                  className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
              </Tooltip>
            )}
            
            {/* Delete button for appropriate roles */}
            {((loginRole === 'Employee' && (value.employee?._id === loginUserId || value.employeeId?._id === loginUserId) && value.status === 'pending_dept_head') ||
              (loginRole === 'Admin' || loginRole === 'DepartmentHead')) && (
              <Tooltip text="Delete" position="left">
                <button
                  onClick={() => onDelete?.(value)}
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
    <div className="p-0">
      {preparedTableData.length > 0 || leavesLoading || isFetching ? (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={[
                "Employee",
                "Department",
                "Leave Type",
                "Leave Period",
                "Status",
                "Actions",
              ]}
              data={preparedTableData}
              isLoading={leavesLoading || isFetching}
              renderCell={renderCell}
            />
          </div>
         
          {preparedTableData.length > 0 && !leavesLoading && !isFetching && (
            <div className="mt-0 py-3">
              <Pagination
                totalCount={leavesData?.pagination?.totalCount || leavesData?.pagination?.totalDocs || 0}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No leave requests found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            No leave requests have been submitted yet.
          </p>
        </div>
      )}
    </div>
  );
};

LeaveTable.propTypes = {
  tableData: PropTypes.array,
  leavesData: PropTypes.object,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  leavesLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  onViewDetails: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onQuickApprove: PropTypes.func,
  onQuickReject: PropTypes.func,
  selectedLeaveId: PropTypes.string,
  setSelectedLeaveId: PropTypes.func,
  loginRole: PropTypes.string,
  loginUserId: PropTypes.string,
};

export default LeaveTable;
