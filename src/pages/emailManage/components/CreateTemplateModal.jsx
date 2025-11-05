import {
  useGetCategoriesQuery,
  useSendEmailMutation,
  useSendTestEmailMutation,
} from "@/redux/features/email/emailApiSlice";
import { Loader, X, Send, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "@/component/Toast";
import { RichTextEditor } from "@/component/RichTextEditor";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import Button from "@/component/Button";

export function CreateTemplateModal({
  open,
  setOpen,
  setShowNewTemplateForm,
  setNewTemplate,
  handleNewTemplateChange,
  newTemplate,
  isLoading,
  saveNewTemplate,
  setSelectedTemplateCategory,
  selectedTemplateCategory,
}) {
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState("#3a41e2");
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendEmail, { isLoading: sendLoading, isSuccess, isError, error }] =
    useSendEmailMutation();
  const [sendTestEmail] = useSendTestEmailMutation();
  const user = useSelector((state) => state.userSlice.user);
  const modalRef = useRef(null);
  const testEmailModalRef = useRef(null);

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
    setNewTemplate((prev) => ({
      ...prev,
      content: content,
    }));
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

    try {
      await sendTestEmail({
        to: testEmailAddress.trim(),
        subject: newTemplate.subject,
        body: newTemplate.content,
        userId: user._id,
        userModel: user.role,
      }).unwrap();
      setIsSendingTest(false);
      setShowTestEmailModal(false);
      setTestEmailAddress("");
      toast.success("Test email sent successfully!");
    } catch (error) {
      // console.log(error)
      toast.error("Failed to send email. Please try again.");
      setIsSendingTest(false);
    }
  };

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch,
  } = useGetCategoriesQuery();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col relative"
          >
            <div
              className="mb-4 p-3 min-h-full rounded-md overflow-auto"
              style={{ borderColor: "#3a41e2" }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-lg text-primary ">
                  Create New Template
                </h4>
                <div className="flex absolute right-5 top-4 items-center gap-2">
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
                    onClick={() => {
                      setShowNewTemplateForm(false);
                      setNewTemplate({
                        title: "",
                        content: "<p>Enter your template content here...</p>",
                      });
                    }}
                    className="text-gray-500 border p-1 border-gray-600 rounded-full hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <FloatingInput
                    id="templateTitle"
                    name="title"
                    type="text"
                    label="Template Title"
                    value={newTemplate.title}
                    onChange={handleNewTemplateChange}
                    // placeholder="e.g. Welcome Email - Template"
                    required
                  />
                </div>
                <div className="w-[250px]">
                  <SelectInput
                    label="Category"
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
                    disabled={categoriesLoading}
                  />
                </div>
                <div>
                  <FloatingInput
                    id="templateDescription"
                    name="des"
                    type="text"
                    label="Template Description"
                    value={newTemplate.des}
                    onChange={handleNewTemplateChange}
                    // placeholder="e.g. This template is used for welcoming new users."
                    required
                  />
                </div>
                <div>
                  <FloatingInput
                    id="templateSubject"
                    name="subject"
                    type="text"
                    label="Email Subject"
                    value={newTemplate.subject}
                    onChange={handleNewTemplateChange}
                    // placeholder="e.g. Welcome to OptimalMD."
                    required
                  />
                </div>
                <div className="">
                  <label
                    htmlFor="templateContent"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Body
                  </label>
                  <div className=" rounded-md overflow-auto">
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
                <div className="flex justify-end absolute bottom-14 z-50 md:bottom-6 right-8">
                  <Button
                    onClick={() => {
                      saveNewTemplate();
                      refetch(); // Refetch categories after saving
                    }}
                    disabled={isLoading}
                    isLoading={isLoading}
                    variant="primary"
                    size="sm"
                    className="bg-primary hover:bg-primary"
                  >
                    Save Template
                  </Button>
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
              <FloatingInput
                id="testEmailAddress"
                type="email"
                label="Send to Email Address"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email address"
                required
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
              <Button
                onClick={() => setShowTestEmailModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                isLoading={isSendingTest}
                icon={Send}
                variant="primary"
                className="bg-primary hover:bg-primary"
              >
                Send Test Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
