import React, { useEffect } from 'react';
import { Calendar, Clock, User, Building2, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import Modal from '@/component/Modal';
import Button from '@/component/Button';

const LeaveDetailsModal = ({ isOpen, onClose, leave }) => {
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
  if (!leave) return null;

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md" className='max-h-[80dvh]'>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <Eye size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Request Details</h2>
              <p className="text-sm text-gray-500">View leave request information</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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

          {/* Leave Details */}
          <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 bg-primary/20 rounded">
                <Calendar size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Leave Details</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Leave Type:</span>
                    <p className="font-medium text-gray-900">{leave.leaveType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium text-primary">{leave.duration?.workingDays || calculateDuration(leave.startDate, leave.endDate)} {leave.duration?.workingDays === 1 || calculateDuration(leave.startDate, leave.endDate) === 1 ? 'day' : 'days'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Paid Leave:</span>
                    <p className="font-medium text-green-600">
                      {leave.paidLeave || 0} {(leave.paidLeave || 0) === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Unpaid Leave:</span>
                    <p className="font-medium text-red-600">
                      {leave.unpaidLeave || 0} {(leave.unpaidLeave || 0) === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <p className="font-medium text-gray-900">{formatDate(leave.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">End Date:</span>
                    <p className="font-medium text-gray-900">{formatDate(leave.endDate)}</p>
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
                    <div className={`p-1 rounded ${leave.deptHeadAction === 'approved' ? 'bg-primary/20' :
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${leave.deptHeadAction === 'approved' ? 'bg-primary/20 text-primary' :
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
                      <div className={`p-1 rounded ${leave.adminAction === 'approved' ? 'bg-primary/20' :
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${leave.adminAction === 'approved' ? 'bg-primary/20 text-primary' :
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

        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <Button onClick={onClose} className="text-sm px-4 py-2 bg-primary hover:bg-primary/90 text-white">Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveDetailsModal;
