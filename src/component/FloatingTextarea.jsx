import { cn } from "@/utils/cn";
import { useState, forwardRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const FloatingTextarea = forwardRef(
  ({ className, label, error, icon, rows = 4, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e) => {
      setIsFocused(true);
      // Don't set focus if this was triggered programmatically
      if (!e.isTrusted) {
        e.target.blur();
        setIsFocused(!!props.value);
        return;
      }
    };

    const handleBlur = (e) => {
      if (!e.target.value) {
        setIsFocused(false);
      }
    };

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "relative border-2 border-gray-300 rounded-md focus-within:border-primary transition-all duration-200 group",
            error && "border-red-500 focus-within:border-red-500",
            className
          )}
        >
          <textarea
            className={cn(
              "block w-full px-3 pt-6 pb-2 bg-transparent appearance-none focus:outline-none z-10 rounded-md",
              icon && "pl-10"
            )}
            rows={rows}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={ref}
            {...props}
          />

          <label
            className={cn(
              "absolute top-4 left-1 text-gray-500 duration-300 origin-0 pointer-events-none px-1",
              icon && "left-10",
              (isFocused || props.value) &&
                "transform -translate-y-6 scale-75 text-primary top-0",
              error && (isFocused || props.value) && "text-red-500",
              error && !(isFocused || props.value) && "text-red-500"
            )}
          >
            {label}
          </label>

          {icon && (
            <div className={cn("absolute left-3 top-6 text-gray-500")}>
              {icon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingTextarea };
