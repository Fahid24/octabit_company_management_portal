import { useState, useEffect, useRef } from "react";
import { Loader, SendHorizonal, X } from "lucide-react";
import { useSelector } from "react-redux";
import { EmailEditor } from "./email-edit-editor";
import { EmailPreview } from "./email-edit-preview";
import { toast } from "@/component/Toast";
import { useSendEmailMutation } from "@/redux/features/email/emailApiSlice";

export function EmailEditModal({ email, refetch, open, setOpen }) {
  const [activeTab, setActiveTab] = useState("edit");
  const modalRef = useRef(null);
  const user = useSelector((state) => state.userSlice.user);
  const [sendEmail, { isLoading }] = useSendEmailMutation();

  const [emailContent, setEmailContent] = useState({
    to: "",
    subject: "",
    body: "",
  });

  // Initialize email content when email prop changes
  useEffect(() => {
    if (email) {
      setEmailContent({
        to: email.to || "",
        subject: email.subject || "",
        body: email.body || "",
      });
    }
  }, [email]);

  const handleSendEmail = async () => {
    try {
      // Validate email fields
      if (!emailContent.to) {
        toast.error("Please enter a recipient email address");
        return;
      }

      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (!emailRegex.test(String(emailContent.to).toLowerCase())) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (!emailContent.subject) {
        toast.error("Please enter an email subject");
        return;
      }

      if (!emailContent.body || emailContent.body === "<p></p>") {
        toast.error("Please enter a message body");
        return;
      }

      await sendEmail({
        to: emailContent.to,
        subject: emailContent.subject,
        body: emailContent.body,
        userId: user._id,
      }).unwrap();

      toast.success("Email sent successfully");
      setEmailContent({
        to: "",
        subject: "",
        body: "",
      });
      setOpen(false);
      refetch?.();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error?.data?.message || "Failed to send email");
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [open, setOpen]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Email Editor</h2>
              <button
                onClick={() => {
                  setEmailContent({
                    to: "",
                    subject: "",
                    body: "",
                  });
                  setOpen(false);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "edit"
                    ? "border-b-2 border-gray-800 text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("edit")}
              >
                Edit
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "preview"
                    ? "border-b-2 border-gray-800 text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "edit" ? (
                <EmailEditor
                  emailContent={emailContent}
                  setEmailContent={setEmailContent}
                />
              ) : (
                <EmailPreview emailContent={emailContent} />
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => {
                  setOpen(false);
                  setEmailContent({
                    to: "",
                    subject: "",
                    body: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 flex gap-2 items-center bg-primary text-white rounded-md hover:bg-primary transition-colors"
                disabled={isLoading}
              >
                Send Email
                {isLoading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <SendHorizonal size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
