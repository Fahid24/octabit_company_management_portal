const TaskSkeleton = () => {
  return (
    <li className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 border-primary/30 shadow-md animate-pulse">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Task title skeleton */}
            <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
            {/* Task details skeleton */}
            <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
          </div>
          {/* Priority badge skeleton */}
          <div className="h-6 w-16 bg-gray-200 rounded-full ml-4"></div>
        </div>
      </div>
    </li>
  );
};

export default TaskSkeleton;
