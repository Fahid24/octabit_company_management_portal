import React, { useEffect, useState } from 'react';
import { XCircle, MessageSquare, Calendar, Clock } from 'lucide-react';
import Button from '@/component/Button';
import { FloatingTextarea } from '@/component/FloatingTextarea';
import Modal from '@/component/Modal';
import { toast } from '@/component/Toast';
import { useShortLeaveActionMutation } from '@/redux/features/shortLeave/shortLeaveApiSlice';

const ShortLeaveRejectModal = ({ isOpen, onClose, leave, userRole, onSuccess }) => {
  const [shortLeaveAction, { isLoading }] = useShortLeaveActionMutation();
  const [comment, setComment] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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
      await shortLeaveAction({
        id: leave._id,
        role: userRole,
        action: 'rejected',
        comment,
        startTime: leave.startTime,
        endTime: leave.endTime,
        date: leave.date,
      }).unwrap();
      
      toast.success('Success', 'Short leave rejected successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error', error?.data?.message || 'Failed to reject short leave');
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
            <h2 className="text-lg font-semibold text-gray-900">Reject Short Leave</h2>
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
                {leave.employeeId?.photoUrl ? (
                  <img
                    src={leave.employeeId.photoUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center">
                    <XCircle size={16} className="text-error" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{leave.departmentId?.name}</p>
                </div>
              </div>
            </div>

            {/* Time Details */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium text-gray-900">{formatDate(leave.date)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium text-error">{leave.durationHours}h</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Time:</span>
                  <p className="font-medium text-gray-900">
                    {formatTime(leave.startTime)} - {formatTime(leave.endTime)}
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
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Rejection Reason (Optional)</h3>
          </div>
          <FloatingTextarea
            label="Rejection Reason"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>

        {/* Warning */}
        <div className="bg-gradient-to-br from-error/5 to-red-50 border border-error/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-error mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-error">Important Notice</h4>
              <p className="text-sm text-gray-700 mt-1">
                This action cannot be undone. Employee will be notified immediately.
              </p>
            </div>
          </div>
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
            disabled={isLoading}
            className="bg-error hover:bg-error/90 text-white text-sm px-4 py-2"
          >
            <XCircle size={16} className="mr-2" />
            {isLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShortLeaveRejectModal;
