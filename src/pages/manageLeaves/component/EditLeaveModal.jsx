import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, Save, Edit, User, Building2, CheckCircle, XCircle } from 'lucide-react';
import Modal from '@/component/Modal';
import Button from '@/component/Button';
import { FloatingInput } from '@/component/FloatiingInput';
import { FloatingTextarea } from '@/component/FloatingTextarea';
import SelectInput from '@/component/select/SelectInput';
import { toast } from '@/component/Toast';
import { useUpdateLeaveMutation } from '@/redux/features/manageLeaves/manageLeavesApiSlice';

const EditLeaveModal = ({ isOpen, onClose, leave, onSuccess }) => {
  const [updateLeave, { isLoading }] = useUpdateLeaveMutation();
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
    paidLeave: ''
  });

  const leaveTypeOptions = [
    { value: 'Annual', label: 'Annual Leave' },
    { value: 'Casual', label: 'Casual Leave' },
    { value: 'Medical', label: 'Medical Leave' },
  ];

  // Status badge function matching the table design
  const getStatusBadge = (status) => {
    const statusMap = {
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3" />,
      },
      pending_dept_head: {
        label: "Pending (Dept Head)",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3 w-3" />,
      },
      pending_admin: {
        label: "Pending (Admin)",
        color: "bg-blue-100 text-blue-800",
        icon: <Clock className="h-3 w-3" />,
      },
    };
    
    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: <Clock className="h-3 w-3" />,
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color} w-fit`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  // Get approval status badge
  const getApprovalBadge = (action) => {
    if (action === 'approved') {
      return (
        <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    } else if (action === 'rejected') {
      return (
        <span className="px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    }
  };

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

  // Calculate duration between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Initialize form data when leave changes
  useEffect(() => {
    if (leave) {
      setFormData({
        startDate: formatDateForInput(leave.startDate),
        endDate: formatDateForInput(leave.endDate),
        leaveType: leave.leaveType || '',
        reason: leave.reason || '',
        paidLeave: leave.paidLeave || ''
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.leaveType) {
      toast.error('Error', 'Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Error', 'Start date cannot be after end date');
      return;
    }

    if (formData.paidLeave && formData.paidLeave < 0) {
      toast.error('Error', 'Paid leave cannot be negative');
      return;
    }

    try {
      const updateData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveType: formData.leaveType,
        reason: formData.reason,
        paidLeave: Number(formData.paidLeave) || 0
      };

      await updateLeave({
        id: leave._id,
        data: updateData
      }).unwrap();

      toast.success('Success', 'Leave request updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Error', error?.data?.message || error?.data?.error || 'Failed to update leave request');
    }
  };

  const handleClose = () => {
    setFormData({
      startDate: '',
      endDate: '',
      leaveType: '',
      reason: '',
      paidLeave: ''
    });
    onClose();
  };

  if (!leave) return null;

  return (
    <Modal open={isOpen} onClose={handleClose} size="lg" className='max-h-[80dvh]'>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Edit size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Leave Request</h2>
            <p className="text-sm text-gray-500">Update leave request details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <User size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Employee Information</h3>
            </div>
            
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="flex items-center gap-3">
                {(leave.employee?.photoUrl || leave.employeeId?.photoUrl) ? (
                  <img
                    src={leave.employee?.photoUrl || leave.employeeId?.photoUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {leave.employee?.name || 
                     leave.employeeId?.name || 
                     (leave.employee?.firstName && leave.employee?.lastName ? 
                       `${leave.employee.firstName} ${leave.employee.lastName}` : 
                       leave.employeeId?.firstName && leave.employeeId?.lastName ? 
                       `${leave.employeeId.firstName} ${leave.employeeId.lastName}` : 
                       'Unknown Employee')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {leave.employee?.email || leave.employeeId?.email || 'No email available'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={12} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {leave.department?.name || leave.departmentId?.name || 'No department assigned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Leave Summary */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <Calendar size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Current Leave Details</h3>
            </div>
            
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Leave Type:</span>
                  <p className="font-medium text-primary">{leave.leaveType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium text-gray-900">
                    {leave.duration?.workingDays || calculateDuration(leave.startDate, leave.endDate)} {(leave.duration?.workingDays || calculateDuration(leave.startDate, leave.endDate)) === 1 ? 'day' : 'days'}
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
              </div>
            </div>
          </div>

          {/* Leave Details Form */}
          <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1 bg-primary/20 rounded">
                <Calendar size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Leave Details</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <SelectInput
                  label="Leave Type"
                  options={leaveTypeOptions}
                  value={leaveTypeOptions.find(opt => opt.value === formData.leaveType)}
                  onChange={(option) => handleInputChange('leaveType', option?.value || '')}
                  placeholder="Select leave type"
                  required
                />
              </div>

              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingInput
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                    // min={new Date().toISOString().split('T')[0]}
                    // icon={<Calendar className="h-4 w-4" />}
                  />

                  <FloatingInput
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                    // min={formData.startDate || new Date().toISOString().split('T')[0]}
                    // icon={<Calendar className="h-4 w-4" />}
                  />

                  <FloatingInput
                    label="Paid Leave Days"
                    type="number"
                    value={formData.paidLeave}
                    onChange={(e) => handleInputChange('paidLeave', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    Note: <strong>Unpaid leave is auto-calculated. Ensure paid leave doesn't exceed the request duration, excluding holidays and weekends.</strong>
                  </p>
                </div>

                {/* Duration Display */}
                {/* {formData.startDate && formData.endDate && (
                  <div className="mt-3 p-2 bg-primary/5 rounded text-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        Duration: {calculateDuration(formData.startDate, formData.endDate)} days
                      </span>
                    </div>
                  </div>
                )} */}
              </div>

              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <FloatingTextarea
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={3}
                  placeholder="Provide a reason for your leave request..."
                  icon={<MessageSquare className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-gradient-to-br from-primary/5 to-amber-50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <Clock size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Current Status</h3>
            </div>
            
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="space-y-3">
                {/* Approval Chain */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Overall Status */}
                  <div>
                    <span className="text-gray-500 text-sm block mb-2">Current Status:</span>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-2">Department Head:</span>
                    {getApprovalBadge(leave.deptHeadAction)}
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-2">Admin:</span>
                    {getApprovalBadge(leave.adminAction)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
            >
              {isLoading ? 'Updating...' : 'Update Request'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditLeaveModal;
