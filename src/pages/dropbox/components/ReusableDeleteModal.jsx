import React, { useState } from "react";

export default function ReusableDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  refetch,
}) {
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setError("");
      await onConfirm();
      //refetch();
      onClose();
    } catch (err) {
      console.error("Modal Delete Error:", err);
      setError(err?.data?.message || err?.message || "Something went wrong.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl text-center relative">
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-6">{description}</p>

        {/* Error Message */}
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-5 py-2 text-sm font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 text-white hover:bg-red-600 rounded-full px-5 py-2 text-sm font-medium transition"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
