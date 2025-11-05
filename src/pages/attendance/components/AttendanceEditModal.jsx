import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Moon } from "lucide-react";
import { format, parseISO } from "date-fns";
import Loader from "@/component/Loader";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import SelectInput from "@/component/select/SelectInput";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import Tooltip from "@/component/Tooltip";
import { toast } from "@/component/Toast";

const AttendanceEditModal = ({
  isOpen,
  onClose,
  attendance,
  onSave,
  isLoading,
  loginUser,
}) => {
  // Fetch admin config for work hours
  const { data: adminConfig } = useGetAdminConfigQuery();
  const NIGHT_SHIFT_START =
    adminConfig?.nightShiftWorkingHours?.start || "21:00";
  const NIGHT_SHIFT_END = adminConfig?.nightShiftWorkingHours?.end || "06:00";

  // Helper function to determine if this employee is on night shift
  const isEmployeeNightShift = () => {
    // Check employee shift from attendance data
    // const employee = attendance?.employeeId;
    return attendance?.employeeShift === "Night";
  };

  // Helper function to determine if this is likely a night shift
  const isNightShift = (checkInTime, checkOutTime) => {
    // First check if employee is assigned to night shift
    if (isEmployeeNightShift()) {
      return true;
    }

    // Fallback to time-based detection if no employee shift info
    if (!checkInTime && !checkOutTime) return false;

    const checkInHour = checkInTime ? parseInt(checkInTime.split(":")[0]) : 0;
    const checkOutHour = checkOutTime
      ? parseInt(checkOutTime.split(":")[0])
      : 0;
    const nightStartHour = parseInt(NIGHT_SHIFT_START.split(":")[0]);
    const nightEndHour = parseInt(NIGHT_SHIFT_END.split(":")[0]);

    // If check-in is during night shift hours OR check-out is early morning
    return checkInHour >= nightStartHour || checkOutHour <= nightEndHour;
  };

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    employeeShift: "Day",
    status: "present",
    lateReason: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scrolling
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (attendance && isOpen) {
      // Helper function to safely format time
      const formatTimeValue = (timeValue) => {
        if (!timeValue) return "";

        // If it's already in HH:mm format, return as is
        if (
          typeof timeValue === "string" &&
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)
        ) {
          return timeValue;
        }

        // Try to parse as ISO string and format
        try {
          return format(parseISO(timeValue), "HH:mm");
        } catch (error) {
          console.warn("Unable to parse time value:", timeValue);
          return "";
        }
      };

      setFormData({
        checkIn: formatTimeValue(attendance.checkIn),
        checkOut: formatTimeValue(attendance.checkOut),
        employeeShift: attendance.employeeShift || "Day",
        status: attendance.status || "present",
        lateReason: attendance.lateReason || "",
        remarks: attendance.remarks || "",
      });
      setErrors({});
    }
  }, [attendance, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate check-in time format
    if (
      formData.checkIn &&
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.checkIn)
    ) {
      newErrors.checkIn = "Please enter valid time format (HH:MM)";
    }

    // Validate check-out time format
    if (
      formData.checkOut &&
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.checkOut)
    ) {
      newErrors.checkOut = "Please enter valid time format (HH:MM)";
    }

    // Validate that check-out is after check-in if both are provided
    if (formData.checkIn && formData.checkOut) {
      const [checkInHour, checkInMin] = formData.checkIn.split(":").map(Number);
      const [checkOutHour, checkOutMin] = formData.checkOut
        .split(":")
        .map(Number);
      const checkInMinutes = checkInHour * 60 + checkInMin;
      const checkOutMinutes = checkOutHour * 60 + checkOutMin;

      // Check if this employee is on night shift or if times suggest night shift
      const isNightShiftEmployee = isEmployeeNightShift();
      const isNightShiftSchedule = isNightShift(
        formData.checkIn,
        formData.checkOut
      );

      if (checkOutMinutes <= checkInMinutes) {
        if (isNightShiftEmployee || isNightShiftSchedule) {
          // For confirmed night shift employees or night shift patterns
          const nightStartHour = parseInt(NIGHT_SHIFT_START.split(":")[0]) - 1;
          const nightEndHour = parseInt(NIGHT_SHIFT_END.split(":")[0]) + 1;

          if (isNightShiftEmployee) {
            // Employee is confirmed night shift - validate night shift pattern
            if (
              !(checkInHour >= nightStartHour && checkOutHour <= nightEndHour)
            ) {
              newErrors.checkOut = `Night shift employees should check-in after ${NIGHT_SHIFT_START} and check-out before ${NIGHT_SHIFT_END}`;
            }
          } else if (
            checkInHour >= nightStartHour &&
            checkOutHour <= nightEndHour
          ) {
            // Valid night shift pattern - no error
          } else {
            newErrors.checkOut =
              "For night shifts, check-in should be in evening and check-out in early morning";
          }
        } else {
          // Regular shift - check-out must be after check-in
          newErrors.checkOut = "Check-out time must be after check-in time";
        }
      }
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.employeeShift) {
      newErrors.employeeShift = "Employee shift is required";
    }

    // Validate late reason is required if status is late
    // if (formData.status === 'late' && !formData.lateReason.trim()) {
    //   newErrors.lateReason = 'Late reason is required when status is late';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Helper function to safely format time for comparison
      const formatTimeForComparison = (timeValue) => {
        if (!timeValue) return "";
        if (
          typeof timeValue === "string" &&
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)
        ) {
          return timeValue;
        }
        try {
          return format(parseISO(timeValue), "HH:mm");
        } catch (error) {
          return "";
        }
      };

      // Get original values for comparison
      const originalCheckIn = formatTimeForComparison(attendance.checkIn);
      const originalCheckOut = formatTimeForComparison(attendance.checkOut);
      const originalEmployeeShift = attendance.employeeShift || "Day";
      const originalStatus = attendance.status || "present";
      const originalLateReason = attendance.lateReason || "";
      const originalRemarks = attendance.remarks || "";

      // Build update data with only changed fields
      const updateData = {};

      // Check each field for changes and only include changed ones
      if (formData.checkIn !== originalCheckIn) {
        updateData.checkIn = formData.checkIn;
      }

      if (formData.checkOut !== originalCheckOut) {
        updateData.checkOut = formData.checkOut;
      }

      if (formData.status !== originalStatus) {
        updateData.status = formData.status;
      }

      if (formData.employeeShift !== originalEmployeeShift) {
        updateData.employeeShift = formData.employeeShift;
      }

      if (formData.lateReason !== originalLateReason) {
        updateData.lateReason = formData.lateReason;
      }

      if (formData.remarks !== originalRemarks) {
        updateData.remarks = formData.remarks;
      }

      // If no changes were made, don't proceed with the update
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      // Add metadata
      updateData.updatedBy = loginUser?.user?._id;

      await onSave(updateData);
      // toast.success('Attendance updated successfully');
      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
      // toast.error('Failed to save attendance. Please try again.');
      setErrors({ submit: "Failed to save attendance. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { value: "present", label: "Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
    { value: "graced", label: "Grace Present" },
    { value: "on leave", label: "On Leave" },
  ];

  const shiftOptions = [
    { value: "Day", label: "Day Shift" },
    { value: "Night", label: "Night Shift" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Attendance
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : attendance ? (
            <div className="space-y-6">
              {/* Employee Info (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  {attendance.employeeId?.photoUrl ? (
                    <img
                      src={attendance.employeeId.photoUrl}
                      alt="Employee"
                      className="w-12 h-12 rounded-full object-cover border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center ${
                      attendance.employeeId?.photoUrl ? "hidden" : "flex"
                    }`}
                    style={{
                      display: attendance.employeeId?.photoUrl
                        ? "none"
                        : "flex",
                    }}
                  >
                    <span className="text-gray-600 font-medium text-sm">
                      {attendance.employeeId?.firstName?.charAt(0) || "?"}
                      {attendance.employeeId?.lastName?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {attendance.employeeId?.firstName || "Unknown"}{" "}
                      {attendance.employeeId?.lastName || "Employee"}
                      {isEmployeeNightShift() && (
                        <Tooltip text="Night Shift Employee" position="top">
                          <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800">
                            <Moon className="w-3 h-3" />
                          </span>
                        </Tooltip>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {attendance.employeeId?.email || "No email available"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {attendance.employeeId?.department?.name ||
                        "No department"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Date:{" "}
                  {(() => {
                    try {
                      // Handle different date formats
                      const dateValue = attendance.date;
                      if (typeof dateValue === "string") {
                        // Try ISO format first, then regular date parsing
                        try {
                          return format(
                            parseISO(dateValue),
                            "EEEE, MMMM dd, yyyy"
                          );
                        } catch (isoError) {
                          return format(
                            new Date(dateValue),
                            "EEEE, MMMM dd, yyyy"
                          );
                        }
                      }
                      return format(new Date(dateValue), "EEEE, MMMM dd, yyyy");
                    } catch (error) {
                      console.warn("Unable to format date:", attendance.date);
                      return attendance.date || "Unknown date";
                    }
                  })()}
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Check In Time */}
                <div className="space-y-2">
                  <FloatingInput
                    type="time"
                    label="Check In Time"
                    value={formData.checkIn}
                    onChange={(e) => handleChange("checkIn", e.target.value)}
                    error={errors.checkIn}
                    disabled={isSaving}
                  />
                </div>

                {/* Check Out Time */}
                <div className="space-y-2">
                  <FloatingInput
                    type="time"
                    label="Check Out Time"
                    value={formData.checkOut}
                    onChange={(e) => handleChange("checkOut", e.target.value)}
                    error={errors.checkOut}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Employee Shift */}
              <div className="space-y-2">
                <SelectInput
                  label="Employee Shift"
                  value={
                    shiftOptions.find(
                      (option) => option.value === formData.employeeShift
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange("employeeShift", option?.value || "Day")
                  }
                  options={shiftOptions}
                  disabled={isSaving}
                  error={errors.employeeShift}
                  menuPlacement="auto"
                  menuPosition="fixed"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <SelectInput
                  label="Status"
                  value={
                    statusOptions.find(
                      (option) => option.value === formData.status
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange("status", option?.value || "present")
                  }
                  options={statusOptions}
                  disabled={isSaving}
                  error={errors.status}
                  menuPlacement="auto"
                  menuPosition="fixed"
                />
              </div>

              {/* Late Reason */}
              <div className="space-y-2">
                <FloatingTextarea
                  label="Late Reason (If applicable)"
                  value={formData.lateReason}
                  onChange={(e) => handleChange("lateReason", e.target.value)}
                  error={errors.lateReason}
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <FloatingTextarea
                  label="Remarks"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              {/* Submit Error */}
              {/* {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{errors.submit}</span>
                  </div>
                </div>
              )} */}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance data found</p>
              <p className="text-xs text-gray-400 mt-2">
                This could mean the attendance record doesn't exist or there's
                an issue with the ID.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving || !attendance}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceEditModal;
