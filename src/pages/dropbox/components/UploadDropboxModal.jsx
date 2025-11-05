import React, { useState, useEffect, useRef } from "react";
import { XIcon, UploadIcon } from "lucide-react";
import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { FileUpload } from "@/component/FileUpload";
import { toast } from "@/component/Toast";

export default function UploadDropboxModal({
  isOpen,
  onClose,
  onSubmit,
  totalUsedBytes = 0,
  maxAllowedBytes = 800 * 1024 * 1024,
}) {
  const [formData, setFormData] = useState({
    docName: "",
    files: [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (value) => {
    const files = Array.isArray(value)
      ? value.map((file, index) => ({
          fileUrl: file.fileUrl || file.link,
          docType:
            file.docType || file.title || file.name || `File-${index + 1}`,
          fileSize: file.file?.size || 0, // Keep in bytes for consistent storage
          _id: index + 1,
        }))
      : [];

    setFormData((prev) => ({
      ...prev,
      files,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.docName) newErrors.docName = "Document name is required";
    if (!formData.files.length) newErrors.files = "At least one file required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return toast.error("Error", "Fill required fields");

    const newFilesSize = formData.files.reduce(
      (sum, file) => sum + (file.fileSize || 0),
      0
    );

    const newTotal = totalUsedBytes + newFilesSize;

    if (newTotal > maxAllowedBytes) {
      const maxMB = (maxAllowedBytes / (1024 * 1024)).toFixed(1);
      const newTotalMB = (newTotal / (1024 * 1024)).toFixed(1);
      toast.error(
        "Storage Limit Exceeded",
        `Total usage after upload would be ${newTotalMB}MB, which exceeds the limit of ${maxMB}MB.`
      );
      return;
    }

    try {
      await onSubmit(formData);
      toast.success("Uploaded", "Document uploaded successfully");
      // console.log("Submitting formData:", JSON.stringify(formData, null, 2));

      onClose();
      setFormData({ docName: "", files: [] });
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed", "Upload failed");
    }
  };

  const modalRef = useRef(null);

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    modalRef.current.scrollTop += e.deltaY;
  };

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
          <UploadIcon size={20} />
          Upload New Document
        </h2>

        <div className="space-y-4">
          <FloatingInput
            label="Document Name"
            name="docName"
            value={formData.docName}
            onChange={handleChange}
            error={errors.docName}
          />

          <FileUpload
            label="Upload File(s)"
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
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
