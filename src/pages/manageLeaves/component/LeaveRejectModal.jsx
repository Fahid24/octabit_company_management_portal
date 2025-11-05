import React, { useEffect, useState } from 'react';
import { XCircle, MessageSquare, Calendar, User } from 'lucide-react';
import Button from '@/component/Button';
import { FloatingTextarea } from '@/component/FloatingTextarea';
import Modal from '@/component/Modal';
import { toast } from '@/component/Toast';
import { useAdminActionMutation, useDeptHeadActionMutation } from '@/redux/features/manageLeaves/manageLeavesApiSlice';

const LeaveRejectModal = ({ isOpen, onClose, leave, userRole, onSuccess }) => {
  const [adminAction, { isLoading: adminLoading }] = useAdminActionMutation();
  const [deptHeadAction, { isLoading: deptHeadLoading }] = useDeptHeadActionMutation();
  const [comment, setComment] = useState('');

  const isLoading = adminLoading || deptHeadLoading;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const handleReject = async () => {
    try {
      const actionData = {
        leaveId: leave._id,
        action: 'rejected',
        comment,
        startDate: leave.startDate,
        endDate: leave.endDate,
      };

      if (userRole === 'Admin') {
        await adminAction(actionData).unwrap();
      } else if (userRole === 'DepartmentHead') {
        await deptHeadAction(actionData).unwrap();
      }
      
      toast.success('Success', 'Leave rejected successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error', error?.data?.message || error?.data?.error || 'Failed to reject leave');
    }
  };

  if (!leave) return null;

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-lg max-h-[80dvh]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-error/10 rounded">
            <XCircle size={20} className="text-error" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reject Leave Request</h2>
            <p className="text-sm text-gray-500">Are you sure you want to reject this request?</p>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-gradient-to-br from-error/5 to-red-50 rounded-lg p-4 mb-6 border border-error/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-error/20 rounded">
              <XCircle size={16} className="text-error" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Request Details</h3>
          </div>
          
          <div className="space-y-3">
            {/* Employee Info */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="flex items-center gap-3">
                {(leave.employee?.photoUrl || leave.employeeId?.photoUrl) ? (
                  <img
                    src={leave.employee?.photoUrl || leave.employeeId?.photoUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center">
                    <User size={16} className="text-error" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {leave.employee?.firstName || leave.employeeId?.firstName} {leave.employee?.lastName || leave.employeeId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{leave.department?.name || leave.departmentId?.name}</p>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
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
                <div className="col-span-2">
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
              <p className="text-sm text-gray-900 mt-1 leading-relaxed">{leave.reason}</p>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Add Comment (Required)</h3>
          </div>
          <FloatingTextarea
            label="Please provide a reason for rejection"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            // icon={<MessageSquare className="h-4 w-4" />}
            required
          />
          {!comment.trim() && (
            <p className="text-sm text-gray-500 mt-2">
              A comment explaining the reason for rejection is required.
            </p>
          )}
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
            onClick={handleReject}
            disabled={isLoading || !comment.trim()}
            className="bg-error hover:bg-error/90 text-white text-sm px-4 py-2"
          >
            <XCircle size={16} className="mr-2" />
            {isLoading ? 'Rejecting...' : 'Reject Leave'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveRejectModal;
