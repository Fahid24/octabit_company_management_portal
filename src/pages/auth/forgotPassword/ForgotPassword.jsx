import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailIcon, ArrowLeftCircle, MailQuestion } from "lucide-react";
import { FloatingInput } from "@/component/FloatiingInput";
import Button from "@/component/Button";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApiSlice";
import { successAlert, errorAlert } from "@/utils/allertFunction";

// Get logo image
import logoImage from "/logo.png";
import { toast } from "@/component/Toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const [forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await forgotPassword(email).unwrap();
      setIsSending(false);
      // successAlert({
      //   title: "Success",
      //   text: "A reset password link has been sent to your email address.",
      // });
      toast.success("Success", "A reset password link has been sent to your email address.");
      // Optionally, redirect after a delay:
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setIsSending(false);
      // errorAlert({
      //   title: "Error",
      //   text: err?.data?.message || "Failed to send reset password email.",
      // });
      toast.error("Error", err?.data?.message || "Failed to send reset password email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f4f1] via-white to-[#f4f1ee] p-4">
      {" "}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>

        <img src={logoImage} alt="Logo" className="h-16 mb-6" />

        <div className="flex items-center justify-center mb-6">
          <MailQuestion className="text-primary h-8 w-8 mr-2" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Forgot Password
          </h2>
        </div>

        <p className="text-gray-600 mb-8 text-center max-w-sm">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {" "}
          <FloatingInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<MailIcon className="h-5 w-5 text-[#2a5834]" />}
            className="focus-within:border-[#2a5834]"
          />
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              <ArrowLeftCircle className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              variant="primary"
            >
              {isSending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-sm text-gray-500 text-center">
          {" "}
          Remember your password?{" "}
          <a
            href="#"
            onClick={() => navigate("/login")}
            className="text-[#2a5834] hover:text-[#3b7a47] transition-colors"
          >
            Sign in
          </a>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          If you don&apos;t receive an email, please check your spam folder or
          <a className="text-[#2a5834] hover:text-[#3b7a47] transition-colors ml-1">
            contact support
          </a>
          .
        </div>
      </div>
    </div>
  );
}
