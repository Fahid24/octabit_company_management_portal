import { useEffect } from "react";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "Do you really want to proceed?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  onBackdropClick,
}) {
  const handleBackdropClick = (e) => {
    // Check if the click target is the backdrop div
    if (e.target === e.currentTarget) {
      onCancel();
      if (onBackdropClick) {
        onBackdropClick();
      }
    }
  };
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
    }, [open]);
  // console.log(open, onBackdropClick);
  if (!open) return null;
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed -inset-10 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm animate-scaleIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors text-xl"
          onClick={onCancel}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="error" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
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
