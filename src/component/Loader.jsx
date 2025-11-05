import { useState, useEffect } from "react";
import siteIcon from "/odl.gif";
import siteIcon2 from "@/assets/companyLogo/logo_crop_no_bg.png";

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center scale-150 justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          {/* Outer spinning ring - smaller */}
          <div
            className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-blue-500 border-r-purple-500/50 rounded-full"
            style={{
              animation: "spin 3s linear infinite",
            }}
          />

          {/* Inner spinning ring - smaller */}
          <div
            className="absolute inset-1 w-14 h-14 border border-transparent border-b-purple-400 border-l-cyan-400/50 rounded-full"
            style={{
              animation: "spin-reverse 2s linear infinite",
            }}
          />

          {/* Main logo - smaller */}
          <div
            className="relative ml-2 mt-2 w-12 h-12 flex items-center justify-center"
            style={{
              animation: "pulse-scale 2s ease-in-out infinite",
            }}
          >
            <img
              src={siteIcon2}
              alt="Main Logo"
              className="w-10 h-auto animate-[pulse_2s_linear_infinite]"
            />

            {/* Smaller pulsing glow */}
            <div
              className="absolute inset-0  rounded-full blur-sm"
              style={{
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Inline styles for loader animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}