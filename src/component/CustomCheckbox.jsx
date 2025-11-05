import { cn } from "@/utils/cn";
import { forwardRef } from "react";

const CustomCheckbox = forwardRef(({ className, label, ...props }, ref) => {
  return (
    <label className={cn("flex items-center cursor-pointer group", className)}>
      <div className="relative flex items-center">
        <input type="checkbox" className="sr-only" ref={ref} {...props} />
        <div className="h-5 w-5 border-2 border-gray-300 rounded group-hover:border-primary transition-colors duration-200">
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center opacity-0 scale-0 transition-all duration-200",
              props.checked && "opacity-100 scale-100"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
});

CustomCheckbox.displayName = "CustomCheckbox";

export { CustomCheckbox };
