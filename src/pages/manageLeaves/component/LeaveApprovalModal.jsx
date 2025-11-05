import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  MessageSquare,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Modal from "@/component/Modal";
import { toast } from "@/component/Toast";
import {
  useAdminActionMutation,
  useDeptHeadActionMutation,
} from "@/redux/features/manageLeaves/manageLeavesApiSlice";

const LeaveApprovalModal = ({
  isOpen,
  onClose,
  leave,
  userRole,
  onSuccess,
}) => {
  const [adminAction, { isLoading: adminLoading }] = useAdminActionMutation();
  const [deptHeadAction, { isLoading: deptHeadLoading }] =
    useDeptHeadActionMutation();
  const [comment, setComment] = useState("");
  const [modifiedData, setModifiedData] = useState({
    startDate: "",
    endDate: "",
    paidLeave: "",
  });

  const isLoading = adminLoading || deptHeadLoading;

  // Format date for input field (YYYY-MM-DD) - adjusts for timezone display
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Create date object from the UTC string
    const date = new Date(dateString);
    
    // Get year, month, and day components in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Format as YYYY-MM-DD
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (leave) {
      setModifiedData({
        startDate: formatDateForInput(leave.startDate),
        endDate: formatDateForInput(leave.endDate),
        paidLeave: leave.paidLeave || "",
      });
    }
  }, [leave]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setModifiedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateDates = () => {
    if (new Date(modifiedData.startDate) > new Date(modifiedData.endDate)) {
      toast.error("Error", "End date must be after start date");
      return false;
    }
    if (modifiedData.paidLeave < 0) {
      toast.error("Error", "Paid leave cannot be negative");
      return false;
    }
    return true;
  };

  const calculateDuration = () => {
    const start = new Date(modifiedData.startDate);
    const end = new Date(modifiedData.endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!validateDates()) {
      return;
    }

    try {
      const actionData = {
        leaveId: leave._id,
        action: "approved",
        comment,
        startDate: modifiedData.startDate,
        endDate: modifiedData.endDate,
        paidLeave: Number(modifiedData.paidLeave),
      };

      console.log("Action Data:", actionData);

      if (userRole === "Admin") {
        await adminAction(actionData).unwrap();
      } else if (userRole === "DepartmentHead") {
        await deptHeadAction(actionData).unwrap();
      }

      toast.success("Success", `Leave approved successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error", error?.data?.message || error?.data?.error || "Failed to approve leave");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!leave) return null;

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-2xl max-h-[80dvh]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded">
            <CheckCircle size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Approve Leave Request
            </h2>
            <p className="text-sm text-gray-500">
              Review and approve this leave request
            </p>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 mb-6 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-primary/20 rounded">
              <Calendar size={16} className="text-primary" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Request Details
            </h3>
          </div>

          <div className="space-y-3">
            {/* Employee Info */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="flex items-center gap-3">
                {leave.employee?.photoUrl || leave.employeeId?.photoUrl ? (
                  <img
                    src={leave.employee?.photoUrl || leave.employeeId?.photoUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {leave.employee?.firstName || leave.employeeId?.firstName}{" "}
                    {leave.employee?.lastName || leave.employeeId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {leave.department?.name || leave.departmentId?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Leave Type:</span>
                  <p className="font-medium text-primary">{leave.leaveType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium text-gray-900">
                    {leave.duration?.workingDays} {leave.duration?.workingDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Paid Leave:</span>
                  <p className="font-medium text-green-600">
                    {leave.paidLeave || 0} days
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Unpaid Leave:</span>
                  <p className="font-medium text-red-600">
                    {leave.unpaidLeave || 0} days
                  </p>
                </div>
                <div className="col-span-4">
                  <span className="text-gray-500">Period:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <span className="text-sm text-gray-500">Reason:</span>
              <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                {leave.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Modification Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 mb-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-600" />
            <h3 className="text-sm font-medium text-gray-900">
              Modify Leave Details (Optional)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <FloatingInput
              label="Start Date"
              type="date"
              value={modifiedData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              // icon={<Calendar className="h-4 w-4" />}
            />
            <FloatingInput
              label="End Date"
              type="date"
              value={modifiedData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              // icon={<Calendar className="h-4 w-4" />}
            />
            <FloatingInput
              label="Paid Leave Days"
              type="number"
              value={modifiedData.paidLeave}
              onChange={(e) => handleInputChange("paidLeave", e.target.value)}
            />
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500 mt-1">
              Note: <strong>Unpaid leave is auto-calculated. Ensure paid leave doesn’t exceed the request duration, excluding holidays and weekends.</strong>
            </p>
          </div>

          {/* Show duration */}
          {/* <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <strong>Duration:</strong> {calculateDuration()} days
          </div> */}

          {/* Show if changes were made */}
          {(() => {
            const originalStart = new Date(leave.startDate)
              .toISOString()
              .split("T")[0];
            const originalEnd = new Date(leave.endDate)
              .toISOString()
              .split("T")[0];

            return (
              modifiedData.startDate !== originalStart ||
              modifiedData.endDate !== originalEnd ||
              modifiedData.paidLeave !== (leave.paidLeave || 0)
            );
          })() && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mt-3">
              <strong>Changes detected:</strong> Employee will be notified of
              the modified leave details.
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">
              Add Comment (Optional)
            </h3>
          </div>
          <FloatingTextarea
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-sm px-4 py-2"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white text-sm px-4 py-2"
          >
            <CheckCircle size={16} className="mr-2" />
            {isLoading ? "Approving..." : "Approve Leave"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveApprovalModal;
