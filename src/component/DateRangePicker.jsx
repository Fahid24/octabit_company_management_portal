"use client"
import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const DateRangePicker = ({ value, onChange, placeholder = "Select date range" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState(value?.startDate ? new Date(value.startDate) : null)
  const [endDate, setEndDate] = useState(value?.endDate ? new Date(value.endDate) : null)
  const [hoverDate, setHoverDate] = useState(null)
  const [showPresets, setShowPresets] = useState(false)
  const dropdownRef = useRef(null)
  
  // Update internal state when value prop changes
  useEffect(() => {
    // Fix timezone issue by using YYYY-MM-DDT00:00:00 format to ensure correct date
    if (value?.startDate) {
      // Handle both ISO string format and Date object
      const dateStr = typeof value.startDate === 'string' ? value.startDate : value.startDate.toISOString().split('T')[0];
      // Ensure we're creating the date at midnight in local time
      const [year, month, day] = dateStr.split(/[-T]/);
      setStartDate(new Date(year, month - 1, day, 0, 0, 0));
    } else {
      setStartDate(null);
    }
    
    if (value?.endDate) {
      // Handle both ISO string format and Date object
      const dateStr = typeof value.endDate === 'string' ? value.endDate : value.endDate.toISOString().split('T')[0];
      // Ensure we're creating the date at midnight in local time
      const [year, month, day] = dateStr.split(/[-T]/);
      setEndDate(new Date(year, month - 1, day, 0, 0, 0));
    } else {
      setEndDate(null);
    }
  }, [value?.startDate, value?.endDate]);

  // Date range presets
  const datePresets = [
    {
      label: "Today",
      getValue: () => {
        const today = new Date()
        return {
          startDate: today.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return {
          startDate: yesterday.toISOString().split("T")[0],
          endDate: yesterday.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Last 7 days",
      getValue: () => {
        const today = new Date()
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          startDate: sevenDaysAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Last 30 days",
      getValue: () => {
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return {
          startDate: thirtyDaysAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Last 90 days",
      getValue: () => {
        const today = new Date()
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
        return {
          startDate: ninetyDaysAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "This week",
      getValue: () => {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        return {
          startDate: startOfWeek.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "This month",
      getValue: () => {
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
          startDate: startOfMonth.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Last month",
      getValue: () => {
        const today = new Date()
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        return {
          startDate: startOfLastMonth.toISOString().split("T")[0],
          endDate: endOfLastMonth.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "This quarter",
      getValue: () => {
        const today = new Date()
        const quarter = Math.floor(today.getMonth() / 3)
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1)
        return {
          startDate: startOfQuarter.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Last quarter",
      getValue: () => {
        const today = new Date()
        const currentQuarter = Math.floor(today.getMonth() / 3)
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1
        const year = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear()
        const startOfLastQuarter = new Date(year, lastQuarter * 3, 1)
        const endOfLastQuarter = new Date(year, lastQuarter * 3 + 3, 0)
        return {
          startDate: startOfLastQuarter.toISOString().split("T")[0],
          endDate: endOfLastQuarter.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "This year",
      getValue: () => {
        const today = new Date()
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        return {
          startDate: startOfYear.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      },
    },
    {
      label: "Last year",
      getValue: () => {
        const today = new Date()
        const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1)
        const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31)
        return {
          startDate: startOfLastYear.toISOString().split("T")[0],
          endDate: endOfLastYear.toISOString().split("T")[0],
        }
      },
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowPresets(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    } else if (startDate) {
      return `From ${startDate.toLocaleDateString()}`
    } else if (endDate) {
      return `Until ${endDate.toLocaleDateString()}`
    }
    return ""
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateInRange = (date) => {
    if (!startDate || !endDate || !date) return false
    return date >= startDate && date <= endDate
  }

  const isDateInHoverRange = (date) => {
    if (!startDate || !hoverDate || !date || endDate) return false
    const start = startDate < hoverDate ? startDate : hoverDate
    const end = startDate < hoverDate ? hoverDate : startDate
    return date >= start && date <= end
  }

  const handleDateClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date)
      setEndDate(null)
    } else {
      // Complete the range
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }

      // Update parent component with dates at midnight to avoid timezone issues
      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const newRange = {
        startDate: formatDate(date < startDate ? date : startDate),
        endDate: formatDate(date < startDate ? startDate : date),
      }
      onChange(newRange)
      setIsOpen(false)
    }
  }

  const handlePresetClick = (preset) => {
    const range = preset.getValue()
    
    // Create dates using consistent local time approach
    const createLocalDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-');
      return new Date(year, month - 1, day, 0, 0, 0);
    };
    
    setStartDate(createLocalDate(range.startDate))
    setEndDate(createLocalDate(range.endDate))
    
    // Pass the original values from preset to maintain format consistency
    onChange(range)
    setIsOpen(false)
    setShowPresets(false)
  }

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const clearSelection = () => {
    setStartDate(null)
    setEndDate(null)
    onChange({ startDate: null, endDate: null })
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
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
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer flex items-center justify-between bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={formatDateRange() ? "text-gray-900" : "text-gray-500"}>
          {formatDateRange() || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setShowPresets(false)}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                !showPresets
                  ? "text-primary border-b-2 border-primary bg-primary/20"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setShowPresets(true)}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                showPresets
                  ? "text-primary border-b-2 border-primary bg-primary/20"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Presets
            </button>
          </div>

          {showPresets ? (
            /* Presets View */
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-1">
                {datePresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Calendar View */
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-8" />
                  }

                  const isSelected =
                    (startDate && date.getTime() === startDate.getTime()) ||
                    (endDate && date.getTime() === endDate.getTime())
                  const isInRange = isDateInRange(date)
                  const isInHoverRange = isDateInHoverRange(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      className={`
                        h-8 w-8 text-sm rounded flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-primary text-white"
                            : isInRange || isInHoverRange
                              ? "bg-primary/10 text-primary"
                              : isToday
                                ? "bg-gray-100 text-gray-900 font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <button onClick={clearSelection} className="text-sm text-gray-500 hover:text-gray-700">
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
