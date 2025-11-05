import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  
  ChevronDown,
  ChevronUp,
} from "lucide-react";


import PropTypes from "prop-types";
const DatePicker = ({
  value = null,
  onChange,
  primaryColor = "#28282B",
  startWeekOnMonday = false,
  className = "",
  minDate,
  maxDate,
  label = "Select Date",
  error,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState(
    value ? value.getDate() : null
  );
  const [selectedMonth, setSelectedMonth] = useState(
    value ? value.getMonth() : null
  );
  const [selectedYear, setSelectedYear] = useState(
    value ? value.getFullYear() : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    value ? value.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    value ? value.getFullYear() : new Date().getFullYear()
  );
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const calendarRef = useRef(null);

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = startWeekOnMonday
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (!value) {
      resetSelection();
    } else {
      setSelectedDay(value.getDate());
      setSelectedMonth(value.getMonth());
      setSelectedYear(value.getFullYear());
      setCurrentMonth(value.getMonth());
      setCurrentYear(value.getFullYear());
    }
  }, [value]);

  const resetSelection = () => {
    setSelectedDay(null);
    setSelectedMonth(null);
    setSelectedYear(null);
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const handleDateSelect = (day, month = currentMonth, year = currentYear) => {
    const selectedDate = new Date(year, month, day);

    if (minDate && selectedDate < minDate) return;
    if (maxDate && selectedDate > maxDate) return;

    setSelectedDay(day);
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowCalendar(false);
    setShowMonthDropdown(false);
    setShowYearDropdown(false);

    onChange && onChange(selectedDate);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const formatDate = () => {
    if (
      selectedDay !== null &&
      selectedMonth !== null &&
      selectedYear !== null
    ) {
      return `${selectedDay} ${months[selectedMonth]} ${selectedYear}`;
    }
    return "";
  };

  const handleTodayClick = () => {
    setCurrentMonth(todayMonth);
    setCurrentYear(todayYear);
    handleDateSelect(todayDate, todayMonth, todayYear);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowCalendar(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isLabelFloating = showCalendar || !!selectedDay;

  const getLabelColor = () => {
    if (error) return "#EF4444";
    if (isLabelFloating) return primaryColor;
    return "#6B7280";
  };

  const getBorderColor = () => {
    if (error) return "#EF4444";
    if (showCalendar) return primaryColor;
    return "#D1D5DB";
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const emptyCells = startWeekOnMonday
    ? firstDay === 0
      ? 6
      : firstDay - 1
    : firstDay;

  return (
    <div
      className={`relative w-full max-w-2xl font-sans ${className}`}
      ref={calendarRef}
    >
      {/* Input */}
      <div className="relative flex items-center">
        <label
          htmlFor="datepicker"
          className={`absolute transition-all duration-200 cursor-text pointer-events-none ${
            isLabelFloating
              ? "text-xs -top-1 px-1"
              : "top-[40%] -translate-y-1/2"
          }`}
          style={{
            color: getLabelColor(),
            backgroundColor: "transparent",
            left: isLabelFloating ? "0.75rem" : "0",
            transition: "all 0.2s ease-in-out",
          }}
        >
          {label}
        </label>
        <input
          id="datepicker"
          type="text"
          value={formatDate()}
          onFocus={() => setShowCalendar(true)}
          readOnly
          style={{
            borderColor: getBorderColor(),
            backgroundColor: "transparent",
          }}
          className="w-full border-b-2 pt-4 pb-2 cursor-pointer text-gray-700 transition-colors duration-200 placeholder-transparent focus:outline-none focus:ring-0"
        />
      </div>

      {showCalendar && (
        <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-full z-50 animate-fade-in-up sm:max-w-md">
          {/* Calendar Header */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-1 sm:gap-2">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              style={{ color: primaryColor }}
            >
              <ChevronLeft size={22} />
            </button>

            {/* Month Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <div
                className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer font-medium hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
              >
                {months[currentMonth]}
                {showMonthDropdown ? (
                  <ChevronUp size={14} style={{ color: primaryColor }} />
                ) : (
                  <ChevronDown size={14} style={{ color: primaryColor }} />
                )}
              </div>
              {showMonthDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-auto w-40 custom-scrollbar">
                  {months.map((month, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer text-sm font-medium transition-colors duration-200"
                      style={{
                        backgroundColor:
                          idx === currentMonth ? primaryColor : "transparent",
                        color: idx === currentMonth ? "#fff" : "#333",
                      }}
                      onClick={() => {
                        setCurrentMonth(idx);
                        setShowMonthDropdown(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          idx === currentMonth ? primaryColor : "transparent";
                        e.currentTarget.style.color =
                          idx === currentMonth ? "#fff" : "#333";
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <div
                className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer font-medium hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
              >
                {currentYear}
                {showYearDropdown ? (
                  <ChevronUp size={14} style={{ color: primaryColor }} />
                ) : (
                  <ChevronDown size={14} style={{ color: primaryColor }} />
                )}
              </div>
              {showYearDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-auto w-24 custom-scrollbar">
                  {Array.from(
                    { length: 1050 },
                    (_, i) => currentYear - 50 + i
                  ).map((year) => (
                    <div
                      key={year}
                      className="px-3 py-2 cursor-pointer text-sm font-medium transition-colors duration-200"
                      style={{
                        backgroundColor:
                          year === currentYear ? primaryColor : "transparent",
                        color: year === currentYear ? "#fff" : "#333",
                      }}
                      onClick={() => {
                        setCurrentYear(year);
                        setShowYearDropdown(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          year === currentYear ? primaryColor : "transparent";
                        e.currentTarget.style.color =
                          year === currentYear ? "#fff" : "#333";
                      }}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              style={{ color: primaryColor }}
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center text-gray-500 text-xs uppercase font-bold mb-2">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: emptyCells }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}
            {Array.from(
              { length: daysInMonth(currentMonth, currentYear) },
              (_, i) => i + 1
            ).map((day) => {
              const isToday =
                day === todayDate &&
                currentMonth === todayMonth &&
                currentYear === todayYear;
              const isSelected =
                day === selectedDay &&
                currentMonth === selectedMonth &&
                currentYear === selectedYear;
              return (
                <div
                  key={day}
                  className="h-10 w-10 flex items-center justify-center rounded-full cursor-pointer font-medium transition-all duration-200"
                  style={{
                    border:
                      isToday && !isSelected
                        ? `2px solid ${primaryColor}`
                        : undefined,
                    backgroundColor: isSelected ? primaryColor : undefined,
                    color: isSelected ? "#fff" : undefined,
                  }}
                  onClick={() => handleDateSelect(day)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = primaryColor;
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "#000";
                    }
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleTodayClick}
              className="px-6 py-2 rounded-full text-white font-semibold transition-colors duration-200 shadow-md hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Today
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${primaryColor}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${primaryColor}; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default DatePicker;


DatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  primaryColor: PropTypes.string,
  startWeekOnMonday: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  label: PropTypes.string,
  error: PropTypes.string,
};