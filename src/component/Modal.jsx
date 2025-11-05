import React from "react";

export default function Modal({ open, onClose, children, className = "" }) {
   
  if (!open) return null;
  return (
    <div  className="fixed inset-0  z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto animate-scaleIn ${className}`}>
        <button
          className="absolute top-3 rounded-full  w-8 h-8 flex justify-center items-center text-3xl right-3 text-red-500 hover:text-gray-700 transition-colors z-10 "
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.18s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
}
