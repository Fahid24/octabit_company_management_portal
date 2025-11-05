import { useState } from "react";
import Button from "./Button";

export default function Error() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      window.location.reload();
    }, 2000);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <div className="w-full max-w-sm text-center">
        {/* Triangle icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-#3a41e2 opacity-10 rounded-full"></div>
          <svg className="relative" width="96" height="96" viewBox="0 0 96 96">
            <polygon
              points="48,16 80,80 16,80"
              fill="#8A6642"
              stroke="#5D4941"
              strokeWidth="2"
            />
            <path
              d="M48 40V60M48 68V68"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Error message */}
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#5D4941" }}>
          404
        </h1>
        <h2 className="text-xl font-medium mb-4" style={{ color: "#8A6642" }}>
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons - Modified this section */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleGoHome}
            className="py-2 px-3 text-sm rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "#28282B",
              color: "white",
            }}
          >
            Go to Homepage
          </Button>

          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="py-2 px-3 text-sm rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "#5D4941",
              color: "white",
              opacity: isRetrying ? 0.8 : 1,
            }}
          >
            {isRetrying ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Retrying...
              </span>
            ) : (
              "Try Again"
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-gray-100">
          <p className="text-sm" style={{ color: "#8A6642" }}>
            Need help?{" "}
            <a href="#" className="underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}