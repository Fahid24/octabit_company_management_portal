import { useState, useRef } from "react";
import {
  useGetAllFilesQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} from "@/redux/features/upload/uploadApiSlice";
import { FileText, Plus, X, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/component/Toast";

const ToolsKit = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const { data: filesData, isLoading, error } = useGetAllFilesQuery();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileClick = (file) => {
    if (file?.link || file?.fileUrl) {
      window.open(file?.link || file?.fileUrl, "_blank");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      await handleFileUpload(file);
    } else {
      setUploadError("Please upload a PDF file");
      toast.error("Invalid File Type", "Please upload a PDF file.");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      await handleFileUpload(file);
    } else {
      setUploadError("Please upload a PDF file");
      toast.error("Invalid File Type", "Please upload a PDF file.");
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadError("");
      const formData = new FormData();
      formData.append("file", file);
      await uploadFile(formData).unwrap();
      setShowUpload(false);
      toast.success("Upload Successful", `${file.name} uploaded successfully.`);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload file. Please try again.");
      toast.error("Upload Failed", "Failed to upload file. Please try again.");
    }
  };

  const handleDelete = async (e, file) => {
    e.stopPropagation();
    try {
      const filename = file.filename || file.name;
      await deleteFile(filename).unwrap();
      toast.success("Delete Successful", `${filename} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Delete Failed", "Failed to delete file. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
        <div className="text-red-500 text-center">
          Error loading files. Please try again later.
        </div>
      </div>
    );
  }

  const files = filesData?.files || [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">
          Documents
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Take or Read your necessary documents
        </p>
      </div>

      {/* Add New Document Button */}
      <div className="mt-6 mb-4">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          {showUpload ? "Cancel Upload" : "Add New Document"}
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload PDF Document
              </h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
                isDragging ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className="p-3 rounded-full bg-primary/10">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isUploading
                      ? "Uploading..."
                      : "Drag and drop your PDF here, or"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Only PDF files are supported
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-2 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary transition-colors ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Browse Files"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>

            {uploadError && (
              <p className="mt-2 text-sm text-red-500 text-center">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length > 0
          ? files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file?.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {file?.type}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file?.size)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, file)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))
          : !isLoading &&
            !showUpload && (
              <div className="text-center py-12 col-span-full">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No documents
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding a new document.
                </p>
              </div>
            )}
      </div>
    </div>
  );
};

export default ToolsKit;
