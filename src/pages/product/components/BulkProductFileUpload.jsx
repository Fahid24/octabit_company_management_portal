import { useDeleteFileMutation, useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { cn } from "@/utils/cn";
import { FileText, Image, LinkIcon, Loader2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";


export const BulkProductFileUpload = ({
  onChange,
  value = [],
  error,
  productIndex,
}) => {
  const [files, setFiles] = useState(Array.isArray(value) ? value : []);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const inputRef = useRef(null);

  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();

  // Update files when value changes from outside
  useEffect(() => {
    if (value) {
      setFiles(Array.isArray(value) ? value : [value]);
    } else {
      setFiles([]);
    }
  }, [value]);

  const validateFile = (file) => {
    const maxSize = 5; // 5MB
    if (file.size > maxSize * 1024 * 1024) {
      return false;
    }
    return true;
  };

  const getDocumentType = (url) => {
    if (!url) return "link";
    const extension = url.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    if (imageExtensions.includes(extension)) return "image";
    return "document";
  };

  const getDocumentName = (url) => {
    if (!url) return "Document";
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop();
      return filename || "Document";
    } catch {
      const parts = url.split("/");
      return parts[parts.length - 1] || "Document";
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        await uploadFileToServer(file);
      }
    }
  };

  const uploadFileToServer = async (file) => {
    const tempId = Date.now().toString();
    
    setUploadingFiles((prev) => ({
      ...prev,
      [tempId]: { id: tempId, name: file.name, isUploading: true },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadFile(formData).unwrap();
      
      const uploadedFile = {
        id: tempId,
        name: file.name,
        url: response.fileUrl,
        type: getDocumentType(response.fileUrl),
      };

      setUploadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });

      const updatedFiles = [...files, uploadedFile];
      setFiles(updatedFiles);
      onChange(updatedFiles);
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        await uploadFileToServer(file);
      }
    }
    e.target.value = "";
  };

  const handleRemoveFile = async (index, file) => {
    if (file.url) {
      try {
        await deleteFile(file.url).unwrap();
      } catch (err) {
        console.error(`Failed to delete file ${file.url}:`, err);
      }
    }

    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex items-start space-x-3">
      {/* Upload Area */}
      <div
        className={cn(
          "w-16 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200",
          dragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
          error && "border-red-300",
          isUploading && "opacity-70 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Plus className="w-6 h-6 text-gray-400" />
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {/* Files Preview */}
      <div className="flex flex-wrap gap-2 flex-1">
        {/* Uploading Files */}
        {Object.values(uploadingFiles).map((file) => (
          <div
            key={file.id}
            className="relative group bg-gray-100 rounded-lg p-2 border border-gray-200"
          >
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-gray-600 truncate max-w-20">
                {file.name}
              </span>
            </div>
          </div>
        ))}

        {/* Uploaded Files */}
        {files.map((file, index) => (
          <div
            key={index}
            className="relative group bg-white rounded-lg h-14 w-32 border border-gray-200 hover:border-primary/40 transition-colors cursor-pointer"
            onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
          >
            <div className="flex items-center space-x-2">
              {file.type === "image" ? (
                <div className="w-full h-full rounded overflow-hidden bg-gray-100">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-14 h-14 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              ) : file.type === "document" ? (
                <div className="flex items-center justify-center w-14 h-14 border-r rounded-lg">
                    <FileText className="w-8 h-8 text-blue-500" />
                </div>
                
              ) : (
                <LinkIcon className="w-6 h-6 text-gray-500" />
              )}
              <span className="text-xs text-gray-700 truncate max-w-16">
                {getDocumentName(file.url)}
              </span>
            </div>
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(index, file);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isDeleting}
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkProductFileUpload;
