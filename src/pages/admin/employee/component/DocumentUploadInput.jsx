import { useRef } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const DocumentUploadInput = ({
  label,
  onChange,
  isLoading,
  value,
  ...props
}) => {
  const inputRef = useRef(null);

  // Extract file name from URL for display
  const fileName = value ? value.split("/").pop().split("?")[0] : "";

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className={cn(
          "relative flex items-center justify-between p-3 border-2 border-dashed rounded-md transition-all duration-200",
          "border-gray-300 hover:border-primary hover:bg-gray-50",
          isLoading && "bg-gray-100 cursor-not-allowed opacity-70"
        )}
      >
        <span className="text-gray-500 truncate">
          {isLoading ? "Uploading..." : fileName || "Choose file (PDF, Image)"}
        </span>
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        )}
        {/* The actual file input, positioned to cover the div */}
        <input
          type="file"
          ref={inputRef}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-20" // Make it clickable over the visible elements
          accept=".pdf,image/*" // Accept PDF and image files
          disabled={isLoading} // Disable input during upload
          {...props}
        />
      </div>
      {value && !isLoading && (
        <p className="mt-1 text-xs text-gray-500">File selected: {fileName}</p>
      )}
    </div>
  );
};

export default DocumentUploadInput;
