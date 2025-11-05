import React, { useEffect } from 'react';
import { User, Building2, Clock, CheckCircle, Eye, XCircle, Calendar } from 'lucide-react';
import Button from '@/component/Button';
import Modal from '@/component/Modal';

const ShortLeaveDetailsModal = ({ isOpen, onClose, leave }) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_dept_head':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!leave) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="md" className='max-h-[80dvh]'>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <Eye size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Short Leave Details</h2>
              <p className="text-sm text-gray-500">View short leave request information</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Employee Information */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <User size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Employee Information</h3>
            </div>
            
            <div className="bg-white/80 rounded-lg p-3 border border-white/50">
              <div className="flex items-center gap-3">
                {leave.employeeId?.photoUrl ? (
                  <img
                    src={leave.employeeId.photoUrl}
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
                    {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{leave.employeeId?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={12} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{leave.departmentId?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <Clock size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Leave Details</h3>
            </div>
            
            <div className="space-y-3">
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
                  <div>
                    <span className="text-gray-500">Start:</span>
                    <p className="font-medium text-gray-900">{formatTime(leave.startTime)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span>
                    <p className="font-medium text-gray-900">{formatTime(leave.endTime)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <span className="text-sm text-gray-500">Reason:</span>
                <p className="text-sm text-gray-900 mt-1 leading-relaxed">{leave.reason}</p>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="bg-gradient-to-br from-primary/5 to-amber-50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <CheckCircle size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Approval History</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${
                      leave.deptHeadAction === 'approved' ? 'bg-primary/20' :
                      leave.deptHeadAction === 'rejected' ? 'bg-error/20' :
                      'bg-warning/20'
                    }`}>
                      {leave.deptHeadAction === 'approved' ? (
                        <CheckCircle size={16} className="text-primary" />
                      ) : leave.deptHeadAction === 'rejected' ? (
                        <XCircle size={16} className="text-error" />
                      ) : (
                        <Clock size={16} className="text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Department Head</p>
                      <p className="text-sm text-gray-600">
                        {leave.deptHeadAction ? 
                          `${leave.deptHeadAction.charAt(0).toUpperCase() + leave.deptHeadAction.slice(1)} on ${new Date(leave.deptHeadActionAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 
                          'Pending review'
                        }
                      </p>
                      {leave.deptHeadComment && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 italic">
                          "{leave.deptHeadComment}"
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    leave.deptHeadAction === 'approved' ? 'bg-primary/20 text-primary' :
                    leave.deptHeadAction === 'rejected' ? 'bg-error/20 text-error' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {leave.deptHeadAction ? leave.deptHeadAction.charAt(0).toUpperCase() + leave.deptHeadAction.slice(1) : 'Pending'}
                  </span>
                </div>
              </div>

              {(leave.status === 'pending_admin' || leave.adminAction) && (
                <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded ${
                        leave.adminAction === 'approved' ? 'bg-primary/20' :
                        leave.adminAction === 'rejected' ? 'bg-error/20' :
                        'bg-primary/10'
                      }`}>
                        {leave.adminAction === 'approved' ? (
                          <CheckCircle size={16} className="text-primary" />
                        ) : leave.adminAction === 'rejected' ? (
                          <XCircle size={16} className="text-error" />
                        ) : (
                          <Clock size={16} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admin</p>
                        <p className="text-sm text-gray-600">
                          {leave.adminAction ? 
                            `${leave.adminAction.charAt(0).toUpperCase() + leave.adminAction.slice(1)} on ${new Date(leave.adminActionAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 
                            'Pending review'
                          }
                        </p>
                        {leave.adminComment && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 italic">
                            "{leave.adminComment}"
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      leave.adminAction === 'approved' ? 'bg-primary/20 text-primary' :
                      leave.adminAction === 'rejected' ? 'bg-error/20 text-error' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {leave.adminAction ? leave.adminAction.charAt(0).toUpperCase() + leave.adminAction.slice(1) : 'Pending'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} className="text-sm px-4 py-2 bg-primary hover:bg-primary/90 text-white">Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShortLeaveDetailsModal;
