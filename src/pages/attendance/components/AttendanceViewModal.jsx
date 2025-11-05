import React, { useEffect } from 'react';
import { X, MapPin, Clock, User, Calendar, FileText, AlertCircle, Moon, SunMoon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Loader from '@/component/Loader';
import Tooltip from '@/component/Tooltip';

const AttendanceViewModal = ({ isOpen, onClose, attendance, isLoading }) => {
  // Helper function to determine if employee works night shift
  const isEmployeeNightShift = () => {
    return attendance?.employeeShift === "Night";
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
  if (!isOpen) return null;

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not recorded';
    try {
      // Handle both ISO string and Date object
      const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'Not recorded';
    try {
      // Handle both ISO string and time-only format
      if (typeof time === 'string') {
        // If it's an ISO string, parse and format
        if (time.includes('T') || time.includes('Z')) {
          return format(new Date(time), 'hh:mm a');
        }
        // If it's just time (HH:mm), convert to display format
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return format(date, 'hh:mm a');
      }
      return format(new Date(time), 'hh:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not recorded';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(date, 'EEEE, MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'graced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on leave':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Attendance Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : attendance ? (
            <div className="space-y-6">
              {/* Employee & Date Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Employee
                  </label>
                  <div className="flex items-center space-x-3">
                    {attendance.employeeId?.photoUrl ? (
                      <img
                        src={attendance.employeeId.photoUrl}
                        alt="Employee"
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center ${
                        attendance.employeeId?.photoUrl ? 'hidden' : 'flex'
                      }`}
                      style={{ display: attendance.employeeId?.photoUrl ? 'none' : 'flex' }}
                    >
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {attendance.employeeId?.firstName || 'Unknown'} {attendance.employeeId?.lastName || 'Employee'}
                        {isEmployeeNightShift() && (
                          <Tooltip
                            text="Night Shift Employee"
                            position="top"
                          >
                            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800">
                              <Moon className="w-3 h-3" />
                            </span>
                          </Tooltip>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{attendance.employeeId?.email || 'No email available'}</p>
                      <p className="text-xs text-gray-400">
                        {attendance.employeeId?.department?.name || 
                         (typeof attendance.employeeId?.department === 'string' ? 'Department ID: ' + attendance.employeeId.department : 'No department')}
                      </p>
                      <p className="text-xs text-gray-400">
                        Role: {attendance.employeeId?.role || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formatDate(attendance.date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <SunMoon className="w-4 h-4 mr-2" />
                        Shift
                      </label>
                      <p className="text-gray-900 font-medium">{attendance?.employeeShift + " Shift" || 'Day Shift'}</p>
                    </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(attendance.status)}`}>
                    {attendance.status}
                  </span>
                  {attendance.isStatusUpdated && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Manually Updated
                    </span>
                  )}
                </div>
              </div>

              {/* Check In/Out Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Check In Time
                  </label>
                  <p className="text-gray-900">{formatTime(attendance.checkIn)}</p>
                  {attendance.checkIn && (
                    <p className="text-xs text-gray-500">
                      Full timestamp: {formatDateTime(attendance.checkIn)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Check Out Time
                  </label>
                  <p className="text-gray-900">{formatTime(attendance.checkOut)}</p>
                  {attendance.checkOut && (
                    <p className="text-xs text-gray-500">
                      Full timestamp: {formatDateTime(attendance.checkOut)}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attendance.checkInLocation && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Check In Location
                    </label>
                    <div className="text-sm text-gray-600">
                      <p>{attendance.checkInLocation.locationName || 'Unknown Location'}</p>
                      <p className="text-xs text-gray-500">
                        From: {attendance.checkInLocation.from || 'Not specified'}
                      </p>
                      {attendance.checkInLocation.latitude && attendance.checkInLocation.longitude && (
                        <p className="text-xs text-gray-500">
                          Coordinates: {attendance.checkInLocation.latitude.toFixed(6)}, {attendance.checkInLocation.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {attendance.checkOutLocation && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Check Out Location
                    </label>
                    <div className="text-sm text-gray-600">
                      <p>{attendance.checkOutLocation.locationName || 'Unknown Location'}</p>
                      <p className="text-xs text-gray-500">
                        From: {attendance.checkOutLocation.from || 'Not specified'}
                      </p>
                      {attendance.checkOutLocation.latitude && attendance.checkOutLocation.longitude && (
                        <p className="text-xs text-gray-500">
                          Coordinates: {attendance.checkOutLocation.latitude.toFixed(6)}, {attendance.checkOutLocation.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Late Reason */}
              {attendance.lateReason && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Late Reason
                  </label>
                  <p className="text-gray-900 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    {attendance.lateReason}
                  </p>
                </div>
              )}

              {/* Remarks */}
              {attendance.remarks && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Remarks
                  </label>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded-md border border-blue-200">
                    {attendance.remarks}
                  </p>
                </div>
              )}

              {/* Update History */}
              {attendance.updated && attendance.updated.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Update History</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attendance.updated.map((update, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>
                            Updated by: {update.updatedBy?.firstName} {update.updatedBy?.lastName}
                          </span>
                          <span>{formatDateTime(update.updatedAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{update.changes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created/Updated Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Created At</label>
                  <p className="text-sm text-gray-700">{formatDateTime(attendance.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-700">{formatDateTime(attendance.updatedAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance data found</p>
              <p className="text-xs text-gray-400 mt-2">
                This could mean the attendance record doesn't exist or there's an issue with the ID.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceViewModal;
