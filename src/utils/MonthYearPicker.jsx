import { useState } from "react";
import PropTypes from "prop-types";

const MonthYearPicker = ({
  initialDate = new Date(),
  onDateChange,
  onClose,
}) => {
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Use initialDate to set the initial state
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const handleApply = () => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    onDateChange(newDate);
    if (onClose) onClose();
  };

  return (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Select Month & Year</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-primary hover:bg-primary/75 text-white rounded transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

MonthYearPicker.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default MonthYearPicker;
