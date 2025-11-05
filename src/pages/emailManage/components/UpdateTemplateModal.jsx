import {
  useGetCategoriesQuery,
  useSendEmailMutation,
} from "@/redux/features/email/emailApiSlice";
import { LockKeyhole, X, Send, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import { toast } from "@/component/Toast";
import { RichTextEditor } from "@/component/RichTextEditor";

const UpdateTemplateModal = ({
  open,
  setOpen,
  cancelEdit,
  newTemplate,
  handleNewTemplateChange,
  saveEditedTemplate,
  isUpdating,
  selectedTemplateCategory,
  setSelectedTemplateCategory,
}) => {
  const modalRef = useRef(null);
  const testEmailModalRef = useRef(null);
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState("#3a41e2");
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const user = useSelector((state) => state.userSlice.user);

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch,
  } = useGetCategoriesQuery();
  const [sendEmail, { isLoading, isSuccess, isError, error }] =
    useSendEmailMutation();

  // Set the selected category when template changes
  useEffect(() => {
    if (open && newTemplate?.category) {
      const templateCategory = {
        value: newTemplate.category._id || newTemplate.category,
        label: newTemplate.category.name || newTemplate.category,
      };
      setSelectedTemplateCategory(templateCategory);
    }
  }, [open, newTemplate, setSelectedTemplateCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close main modal if test email modal is open
      if (showTestEmailModal) return;

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen, showTestEmailModal]);

  // Handle click outside for test email modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        testEmailModalRef.current &&
        !testEmailModalRef.current.contains(event.target)
      ) {
        setShowTestEmailModal(false);
      }
    };
    if (showTestEmailModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTestEmailModal]);

  const handleContentChange = (content) => {
    newTemplate.content = content;
  };

  const handleSendTestEmail = async () => {
    // Validation with toast errors
    if (!testEmailAddress.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!newTemplate.subject || !newTemplate.subject.trim()) {
      toast.error("Email subject is required");
      return;
    }

    if (
      !newTemplate.content ||
      !newTemplate.content.trim() ||
      newTemplate.content === "<p>Enter your template content here...</p>"
    ) {
      toast.error("Email body content is required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailAddress.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSendingTest(true);

    // Console log the required information
    // console.log("email:", testEmailAddress.trim())
    // console.log("body:", newTemplate.content)
    // console.log("subject:", newTemplate.subject)
    try {
      const res = await sendEmail({
        to: testEmailAddress.trim(),
        subject: newTemplate.subject,
        body: newTemplate.content,
        userId: user._id,
      }).unwrap();
      setIsSendingTest(false);
      setShowTestEmailModal(false);
      setTestEmailAddress("");
      toast.success("Email sent successfully!");
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    }
  };

  const reactSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#3a41e2" : provided.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px #3a41e2" : provided.boxShadow,
      "&:hover": {
        borderColor: state.isFocused ? "#3a41e2" : provided.borderColor,
      },
      minHeight: "38px", // Match input height
      fontSize: "0.875rem", // text-sm
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3a41e2"
        : state.isFocused
        ? "#e6f7f5"
        : provided.backgroundColor,
      color: state.isSelected ? "white" : provided.color,
      fontSize: "0.875rem", // text-sm
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e6f7f5", // Light green background for selected tags
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#3a41e2", // Green text for selected tags
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#3a41e2",
      "&:hover": {
        backgroundColor: "#3a41e2",
        color: "white",
      },
    }),
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col relative "
          >
            <div
              className="mb-4 p-3 border rounded-md min-h-full overflow-auto"
              style={{ borderColor: "#3a41e2" }}
            >
              <div className="flex  justify-between items-center mb-2">
                <h4
                  className="font-medium text-sm"
                  style={{ color: "#3a41e2" }}
                >
                  Edit Template
                </h4>
                <div className="flex absolute right-5 top-4 items-center gap-5">
                  {/* Send Test Email Button - Using Primary Color */}
                  <button
                    onClick={() => setShowTestEmailModal(true)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-white rounded-md transition-colors"
                    style={{ backgroundColor: "#3a41e2" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#007A64")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#3a41e2")
                    }
                  >
                    <Send size={14} />
                    Send Test Email
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-500 border p-1 border-gray-600 rounded-full hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 ">
                <div>
                  <label
                    htmlFor="editTemplateTitle"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Template Title
                  </label>
                  <input
                    id="editTemplateTitle"
                    name="title"
                    placeholder="e.g. Welcome Email - Template"
                    type="text"
                    value={newTemplate.title}
                    onChange={handleNewTemplateChange}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="w-[250px]">
                  <label
                    className="text-sm pb-2 font-semibold text-gray-700 "
                    htmlFor=""
                  >
                    Category
                  </label>
                  <Select
                    options={[
                      ...(categories?.map((category) => ({
                        value: category._id,
                        label: category.name,
                      })) || []),
                    ]}
                    value={selectedTemplateCategory}
                    onChange={(option) => setSelectedTemplateCategory(option)}
                    placeholder={
                      categoriesLoading
                        ? "Loading categories..."
                        : "Select Template Category"
                    }
                    // isClearable
                    isDisabled={categoriesLoading}
                    classNamePrefix="react-select"
                    styles={reactSelectStyles}
                  />
                </div>
                <div>
                  <label
                    htmlFor="editTemplateDescription"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Template Description
                  </label>
                  <textarea
                    id="editTemplateDescription"
                    name="des"
                    placeholder="e.g. This template is used for welcoming new users."
                    type="text"
                    value={newTemplate.des}
                    onChange={handleNewTemplateChange}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editTemplateSubject"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Email Subject
                  </label>
                  <input
                    id="editTemplateSubject"
                    name="subject"
                    placeholder="e.g. Welcome to Our Service"
                    type="text"
                    value={newTemplate.subject}
                    onChange={handleNewTemplateChange}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                {newTemplate?.placeholders?.length !== 0 && (
                  <div className="text-sm">
                    <p className="flex gap-1 items-start">
                      {" "}
                      <LockKeyhole size={18} className="text-primary" />{" "}
                      Required Placeholders :{" "}
                      {newTemplate?.placeholders?.join(", ")}
                    </p>
                  </div>
                )}
                <div className="">
                  <label
                    htmlFor="editTemplateContent"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Email Body
                  </label>
                  <div className=" rounded-md">
                    <RichTextEditor
                      initialContent={
                        newTemplate.content ||
                        "<p>Enter your template content here...</p>"
                      }
                      onContentChange={handleContentChange}
                      minHeight="685px"
                      buttonBackgroundColor={buttonBackgroundColor}
                      setButtonBackgroundColor={setButtonBackgroundColor}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 absolute bottom-8 right-10">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 z-50 border bg-white border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={saveEditedTemplate}
                    className="px-3 py-1  text-white rounded-md bg-primary z-50 hover:bg-primary transition-colors"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div
            ref={testEmailModalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail style={{ color: "#3a41e2" }} size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                  Send Test Email
                </h3>
              </div>
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="testEmailAddress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Send to Email Address
              </label>
              <input
                id="testEmailAddress"
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  focusRingColor: "#3a41e2",
                  "--tw-ring-color": "#3a41e2",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3a41e2";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0, 131, 108, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Subject:</strong> {newTemplate.subject || "No subject"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Template:</strong>{" "}
                {newTemplate.title || "Untitled Template"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#3a41e2" }}
                onMouseEnter={(e) =>
                  !isSendingTest && (e.target.style.backgroundColor = "#007A64")
                }
                onMouseLeave={(e) =>
                  !isSendingTest && (e.target.style.backgroundColor = "#3a41e2")
                }
              >
                {isSendingTest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Test Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateTemplateModal;
