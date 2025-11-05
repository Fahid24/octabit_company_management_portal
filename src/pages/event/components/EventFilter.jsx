import { Filter, X, Calendar, RotateCcw } from "lucide-react";
import SelectInput from "@/component/select/SelectInput";
import DateRangeSelector from "@/component/DateRangeSelector";
import Button from "@/component/Button";
import { format } from "date-fns";
import React, { useState, useEffect, useRef } from "react";

const EventFilter = ({
  startDate,
  endDate,
  onDateRangeChange,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  showFilters,
  setShowFilters,
  clearFilters,
}) => {
  // Reference to the filter panel to prevent closing when clicking inside
  const filterPanelRef = useRef(null);

  // Effect to prevent unexpected closing of filter panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only run this check if filters are shown
      if (
        showFilters &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target)
      ) {
        // Clicked outside the filter panel, but let the toggle button handle itself
        if (event.target.closest("[data-filter-toggle]")) {
          return;
        }
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // Event types from the provided schema
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "party", label: "Party" },
    { value: "meeting", label: "Meeting" },
    { value: "training", label: "Training" },
    { value: "discussion", label: "Discussion" },
    { value: "holiday", label: "Holiday" },
    { value: "conference", label: "Conference" },
    { value: "workshop", label: "Workshop" },
    { value: "birthday", label: "Birthday" },
    { value: "webinar", label: "Webinar" },
    { value: "weekend", label: "Weekend" },
    { value: "work-aniversary", label: "Work Anniversary" },
    { value: "make-up-day", label: "Make-Up Day" },
    { value: "on-call", label: "On-Call" },
    { value: "other", label: "Other" },
  ];

  // Status options from the provided schema
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ];

  // Check if any filter is active
  const hasActiveFilters = selectedType || selectedStatus;

  // Simple filter toggle handler
  const handleFilterToggle = (e) => {
    e.stopPropagation();
    try {
      setShowFilters(!showFilters);
    } catch (error) {
      console.error("Error toggling filters:", error);
    }
  };

  return (
    <div className="mb-6">
      {/* Simple Filter Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleFilterToggle}
          className={`flex items-center px-3 py-2 text-xs md:text-sm font-medium rounded-md ${
            showFilters
              ? "text-primary bg-primary/10 border border-primary/20"
              : "text-white bg-primary hover:bg-primary/90"
          }`}
        >
          <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          {showFilters ? "Filters" : "Filters"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          ref={filterPanelRef}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Event Filters
              </h3>
            </div>
            {/* <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                size="sm"
                className="border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
              >
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </div>
              </Button>
            </div> */}
          </div>

          {/* Horizontal Filters Layout */}
          <div className="flex flex-wrap gap-4 z-40">
            {/* Date Range Picker */}
            <div
              className="w-full md:w-auto md:flex-1 min-w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              <DateRangeSelector
                onDateRangeChange={onDateRangeChange}
                label="Date Range"
                allowFutureDates={true}
              />
            </div>

            {/* Event Type Filter */}
            <div className="w-full md:w-auto md:flex-1 min-w-[180px] z-30">
              <SelectInput
                label="Event Type"
                value={selectedType}
                onChange={setSelectedType}
                options={typeOptions}
                placeholder="Select Event Type"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-auto md:flex-1 min-w-[180px] z-20">
              <SelectInput
                label="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusOptions}
                placeholder="Select Status"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">Active filters:</span>

                {/* Type Filter */}
                {selectedType && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Type:{" "}
                    {typeOptions.find((t) => t.value === selectedType.value)
                      ?.label || selectedType.value}
                    <button
                      onClick={() => setSelectedType(null)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Status Filter */}
                {selectedStatus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Status:{" "}
                    {statusOptions.find((s) => s.value === selectedStatus.value)
                      ?.label || selectedStatus.value}
                    <button
                      onClick={() => setSelectedStatus(null)}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearFilters}
                  className="text-primary hover:text-primary/80 text-xs underline ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilter;
