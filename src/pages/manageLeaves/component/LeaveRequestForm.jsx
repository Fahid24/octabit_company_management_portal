import { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import Button from "@/component/Button";
import { TitleDivider } from "@/component/TitleDevider";
import { useCreateLeaveMutation } from "@/redux/features/manageLeaves/manageLeavesApiSlice";
import { toast } from "@/component/Toast";
import { FloatingInput } from "@/component/FloatiingInput";
import { useSelector } from "react-redux";
import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";
import { useGetLeavesByUserIdQuery } from "@/redux/features/manageLeaves/manageLeavesApiSlice";
import SelectInput from "@/component/select/SelectInput"; // added

const LeaveRequestForm = ({ hideLayout, onClose }) => {
  const { user } = useSelector((state) => state.userSlice);
  const defaultDepartmentId =
    user?.user?.department?._id || user?.user?.department || "";
  const [formData, setFormData] = useState({
    employeeId: user?.user?._id || "",
    departmentId: defaultDepartmentId,
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  });
  const [errors, setErrors] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  });
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [pendingSubmission, setPendingSubmission] = useState(false);

  const [createLeave, { isLoading }] = useCreateLeaveMutation();

  // Get admin config for leave limits
  const { data: configData } = useGetAdminConfigQuery();

  // Get user's leave stats
  const { data: userLeavesData } = useGetLeavesByUserIdQuery(
    { userId: user?.user?._id, page: 1, limit: 1000 }, // Get all leaves for calculation
    { skip: !user?.user?._id }
  );

  // Helper function to calculate limit based on unit
  const calculateLimit = (limitConfig) => {
    if (!limitConfig) return 0;

    const { unit, value } = limitConfig;

    if (unit === "yearly") {
      return value;
    } else if (unit === "monthly") {
      // Calculate yearly limit from monthly (12 months)
      return value * 12;
    }

    return value; // fallback
  };

  // Helper function to calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Helper function to check leave limits
  const checkLeaveLimit = () => {
    // SAFEGUARD: ensure we always have a string
    const lt = formData.leaveType;
    const leaveTypeStr =
      typeof lt === "string" ? lt : lt && lt.value ? lt.value : "";
    if (
      !configData ||
      !userLeavesData?.leaveStats ||
      !leaveTypeStr ||
      !formData.startDate ||
      !formData.endDate
    ) {
      return { withinLimit: true };
    }
    const requestedDays = calculateDays(formData.startDate, formData.endDate);
    const leaveType = leaveTypeStr.toLowerCase();

    // Get current usage from leaveStats
    const currentUsage =
      userLeavesData.leaveStats[`${leaveType}Leave`]?.approved || 0;

    // Get limit from config
    let limit = 0;
    if (leaveType === "casual") {
      limit = calculateLimit(configData.casualLeaveLimit);
    } else if (leaveType === "annual") {
      limit = calculateLimit(configData.annualLeaveLimit);
    } else if (leaveType === "medical") {
      limit = calculateLimit(configData.medicalLeaveLimit);
    }

    const totalAfterRequest = currentUsage + requestedDays;
    const exceedsLimit = totalAfterRequest > limit;

    return {
      withinLimit: !exceedsLimit,
      currentUsage,
      limit,
      requestedDays,
      totalAfterRequest,
      exceededBy: exceedsLimit ? totalAfterRequest - limit : 0,
    };
  };

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
        [name]: "",
      }));
    }
  };

  const validateDates = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start > end) {
      toast.error("Invalid Dates", "End date must be after start date");
      return false;
    }
    return true;
  };

  // Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Validate end date
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    // Validate leave type
    if (!formData.leaveType) {
      newErrors.leaveType = "Leave type is required";
    }

    // Validate reason
    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to actually submit the leave request
  const submitLeaveRequest = async () => {
    try {
      await createLeave(formData).unwrap();
      toast.success("Success", "Leave request submitted successfully");
      setFormData({
        employeeId: user?.user?._id || "",
        departmentId: defaultDepartmentId,
        startDate: "",
        endDate: "",
        leaveType: "",
        reason: "",
      });
      setErrors({
        startDate: "",
        endDate: "",
        leaveType: "",
        reason: "",
      });
      setShowWarningModal(false);
      setPendingSubmission(false);
      if (onClose) onClose();
    } catch (err) {
      toast.error(
        "Error",
        err?.data?.message || err?.data?.error || "Failed to submit leave request"
      );
      setShowWarningModal(false);
      setPendingSubmission(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      return;
    }

    if (!validateDates()) return;

    // Check leave limits
    const limitCheck = checkLeaveLimit();

    if (limitCheck.withinLimit) {
      // Within limits, submit directly
      submitLeaveRequest();
    } else {
      // Exceeds limits, show warning
      const leaveTypeName =
        formData.leaveType.charAt(0).toUpperCase() +
        formData.leaveType.slice(1);
      setWarningMessage(
        `You are requesting ${limitCheck.requestedDays} days of ${leaveTypeName} leave. ` +
          `You have already used ${limitCheck.currentUsage} days out of ${limitCheck.limit} days allowed. ` +
          `This request will exceed your limit by ${limitCheck.exceededBy} days. ` +
          `Do you still want to submit this request?`
      );
      setShowWarningModal(true);
      setPendingSubmission(true);
    }
  };

  // Handle warning modal confirmation
  const handleWarningConfirm = () => {
    submitLeaveRequest();
  };

  // Handle warning modal cancel
  const handleWarningCancel = () => {
    setShowWarningModal(false);
    setPendingSubmission(false);
    setWarningMessage("");
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Department (readonly if auto-filled) */}
      {formData.departmentId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingInput
              label="Employee Name"
              type="text"
              name="Name"
              value={user?.user?.firstName + " " + user?.user?.lastName || ""}
              icon={<Users className="h-5 w-5" />}
              readOnly
            />
            <FloatingInput
              label="Today’s Date"
              type="date"
              name="date"
              value={new Date().toISOString().split("T")[0]}
              icon={<Users className="h-5 w-5" />}
              readOnly
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingInput
              label="Supervisor Name"
              type="text"
              name="dname"
              value={
                user?.user?.department?.departmentHeads
                  ?.map(
                    (head) => `${head?.firstName || ""} ${head?.lastName || ""}`
                  )
                  .join(", ") || ""
              }
              icon={<Users className="h-5 w-5" />}
              readOnly
            />
            <FloatingInput
              label="Department"
              type="text"
              name="department"
              value={
                user?.user?.department?.name || user?.user?.departmentName || ""
              }
              icon={<Users className="h-5 w-5" />}
              readOnly
            />
          </div>
        </>
      )}
      {/* Replaced FloatingInput (type=select) with SelectInput */}
      {/*
        SelectInput compatibility layer:
        - Maintain formData.leaveType as a plain string
        - Provide object to SelectInput if it expects option objects
      */}
      {(() => {
        const leaveTypeOptions = [
          { value: "", label: "Select Leave Type" },
          { value: "Annual", label: "Annual" },
          { value: "Casual", label: "Casual" },
          { value: "Medical", label: "Medical" },
        ];
        const selectedOption =
          leaveTypeOptions.find((o) => o.value === formData.leaveType) ||
          leaveTypeOptions[0];
        return (
          <SelectInput
            label="Type of Absence Requested"
            name="leaveType"
            // Provide the option object (common pattern). If SelectInput expects a string
            // it can read selectedOption.value internally; otherwise it gets full object.
            value={selectedOption}
            options={leaveTypeOptions}
            required
            error={errors.leaveType}
            icon={<Clock className="h-5 w-5" />}
            onChange={(val) => {
              // val could be: option object, string, or event
              const value =
                val && val.value !== undefined
                  ? val.value
                  : val && val.target
                  ? val.target.value
                  : typeof val === "string"
                  ? val
                  : "";
              handleChange({ target: { name: "leaveType", value } });
            }}
          />
        );
      })()}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FloatingInput
          label="First day out"
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          error={errors.startDate}
          icon={<Calendar className="h-5 w-5" />}
        />

        <FloatingInput
          label="Last day out"
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
          error={errors.endDate}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      <FloatingInput
        label="Reason for Absence"
        type="textarea"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        required
        error={errors.reason}
        icon={<FileText className="h-5 w-5" />}
        rows={4}
      />

      <div className="flex justify-center gap-4">
        <Button
          type="button"
          className="px-8 py-2 rounded-md"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || pendingSubmission}
          className="px-8 py-2 rounded-md"
        >
          {isLoading || pendingSubmission ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );

  // Warning Modal Component
  const WarningModal = () =>
    showWarningModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md mx-4 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Leave Limit Warning</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {warningMessage}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleWarningCancel}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleWarningConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isLoading ? "Submitting..." : "Submit Anyway"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

  if (hideLayout) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-sm w-full max-w-xl">
          <div className="relative h-42 bg-form-header-gradient overflow-hidden rounded-t-xl mb-4 py-3">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
            <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>
            <div>
              <h1 className="text-3xl font-semibold text-center mt-2">
                Leave Request Form
              </h1>
              <TitleDivider color="black" className={"-mt-0"} title={""} />
              <p className="text-center pb-2">
                Submit your leave request details
              </p>
            </div>
          </div>
          {formContent}
        </div>
        <WarningModal />
      </>
    );
  }

  // Default layout when hideLayout is false
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm w-full max-w-4xl mx-auto">
        <div className="relative h-42 bg-form-header-gradient overflow-hidden rounded-t-xl mb-4 py-3">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>
          <div>
            <h1 className="text-3xl font-semibold text-center mt-2">
              Leave Request Form
            </h1>
            <TitleDivider color="black" className={"-mt-0"} title={""} />
            <p className="text-center pb-2">
              Submit your leave request details
            </p>
          </div>
        </div>
        {formContent}
      </div>
      <WarningModal />
    </>
  );
};

export default LeaveRequestForm;
