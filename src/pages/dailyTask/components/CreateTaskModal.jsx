import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, LinkIcon } from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import { useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { toast } from "@/component/Toast";
import PropTypes from "prop-types";
import { useGetProjectsQuery } from "@/redux/features/admin/project/projectApiSlice";
import { FloatingTextarea } from "@/component/FloatingTextarea";

const CreateTaskModal = ({
  isOpen,
  onClose,
  employeesData,
  loggedInUser,
  onCreateTask,
}) => {
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'link'
  const [linkInput, setLinkInput] = useState("");
  // const [attachments, setAttachments] = useState([]);

  // Set default due date to today at 7:00 PM in local timezone
  const getCurrentDateAt7PM = () => {
    const today = new Date();
    
    // Create a new date object for today
    const localDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      19, 0, 0, 0  // Set to 7:00:00 PM in local time
    );
    
    // Format to YYYY-MM-DDThh:mm using local timezone values
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: { value: "", label: "" },
    project: null,
    employeeId: null,
    dueDate: getCurrentDateAt7PM(),
    assignedBy: loggedInUser?.user?._id || null,
    attachments: [],
  });
  // console.log(formData.attachments);
  const [formErrors, setFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const [uploadFile] = useUploadFileMutation();

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

  const {
    data: projectsDataForEmployee,
    isLoading: isLoadingProjectsForEmployee,
  } = useGetProjectsQuery({
    page: 1,
    limit: 9000000,
  });

  const validateForm = () => {
    let errors = {};
    if (!formData.title) errors.title = "Task title is required.";
    if (!formData.description)
      errors.description = "Task description is required.";
    if (!formData.priority) errors.priority = "Priority is required.";
    if (!formData.employeeId)
      errors.employeeId = "Employee selection is required.";
    if (!formData.dueDate || formData.dueDate === "")
      errors.dueDate = "Due date is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (loggedInUser?.user?.role === "Employee" && employeesData?.data) {
      const userEmployee = employeesData.data.find(
        (emp) => emp._id === loggedInUser.user._id
      );

      if (userEmployee) {
        const employeeOption = {
          label: `${userEmployee.firstName} ${userEmployee.lastName}`,
          value: userEmployee._id,
          email: userEmployee.email,
          department: userEmployee.department?.name,
          role: userEmployee.role,
        };

        setFormData((prev) => ({
          ...prev,
          employeeId: employeeOption,
        }));
      }
    }
  }, [loggedInUser, employeesData?.data]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

  const resetForm = () => {
  setFormData({
    title: "",
    description: "",
    priority: "",
    employeeId:
      loggedInUser?.user?.role === "Employee"
        ? {
            label: `${loggedInUser?.user?.firstName || ""} ${
              loggedInUser?.user?.lastName || ""
            }`,
            value: loggedInUser?.user?._id || null,
          }
        : null,
    dueDate: getCurrentDateAt7PM(), // Set default due date to today at 7:00 PM
    project: null,
    assignedBy: loggedInUser?.user?._id || null,
    attachments: [],
  });
  setFormErrors({});
  setActiveTab("upload"); // Reset to upload tab
  setLinkInput(""); // Clear link input
};

  // const handleFileSelect = (e) => {
  //   const selectedFiles = Array.from(e.target.files);
  //   setFormData((prev) => ({
  //     ...prev,
  //     attachments: [...prev.attachments, ...selectedFiles],
  //   }));
  // };

  const handleDeleteAttachment = (indexToDelete) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Validation Error", "Please fill in all required fields.");
      return;
    }

    try {
      setIsCreating(true);

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

      const taskPayload = {
        employeeId: formData.employeeId.value,
        project: formData.project?.value || null,
        title: formData.title,
        details: formData.description,
        dueDate: formData.dueDate,
        assignedBy: formData.assignedBy,
        priority: formData.priority.value,
        attachments: allAttachments,
      };

      await onCreateTask(taskPayload);

      onClose();
      resetForm();
      // setFormData({
      //   title: "",
      //   description: "",
      //   priority: "",
      //   employeeId:
      //     loggedInUser?.user?.role === "Employee"
      //       ? {
      //         label: `${loggedInUser?.user?.firstName || ""} ${loggedInUser?.user?.lastName || ""
      //           }`,
      //         value: loggedInUser?.user?._id || null,
      //       }
      //       : null,
      //   dueDate: "",
      //   project: null,
      //   assignedBy: loggedInUser?.user?._id || null,
      //   attachments: [],
      // });
      // setActiveTab("upload")
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error(
        "Error",
        error?.data?.message || "Failed to create task. Please try again."
      );
    } finally {
      setIsCreating(false);
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
            disabled={isCreating}
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

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault(); // stop any accidental background scroll (safety)
    modalRef.current.scrollTop += e.deltaY;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onWheel={handleOverlayScroll} // added
    >
      <div
        ref={modalRef} // added
        className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-xl relative my-8 max-h-[80vh] overflow-y-auto"
      >
        <button
          className="absolute top-4 right-4 text-red-500"
          onClick={() => {
            onClose();
            resetForm();
          }}
        >
          <X size={18} strokeWidth={4} />
        </button>
        <h2 className="text-xl font-semibold text-center mb-6">Add New Task</h2>
        <div>
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

          {/* <FloatingInput
            label="Task Description"
            type="textarea"
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
            error={formErrors.description}
          /> */}

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

          <SelectInput
            className="z-30"
            label="Set Priority"
            isMulti={false}
            value={formData.priority.label ? formData.priority : null}
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
            error={formErrors.priority}
          />
          <SelectInput
            disabled={loggedInUser?.user?.role === "Employee"}
            className="z-20 cursor-not-allowed"
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
            options={[...(employeesData?.data || [])] // Shallow copy to avoid mutation
              .sort((a, b) => {
                const nameA = `${a?.firstName ?? ""} ${
                  a?.lastName ?? ""
                }`.toLowerCase();
                const nameB = `${b?.firstName ?? ""} ${
                  b?.lastName ?? ""
                }`.toLowerCase();
                return nameA.localeCompare(nameB);
              })
              .map((employee) => ({
                label:
                  (employee?.firstName || "") +
                  " " +
                  (employee?.lastName || ""),
                value: employee._id,
                email: employee?.email,
                department: employee?.department?.name,
                role: employee?.role,
              }))}
            error={formErrors.employeeId}
          />

          <SelectInput
            className={"z-10"}
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
              { value: null, label: "No Project" },
              ...(projectsDataForEmployee?.projects?.map((project) => ({
                value: project._id,
                label: project.name,
              })) || []),
            ]}
          />

          {/* Attachments Section */}
          {/* <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${isDragging ? "border-primary bg-blue-50" : "border-gray-300"
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
                  className="py-1.5 px-3 bg-primary text-white rounded-md text-xs font-medium transition-colors"
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
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
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
                      onClick={(e) => handleDeleteAttachment(e, file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
                setFormErrors({});
              }}
              className="bg-gray-500"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className=""
              size="sm"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

CreateTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  employeesData: PropTypes.shape({
    data: PropTypes.array,
  }),
  loggedInUser: PropTypes.object,
  onCreateTask: PropTypes.func.isRequired,
};

export default CreateTaskModal;
