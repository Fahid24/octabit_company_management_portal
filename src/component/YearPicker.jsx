import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

const YearPicker = ({
  label = "Year",
  value,
  onChange,
  error,
  className,
  required = false,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Calculate which decade the current year belongs to
  const currentYear = value || new Date().getFullYear();
  const currentDecadeStart = Math.floor(currentYear / 10) * 10 + 1; // e.g., 2025 -> 2021

  const [displayStartYear, setDisplayStartYear] = useState(currentDecadeStart);
  const dropdownRef = useRef(null);

  const showFloating = (value !== null && value !== undefined) || isFocused;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update displayStartYear when value changes to ensure selected year is visible
  useEffect(() => {
    if (value) {
      const valueDecadeStart = Math.floor(value / 10) * 10 + 1;
      setDisplayStartYear(valueDecadeStart);
    }
  }, [value]);

  const handleYearSelect = (year) => {
    onChange(year);
    setIsOpen(false);
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handlePreviousYears = () => {
    const newStartYear = displayStartYear - 10;
    setDisplayStartYear(newStartYear);
  };

  const handleNextYears = () => {
    const newStartYear = displayStartYear + 10;
    setDisplayStartYear(newStartYear);
  };

  // Generate 10 years starting from displayStartYear (no limits)
  const displayYears = [];
  for (let i = 0; i < 10; i++) {
    const year = displayStartYear + i;
    displayYears.push(year);
  }

  // No limits - always allow navigation
  const canGoPrevious = true;
  const canGoNext = true;

  // Calculate the display range (***1-***0 format)
  const displayEndYear = displayStartYear + 9;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!isOpen) {
      setIsFocused(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div
        className={cn(
          "relative border-b-2 border-gray-300 focus-within:border-primary transition-all duration-200 group",
          error && "border-red-500"
        )}
      >
        {/* Left-to-right animation border */}
        <div className="absolute bottom-[-2px] left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>

        <div className="relative flex items-center">
          <div
            onClick={handleDropdownToggle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            className={cn(
              "block w-full px-0 pt-6 pb-2 bg-transparent appearance-none focus:outline-none z-10 cursor-pointer",
              icon && "pl-8"
            )}
          >
            {value || ""}
          </div>

          {icon && (
            <div
              className={cn(
                "absolute left-0 top-1/2 text-gray-500",
                !value && "-translate-y-1/2"
              )}
            >
              {icon}
            </div>
          )}

          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        <label
          className={cn(
            "absolute top-4 left-0 text-gray-500 duration-300 origin-0 pointer-events-none",
            icon && "left-8",
            showFloating && "transform -translate-y-4 scale-75 text-primary",
            error && "text-red-500"
          )}
        >
          {required && (
            <span className="font-bold text-red-500 mr-0.5 text-lg">*</span>
          )}{" "}
          {label}
        </label>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {/* Year Navigation Header */}
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
            <button
              type="button"
              onClick={handlePreviousYears}
              disabled={!canGoPrevious}
              className={cn(
                "p-1 rounded hover:bg-gray-200 transition-colors",
                !canGoPrevious && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>
                {displayStartYear} - {displayEndYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextYears}
              disabled={!canGoNext}
              className={cn(
                "p-1 rounded hover:bg-gray-200 transition-colors",
                !canGoNext && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Year Grid */}
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {displayYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "px-3 py-2 text-sm rounded transition-colors text-center",
                    year === currentYear
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default YearPicker;
