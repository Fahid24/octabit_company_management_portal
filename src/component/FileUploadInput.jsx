import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Loader2 } from "lucide-react"; // For loading spinner
import { cn } from "@/utils/cn";
import { useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { getNestedValue, setNestedValue } from "@/utils/getAndSetNestedValues";

const FileUploadInput = forwardRef(
  (
    {
      label,
      targetPath,
      error,
      className,
      icon,
      setFormData,
      setErrors,
      formData,
      multiple,
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [uploading, setUploading] = useState(false);
    const internalInputRef = useRef(null);

    const [uploadFile, { isLoading: isUploading, error: uploadError }] =
      useUploadFileMutation();

    // Expose internal ref if needed by parent
    useImperativeHandle(ref, () => internalInputRef.current);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleFileSelect = async (event) => {
      const files = Array.from(event.target.files || []);

      if (files.length > 0) {
        setUploading(true);
        try {
          const uploadedUrls = [];
          for (const file of files) {
            // Create FormData for each file
            const fileFormData = new FormData();
            fileFormData.append("file", file);

            // Debug logs as per your request
            // console.log("File being uploaded:", file.name, file.type, file.size)
            for (const [key, value] of fileFormData.entries()) {
              // console.log(`FormData contains: ${key}:`, value instanceof File ? `File: ${value.name}` : value)
            }

            // Upload the file using the provided uploadFile function
            const response = await uploadFile(fileFormData);
            // console.log("Upload response:", response)

            uploadedUrls.push(response?.data?.fileUrl);
          }

          // Update the form data at the targetPath with the actual server URLs
          setFormData((prev) => {
            const newFormData = { ...prev };
            if (multiple) {
              // Get existing values and append new ones
              const existingValues =
                getNestedValue(newFormData, targetPath) || [];
              const updatedValues = Array.isArray(existingValues)
                ? [...existingValues, ...uploadedUrls]
                : [...uploadedUrls];
              setNestedValue(newFormData, targetPath, updatedValues);
            } else {
              setNestedValue(newFormData, targetPath, uploadedUrls[0] || null);
            }
            return newFormData;
          });

          // Clear error for this field if it exists
          setErrors((prev) => {
            const newErrors = { ...prev };
            setNestedValue(newErrors, targetPath, undefined); // Clear specific error
            return newErrors;
          });
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          setErrors((prev) => {
            const newErrors = { ...prev };
            setNestedValue(newErrors, targetPath, "Upload failed");
            return newErrors;
          });
        } finally {
          setUploading(false);
          // Clear the input's value to allow re-uploading the same file
          if (internalInputRef.current) {
            internalInputRef.current.value = "";
          }
        }
      } else {
        // If files are cleared (e.g., user cancels selection), clear the form data entry for this field.
        setFormData((prev) => {
          const newFormData = { ...prev };
          setNestedValue(newFormData, targetPath, multiple ? [] : null);
          return newFormData;
        });
      }
    };

    // Get the current value from formData based on targetPath
    const currentValue = getNestedValue(formData, targetPath);

    // Determine if the label should be "active" (transformed)
    const isLabelActive =
      isFocused ||
      (Array.isArray(currentValue) ? currentValue.length > 0 : !!currentValue);

    // Determine the displayed file name(s)
    const displayedFileNames =
      Array.isArray(currentValue) && currentValue.length > 0
        ? currentValue
            .map((url) => url.split("/").pop())
            .filter(Boolean)
            .join(", ")
        : typeof currentValue === "string" && currentValue
        ? currentValue.split("/").pop()
        : ""; // Empty string if no file

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "relative border-2 border-dashed border-gray-300 rounded-md p-4 pb-2.5 transition-all duration-200 group",
            error && "border-red-500",
            "focus-within:border-primary focus-within:border-solid", // Change border style on focus
            className
          )}
        >
          {/* Hidden file input to handle file selection */}
          <input
            disabled={disabled}
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer z-20" // Make it clickable over the visible elements
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleFileSelect}
            ref={internalInputRef}
            multiple={multiple} // Apply the multiple prop here
            {...props}
          />

          {/* Floating label */}
          <label
            className={cn(
              "absolute left-4 text-gray-500 duration-300 origin-0 pointer-events-none",
              icon && "left-10", // Adjust left if icon is present
              // Initial position: centered vertically
              !isLabelActive && "top-1/2 -translate-y-1/2",
              // Active position: top-left, scaled down
              isLabelActive &&
                "top-4 transform -translate-y-4 scale-75 text-primary", // Keep original transform
              error && "text-red-500"
            )}
          >
            {required && <span className="text-red-500 font-bold">*</span>}{" "}
            {label}
          </label>

          {/* Optional icon */}
          {icon && (
            <div
              className={cn(
                "absolute left-4 text-gray-500",
                // Initial position: centered vertically
                !isLabelActive && "top-1/2 -translate-y-1/2",
                // Active position: top-left, aligned with label
                isLabelActive && "top-4" // No translate-y needed if label moves up
              )}
            >
              {icon}
            </div>
          )}

          {/* Display area for file names / placeholder / loading and Browse button */}
          <div
            className={cn(
              "flex items-center justify-between w-full",
              icon ? "pl-8" : "pl-0", // Adjust padding if icon is present
              isLabelActive ? "pt-0 pb-0" : "pt-0" // Add padding top if label is floated
            )}
          >
            {uploading ? (
              <span className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
              </span>
            ) : (
              <span className="text-gray-700 truncate flex-grow">
                {displayedFileNames || <span className="text-white">`</span>}
              </span>
            )}
            <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm cursor-pointer hover:bg-gray-200 transition-colors">
              Browse
            </span>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FileUploadInput.displayName = "FileUploadInput";

export default FileUploadInput;
