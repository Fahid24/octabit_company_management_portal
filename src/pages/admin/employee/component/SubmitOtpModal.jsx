import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { toast } from "@/component/Toast";
const SubmitOtpModal = ({
  isOpen,
  onClose,
  userEmail,
  onSubmitOtp,
  isLoading,
  refetch,
  onResendOtp,
  sendingOtpLoader,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setTimeLeft(120);
      setCanResend(false);

      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
      setOtp(["", "", "", "", "", ""]);
      setError("");
    }

    return () => clearInterval(timer);
  }, [isOpen]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    setError("");

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Handle Enter key
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const numbers = paste.replace(/\D/g, "").slice(0, 6);

    const newOtp = [...otp];
    numbers.split("").forEach((num, index) => {
      if (index < 6) {
        newOtp[index] = num;
      }
    });

    setOtp(newOtp);
    setError("");

    // Focus on the next empty input or the last one
    const nextEmptyIndex = numbers.length < 6 ? numbers.length : 5;
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await onSubmitOtp({ otp: otpValue, email: userEmail });

      if (response?.error?.data?.success === false) {
        setCanResend(true);
        toast.error(
          "Error",
          response?.error?.data?.error ||
            "Failed to verify OTP. Please try again"
        );
      } else {
        toast.success(
          "Success",
          response?.data?.message || "OTP submitted successfully.",
          3000
        );

        onClose();
        setOtp(["", "", "", "", "", ""]);
        refetch();
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      toast.error(
        "Error",
        error?.data?.message || "Failed to verify OTP. Please try again."
      );
    } finally {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (onResendOtp) {
      try {
        await onResendOtp({
          email: userEmail,
        });

        setTimeLeft(120);
        setCanResend(false);

        const timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);

        toast.success(
          "Code Sent",
          "A new verification code has been sent to your email."
        );
      } catch (error) {
        toast.error("Error", "Failed to resend code. Please try again.");
      }
    }
  };

  const handleClose = () => {
    onClose();
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  if (!isOpen) return null;

  const otpValue = otp.join("");
  const isVerifyDisabled = isSubmitting || isLoading || otpValue.length !== 6;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-[#B8865A] rounded-full flex items-center justify-center shadow-lg mb-6">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-primary">{userEmail}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm font-medium text-center mb-4 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {timeLeft > 0 ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <span className="text-sm text-gray-600">
                Expires in{" "}
                <span className="font-bold text-primary font-mono">
                  {formatTime(timeLeft)}
                </span>
              </span>
            </>
          ) : (
            <span className="text-red-500 text-sm font-medium">
              Code expired
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={handleSubmit}
            disabled={isVerifyDisabled}
            className="w-full h-12 bg-primary hover:bg-[#8B6441] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading || isSubmitting}
            className="w-full text-primary hover:text-[#8B6441] hover:bg-primary/5 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="1,4 1,10 7,10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            {sendingOtpLoader ? "Resending..." : "Resend Code"}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          Didn&apos;t receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default SubmitOtpModal;
