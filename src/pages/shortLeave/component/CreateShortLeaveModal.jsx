import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Clock, Calendar, MessageSquare, User, Users } from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import SelectInput from "@/component/select/SelectInput";
import Modal from "@/component/Modal";
import { toast } from "@/component/Toast";
import {
  useCreateShortLeaveMutation,
  useUpdateShortLeaveMutation,
} from "@/redux/features/shortLeave/shortLeaveApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";

const CreateShortLeaveModal = ({ isOpen, onClose, leave, onSuccess }) => {
  const { user } = useSelector((state) => state.userSlice);
  const [createShortLeave, { isLoading: isCreating }] =
    useCreateShortLeaveMutation();
  const [updateShortLeave, { isLoading: isUpdating }] =
    useUpdateShortLeaveMutation();

  // Fetch employees and departments for admin and dept head
  const { data: allEmployees, isLoading: loadingEmployees } =
    useGetAllEmployeesQuery(
      {
        page: 1,
        limit: 1000,
      },
      {
        skip:
          !user?.user ||
          (user.user.role !== "Admin" && user.user.role !== "DepartmentHead"),
      }
    );

  const { data: departments } = useGetDepartmentsQuery(
    {
      page: 0,
      limit: 0,
      isPopulate: true,
    },
    {
      skip: !user?.user || user.user.role !== "Admin",
    }
  );

  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
    selectedEmployee: null, // For admin and dept head to select employee
  });

  const [errors, setErrors] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    selectedEmployee: '',
  });

  // Get user role and permissions
  const userRole = user?.user?.role;
  const canRequestForOthers =
    userRole === "Admin" || userRole === "DepartmentHead";

  // Filter employees based on user role and create options for select
  const getEmployeeOptions = () => {
    if (!canRequestForOthers) return [];

    let filteredEmployees = [];

    if (userRole === "Admin") {
      // Admin can select any employee
      filteredEmployees = allEmployees?.data || [];
    } else if (userRole === "DepartmentHead") {
      // Department head can only select employees from their department
      filteredEmployees =
        allEmployees?.data?.filter(
          (emp) =>
            emp.department?._id === user.user.department?._id ||
            emp.department === user.user.department?._id
        ) || [];
    }

    // Add current user as an option for self-request
    const currentUserOption = {
      value: user.user._id,
      label: `${user.user.firstName} ${user.user.lastName} (Yourself)`,
      email: user.user.email,
      department: user.user.department?.name || "No Department",
      role: user.user.role,
      data: user.user,
    };

    const employeeOptions = filteredEmployees
      .filter((emp) => emp._id !== user.user._id) // Remove current user from list to avoid duplicates
      .map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department?.name || "No Department",
        role: emp.role,
        data: emp, // Store the full employee object
      }));

    // Add current user at the top of the list
    return [currentUserOption, ...employeeOptions];
  };

  const employeeOptions = getEmployeeOptions();

  useEffect(() => {
    if (leave) {
      // Edit mode - populate form with existing data
      const leaveDate = new Date(leave.date);
      // Format date as YYYY-MM-DD for input field
      const formattedDate =
        leaveDate.getFullYear() +
        "-" +
        String(leaveDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(leaveDate.getDate()).padStart(2, "0");

      setFormData({
        date: formattedDate,
        startTime: leave.startTime,
        endTime: leave.endTime,
        reason: leave.reason,
        selectedEmployee: null,
      });
      setErrors({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
        selectedEmployee: '',
      });
    } else {
      // Create mode - reset form and set default employee for admin/dept head
      // Set default startTime to current time and endTime to +1 hour
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const startTime = pad(now.getHours()) + ":" + pad(now.getMinutes());
      const endObj = new Date(now.getTime() + 60 * 60 * 1000);
      const endTime = pad(endObj.getHours()) + ":" + pad(endObj.getMinutes());

      setFormData({
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        reason: '',
        selectedEmployee: canRequestForOthers ? user?.user : null, // Default to self for admin/dept head
      });
      setErrors({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
        selectedEmployee: '',
      });
    }
  }, [leave, canRequestForOthers, user]);


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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleEmployeeSelect = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployee: selectedOption?.data || null,
    }));
    
    // Clear employee selection error
    if (errors.selectedEmployee) {
      setErrors((prev) => ({
        ...prev,
        selectedEmployee: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
      selectedEmployee: '',
    };

    let isValid = true;

    // Validate date
    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    } else {
      // Check if date is not in the past (optional validation)
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Uncomment if you want to prevent past dates
      // if (selectedDate < today) {
      //   newErrors.date = 'Cannot request short leave for past dates';
      //   isValid = false;
      // }
    }

    // Validate start time
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
      isValid = false;
    }

    // Validate end time
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
      isValid = false;
    } else if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
      isValid = false;
    }

    // Validate reason
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
      isValid = false;
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
      isValid = false;
    } else if (formData.reason.length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
      isValid = false;
    }

    // Validate employee selection for admin/dept head (if they haven't selected anyone, it defaults to self)
    if (canRequestForOthers && !leave && !formData.selectedEmployee) {
      newErrors.selectedEmployee = 'Please select an employee';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Determine which employee the request is for
      const targetEmployee =
        canRequestForOthers && !leave && formData.selectedEmployee
          ? formData.selectedEmployee
          : user?.user;

      if (leave) {
        // Update existing leave (always for self in edit mode)
        await updateShortLeave({
          id: leave._id,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.reason,
        }).unwrap();
        toast.success("Success", "Short leave request updated successfully");
      } else {
        // Create new leave
        await createShortLeave({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.reason,
          employeeId: targetEmployee._id,
          departmentId:
            targetEmployee.department?._id || targetEmployee.department,
        }).unwrap();

        const message =
          canRequestForOthers &&
          formData.selectedEmployee &&
          formData.selectedEmployee._id !== user?.user?._id
            ? `Short leave request submitted successfully for ${targetEmployee.firstName} ${targetEmployee.lastName}`
            : "Short leave request submitted successfully";
        toast.success("Success", message);
      }
      onSuccess();
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || error?.data?.error || "Failed to submit short leave request"
      );
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg" className="max-h-[80dvh]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {leave ? "Edit Short Leave" : "Request Short Leave"}
            </h2>
            <p className="text-sm text-gray-500">
              {leave
                ? userRole === "Admin" || userRole === "DepartmentHead"
                  ? `Update short leave request for ${leave.employeeId?.firstName} ${leave.employeeId?.lastName}`
                  : "Update your short leave request"
                : "Submit a new short leave request"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection - Only show for Admin and Department Head in create mode */}
          {!leave && canRequestForOthers && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1 bg-primary/20 rounded">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Select Employee
                  </h3>
                  <p className="text-xs text-gray-500">
                    Choose who this request is for (defaults to yourself)
                  </p>
                </div>
              </div>

              {loadingEmployees ? (
                <div className="flex items-center justify-center py-4 bg-white/50 rounded-lg border border-gray-200">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-500">
                    Loading employees...
                  </span>
                </div>
              ) : (
                <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                  <SelectInput
                    label="Employee"
                    icon={<User className="h-4 w-4" />}
                    options={employeeOptions}
                    value={
                      employeeOptions.find(
                        (opt) => opt.data._id === formData.selectedEmployee?._id
                      ) || null
                    }
                    onChange={handleEmployeeSelect}
                    placeholder="Select yourself or another employee..."
                    error={errors.selectedEmployee}
                  />
                  <div className="mt-2 p-2 bg-primary/5 rounded text-xs text-gray-600">
                    💡 <strong>Tip:</strong> You can create requests for
                    yourself or your team members. Your name appears first in
                    the list with "(Yourself)" label.
                  </div>
                </div>
              )}

              {employeeOptions.length === 0 && !loadingEmployees && (
                <div className="bg-white/50 rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500 text-center">
                    No employees found in your{" "}
                    {userRole === "Admin" ? "organization" : "department"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Leave Details Form */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1 bg-primary/20 rounded">
                <Calendar size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                Leave Details
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput
                    label="Date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    // required
                    error={errors.date}
                    // min={new Date().toISOString().split('T')[0]}
                    // icon={<Calendar className="h-4 w-4" />}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FloatingInput
                      label="Start Time"
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      // required
                      error={errors.startTime}
                      // icon={<Clock className="h-4 w-4" />}
                      className="text-sm"
                      inputClassName="text-sm"
                    />

                    <FloatingInput
                      label="End Time"
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      // required
                      error={errors.endTime}
                      className="text-sm"
                      inputClassName="text-sm"
                      // icon={<Clock className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-3 border border-white/50">
                <FloatingTextarea
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  // required
                  error={errors.reason}
                  rows={3}
                  icon={<MessageSquare className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
            >
              {isCreating || isUpdating
                ? "Submitting..."
                : leave
                ? "Update Request"
                : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateShortLeaveModal;
