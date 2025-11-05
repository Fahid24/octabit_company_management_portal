"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileIcon,
  UploadIcon,
  LinkIcon,
  XIcon,
  FileTextIcon,
  ExternalLinkIcon,
  PlusIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useDeleteFileMutation,
  useUploadFileMutation,
} from "@/redux/features/upload/uploadApiSlice";
// import { useUploadFileMutation, useDeleteFileMutation } from "@/services/api" // Update this path to your actual API slice
import PropTypes from "prop-types";

export function FileUpload({
  onChange,
  value = [],
  label = "Upload Document",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png, mp4, mp3, m4a, m4v, mpeg, mpg, ogg, webm, wav, wma, wmv",
  maxSize = 5, // in MB
  error,
  required = false,
  isMultiFile = false,
  isTitle = false,
  isTitleRequired = false,
  onFileClick,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [mode, setMode] = useState("upload"); // "upload" or "link"
  const [fileLink, setFileLink] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [files, setFiles] = useState(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track uploading status by file ID
  const inputRef = useRef(null);

  // Initialize RTK Query mutations
  const [uploadFile, { isLoading: isUploading, error: uploadError }] =
    useUploadFileMutation();
  const [deleteFile, { isLoading: isDeleting, error: deleteError }] =
    useDeleteFileMutation();

  // Update files when value changes from outside
  useEffect(() => {
    if (value) {
      setFiles(Array.isArray(value) ? value : [value]);
    } else {
      setFiles([]);
    }
  }, [value]);

  // Handle API errors
  useEffect(() => {
    if (uploadError) {
      setFileError(
        `Upload failed: ${uploadError.data?.message || "Server error"}`
      );
    }
  }, [uploadError]);

  useEffect(() => {
    if (deleteError) {
      console.error("Delete failed:", deleteError);
      // We don't show delete errors to the user, just log them
    }
  }, [deleteError]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type
    const fileType = file.type;
    const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;
    const acceptedTypes = accept.split(",");

    if (
      !acceptedTypes.some(
        (type) =>
          type.trim() === fileExtension ||
          (type.includes("/") && fileType.match(type.trim().replace("*", ".*")))
      )
    ) {
      setFileError(`File type not supported. Accepted types: ${accept}`);
      return false;
    }

    setFileError("");
    return true;
  };

  const validateTitle = () => {
    if (isTitleRequired && !fileTitle.trim()) {
      setTitleError("Document title is required");
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateLink = (link) => {
    try {
      new URL(link);
      return true;
    } catch {
      setFileError(
        "Please enter a valid URL (e.g., https://example.com/document.pdf)"
      );
      return false;
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        if (!isTitleRequired || validateTitle()) {
          await uploadFileToServer(file);
        }
      }
    }
  };

  const uploadFileToServer = async (file) => {
    // Create a temporary ID for tracking this upload
    const tempId = Date.now().toString();

    // Create a temporary file object for UI feedback
    const tempFileObj = {
      id: tempId,
      file,
      type: "file",
      name: file.name,
      title: fileTitle || file.name,
      isUploading: true,
    };

    // Add to uploading files state
    setUploadingFiles((prev) => ({
      ...prev,
      [tempId]: tempFileObj,
    }));

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Debug log - this is a better way to see FormData contents
      // console.log("File being uploaded:", file.name, file.type, file.size)

      // For debugging, you can iterate through the FormData entries
      for (const [key, value] of formData.entries()) {
        // console.log(`FormData contains: ${key}:`, value instanceof File ? `File: ${value.name}` : value)
      }

      // Upload the file
      const response = await uploadFile(formData).unwrap();
      // console.log("Upload response:", response)

      // Create the final file object with server response data
      const uploadedFile = {
        id: tempId,
        file,
        type: "file",
        name: file.name,
        title: fileTitle || file.name,
        serverFilename: response.filename, // Store the server filename for deletion
        fileUrl: response.fileUrl || URL.createObjectURL(file),
      };

      // Remove from uploading state
      setUploadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });

      // Add to files state
      addFile(uploadedFile);
    } catch (err) {
      console.error("File upload failed:", err);
      setFileError(`Upload failed: ${err.message || "Unknown error"}`);

      // Remove from uploading state
      setUploadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
    }
  };

  const addFile = (newFile) => {
    if (!isMultiFile && files.length > 0) {
      // Replace the existing file if not in multi-file mode
      const updatedFiles = [newFile];
      setFiles(updatedFiles);
      onChange(isMultiFile ? updatedFiles : updatedFiles[0]);
    } else {
      // Add to existing files
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      onChange(isMultiFile ? updatedFiles : updatedFiles[0]);
    }

    // Reset form fields
    setFileLink("");
    setFileTitle("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  const handleInputChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        if (!isTitleRequired || validateTitle()) {
          await uploadFileToServer(file);
        }
      }
    }
  };

  const handleLinkChange = (e) => {
    setFileLink(e.target.value);
    // Clear error message when input changes
    if (fileError) {
      setFileError("");
    }
  };

  const handleTitleChange = (e) => {
    setFileTitle(e.target.value);
    // Clear error message when input changes
    if (titleError) {
      setTitleError("");
    }
  };

  const handleLinkSubmit = () => {
    if (fileLink && validateLink(fileLink)) {
      if (!isTitleRequired || validateTitle()) {
        const linkName = fileLink.split("/").pop() || "Document Link";
        addFile({
          link: fileLink,
          type: "link",
          name: linkName,
          title: fileTitle || linkName,
        });
      }
    }
  };
  const handleRemove = async (index, file) => {
    // If we have a server filename, delete the file from server
    // console.log("deleted file", file)
    if (file.fileUrl) {
      try {
        // console.log("Deleting file:", file.fileUrl)
        // Only try to split if fileUrl exists
        // console.log(file.fileUrl.split('/').pop())
        await deleteFile(file.fileUrl).unwrap();
        // console.log(`File ${file.fileUrl} deleted successfully`)
      } catch (err) {
        console.error(`Failed to delete file ${file.fileUrl}:`, err);
        // Continue with UI removal even if server deletion fails
      }
    }

    // Update UI
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onChange(
      isMultiFile
        ? updatedFiles
        : updatedFiles.length > 0
        ? updatedFiles[0]
        : null
    );
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFileError("");
    setTitleError("");
  };

  const showUploadForm = isMultiFile || files.length === 0;
  // console.log(files)
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2 mb-4">
          {files.map((file, index) => {
            const isVideo =
              (file.file &&
                file.file.type &&
                file.file.type.startsWith("video")) ||
              (file.name &&
                /\.(mp4|webm|ogg|mov|avi|m4v|wmv|mpeg|mpg)$/i.test(
                  file.name
                )) ||
              (file.link &&
                /\.(mp4|webm|ogg|mov|avi|m4v|wmv|mpeg|mpg)$/i.test(file.link));
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onFileClick && onFileClick(file)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 rounded-full bg-primary/10">
                    {isVideo ? (
                      <span className="inline-block">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </span>
                    ) : (
                      <FileTextIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.docType}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {file.name}
                    </p>
                    {isVideo && (file.fileUrl || file.link) && (
                      <video
                        src={file.fileUrl || file.link}
                        controls
                        className="mt-2 rounded max-w-xs max-h-40 border border-gray-200"
                        style={{ background: "#000" }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileClick && onFileClick(file);
                      }}
                      className="text-xs text-primary hover:text-primary flex items-center mt-1"
                    >
                      <ExternalLinkIcon className="h-3 w-3 mr-1" /> Open Link
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index, file);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Remove file"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2Icon className="h-5 w-5 text-gray-500 animate-spin" />
                  ) : (
                    <XIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Uploading files */}
      {Object.keys(uploadingFiles).length > 0 && (
        <div className="space-y-2 mb-4">
          {Object.values(uploadingFiles).map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 rounded-full bg-primary/10">
                  <Loader2Icon className="h-5 w-5 text-primary animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.title || file.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Uploading...</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      {showUploadForm && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => switchMode("upload")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                mode === "upload"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <UploadIcon className="inline-block w-4 h-4 mr-2" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => switchMode("link")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                mode === "link"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <LinkIcon className="inline-block w-4 h-4 mr-2" />
              Provide Link
            </button>
          </div>

          {isTitle && (
            <div className="relative group">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 pl-3">
                <FileTextIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={fileTitle}
                onChange={handleTitleChange}
                placeholder={`Enter document title${
                  isTitleRequired ? " (required)" : " (optional)"
                }`}
                className={cn(
                  "w-full px-4 py-3 pl-10 border-b-2 border-gray-300 focus:border-primary focus:outline-none transition-colors bg-transparent rounded-md",
                  titleError && "border-red-500"
                )}
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          )}
          {titleError && (
            <p className="text-xs text-red-500 mt-1">{titleError}</p>
          )}

          {mode === "upload" ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 transition-all duration-300 ease-in-out",
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
                isUploading && "opacity-70 pointer-events-none"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className="p-3 rounded-full bg-primary/10">
                  {isUploading ? (
                    <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <FileIcon className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isUploading
                      ? "Uploading..."
                      : "Drag and drop your file here, or"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats:{" "}
                    {accept
                      .replace(/\./g, "")
                      .toUpperCase()
                      .replace(/,/g, ", ")}
                  </p>
                  <p className="text-xs text-gray-500">Max size: {maxSize}MB</p>
                </div>
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className={cn(
                    "py-2 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary transition-colors",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    "Browse Files"
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={handleInputChange}
                  disabled={isUploading}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 pl-3">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={fileLink}
                  onChange={handleLinkChange}
                  placeholder="Enter document URL"
                  className="w-full px-4 py-3 pl-10 border-b-2 border-gray-300 focus:border-primary focus:outline-none transition-colors bg-transparent rounded-md"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
              </div>
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="py-3 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {(fileError || error) && (
        <div className="flex items-center space-x-2 text-red-500 mt-2">
          <AlertCircleIcon className="h-4 w-4" />
          <p className="text-xs">{fileError || error}</p>
        </div>
      )}

      {/* Add more button for multi-file mode */}
      {/* {isMultiFile && files.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setFiles(files)
            handleButtonClick()
          }}
          className="mt-2 flex items-center text-sm text-primary hover:text-primary transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Another {mode === "upload" ? "File" : "Link"}
        </button>
      )} */}
    </div>
  );
}

FileUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  label: PropTypes.string,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  error: PropTypes.string,
  required: PropTypes.bool,
  isMultiFile: PropTypes.bool,
  isTitle: PropTypes.bool,
  isTitleRequired: PropTypes.bool,
  onFileClick: PropTypes.func,
};
