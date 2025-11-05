import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, LinkIcon } from "lucide-react";
import { useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import {
  useUpdateDailyTaskMutation,
  useUpdateDailyTaskStatusMutation,
} from "@/redux/features/dailyTask/dailyTaskApiSlice";
import { toast } from "@/component/Toast";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import SelectInput from "@/component/select/SelectInput";
import PropTypes from "prop-types";
import Button from "@/component/Button";

const ReviewTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  taskDetails,
  isAdminReview = false,
}) => {
  const [timeValue, setTimeValue] = useState("");
  const [timeUnit, setTimeUnit] = useState();
  const [completion, setCompletion] = useState("");
  const [completedDetails, setCompletedDetails] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'link'
  const [linkInput, setLinkInput] = useState("");
  const fileInputRef = useRef(null);

  const [uploadFile] = useUploadFileMutation();
  const [updateTaskAttachments] = useUpdateDailyTaskMutation();
  const [updateTaskStatus] = useUpdateDailyTaskStatusMutation();

  // Effect to pre-fill data when modal opens for admin review
  useEffect(() => {
    if (isOpen && taskDetails && isAdminReview) {
      // Pre-fill existing completion data
      if (taskDetails.completion !== undefined) {
        setCompletion(taskDetails.completion.toString());
      }

      // Pre-fill existing completed details
      if (taskDetails.completedDetails) {
        setCompletedDetails(taskDetails.completedDetails);
      }

      // Pre-fill existing completion time data
      if (taskDetails.completionTime) {
        setTimeValue(taskDetails.completionTime.value?.toString() || "");

        // Find matching time unit option
        const timeUnitOptions = [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
          { value: "weeks", label: "Weeks" },
        ];

        const matchingUnit = timeUnitOptions.find(
          (option) => option.value === taskDetails.completionTime.unit
        );
        if (matchingUnit) {
          setTimeUnit(matchingUnit);
        }
      }
    }
  }, [isOpen, taskDetails, isAdminReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!timeValue) newErrors.timeValue = "Time value is required";
    if (!timeUnit) newErrors.timeUnit = "Time unit is required";
    if (!completion) {
      newErrors.completion = "Completion percentage is required";
    } else if (completion < 0 || completion > 100) {
      newErrors.completion = "Completion must be between 0 and 100";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsUploading(true);

      // Upload new attachments if any
      const attachmentUrls = [];
      const fileAttachments = attachments.filter((att) => att instanceof File);

      if (fileAttachments.length > 0) {
        for (const file of fileAttachments) {
          const formData = new FormData();
          formData.append("file", file);
          const response = await uploadFile(formData).unwrap();
          if (response.fileUrl) {
            attachmentUrls.push(response.fileUrl);
          }
        }
      }

      const linkAttachments = attachments.filter(
        (att) => typeof att === "string" && !(att instanceof File)
      );

      // Combine new file URLs and link attachments
      const allAttachments = [
        ...(taskDetails?.attachments || []),
        ...attachmentUrls,
        ...linkAttachments,
      ];

      // Update task with new attachments
      await updateTaskAttachments({
        id: taskDetails._id,
        attachments: allAttachments,
      }).unwrap();

      // Update task status with completion data
      const targetStatus = isAdminReview ? "Completed" : "In Review";
      await updateTaskStatus({
        taskId: taskDetails._id,
        status: targetStatus,
        completion: Number.parseInt(completion),
        completedDetails: completedDetails.trim() || undefined,
        completionTime: {
          value: Number.parseInt(timeValue),
          unit: timeUnit?.value,
        },
      }).unwrap();

      // Call parent onSubmit with the review data
      onSubmit({
        timeValue: Number.parseInt(timeValue),
        timeUnit: timeUnit?.value,
        completion: Number.parseInt(completion),
        completedDetails: completedDetails.trim() || undefined,
        attachments: [...attachmentUrls, ...linkAttachments],
      });

      resetForm();
      const successMessage = isAdminReview
        ? "Task completed and review updated successfully!"
        : "Task review submitted successfully!";
      toast.success("Success", successMessage);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Error", error?.data?.message || "Failed to submit review");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTimeValue("");
    setTimeUnit();
    setCompletion("");
    setCompletedDetails("");
    setAttachments([]);
    setErrors(null);
    setActiveTab("upload");
    setLinkInput("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...selectedFiles]);
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      // Basic URL validation
      try {
        new URL(linkInput);
        setAttachments((prev) => [...prev, linkInput.trim()]);
        setLinkInput("");
      } catch (e) {
        toast.error("Error", "Please enter a valid URL");
      }
    }
  };

  const handleDeleteAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]);
  };

  const renderAttachmentPreview = (attachment, index) => {
    if (attachment instanceof File) {
      return (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {attachment.name} ({formatFileSize(attachment.size)})
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleDeleteAttachment(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-4 w-4 text-gray-500" />
            <a
              href={attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate max-w-xs"
            >
              {attachment}
            </a>
          </div>
          <button
            type="button"
            onClick={() => handleDeleteAttachment(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-xs sm:max-w-md lg:max-w-2xl w-full shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
            {isAdminReview
              ? "Review and Complete Task"
              : "Task Review Information"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 rounded-lg">
          <p className="text-sm sm:text-base text-gray-900 font-semibold mb-2 text-center">
            {taskDetails?.title}
          </p>
          <p className="text-xs sm:text-sm text-gray-700">
            <strong>Details:</strong> {taskDetails?.details}
          </p>
          {isAdminReview && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
                📝 Admin Review Mode
              </p>
              <p className="text-xs text-blue-700">
                You can review and update the completion information before
                marking this task as completed.
              </p>
            </div>
          )}
          {taskDetails?.attachments?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600">
                Current Attachments:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {taskDetails.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    File {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              Task Completion Details *
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <FloatingInput
                label="Time Value"
                type="number"
                min="1"
                value={timeValue}
                onChange={(e) => {
                  setTimeValue(e.target.value);
                  setErrors((prev) => ({ ...prev, timeValue: "" }));
                }}
                error={errors?.timeValue}
                className="flex-1"
              />

              <SelectInput
                className={"z-30 -mt-0.5 flex-1"}
                label="Time Unit"
                isMulti={false}
                value={timeUnit}
                onChange={(e) => {
                  setTimeUnit(e);
                  setErrors((prev) => ({ ...prev, timeUnit: "" }));
                }}
                options={[
                  { value: "minutes", label: "Minutes" },
                  { value: "hours", label: "Hours" },
                  { value: "days", label: "Days" },
                  { value: "weeks", label: "Weeks" },
                ]}
                error={errors?.timeUnit}
              />

              <FloatingInput
                label="Completion %"
                type="number"
                min="0"
                max="100"
                value={completion}
                onChange={(e) => {
                  setCompletion(e.target.value);
                  setErrors((prev) => ({ ...prev, completion: "" }));
                }}
                error={errors?.completion}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              Additional completion details (Optional)
            </label>
            <FloatingTextarea
              // label="Describe what was completed, any challenges faced, or additional notes..."
              value={completedDetails}
              onChange={(e) => setCompletedDetails(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Add Attachments (Optional)
            </label>

            <div className="flex border-b border-gray-200 mb-3 sm:mb-4">
              <button
                type="button"
                className={`py-1.5 sm:py-2 px-2 sm:px-4 font-medium text-xs sm:text-sm focus:outline-none ${
                  activeTab === "upload"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`py-1.5 sm:py-2 px-2 sm:px-4 font-medium text-xs sm:text-sm focus:outline-none ${
                  activeTab === "link"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("link")}
              >
                Add Link
              </button>
            </div>

            {activeTab === "upload" ? (
              <div
                className={`border-2 border-dashed rounded-lg p-3 sm:p-4 transition-all duration-300 ${
                  isDragging ? "border-primary bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  <p className="text-xs sm:text-sm font-medium text-gray-700">
                    Drag & drop files here, or
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1 sm:py-1.5 px-2 sm:px-3 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex gap-2">
                  <FloatingInput
                    label="Enter URL"
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    className="py-0 px-3 sm:px-6 bg-primary text-white rounded-md text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Example: https://example.com/document.pdf
                </p>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-2 sm:mt-3 space-y-2">
                {attachments.map((attachment, index) =>
                  renderAttachmentPreview(attachment, index)
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 text-sm"
            >
              {isUploading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReviewTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isAdminReview: PropTypes.bool,
  taskDetails: PropTypes.shape({
    _id: PropTypes.string,
    details: PropTypes.string,
    title: PropTypes.string,
    attachments: PropTypes.array,
    completion: PropTypes.number,
    completedDetails: PropTypes.string,
    completionTime: PropTypes.shape({
      value: PropTypes.number,
      unit: PropTypes.string,
    }),
  }),
};

export default ReviewTaskModal;
