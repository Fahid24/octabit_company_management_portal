import React, { useEffect, useState, useRef } from "react";
import { XIcon, EditIcon } from "lucide-react";
import Button from "@/component/Button";
import { FileUpload } from "@/component/FileUpload";
import { toast } from "@/component/Toast";

import { FloatingInput } from "@/component/FloatiingInput";

export default function EditDropboxModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues = {},
  usedStorageMB = 0,
  maxStorageMB = 300,
}) {
  const [formData, setFormData] = useState({
    docName: "",
    files: [],
  });

  const [errors, setErrors] = useState({});

  const modalRef = useRef(null);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        docName: initialValues.docName || "",
        files: initialValues.files || [],
      });
    }
  }, [initialValues]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleFileChange = (value) => {
    const files = Array.isArray(value)
      ? value.map((file, index) => ({
          fileUrl: file.fileUrl || file.link,
          docType:
            file.docType || file.title || file.name || `File-${index + 1}`,
          fileSize: file.file?.size || file.fileSize || 0, // Keep in bytes
          _id: file._id || `new-${index + 1}`,
        }))
      : [];

    setFormData((prev) => ({
      ...prev,
      files,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.files.length) newErrors.files = "At least one file required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return toast.error("Error", "Add at least one file");

    const currentDocOldSizeBytes =
      initialValues.files?.reduce((sum, f) => sum + (f.fileSize || 0), 0) || 0;

    const currentDocNewSizeBytes =
      formData.files?.reduce((sum, f) => sum + (f.fileSize || 0), 0) || 0;

    const updatedUsedBytes =
      usedStorageMB * 1024 * 1024 -
      currentDocOldSizeBytes +
      currentDocNewSizeBytes;
    const updatedUsedStorageMB = updatedUsedBytes / (1024 * 1024);

    if (updatedUsedStorageMB > maxStorageMB) {
      return toast.error(
        "Storage Limit Exceeded",
        `Usage would become ${updatedUsedStorageMB.toFixed(
          2
        )}MB, exceeding limit of ${maxStorageMB}MB`
      );
    }

    try {
      await onSubmit({
        ...initialValues,
        files: formData.files,
      });

      toast.success("Updated", "Document updated successfully");
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed", "Update failed");
    }
  };

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    modalRef.current.scrollTop += e.deltaY;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed -top-7 inset-0 z-50 flex items-center justify-center bg-black/30"
      onWheel={handleOverlayScroll}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative max-h-[80vh] overflow-y-auto"
        ref={modalRef}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <XIcon size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <EditIcon size={20} />
          Edit Document
        </h2>

        <div className="space-y-4">
          <FloatingInput
            label="Document Name"
            name="docName"
            type="text"
            value={formData.docName}
            onChange={() => {}}
            disabled
            className="cursor-not-allowed"
            float={true}
          />

          <FileUpload
            label="Manage File(s)"
            onChange={handleFileChange}
            value={formData.files}
            isMultiFile={true}
            isTitle={true}
            isTitleRequired={false}
            onFileClick={(file) => {
              if (file?.fileUrl) {
                window.open(file.fileUrl, "_blank");
              } else {
                console.warn("No file URL available.");
              }
            }}
          />

          {errors.files && (
            <p className="text-red-500 text-sm mt-1">{errors.files}</p>
          )}
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
