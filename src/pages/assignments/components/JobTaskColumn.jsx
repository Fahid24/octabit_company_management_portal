/* eslint-disable react/prop-types */
import ConfirmDialog from "@/component/ConfirmDialog";
import { useState } from "react";
import { useSelector } from "react-redux";
import JobTaskCard from "./JobTaskCard";

const JobTaskColumn = ({ title, tasks, onStatusChange, onShowDetails }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTaskData, setPendingTaskData] = useState(null);
  const loginUser = useSelector((state) => state.userSlice.user);
  const [isDragOver, setIsDragOver] = useState(false);
  const isDisabled =
    title === "Completed" && loginUser?.user?.role === "Employee";

  const handleDragOver = (e) => {
    if (isDisabled) return;
    e.preventDefault();

    // Get the task data to check if drop should be allowed
    const taskData = e.dataTransfer.getData("text/plain");
    if (taskData) {
      try {
        const task = JSON.parse(taskData);
        // Don't show drag over effect if trying to drop to completed from non-review status
        if (title === "Completed" && task?.status !== "In Review") {
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (isDisabled) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    if (isDisabled) return;
    e.preventDefault();
    setIsDragOver(false);

    const taskData = JSON.parse(e.dataTransfer.getData("text/plain"));

    // Prevent dropping to completed unless coming from "In Review"
    if (title === "Completed") {
      if (taskData.status !== "In Review") {
        return; // Block drop if not coming from "In Review"
      }

      // Show confirmation dialog for valid drop
      setPendingTaskData(taskData);
      setConfirmOpen(true);
      return;
    }

    if (taskData.status === "Completed") {
      return; // Don't allow the drop
    }

    if (taskData.status !== title) {
      onStatusChange(taskData, title);
    }
  };

  const handleConfirmMove = () => {
    if (pendingTaskData) {
      onStatusChange(pendingTaskData, title);
      setPendingTaskData(null);
      setConfirmOpen(false);
    }
  };

  const handleCancelMove = () => {
    setPendingTaskData(null);
    setConfirmOpen(false);
  };

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
    <div
      className={`bg-gray-50 rounded-xl border ${
        isDragOver ? "border-primary bg-primary/5" : "border-gray-200"
      } ${
        isDisabled ? "opacity-70" : ""
      } transition-all duration-300 min-h-96 `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`${styles.header} border-b p-4 rounded-t-xl sticky top-0 z-10`}
      >
        <div className="flex items-center justify-between">
          <h2 className={`${styles.headerText} font-bold text-lg`}>{title}</h2>
          <span
            className={`${styles.badge} text-xs px-3 py-1 rounded-full font-medium`}
          >
            {tasks?.length}
          </span>
        </div>
      </div>

      <div className="p-2 max-h-[72vh] overflow-auto">
        <div className="space-y-3">
          {tasks?.map((task) => (
            <JobTaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>

        {tasks?.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Mark as Completed"
        message="Are you sure you want to move this task to Completed?"
        confirmText="Yes, Move"
        cancelText="Cancel"
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />
    </div>
  );
};

export default JobTaskColumn;
