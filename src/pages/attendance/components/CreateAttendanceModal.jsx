import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import Modal from "@/component/Modal";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { useCreateAttendanceMutation } from "@/redux/features/attendance/attendanceApiSlice";
import SelectInput from "@/component/select/SelectInput";
import { toast } from "@/component/Toast";

const statusOptions = [
    { value: "present", label: "Present" },
    { value: "late", label: "Late" },
    { value: "graced", label: "Graced" }
];


const shiftOptions = [
    { value: 'Day', label: 'Day Shift' },
    { value: 'Night', label: 'Night Shift' }
];

const CreateAttendanceModal = ({ isOpen, onClose, employee, date, onSuccess, loginUser }) => {
    const [createAttendance, { isLoading }] = useCreateAttendanceMutation();
    const [errors, setErrors] = useState({});

    // Fetch admin config for work hours
    const { data: adminConfig } = useGetAdminConfigQuery();
    const WORK_START = adminConfig?.workingHours.start || "09:00";
    const WORK_END = adminConfig?.workingHours.end || "17:00";
    const NIGHT_SHIFT_START = adminConfig?.nightShiftWorkingHours?.start || "21:00";
    const NIGHT_SHIFT_END = adminConfig?.nightShiftWorkingHours?.end || "06:00";

    // Helper function to determine if this employee is on night shift
    const isEmployeeNightShift = () => {
        // Check if employee has shift property indicating night shift
        return employee?.shift === 'Night' || employee?.shift === 'night' || employee?.shiftType === 'Night' || employee?.shiftType === 'night';
    };

    // Helper function to determine if this is likely a night shift based on employee or times
    const isNightShift = (checkInTime, checkOutTime) => {
        // First check if employee is assigned to night shift
        if (isEmployeeNightShift()) {
            return true;
        }
        
        // Fallback to time-based detection if no employee shift info
        if (!checkInTime && !checkOutTime) return false;
        
        const checkInHour = checkInTime ? parseInt(checkInTime.split(':')[0]) : 0;
        const checkOutHour = checkOutTime ? parseInt(checkOutTime.split(':')[0]) : 0;
        const nightStartHour = parseInt(NIGHT_SHIFT_START.split(':')[0]);
        const nightEndHour = parseInt(NIGHT_SHIFT_END.split(':')[0]);
        
        // If check-in is during night shift hours OR check-out is early morning
        return checkInHour >= nightStartHour || checkOutHour <= nightEndHour;
    };

    const getDefaultDateTime = (dateStr, timeStr, isCheckOut = false) => {
        if (!dateStr || !timeStr) return "";
        
        const hour = parseInt(timeStr.split(':')[0]);
        const baseDate = new Date(dateStr);
        
        // Check if this employee is on night shift
        const employeeOnNightShift = isEmployeeNightShift();
        
        // Use night shift times if employee is on night shift
        const nightStartHour = parseInt(NIGHT_SHIFT_START.split(':')[0]);
        const nightEndHour = parseInt(NIGHT_SHIFT_END.split(':')[0]);
        
        // Determine if this is a night shift time based on employee shift or time pattern
        const isNightShiftTime = employeeOnNightShift || (isCheckOut ? 
            (hour <= nightEndHour) : // Check-out is early morning
            (hour >= nightStartHour)); // Check-in is late evening
        
        if (isNightShiftTime && employeeOnNightShift) {
            // Night shift logic for confirmed night shift employees
            if (isCheckOut) {
                // For night shift check-out: if using night shift end time or early morning, it's next day
                if (hour <= nightEndHour) {
                    baseDate.setDate(baseDate.getDate() + 1);
                }
            } else {
                // For night shift check-in: if hour < 12 (early morning), it's next day
                if (hour < 12) {
                    baseDate.setDate(baseDate.getDate() + 1);
                }
            }
        } else if (isNightShiftTime && !employeeOnNightShift) {
            // Time-based detection for employees without explicit shift assignment
            if (isCheckOut) {
                // For check-out: if hour <= night end hour, it's next day
                if (hour <= nightEndHour) {
                    baseDate.setDate(baseDate.getDate() + 1);
                }
            } else {
                // For check-in: if hour < 12 (early morning), it's next day
                if (hour < 12) {
                    baseDate.setDate(baseDate.getDate() + 1);
                }
            }
        }
        
        const adjustedDateStr = baseDate.toISOString().split('T')[0];
        return `${adjustedDateStr}T${timeStr}`;
    };

    const getInitialFormData = () => {
        // Determine if we should use night shift defaults based on employee shift
        const useNightShiftDefaults = isEmployeeNightShift();
        
        const defaultCheckInTime = useNightShiftDefaults ? NIGHT_SHIFT_START : WORK_START;
        const defaultCheckOutTime = useNightShiftDefaults ? NIGHT_SHIFT_END : WORK_END;
        
        return {
            employeeId: employee?.employeeId || employee?._id || "",
            employeeShift: employee?.shift || "Day",
            date: date || "",
            checkIn: date ? getDefaultDateTime(date, defaultCheckInTime, false) : "",
            checkOut: date ? getDefaultDateTime(date, defaultCheckOutTime, true) : "",
            checkInLocation: {
                from: "office",
                latitude: "",
                longitude: "",
                locationName: "",
            },
            checkOutLocation: {
                from: "office",
                latitude: "",
                longitude: "",
                locationName: "",
            },
            status: "present",
            lateReason: "",
            remarks: "",
            createdBy: loginUser?.user?._id || loginUser?._id || "",
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

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

    // Update form data when modal opens or dependencies change
    useEffect(() => {
        if (isOpen) {
            const newFormData = getInitialFormData();
            setFormData(newFormData);
            setErrors({});
        }
    }, [isOpen, employee, date, loginUser, WORK_START, WORK_END, NIGHT_SHIFT_START, NIGHT_SHIFT_END]);

    // Update checkIn/checkOut defaults if date or adminConfig changes
    useEffect(() => {
        if (isOpen && date) {
            // Determine if we should use night shift defaults based on employee shift
            const useNightShiftDefaults = isEmployeeNightShift();
            
            const defaultCheckInTime = useNightShiftDefaults ? NIGHT_SHIFT_START : WORK_START;
            const defaultCheckOutTime = useNightShiftDefaults ? NIGHT_SHIFT_END : WORK_END;
            
            setFormData((prev) => ({
                ...prev,
                employeeId: employee?.employeeId || employee?._id || "",
                employeeShift: employee?.shift || "Day",
                date: date,
                checkIn: getDefaultDateTime(date, defaultCheckInTime, false),
                checkOut: getDefaultDateTime(date, defaultCheckOutTime, true),
                createdBy: loginUser?.user?._id || loginUser?._id || "",
            }));
        }
    }, [isOpen, date, employee, loginUser, WORK_START, WORK_END, NIGHT_SHIFT_START, NIGHT_SHIFT_END]);

    // Function to get location name from coordinates
    const fetchLocationName = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await response.json();
            return data.display_name || "Location not found";
        } catch (error) {
            console.error("Error fetching location name:", error);
            return "Unable to fetch location";
        }
    };

    // Auto-fill location using browser geolocation when modal opens
    useEffect(() => {
        if (isOpen && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    
                    // Fetch location name
                    const locationName = await fetchLocationName(latitude, longitude);
                    
                    setFormData((prev) => ({
                        ...prev,
                        checkInLocation: {
                            ...prev.checkInLocation,
                            latitude,
                            longitude,
                            locationName,
                        },
                        checkOutLocation: {
                            ...prev.checkOutLocation,
                            latitude,
                            longitude,
                            locationName,
                        },
                    }));
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    // Optionally show user a message about location access
                }
            );
        }
    }, [isOpen]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleLocationChange = (type, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeId) {
            newErrors.employeeId = "Employee is required";
        }

        if (!formData.date) {
            newErrors.date = "Date is required";
        }

        if (!formData.checkIn) {
            newErrors.checkIn = "Check in time is required";
        }

        if (!formData.checkOut) {
            newErrors.checkOut = "Check out time is required";
        }

        if (!formData.employeeShift) {
            newErrors.employeeShift = "Employee shift is required";
        }

        if (!formData.status) {
            newErrors.status = "Status is required";
        }

        if (formData.status === "late" && !formData.lateReason?.trim()) {
            newErrors.lateReason = "Late reason is required when status is late";
        }

        // Validate check-out is after check-in (handles night shift scenarios)
        if (formData.checkIn && formData.checkOut) {
            const checkInTime = new Date(formData.checkIn);
            const checkOutTime = new Date(formData.checkOut);
            
            // Check if this appears to be a night shift
            const checkInTimeStr = formData.checkIn.split('T')[1]; // Get time part
            const checkOutTimeStr = formData.checkOut.split('T')[1]; // Get time part
            const isNightShiftSchedule = isNightShift(checkInTimeStr, checkOutTimeStr);
            
            // For night shifts, check-out can be next day, so we need to ensure 
            // the time difference makes sense (not more than 24 hours)
            const timeDiffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            
            if (checkOutTime <= checkInTime) {
                newErrors.checkOut = "Check out time must be after check in time";
            } else if (timeDiffHours > 24) {
                newErrors.checkOut = "Check out time cannot be more than 24 hours after check in";
            } else if (timeDiffHours < 1 && !isNightShiftSchedule) {
                newErrors.checkOut = "Work duration should be at least 1 hour for regular shifts";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData(getInitialFormData());
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors below");
            return;
        }

        try {
            await createAttendance(formData).unwrap();
            toast.success("Attendance created successfully");
            onSuccess?.();
            resetForm();
            onClose();
        } catch (error) {
            console.error("Create attendance error:", error);
            toast.error(error?.data?.message || "Failed to create attendance");
        }
    };

    return (
    <Modal open={isOpen} onClose={() => { resetForm(); onClose(); }} size="lg" className="max-h-[80vh]">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create Attendance</h2>
                {/* Employee Info & Date (styled, matching AttendanceEditModal) */}
                {employee && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <div className="flex items-center space-x-3">
                            {employee.photoUrl ? (
                                <img
                                    src={employee.photoUrl}
                                    alt={employee.name || employee.firstName}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {/* Show initials if no photo. Use firstName/lastName if available, else split employee.name */}
                            {!employee.photoUrl && (
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium text-sm">
                                        {employee.firstName && employee.lastName
                                            ? (employee.firstName.charAt(0) || '?') + (employee.lastName.charAt(0) || '?')
                                            : employee.name
                                                ? employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                                                : '??'}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">
                                    {employee.name || `${employee.firstName || 'Unknown'} ${employee.lastName || 'Employee'}`}
                                </p>
                                <p className="text-sm text-gray-500">{employee.designation || 'No designation'}</p>
                                <p className="text-xs text-gray-400">
                                    {employee.department || 'No department'}
                                    {isEmployeeNightShift() && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Night Shift
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Date: {(() => {
                                try {
                                    const dateValue = date || formData.date;
                                    if (typeof dateValue === 'string') {
                                        // Try ISO format first, then regular date parsing
                                        try {
                                            return format(parseISO(dateValue), 'EEEE, MMMM dd, yyyy');
                                        } catch (isoError) {
                                            return format(new Date(dateValue), 'EEEE, MMMM dd, yyyy');
                                        }
                                    }
                                    return format(new Date(dateValue), 'EEEE, MMMM dd, yyyy');
                                } catch (error) {
                                    return date || formData.date || 'Unknown date';
                                }
                            })()}
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput
                        label="Check In Time"
                        type="datetime-local"
                        value={formData.checkIn}
                        onChange={(e) => handleInputChange("checkIn", e.target.value)}
                        required
                        error={errors.checkIn}
                    />
                    <FloatingInput
                        label="Check Out Time"
                        type="datetime-local"
                        value={formData.checkOut}
                        onChange={(e) => handleInputChange("checkOut", e.target.value)}
                        required
                        error={errors.checkOut}
                    />

                    <SelectInput
                        label="Employee Shift"
                        value={shiftOptions.find(option => option.value === formData.employeeShift) || null}
                        onChange={(option) => handleChange('employeeShift', option?.value || 'Day')}
                        required
                        options={shiftOptions}
                        error={errors.employeeShift}
                        menuPlacement="auto"
                        menuPosition="fixed"
                    />

                    <SelectInput
                        label="Status"
                        options={statusOptions}
                        value={statusOptions.find(opt => opt.value === formData.status)}
                        onChange={(opt) => handleInputChange("status", opt?.value || "")}
                        required
                        error={errors.status}
                        menuPlacement="auto"
                        menuPosition="fixed"
                    />
                    {formData.status === "late" && (
                        <FloatingTextarea
                            label="Late Reason"
                            value={formData.lateReason}
                            onChange={(e) => handleInputChange("lateReason", e.target.value)}
                            rows={2}
                            required
                            error={errors.lateReason}
                        />
                    )}
                    <FloatingTextarea
                        label="Remarks"
                        value={formData.remarks}
                        onChange={(e) => handleInputChange("remarks", e.target.value)}
                        rows={2}
                        error={errors.remarks}
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="secondary" onClick={() => { resetForm(); onClose(); }} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white px-6 py-2">
                            {isLoading ? "Creating..." : "Create Attendance"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateAttendanceModal;
