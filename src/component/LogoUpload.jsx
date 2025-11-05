import { useState, useRef } from "react";
import { Upload, X, Loader2, Image } from "lucide-react";
import { useUploadFileMutation, useDeleteFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { toast } from "@/component/Toast";
import PropTypes from 'prop-types';

const LogoUpload = ({ value, onChange, error, required = false, label = "Upload Logo" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);

  const [uploadFile] = useUploadFileMutation();
  const [deleteFile] = useDeleteFileMutation();

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const validateFile = (file) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit");
      return false;
    }

    // Check file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only image files (JPEG, PNG, GIF, WebP) are allowed");
      return false;
    }

    setUploadError("");
    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadFile(formData).unwrap();
      
      // Call onChange with the uploaded file URL
      onChange(response.fileUrl);
      
      toast.success("Logo uploaded successfully!");
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadError(`Upload failed: ${err.data?.message || "Unknown error"}`);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
      // Reset input value
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    try {
      setIsDeleting(true);
      console.log(value);
      
      // Delete from server
      await deleteFile(value).unwrap();
      
      // Clear the value
      onChange("");
      
      toast.success("Logo deleted successfully!");
    } catch (err) {
      console.error("Failed to delete file:", err);
      toast.error("Failed to delete logo");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex justify-center">
        <div className="relative">
          {/* Upload Area */}
          <div
            className={`
              w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer
              transition-all duration-200 overflow-hidden
              ${value 
                ? "border-gray-300 bg-gray-50" 
                : "border-gray-400 hover:border-primary hover:bg-primary/5"
              }
              ${error ? "border-red-500" : ""}
              ${isUploading ? "pointer-events-none opacity-70" : ""}
            `}
            onClick={!value ? handleUploadClick : undefined}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-gray-600">Uploading...</span>
              </div>
            ) : value ? (
              <img
                src={value}
                alt="Logo preview"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-xs text-gray-600 text-center px-2">
                  Click to upload
                </span>
              </div>
            )}

            {/* Fallback for broken image */}
            {value && (
              <div className="hidden w-full h-full items-center justify-center bg-gray-100 rounded-full">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Delete Button */}
          {value && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`
                absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full
                flex items-center justify-center hover:bg-red-600 transition-colors
                ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title="Delete logo"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Upload Button (when image exists) */}
          {value && !isUploading && (
            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
              title="Change logo"
            >
              <Upload className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* File Input */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)
      </p>

      {/* Error Message */}
      {(uploadError || error) && (
        <p className="text-xs text-red-500 text-center">
          {uploadError || error}
        </p>
      )}
    </div>
  );
};

LogoUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  label: PropTypes.string,
};

export default LogoUpload;
