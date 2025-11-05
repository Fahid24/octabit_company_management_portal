import { useState, useEffect, useRef } from "react";
import { EmailEditor } from "./email-editor";
import { EmailPreview } from "./email-preview";
import { Loader, Mail, SendHorizonal, X } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "@/component/Toast";
import { useSendEmailMutation } from "@/redux/features/email/emailApiSlice";
import Button from "@/component/Button";
import { companyEmail } from "@/constant/companyInfo";

export function EmailModal() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const modalRef = useRef(null);
  const user = useSelector((state) => state.userSlice.user);
  const [sendEmail, { isLoading, isSuccess, isError, error }] =
    useSendEmailMutation();

  const [emailContent, setEmailContent] = useState({
    from: companyEmail,
    to: "",
    subject: "",
    messageBody:
      "<p>Hi $firstName,</p><p>I hope this email finds you well. I wanted to reach out regarding your recent inquiry about our services.</p><p>Looking forward to hearing from you soon.</p>",
    footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0; " >As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin@haquedigital.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin@haquedigital.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Shawn Fry</p><p style="margin: 0">Founder & CEO</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;">
		<p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and
			may contain privileged, proprietary or confidential information intended solely for use by OptimalMD
			Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify me via
			return email. Please also delete this message, its attachments and all copies, electronic or print, without
			further distribution.</font></p>

	</td>`,
  });

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

      if (!emailContent.messageBody || emailContent.messageBody === "<p></p>") {
        toast.error("Please enter a message body");
        return;
      }

      if (!emailContent.footer || emailContent.footer === "<p></p>") {
        toast.error("Please enter a footer");
        return;
      }

      await sendEmail({
        to: emailContent.to,
        subject: emailContent.subject,
        body: `
          <!DOCTYPE html>
          <html>
          <body style="margin: 0; padding: 0; background-color: white; font-family: Arial, Helvetica, sans-serif;">
            <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <tr>
                <td>
                  <img src="https://server.optimalmd.com/uploads/OMD.png" alt="OptimalMD"
                    style="max-width: 200px; display: block; margin: 0 auto; padding-bottom: 20px;">
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  ${emailContent.messageBody}
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  ${emailContent.footer}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 0px;">
                  <p style="margin: 0; text-align: center; color: gray;">Copyright © ${new Date().getFullYear()} OptimalMD Technologies, LLC,
                    All rights reserved.</p>
                </td>
              </tr>
            </table>
          </body>
          </html>`,
        userId: user._id,
      }).unwrap();

      toast.success("Email sent successfully");
      setEmailContent({
        from: companyEmail,
        to: "",
        subject: "",
        messageBody:
          "<p>Hi $firstName,</p><p>I hope this email finds you well. I wanted to reach out regarding your recent inquiry about our services.</p><p>Looking forward to hearing from you soon.</p>",
        footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0; " >As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin@haquedigital.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin@haquedigital.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Shawn Fry</p><p style="margin: 0">Founder & CEO</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;">
		<p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and
			may contain privileged, proprietary or confidential information intended solely for use by OptimalMD
			Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify me via
			return email. Please also delete this message, its attachments and all copies, electronic or print, without
			further distribution.</font></p>

	</td>`,
      });
      setOpen(false);
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscapeKey);
    } else {
      document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={Mail}
        variant="secondary"
        className="bg-gray-800 hover:bg-gray-700 text-white"
      >
        Compose Email
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">Email Template Editor</h2>
              <button
                onClick={() => {
                  setEmailContent({
                    from: companyEmail,
                    to: "",
                    subject: "",
                    messageBody:
                      "<p>Hi $firstName,</p><p>I hope this email finds you well. I wanted to reach out regarding your recent inquiry about our services.</p><p>Looking forward to hearing from you soon.</p>",
                    footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0; " >As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin@haquedigital.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin@haquedigital.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Shawn Fry</p><p style="margin: 0">Founder & CEO</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;">
		<p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and
			may contain privileged, proprietary or confidential information intended solely for use by OptimalMD
			Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify me via
			return email. Please also delete this message, its attachments and all copies, electronic or print, without
			further distribution.</font></p>

	</td>`,
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
              <Button
                onClick={() => {
                  setOpen(false);
                  setEmailContent({
                    from: companyEmail,
                    to: "",
                    subject: "",
                    messageBody:
                      "<p>Hi $firstName,</p><p>I hope this email finds you well. I wanted to reach out regarding your recent inquiry about our services.</p><p>Looking forward to hearing from you soon.</p>",
                    footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0; " >As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin@haquedigital.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin@haquedigital.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Shawn Fry</p><p style="margin: 0">Founder & CEO</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;">
		<p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and
			may contain privileged, proprietary or confidential information intended solely for use by OptimalMD
			Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify me via
			return email. Please also delete this message, its attachments and all copies, electronic or print, without
			further distribution.</font></p>

	</td>`,
                  });
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                isLoading={isLoading}
                icon={SendHorizonal}
                variant="primary"
                className="bg-primary hover:bg-primary"
              >
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
