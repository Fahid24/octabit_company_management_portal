"use client"
import PropTypes from "prop-types"
import DateRangePicker from "./DateRangePicker"

const FilterPanel = ({ filter, setFilter, setFilterPanelOpen, filterOptions, optionLabels = {} }) => {
  const handleDateRangeChange = (key, dateRange) => {
    setFilter((f) => ({
      ...f,
      [key]: {
        from: dateRange.startDate || null,
        to: dateRange.endDate || null,
      },
    }))
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-30 z-40" onClick={() => setFilterPanelOpen(false)} />

      {/* Sidebar with smooth animation */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filter</h2>
            <button
              onClick={() => setFilterPanelOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {Object.keys(filterOptions).map((key) => {
              // Handle multiple date range filters (startDate, dueDate, endDate)
              if (["startDate", "dueDate", "endDate"].includes(key) && filterOptions[key].type === "dateRange") {
                return (
                  <div className="mb-4" key={key}>
                    <label className="block font-medium mb-2">{filterOptions[key].label || key}</label>
                    <DateRangePicker
                      value={{
                        startDate: filter[key]?.from || null,
                        endDate: filter[key]?.to || null,
                      }}
                      onChange={(dateRange) => handleDateRangeChange(key, dateRange)}
                      placeholder={`Select ${filterOptions[key].label?.toLowerCase() || key}`}
                    />
                  </div>
                )
              }

              // Handle single dateRange filter (for AllApplication component)
              if (key === "dateRange" && filterOptions[key].type === "dateRange") {
                return (
                  <div className="mb-4" key={key}>
                    <label className="block font-medium mb-2">{filterOptions[key].label || key}</label>
                    <DateRangePicker
                      value={{
                        startDate: filter[key]?.from || null,
                        endDate: filter[key]?.to || null,
                      }}
                      onChange={(dateRange) => handleDateRangeChange(key, dateRange)}
                      placeholder={`Select ${filterOptions[key].label?.toLowerCase() || key}`}
                    />
                  </div>
                )
              }

              // Handle regular checkbox filters (your original logic) - only for arrays
              if (Array.isArray(filterOptions[key])) {
                return (
                  <div className="mb-4" key={key}>
                    <label className="block font-medium mb-1 capitalize">{key}</label>
                    {filterOptions[key].map((option) => {
                      // If option is an object (for department), use id as value and name as label
                      let value, displayLabel
                      if (typeof option === "object" && option !== null && option.id && option.name) {
                        value = option.id
                        displayLabel = option.name
                      } else {
                        value = option
                        displayLabel = optionLabels[key]?.[option] || option
                      }
                      return (
                        <label key={value} className="flex items-center mb-1 pl-2 border-l-4 border-transparent">
                          <input
                            type="checkbox"
                            checked={filter[key]?.includes(value) || false}
                            onChange={() => {
                              setFilter((f) => {
                                const exists = f[key]?.includes(value)
                                return {
                                  ...f,
                                  [key]: exists ? f[key].filter((item) => item !== value) : [...(f[key] || []), value],
                                }
                              })
                            }}
                            className="mr-2"
                          />
                          {displayLabel}
                        </label>
                      )
                    })}
                  </div>
                )
              }

              return null
            })}
          </div>

          <button
            className="mt-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
            onClick={() => {
              const clearedFilter = Object.keys(filter).reduce((acc, key) => {
                if (["startDate", "dueDate", "endDate", "dateRange"].includes(key)) {
                  acc[key] = { from: null, to: null }
                } else {
                  acc[key] = []
                }
                return acc
              }, {})
              setFilter(clearedFilter)
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  )
}

FilterPanel.propTypes = {
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  setFilterPanelOpen: PropTypes.func.isRequired,
  filterOptions: PropTypes.object.isRequired,
  optionLabels: PropTypes.object,
}

export default FilterPanel
