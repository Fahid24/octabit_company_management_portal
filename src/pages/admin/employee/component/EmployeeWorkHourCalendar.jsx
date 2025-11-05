import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Enhanced calendar grid for an employee's daily work hours and leave days
 * @param {Object[]} dailyStats - Array of {date, workedHours, isLeaveDay}
 * @param {boolean} isCompact - Whether to show a more compact version
 */
const EmployeeWorkHourCalendar = ({ dailyStats = [], isCompact = false }) => {
  // Group by months for better organization
  const calendarData = useMemo(() => {
    if (!dailyStats || !dailyStats.length) return [];

    // Sort all days
    const sorted = [...dailyStats].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by month
    const months = {};
    sorted.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!months[monthKey]) {
        months[monthKey] = {
          name: date.toLocaleString('default', { month: 'short' }),
          days: []
        };
      }
      months[monthKey].days.push({
        ...day,
        dayOfMonth: date.getDate(),
        fullDate: date.toLocaleDateString()
      });
    });

    return Object.values(months);
  }, [dailyStats]);

  const getColorClass = (day) => {
    if (day.isLeaveDay) return "bg-red-100 text-red-500 border-red-200";
    if (day.workedHours >= 8) return "bg-green-500 text-white border-green-600";
    if (day.workedHours >= 6) return "bg-green-300 text-green-900 border-green-400";
    if (day.workedHours > 0) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-400 border-gray-200";
  };

  const getTooltip = (day) => {
    const today = new Date();
    const dayDate = new Date(day.date);
    const isToday = dayDate.toDateString() === today.toDateString();
    const isFuture = dayDate > today;
    const isPast = dayDate < today;

    if (day.isLeaveDay) return `${day.fullDate}: On Leave`;

    if (isToday && day.workedHours > 0) {
      return `${day.fullDate}: Today - ${day.workedHours.toFixed(2)} hours`;
    }

    if (isFuture) return `${day.fullDate}: Scheduled`;

    if (isPast && day.workedHours === 0) return `${day.fullDate}: Absent`;

    if (day.workedHours > 0) return `${day.fullDate}: ${day.workedHours.toFixed(2)} hours`;

    return `${day.fullDate}: Not working`;
  };


  if (!calendarData.length) return <div className="text-gray-400 text-center py-2">No calendar data.</div>;

  return (
    <div className="text-xs">
      {calendarData.map((month, monthIndex) => (
        <div key={monthIndex} className="mb-2">
          {!isCompact && <div className="font-medium text-gray-500 mb-1">{month.name}</div>}
          <div className="flex flex-wrap gap-1">
            {month.days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`${getColorClass(day)} ${isCompact ? 'w-4 h-4' : 'w-6 h-6 text-center leading-6'} 
                  rounded border flex items-center justify-center transition-all duration-200 hover:scale-110`}
                title={getTooltip(day)}
              >
                {!isCompact && day.dayOfMonth}
              </div>
            ))}
          </div>
        </div>
      ))}
      {!isCompact && (
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center"><span className="inline-block w-3 h-3 bg-green-500 border border-green-600 mr-1"></span> 8+ hrs</span>
          <span className="flex items-center"><span className="inline-block w-3 h-3 bg-green-300 border border-green-400 mr-1"></span> 6-8 hrs</span>
          <span className="flex items-center"><span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-200 mr-1"></span> 1-6 hrs</span>
          <span className="flex items-center"><span className="inline-block w-3 h-3 bg-red-100 border border-red-200 mr-1"></span> Leave</span>
          <span className="flex items-center"><span className="inline-block w-3 h-3 bg-gray-100 border border-gray-200 mr-1"></span> Absent</span>
        </div>
      )}
    </div>
  );
};

EmployeeWorkHourCalendar.propTypes = {
  dailyStats: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    workedHours: PropTypes.number,
    isLeaveDay: PropTypes.bool
  })),
  isCompact: PropTypes.bool
};

export default EmployeeWorkHourCalendar;
