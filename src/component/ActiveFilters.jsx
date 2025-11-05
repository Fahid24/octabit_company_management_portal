"use client"
import PropTypes from "prop-types"

const ActiveFilters = ({ filter, onRemove, optionLabels = {} }) => {
  if (!filter) return null

  const hasActiveFilters = Object.keys(filter).some((key) => {
    if (["startDate", "dueDate", "endDate"].includes(key)) {
      return filter[key]?.from || filter[key]?.to
    }
    if (key === "search") {
      return filter[key]
    }
    return filter[key]?.length > 0
  })

  if (!hasActiveFilters) return null

  const getDateRangeLabel = (key) => {
    switch (key) {
      case "startDate":
        return "Start Date"
      case "dueDate":
        return "Due Date"
      case "endDate":
        return "End Date"
      default:
        return key
    }
  }

  const formatDateRange = (dateRange) => {
    if (dateRange.from && dateRange.to) {
      return `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
    } else if (dateRange.from) {
      return `From ${new Date(dateRange.from).toLocaleDateString()}`
    } else if (dateRange.to) {
      return `Until ${new Date(dateRange.to).toLocaleDateString()}`
    }
    return ""
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.keys(filter).map((key) => {
        // Handle search filter
        if (key === "search" && filter[key]) {
          return (
            <span
              key={key}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
            >
              🔍 Search: "{filter[key]}"
              <button onClick={() => onRemove(key)} className="ml-2 text-purple-600 hover:text-purple-800 font-bold">
                ×
              </button>
            </span>
          )
        }

        // Handle date range filters
        if (["startDate", "dueDate", "endDate"].includes(key)) {
          const dateRange = filter[key]
          if (dateRange?.from || dateRange?.to) {
            const dateText = formatDateRange(dateRange)
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                📅 {getDateRangeLabel(key)}: {dateText}
                <button onClick={() => onRemove(key)} className="ml-2 text-green-600 hover:text-green-800 font-bold">
                  ×
                </button>
              </span>
            )
          }
          return null
        }

        // Handle regular array filters (your original logic) - only for arrays
        if (Array.isArray(filter[key]) && filter[key].length > 0) {
          return filter[key].map((value) => (
            <span
              key={`${key}-${value}`}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {optionLabels[key]?.[value] || value}
              <button onClick={() => onRemove(key, value)} className="ml-1 text-blue-600 hover:text-blue-800">
                ×
              </button>
            </span>
          ))
        }

        return null
      })}
    </div>
  )
}

ActiveFilters.propTypes = {
  filter: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  optionLabels: PropTypes.object,
}

export default ActiveFilters
