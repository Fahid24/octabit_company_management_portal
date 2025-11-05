/* eslint-disable react/prop-types */
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "@/component/Toast";

const JobTaskReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  taskDetails,
  isAdminReview = false,
}) => {
  const [timeValue, setTimeValue] = useState("");
  // console.log(timeValue);
  const [timeUnit, setTimeUnit] = useState();
  const [completion, setCompletion] = useState("");
  const [errors, setErrors] = useState({});

  // Pre-fill data when admin is reviewing existing completion data
  useEffect(() => {
    if (isOpen && isAdminReview && taskDetails) {
      // Pre-fill with existing completion data if available
      if (taskDetails.completion !== undefined) {
        setCompletion(taskDetails.completion.toString());
      }
      if (taskDetails.completionTime || taskDetails.timeSpent) {
        const timeData = taskDetails.completionTime || taskDetails.timeSpent;
        if (timeData.value) {
          setTimeValue(timeData.value.toString());
        }
        if (timeData.unit) {
          setTimeUnit({ value: timeData.unit, label: timeData.unit });
        }
      }
    } else if (!isOpen) {
      // Reset form when modal closes
      setTimeValue("");
      setTimeUnit();
      setCompletion("");
      setErrors({});
    }
  }, [isOpen, isAdminReview, taskDetails]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!timeValue) {
      newErrors.timeValue = "Time value is required";
    }

    if (!timeUnit) {
      newErrors.timeUnit = "Time unit is required";
    }

    if (!completion) {
      newErrors.completion = "Completion percentage is required";
    } else if (completion < 0 || completion > 100) {
      newErrors.completion = "Completion must be between 0 and 100";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      timeValue: Number.parseInt(timeValue),
      timeUnit: timeUnit?.value,
      completion: Number.parseInt(completion),
    });

    // Show success message
    const successMessage = isAdminReview
      ? "Task completed successfully!"
      : "Task submitted for review successfully!";
    toast.success("Success", successMessage);

    // Reset form
    setTimeValue("");
    setTimeUnit();
    setCompletion("");
    setErrors(null);
  };

  const handleClose = () => {
    setTimeValue("");
    setTimeUnit({});
    setCompletion("");
    setErrors(null);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isAdminReview
              ? "Review and Complete Task"
              : "Task Review Information"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-base text-gray-900 font-semibold mb-2 text-center">
            {taskDetails?.title}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Details:</strong> {taskDetails?.details}
          </p>
          {isAdminReview && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-1">
                📝 Admin Review Mode
              </p>
              <p className="text-xs text-blue-700">
                You can review and update the completion information before
                marking this task as completed.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How long did it take to finish this task? *
            </label>
            <div className="flex gap-3">
              <FloatingInput
                label="Time Value"
                type="number"
                value={timeValue}
                onChange={(e) => {
                  setTimeValue(e.target.value),
                    setErrors((prev) => ({
                      ...prev,
                      timeValue: "",
                    }));
                }}
                error={errors?.timeValue}
              />

              <SelectInput
                className={"z-30 -mt-0.5"}
                label="Time Unit"
                isMulti={false}
                value={timeUnit}
                onChange={(e) => {
                  setTimeUnit(e);
                  setErrors((prev) => ({
                    ...prev,
                    timeUnit: "",
                  }));
                }}
                options={[
                  { value: "minutes", label: "Minutes" },
                  { value: "hours", label: "Hours" },
                  { value: "days", label: "Days" },
                  { value: "weeks", label: "Weeks" },
                ]}
                error={errors?.timeUnit}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What percentage did you complete? *
            </label>

            <FloatingInput
              label="Completion Percentage"
              type="number"
              value={completion}
              onChange={(e) => {
                setCompletion(e.target.value),
                  setErrors((prev) => ({
                    ...prev,
                    completion: "",
                  }));
              }}
              error={errors?.completion}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

JobTaskReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isAdminReview: PropTypes.bool,
  taskDetails: PropTypes.shape({
    _id: PropTypes.string,
    details: PropTypes.string,
    title: PropTypes.string,
    completion: PropTypes.number,
    completionTime: PropTypes.object,
    timeSpent: PropTypes.object,
  }),
};

export default JobTaskReviewModal;
