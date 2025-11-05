import React, { useEffect, useState } from 'react';
import { CheckCircle, MessageSquare } from 'lucide-react';
import Button from '@/component/Button';
import { FloatingTextarea } from '@/component/FloatingTextarea';
import Modal from '@/component/Modal';
import { toast } from '@/component/Toast';
import { useShortLeaveActionMutation } from '@/redux/features/shortLeave/shortLeaveApiSlice';

const ShortLeaveActionModal = ({ isOpen, onClose, leave, userRole, onSuccess }) => {
  const [shortLeaveAction, { isLoading }] = useShortLeaveActionMutation();
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!action) {
      toast.error('Error', 'Please select an action');
      return;
    }

    try {
      await shortLeaveAction({
        id: leave._id,
        role: userRole,
        action,
        comment,
        startTime: leave.startTime,
        endTime: leave.endTime,
        date: leave.date,
      }).unwrap();
      
      toast.success('Success', `Short leave ${action} successfully`);
      onSuccess();
    } catch (error) {
      toast.error('Error', error?.data?.message || 'Failed to update short leave');
    }
  };

  if (!leave) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="md" className='max-h-[80dvh]'>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckCircle size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Take Action</h2>
            <p className="text-sm text-gray-500">Approve or reject this short leave request</p>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Request Summary</h3>
          <p className="text-sm text-gray-600">
            <strong>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</strong> is requesting 
            short leave on <strong>{new Date(leave.date).toLocaleDateString()}</strong> from{' '}
            <strong>{new Date(`2000-01-01T${leave.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</strong> to{' '}
            <strong>{new Date(`2000-01-01T${leave.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</strong>{' '}
            ({leave.durationHours} hours) for: <strong>{leave.reason}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="approved"
                  checked={action === 'approved'}
                  onChange={(e) => setAction(e.target.value)}
                  className="mr-2"
                />
                <span className="text-green-700">Approve</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="rejected"
                  checked={action === 'rejected'}
                  onChange={(e) => setAction(e.target.value)}
                  className="mr-2"
                />
                <span className="text-red-700">Reject</span>
              </label>
            </div>
          </div>

          <FloatingTextarea
            label="Comment (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Add any comments about your decision..."
            icon={<MessageSquare className="h-4 w-4" />}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 
                       action === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isLoading ? 'Processing...' : `${action === 'approved' ? 'Approve' : action === 'rejected' ? 'Reject' : 'Submit'}`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ShortLeaveActionModal;
