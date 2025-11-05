/* eslint-disable react/prop-types */
import { FloatingInput } from "@/component/FloatiingInput";
import { FileText, LinkIcon, Upload, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/component/Toast";
import PropTypes from "prop-types";
import { useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { useUpdateDailyTaskMutation } from "@/redux/features/dailyTask/dailyTaskApiSlice";
import SelectInput from "@/component/select/SelectInput";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { useSelector } from "react-redux";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { useGetProjectsQuery } from "@/redux/features/admin/project/projectApiSlice";
import Button from "@/component/Button";

const EditTaskModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    employeeId: null,
    description: "",
    priority: null,
    attachments: [],
    project: null,
    dueDate: "",
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [formErrors, setFormErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile] = useUploadFileMutation();
  const [updateDailyTask] = useUpdateDailyTaskMutation();
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'link'
  const [linkInput, setLinkInput] = useState("");

  const logInUser = useSelector((state) => state.userSlice.user);
  const isEmployee = logInUser?.user?.role === "Employee";

  const {
    data: projectsDataForEmployee,
    isLoading: isLoadingProjectsForEmployee,
  } = useGetProjectsQuery({
    page: 1,
    limit: 9000000,
  });

  const priorityData = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 9000000000,
  });

  useEffect(() => {
    if (task) {
      const employee =
        employeesData?.data?.find(
          (employee) => employee._id === task.employeeId?._id
        ) || null;
      // console.log(employee);

      // Format dueDate for datetime-local input (convert UTC to local time)
      let formattedDueDate = "";
      if (task.dueDate) {
        const utcDate = new Date(task.dueDate);
        if (!isNaN(utcDate.getTime())) {
          // Convert UTC to local time by adjusting for timezone offset
          const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
          );
          // Format to YYYY-MM-DDTHH:MM for datetime-local input
          formattedDueDate = localDate.toISOString().slice(0, 16);
        }
      }

      setFormData({
        employeeId: {
          value: employee?._id || null,
          label: `${employee?.firstName} ${employee?.lastName}`,
        },
        title: task.title || "",
        project: {
          label: task?.project?.name || "",
          value: task?.project?._id || null,
        },
        description: task.details,
        priority: priorityData.find((p) => p.value === task.priority) || null,
        attachments: task.attachments || [],
        dueDate: formattedDueDate,
      });
    }
  }, [task, employeesData]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    try {
      // Upload each file and get the URL
      const uploadPromises = droppedFiles.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        const uploadResponse = await uploadFile(uploadFormData).unwrap();
        return uploadResponse.fileUrl; // Return the URL string
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Add the uploaded URLs to attachments array
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedUrls],
      }));

      // toast.success("Success", `${uploadedUrls.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Error", "Failed to upload files. Please try again.");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    // Add files to attachments array (they'll be uploaded on form submission)
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...selectedFiles],
    }));

    // Clear the input
    e.target.value = "";
  };

  const handleDeleteAttachment = (indexToDelete) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = "Task title is required";
    if (!formData.description)
      errors.description = "Task description is required";
    if (!formData.priority) errors.priority = "Priority is required";
    setFormErrors(errors);
    // console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsUploading(true);

      // Upload new attachments
      // Separate files and links
      const filesToUpload = formData.attachments.filter(
        (item) => item instanceof File
      );
      const links = formData.attachments.filter(
        (item) => typeof item === "string"
      );

      // Upload all files
      const uploadedFileUrls = [];
      if (filesToUpload.length > 0) {
        const uploadPromises = filesToUpload.map(async (file) => {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);
          const uploadResponse = await uploadFile(uploadFormData).unwrap();
          return uploadResponse.fileUrl;
        });

        const uploadResults = await Promise.all(uploadPromises);
        uploadedFileUrls.push(...uploadResults);

        toast.success(
          "Success",
          `${uploadResults.length} file(s) uploaded successfully`
        );
      }

      // Combine uploaded file URLs with existing links
      const allAttachments = [...uploadedFileUrls, ...links];

      const updatePayload = {
        id: task._id,
        title: formData.title,
        project: formData.project?.value || null,
        details: formData.description,
        priority: formData.priority?.value,
        attachments: allAttachments,
        employeeId: formData.employeeId?.value || null,
        dueDate: formData.dueDate, // Send local time directly, backend will handle UTC conversion
      };

      // Update task
      await updateDailyTask(updatePayload).unwrap();
      onUpdate();
      onClose();
      toast.success("Success", "Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Error", error?.data?.message || "Failed to update task");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      // Basic URL validation
      try {
        new URL(linkInput);
        // setAttachments((prev) => [...prev, linkInput.trim()]);
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, linkInput.trim()],
        }));
        setLinkInput("");
      } catch (e) {
        toast.error("Error", "Please enter a valid URL");
      }
    }
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
            <span className="text-xs text-orange-700 bg-orange-100 text-center rounded-xl px-2">
              Pending Upload
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
      // It's a link
      return (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
        >
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-4 w-4 text-blue-500" />
            <a
              href={attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate max-w-xs"
              title={attachment}
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

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl z-20">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Edit Task
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <FloatingInput
                label="Task Title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    title: "",
                  }));
                }}
                error={formErrors.title}
              />

              <FloatingTextarea
                id="description"
                label="Task Description"
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    description: "",
                  }));
                }}
                rows={4}
                className="mt-6"
                error={formErrors.description}
              />

              <FloatingInput
                label="Due Date & Time"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    dueDate: "",
                  }));
                }}
                error={formErrors.dueDate}
                className="mt-6"
              />
            </div>

            <SelectInput
              className="z-40"
              label="Set Priority"
              isMulti={false}
              value={formData?.priority?.label ? formData?.priority : null}
              onChange={(e) => {
                // console.log(e);
                setFormData((prev) => ({
                  ...prev,
                  priority: e,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  priority: "",
                }));
              }}
              options={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
              ]}
              error={formErrors?.priority}
            />

            <SelectInput
              disabled={isEmployee}
              className="z-30"
              label="Select Employee"
              isMulti={false}
              value={formData.employeeId}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  employeeId: e,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  employeeId: "",
                }));
              }}
              options={
                employeesData?.data
                  ?.filter(
                    (employee) =>
                      employee?.role === "DepartmentHead" ||
                      employee?.role === "Employee"
                  )
                  ?.sort((a, b) => {
                    const nameA = `${a?.firstName ?? ""} ${
                      a?.lastName ?? ""
                    }`.toLowerCase();
                    const nameB = `${b?.firstName ?? ""} ${
                      b?.lastName ?? ""
                    }`.toLowerCase();
                    return nameA.localeCompare(nameB);
                  })
                  ?.map((employee) => ({
                    label:
                      (employee?.firstName || "") +
                      " " +
                      (employee?.lastName || ""),
                    value: employee._id,
                    email: employee?.email,
                    department: employee?.department?.name,
                    role: employee?.role,
                  })) || []
              }
              error={formErrors.employeeId}
            />

            <SelectInput
              className={"z-20"}
              label="Select Project"
              isMulti={false}
              value={formData.project}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  project: e,
                }));
              }}
              options={[
                { label: "No Project", value: "" },
                ...(projectsDataForEmployee?.projects?.map((project) => ({
                  value: project._id,
                  label: project.name,
                })) || []),
              ]}
            />

            {/* <div className="my-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>

              {formData.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Current Attachments
                  </h4>
                  <div className="space-y-2">
                    {formData.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                      >
                        <a
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            Attachment {index + 1}
                          </span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(index, false)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop files here, or
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3 bg-primary text-white rounded-md text-xs font-medium  transition-colors"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {newAttachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    New Attachments
                  </h4>
                  <div className="space-y-2">
                    {newAttachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {file.name} ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(index, true)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div> */}

            <div className="mt-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
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

              {formData?.attachments.length > 0 && (
                <div className="mt-2 sm:mt-3 space-y-2">
                  {formData.attachments.map((attachment, index) =>
                    renderAttachmentPreview(attachment, index)
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isUploading ? "Updating..." : "Update Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    attachments: PropTypes.array,
  }),
  onUpdate: PropTypes.func.isRequired,
};

export default EditTaskModal;
