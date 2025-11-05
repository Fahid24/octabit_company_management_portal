import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import "@/utils/DateRangeSelector.css"; // Assuming you have a CSS file for styles
import Button from "@/component/Button";

const DateRangeSelector = ({
  onDateRangeChange,
  label = "Date Range",
  className,
  error,
  allowFutureDates = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [displayMonths, setDisplayMonths] = useState([
    generateMonthData(new Date()),
  ]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const calendarRef = useRef(null);

  // Generate days for a specific month
  function generateMonthData(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const dayOfWeekStart = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days = [];
    // Add previous month days
    for (let i = 0; i < dayOfWeekStart; i++) {
      const prevMonthDay = new Date(year, month, -dayOfWeekStart + i + 1);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: isSameDay(prevMonthDay, new Date()),
      });
    }
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
      });
    }
    // Fill the remaining spots with next month days
    const totalCells = Math.ceil(days.length / 7) * 7;
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: isSameDay(nextMonthDay, new Date()),
      });
    }
    return {
      month,
      year,
      days,
    };
  }

  function isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  // Handle month navigation
  function prevMonth() {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    setCurrentMonth(newMonth);
    setDisplayMonths([generateMonthData(newMonth)]);
  }

  function nextMonth() {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    setCurrentMonth(newMonth);
    setDisplayMonths([generateMonthData(newMonth)]);
  }

  // Apply predefined date ranges
  function applyDateRange(rangeType) {
    const today = new Date();
    let start, end;
    switch (rangeType) {
      case "today":
        start = today;
        end = today;
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        start = yesterday;
        end = yesterday;
        break;
      case "week":
        start = startOfWeek(today, { weekStartsOn: 0 });
        end = endOfWeek(today, { weekStartsOn: 0 });
        break;
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case "last3Months":
        const threeMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          1
        );
        start = startOfMonth(threeMonthsAgo);
        end = endOfMonth(
          new Date(today.getFullYear(), today.getMonth() - 1, 1)
        );
        break;
      case "last6Months":
        const sixMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          1
        );
        start = startOfMonth(sixMonthsAgo);
        end = endOfMonth(
          new Date(today.getFullYear(), today.getMonth() - 1, 1)
        );
        break;
      case "year":
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case "lastYear":
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        start = startOfYear(lastYear);
        end = endOfYear(lastYear);
        break;
      default:
        // For custom, we'll use the selected dates
        if (customDateRange.startDate && customDateRange.endDate) {
          start = customDateRange.startDate;
          end = customDateRange.endDate;
        } else {
          // Default to current month if no custom range selected
          start = startOfMonth(today);
          end = endOfMonth(today);
        }
    }
    setSelectedRange(rangeType);
    onDateRangeChange({
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    });
    // Close calendar for all preset selections
    if (rangeType !== "custom") {
      setIsOpen(false);
    }
  }

  // Handle day selection for custom range
  function handleDateSelect(day) {
    if (
      !customDateRange.startDate ||
      (customDateRange.startDate && customDateRange.endDate)
    ) {
      // Start new selection
      setCustomDateRange({
        startDate: day.date,
        endDate: null,
      });
    } else if (customDateRange.startDate && !customDateRange.endDate) {
      // Complete the selection
      let start = customDateRange.startDate;
      let end = day.date;
      // Make sure start date is before end date
      if (start > end) {
        [start, end] = [end, start];
      }
      setCustomDateRange({
        startDate: start,
        endDate: end,
      });
      // Auto apply the custom date range and close the calendar
      setSelectedRange("custom");
      onDateRangeChange({
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      });
      // Always close the calendar after selection
      setIsOpen(false);
    }
  }

  // Check if a day is within the selected range
  function isInRange(date) {
    if (!customDateRange.startDate) return false;
    if (!customDateRange.endDate && hoveredDate) {
      return (
        (date >= customDateRange.startDate && date <= hoveredDate) ||
        (date <= customDateRange.startDate && date >= hoveredDate)
      );
    }
    return (
      customDateRange.endDate &&
      date >= customDateRange.startDate &&
      date <= customDateRange.endDate
    );
  }

  // Handle mouse hover for date range preview
  function handleDateHover(day) {
    if (customDateRange.startDate && !customDateRange.endDate) {
      setHoveredDate(day.date);
    }
  }

  // Close the calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Apply the selected range when component mounts
  useEffect(() => {
    applyDateRange(selectedRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format date for display
  function formatDateDisplay(date) {
    return date ? format(date, "MMM dd, yyyy") : "";
  }

  // Get the displayed date range text based on selected range
  function getDisplayedDateRange() {
    const today = new Date();
    switch (selectedRange) {
      case "today":
        return `Today (${format(today, "MMM dd, yyyy")})`;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return `Yesterday (${format(yesterday, "MMM dd, yyyy")})`;
      case "week":
        return `This Week (${format(
          startOfWeek(today, { weekStartsOn: 0 }),
          "MMM dd"
        )} - ${format(endOfWeek(today, { weekStartsOn: 0 }), "MMM dd")})`;
      case "month":
        return `This Month (${format(startOfMonth(today), "MMM yyyy")})`;
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        return `Last Month (${format(lastMonth, "MMM yyyy")})`;
      case "last3Months":
        const threeMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          1
        );
        const lastMonth3 = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        return `Last 3 Months (${format(threeMonthsAgo, "MMM yyyy")} - ${format(
          lastMonth3,
          "MMM yyyy"
        )})`;
      case "last6Months":
        const sixMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          1
        );
        const lastMonth6 = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        return `Last 6 Months (${format(sixMonthsAgo, "MMM yyyy")} - ${format(
          lastMonth6,
          "MMM yyyy"
        )})`;
      case "year":
        return `This Year (${format(today, "yyyy")})`;
      case "lastYear":
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        return `Last Year (${format(lastYear, "yyyy")})`;
      case "custom":
        if (customDateRange.startDate && customDateRange.endDate) {
          if (isSameDay(customDateRange.startDate, customDateRange.endDate)) {
            return formatDateDisplay(customDateRange.startDate);
          }
          return `${formatDateDisplay(
            customDateRange.startDate
          )} - ${formatDateDisplay(customDateRange.endDate)}`;
        }
        return "Custom Range";
      default:
        return "Select Date Range";
    }
  }

  return (
    <div className={"relative w-full " + (className || "")} ref={calendarRef}>
      <div
        className={
          `relative border-b border-gray-300 focus-within:border-primary transition-all duration-200 group ` +
          (error ? "border-red-500 " : "")
        }
      >
        {/* Floating label */}
        <label
          className={
            `absolute left-0 -top-1.5 translate-y-0 scale-75 duration-300 origin-0 pointer-events-none pl-9 px-1 text-primary` +
            (error ? " text-red-500" : "")
          }
          style={{ transition: "all 0.2s" }}
        >
          {label}
        </label>
        {/* Main clickable area */}
        <div
          className={
            `w-full pt-6 pb-2 bg-transparent focus:outline-none z-10 cursor-pointer flex items-center min-h-[40px]` +
            (error ? " text-red-500" : "")
          }
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 pl-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
          <span className="flex-1 text-left select-none pl-9 pr-6 truncate text-gray-700 font-normal">
            {getDisplayedDateRange()}
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {isOpen && (
        <div className="calendar-popup">
          <div className="p-4">
            <div className="quick-selects">
              <button
                className={`quick-select-btn ${
                  selectedRange === "today" ? "active" : ""
                }`}
                onClick={() => applyDateRange("today")}
              >
                Today
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "yesterday" ? "active" : ""
                }`}
                onClick={() => applyDateRange("yesterday")}
              >
                Yesterday
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "week" ? "active" : ""
                }`}
                onClick={() => applyDateRange("week")}
              >
                This Week
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "month" ? "active" : ""
                }`}
                onClick={() => applyDateRange("month")}
              >
                This Month
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "lastMonth" ? "active" : ""
                }`}
                onClick={() => applyDateRange("lastMonth")}
              >
                Last Month
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "last3Months" ? "active" : ""
                }`}
                onClick={() => applyDateRange("last3Months")}
              >
                Last 3 Months
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "last6Months" ? "active" : ""
                }`}
                onClick={() => applyDateRange("last6Months")}
              >
                Last 6 Months
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "year" ? "active" : ""
                }`}
                onClick={() => applyDateRange("year")}
              >
                This Year
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "lastYear" ? "active" : ""
                }`}
                onClick={() => applyDateRange("lastYear")}
              >
                Last Year
              </button>
              <button
                className={`quick-select-btn ${
                  selectedRange === "custom" ? "active" : ""
                }`}
                onClick={() => setSelectedRange("custom")}
              >
                Custom Range
              </button>
            </div>
            {selectedRange === "custom" && (
              <div className="custom-range-calendar mt-4">
                <div className="calendar-header flex justify-between items-center mb-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="text-center font-medium">
                    {format(currentMonth, "MMMM yyyy")}
                  </div>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
                <div className="calendar-grid-container">
                  {displayMonths.map((month, monthIndex) => (
                    <div key={monthIndex} className="calendar-month">
                      <div className="calendar-grid">
                        <div className="grid grid-cols-7 text-center font-medium text-xs mb-2 text-gray-500">
                          <div>Su</div>
                          <div>Mo</div>
                          <div>Tu</div>
                          <div>We</div>
                          <div>Th</div>
                          <div>Fr</div>
                          <div>Sa</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {month.days.map((day, index) => {
                            const isToday = isSameDay(day.date, new Date());
                            const isStart =
                              customDateRange.startDate &&
                              isSameDay(day.date, customDateRange.startDate);
                            const isEnd =
                              customDateRange.endDate &&
                              isSameDay(day.date, customDateRange.endDate);
                            const isSelected = isStart || isEnd;
                            const isRangeDay = isInRange(day.date);
                            // Highlight today differently when "Today" is selected
                            const isTodaySelected =
                              selectedRange === "today" && isToday;
                            const isCurrentMonthDay =
                              selectedRange === "month" &&
                              day.date.getMonth() === new Date().getMonth() &&
                              day.date.getFullYear() ===
                                new Date().getFullYear() &&
                              day.isCurrentMonth;
                            // Disable future dates only if allowFutureDates is false
                            const isFuture =
                              !allowFutureDates && day.date > new Date();
                            let classes = "day-cell ";
                            if (!day.isCurrentMonth) {
                              classes += "text-gray-300 ";
                            }
                            if (isToday) {
                              classes += "border border-primary font-medium ";
                            }
                            if (isTodaySelected) {
                              // Special highlighting for today when "Today" is selected
                              classes += "bg-primary text-white font-medium ";
                            } else if (isCurrentMonthDay) {
                              // Highlight days in the current month when "This Month" is selected
                              classes += "bg-primary/20 ";
                            } else if (isSelected) {
                              classes += "bg-primary text-white font-medium ";
                            } else if (isRangeDay) {
                              classes += "bg-primary/20 ";
                            } else {
                              classes += "hover:bg-gray-100 ";
                            }
                            if (isFuture) {
                              classes += " cursor-not-allowed opacity-40 ";
                            }
                            return (
                              <div
                                key={index}
                                className={classes}
                                onClick={() =>
                                  !isFuture && handleDateSelect(day)
                                }
                                onMouseEnter={() => handleDateHover(day)}
                              >
                                {day.date.getDate()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="selected-range-info">
                  <div>
                    <div className="text-gray-500 text-xs">Start Date</div>
                    <div className="font-medium">
                      {customDateRange.startDate
                        ? format(customDateRange.startDate, "MMM dd, yyyy")
                        : "Select start date"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">End Date</div>
                    <div className="font-medium">
                      {customDateRange.endDate
                        ? format(customDateRange.endDate, "MMM dd, yyyy")
                        : "Select end date"}
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <Button variant="primary" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  {/* clear button */}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCustomDateRange({ startDate: null, endDate: null });
                      setSelectedRange("month");
                      onDateRangeChange({ startDate: null, endDate: null });
                      setIsOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DateRangeSelector.propTypes = {
  onDateRangeChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  allowFutureDates: PropTypes.bool,
};

export default DateRangeSelector;
