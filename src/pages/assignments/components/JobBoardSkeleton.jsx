/* eslint-disable react/prop-types */
export const TaskCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-2 border-l-2 border-t-gray-300 border-l-gray-300 p-4 mb-3 animate-pulse">
      {/* Header with title and options */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* Department badge */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>

      {/* Assignee and date */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Priority and completion */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
};

export const ColumnSkeleton = ({ title, taskCount = 3 }) => {
  const getColumnStyles = (title) => {
    switch (title) {
      case "To Do":
        return {
          header:
            "border-b-1 border-primary bg-gradient-to-r from-[#E5C7AB]/40 to-primary/60",
          headerText: "text-primary",
          badge: "bg-white text-primary",
        };
      case "In Progress":
        return {
          header:
            "border-b-1 border-blue-500 bg-gradient-to-r from-blue-200/40 to-blue-300",
          headerText: "text-blue-600",
          badge: "bg-white text-blue-700",
        };
      case "In Review":
        return {
          header:
            " border-b-1 border-yellow-500 bg-gradient-to-r from-yellow-200/40 to-yellow-300",
          headerText: "text-yellow-700",
          badge: "bg-white text-yellow-700",
        };
      case "Completed":
        return {
          header:
            "border-b-1 border-green-500 bg-gradient-to-r from-green-200/40 to-green-300",
          headerText: "text-green-700",
          badge: "bg-white text-green-700",
        };
      default:
        return {
          header: "bg-gray-50 border-gray-200",
          headerText: "text-gray-700",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  };

  const styles = getColumnStyles(title);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 min-h-96">
      <div className={`${styles.header} border-b p-4 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h2 className={`${styles.headerText} font-bold text-lg`}>{title}</h2>
          <span
            className={`${styles.badge} text-xs px-3 py-1 rounded-full font-medium animate-pulse`}
          >
            <div className="w-4 h-4 bg-current opacity-30 rounded"></div>
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: taskCount }).map((_, index) => (
            <TaskCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const TaskBoardSkeleton = () => {
  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 ">
      <div className="mx-auto">
        <div className="flex justify-between items-center min-w-full">
          <div className="mb-8 w-full">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
              Project Board
            </h1>
            <p className="text-gray-600">Manage your workflow efficiently</p>
          </div>
          <div className="w-full flex gap-3 justify-end">
            {/* Employee selector skeleton */}
            <div className="max-w-64 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
            {/* Project selector skeleton */}
            <div className="max-w-64 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ColumnSkeleton title="To Do" taskCount={2} />
          <ColumnSkeleton title="In Progress" taskCount={3} />
          <ColumnSkeleton title="In Review" taskCount={1} />
          <ColumnSkeleton title="Completed" taskCount={2} />
        </div>
      </div>
    </div>
  );
};
