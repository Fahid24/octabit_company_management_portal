const EventItemSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 animate-pulse">
      {/* Event date/time indicator */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        {/* Event title */}
        <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        {/* Event time/details */}
        <div className="h-3 bg-gray-200 rounded-md w-1/2 mb-1"></div>
        {/* Event location */}
        <div className="h-3 bg-gray-200 rounded-md w-2/3"></div>
      </div>

      {/* Event status/priority */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}

const EventSectionSkeleton = ({ title, itemCount = 3 }) => {
  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Event items */}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <EventItemSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

const EventsSkeleton = ({ isCurrentMonth, isFutureMonth, isPastMonth }) => {
  return (
    <div className="p-4">
      {/* Today's Events Skeleton - only in current month */}
      {isCurrentMonth && <EventSectionSkeleton title="Today's Events" itemCount={2} />}

      {/* Upcoming Events Skeleton - in current or future months */}
      {(isCurrentMonth || isFutureMonth) && <EventSectionSkeleton title="Upcoming Events" itemCount={4} />}

      {/* Past Events Skeleton - in current or past months */}
      {(isCurrentMonth || isPastMonth) && <EventSectionSkeleton title="Past Events" itemCount={3} />}
    </div>
  )
}

export { EventItemSkeleton, EventSectionSkeleton, EventsSkeleton }
