import { cn } from "@/utils/cn";
import { useState, forwardRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const FloatingInput = forwardRef(
  (
    {
      className,
      label,
      error,
      icon,
      type = "text",
      options = [],
      required = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputRef = useRef(null);

    // Modify the handleFocus and handleBlur functions to prevent auto-selection issues
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

    // Prevent scroll from changing number input values
    const handleWheel = (e) => {
      if (type === "number") {
        e.target.blur(); // Remove focus to prevent value change
      }
    };

    const togglePasswordVisibility = () =>
      setIsPasswordVisible(!isPasswordVisible);

    const inputType =
      type === "password"
        ? isPasswordVisible
          ? "text"
          : "password"
        : type === "number"
        ? "number"
        : type;
    const isSelect = type === "select";
    const isDate = type === "date";

    // Effect to handle date input placeholder
    useEffect(() => {
      if (isDate && inputRef.current) {
        // Remove the placeholder when not focused
        if (!isFocused) {
          // This trick removes the default date placeholder
          inputRef.current.showPicker = function () {
            if (document.activeElement === inputRef.current) {
              HTMLInputElement.prototype.showPicker.call(this);
            }
          };
        }
      }
    }, [isFocused, isDate]);

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "relative border-b-2 border-gray-300 focus-within:border-primary transition-all duration-200 group",
            error && "border-red-500",
            className
          )}
        >
          {/* Left-to-right animation border */}
          <div className="absolute bottom-[-2px] left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>

          {isSelect ? (
            <select
              className={cn(
                "block w-full px-0 pt-6 pb-2 bg-transparent appearance-none focus:outline-none z-10 border-none relative",
                icon && "pl-8"
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={ref}
              {...props}
            >
              <option value="" disabled></option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={inputType}
              className={cn(
                "block w-full px-0 pt-6 pb-2 bg-transparent appearance-none focus:outline-none z-10",
                icon && "pl-8",
                type === "password" && "pr-10",
                isDate &&
                  !isFocused &&
                  !props.value &&
                  "date-input-no-placeholder"
              )}
              placeholder={isDate && !isFocused ? " " : " "}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onWheel={handleWheel}
              ref={isDate ? inputRef : ref}
              {...props}
            />
          )}

          <label
            className={cn(
              "absolute top-4 left-0 text-gray-500 duration-300 origin-0 pointer-events-none",
              icon && "left-8",
              (isFocused || props.value) &&
                "transform -translate-y-4 scale-75 text-primary",
              error && "text-red-500"
            )}
          >
            {required && (
              <span className="font-bold text-red-500 mr-0.5 text-lg">*</span>
            )}{" "}
            {label}
          </label>
          {icon && (
            <div
              className={cn(
                "absolute left-0 top-1/2 text-gray-500",
                !props.value && "-translate-y-1/2 "
              )}
            >
              {icon}
            </div>
          )}

          {type === "password" && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isPasswordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}

          {isSelect && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

FloatingInput.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  icon: PropTypes.node,
  type: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
  options: PropTypes.array,
};

export { FloatingInput };
