import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Clock, Calendar } from 'lucide-react';
import Button from '@/component/Button';
import { FloatingInput } from '@/component/FloatiingInput';
import { FloatingTextarea } from '@/component/FloatingTextarea';
import Modal from '@/component/Modal';
import { toast } from '@/component/Toast';
import { useShortLeaveActionMutation } from '@/redux/features/shortLeave/shortLeaveApiSlice';

const ShortLeaveApprovalModal = ({ isOpen, onClose, leave, userRole, onSuccess }) => {
  const [shortLeaveAction, { isLoading }] = useShortLeaveActionMutation();
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');
  const [modifiedData, setModifiedData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (leave) {
      // Convert UTC date to local date
      const utcDate = new Date(leave.date);
      // Convert to local date by creating a new date in local timezone
      const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      const dateString = localDate.toISOString().split('T')[0];
      
      setModifiedData({
        date: dateString,
        startTime: leave.startTime,
        endTime: leave.endTime,
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
    setModifiedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateTime = () => {
    if (modifiedData.startTime >= modifiedData.endTime) {
      toast.error('Error', 'End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (selectedAction) => {
    if (!selectedAction) {
      toast.error('Error', 'Please select an action');
      return;
    }

    if (selectedAction === 'approved' && !validateTime()) {
      return;
    }

    try {
      await shortLeaveAction({
        id: leave._id,
        role: userRole,
        action: selectedAction,
        comment,
        // Send modified data if approved
        ...(selectedAction === 'approved' && {
          date: modifiedData.date,
          startTime: modifiedData.startTime,
          endTime: modifiedData.endTime,
        })
      }).unwrap();
      
      toast.success('Success', `Short leave ${selectedAction} successfully`);
      onSuccess();
    } catch (error) {
      toast.error('Error', error?.data?.message || 'Failed to update short leave');
    }
  };

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

  if (!leave) return null;

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-lg max-h-[80dvh]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded">
            <CheckCircle size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Short Leave</h2>
            <p className="text-sm text-gray-500">Review and approve/reject this request</p>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 mb-6 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-primary/20 rounded">
              <Calendar size={16} className="text-primary" />
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
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock size={16} className="text-primary" />
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
                  <p className="font-medium text-primary">{leave.durationHours}h</p>
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

        {/* Modification Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 mb-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-600" />
            <h3 className="text-sm font-medium text-gray-900">Modify (Optional)</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <FloatingInput
              label="Date"
              type="date"
              value={modifiedData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              // icon={<Calendar className="h-4 w-4" />}
            />
            <FloatingInput
              label="Start"
              type="time"
              value={modifiedData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              // icon={<Clock className="h-4 w-4" />}
            />
            <FloatingInput
              label="End"
              type="time"
              value={modifiedData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              // icon={<Clock className="h-4 w-4" />}
            />
          </div>
          
          {/* Show if changes were made */}
          {(() => {
            const utcDate = new Date(leave.date);
            const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
            const originalDateString = localDate.toISOString().split('T')[0];
            
            return (modifiedData.date !== originalDateString ||
                   modifiedData.startTime !== leave.startTime ||
                   modifiedData.endTime !== leave.endTime);
          })() && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Changes detected:</strong> Employee will be notified.
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Add Comment (Optional)</h3>
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
            onClick={() => handleSubmit('approved')}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white text-sm px-4 py-2"
          >
            <CheckCircle size={16} className="mr-2" />
            {isLoading ? 'Processing...' : 'Approve'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShortLeaveApprovalModal;
