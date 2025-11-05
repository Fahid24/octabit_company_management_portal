/* eslint-disable react/prop-types */

import { useState, useRef, useEffect, useMemo } from "react";
import {
  User,
  Calendar,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Eye,
  Clock,
  Edit,
  Trash2,
  Plus,
  FileText,
  CircleAlert,
  Link2,
} from "lucide-react";
import {
  useCreateDailyTaskMutation,
  useGetAllDailyTasksQuery,
  useUpdateDailyTaskStatusMutation,
  useDeleteDailyTaskMutation,
} from "@/redux/features/dailyTask/dailyTaskApiSlice";
import { useSelector } from "react-redux";
import SelectInput from "@/component/select/SelectInput";
// import { FloatingInput } from "@/component/FloatiingInput";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import ConfirmDialog from "@/component/ConfirmDialog";
import EditTaskModal from "./components/EditTaskModal";
import CreateTaskModal from "./components/CreateTaskModal";
import Button from "@/component/Button";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import ReviewTaskModal from "./components/ReviewTaskModal";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";

const columns = ["To Do", "In Progress", "In Review", "Completed"];

const TaskCardSkeleton = () => {
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

const ColumnSkeleton = ({ title, taskCount = 3 }) => {
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

const TaskBoardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:pl-24 pb-20 md:pb-4">
        <div className="flex justify-between items-center min-w-full">
          <div className="mb-8 w-full">
            <h1 className="text-xl font-bold leading-tight text-gray-900">
              Task Board
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

const TaskCard = ({
  task,
  onStatusChange,
  onShowDetails,
  deleteTask,
  onShowEdit,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTaskData, setPendingTaskData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [deleteDailyTask] = useDeleteDailyTaskMutation();
  // console.log(itemToDelete?._id);

  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  const loginUser = useSelector((state) => state.userSlice.user);
  const loginRole = loginUser?.user?.role;
  const isEmployee = loginUser?.user?.role === "Employee";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAvailableActions = (currentStatus) => {
    const actions = [{ label: "View Details", action: "details", icon: Eye }];

    switch (currentStatus) {
      case "To Do":
        actions.push({
          label: "Move to In Progress",
          status: "In Progress",
          icon: ArrowRight,
        });
        actions.push({
          label: "Move to In Review",
          status: "In Review",
          icon: CheckCircle,
        });
        break;
      case "In Progress":
        actions.push({
          label: "Move to To Do",
          status: "To Do",
          icon: ArrowLeft,
        });
        actions.push({
          label: "Move to In Review",
          status: "In Review",
          icon: CheckCircle,
        });
        break;
      case "In Review":
        actions.push({
          label: "Move to To Do",
          status: "To Do",
          icon: ArrowLeft,
        });
        actions.push({
          label: "Move to In Progress",
          status: "In Progress",
          icon: ArrowLeft,
        });
        !isEmployee &&
          actions.push({
            label: "Move to Completed",
            status: "Completed",
            icon: CheckCircle,
          });
        break;
      default:
        break;
    }
    actions.push({
      label: "Edit",
      action: "edit",
      icon: Edit,
    });
    actions.push({
      label: "Delete",
      action: "delete",
      icon: Trash2,
    });

    return actions;
  };

  const handleConfirmMove = () => {
    if (pendingTaskData) {
      onStatusChange(pendingTaskData, "Completed");
      setPendingTaskData(null);
      setConfirmOpen(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item?._id); // store the item to delete
    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDailyTask(itemToDelete).unwrap();
      toast.success("Success", "Task deleted successfully!");

      // cleanup
      setIsDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Error", error?.data?.message || "Failed to delete task.");
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBackdropClick = (e) => {
    // console.log(e.target, e.currentTarget);
    if (e.target === e.currentTarget) {
      setIsDialogOpen(false);
      setItemToDelete(null);
    }
  };
  // const handleTaskCompleteBackdropClick = (e) => {
  //   console.log('Backdrop clicked');
  //   console.log('Target:', e.target);
  //   console.log('CurrentTarget:', e.currentTarget);
  //   console.log('Are they equal?', e.target === e.currentTarget);

  //   if (e.target === e.currentTarget) {
  //     console.log('Closing modal...');
  //     setConfirmOpen(false);
  //     setPendingTaskData(null);
  //   }
  // };

  return (
    <div className="relative group">
      <div
        onDoubleClick={() => onShowDetails(task)}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify(task));
        }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 border-t-2 border-l-2 p-4 mb-3 cursor-move hover:shadow-md transition-all duration-200 ${
          task?.status == "To Do"
            ? "border-t-primary border-l-primary"
            : task?.status == "In Progress"
            ? "border-t-blue-500 border-l-blue-500"
            : task?.status == "In Review"
            ? "border-t-yellow-500 border-l-yellow-500"
            : task?.status == "Completed"
            ? "border-t-green-500 border-l-green-500"
            : ""
        }`}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-gray-900 font-semibold text-sm leading-tight pr-2 line-clamp-2 text-wrap">
            {task.title}
          </h3>
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <MoreVertical size={16} />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-50">
                {getAvailableActions(task.status).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (action.action === "details") {
                        onShowDetails(task);
                        setShowOptions(false);
                        return;
                      }
                      if (action.action === "edit") {
                        onShowEdit(task);
                        setShowOptions(false);
                        return;
                      }

                      if (action.action === "delete") {
                        handleDeleteClick(task);
                        setShowOptions(false);
                        return;
                      }

                      // If moving to Completed from In Review, use appropriate flow
                      if (
                        action.status === "Completed" &&
                        task.status === "In Review"
                      ) {
                        setPendingTaskData({ ...task }); // pass task data
                        setConfirmOpen(true);
                        setShowOptions(false);
                        return;
                      }

                      // Otherwise do normal status change
                      onStatusChange(task, action.status);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                  >
                    <action.icon size={14} />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* <h3 className="text-gray-600 text-xs  pr-2 text-wrap mt-1 mb-2">
          {task.details?.length > 100 ? `${task.details.slice(0, 90)}...` : task.details}
        </h3> */}

        <h3 className="text-gray-600 text-xs pr-2 mt-1 mb-2 break-words overflow-hidden">
          {task.details?.length > 100 ? (
            <span className="line-clamp-3">{task.details}</span>
          ) : (
            <span className="break-words">{task.details}</span>
          )}
        </h3>

        {/* Assignee and date */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {task?.employeeId?.photoUrl ? (
              <div>
                <img
                  src={task.employeeId.photoUrl}
                  alt={`${task.employeeId.firstName} ${task.employeeId.lastName}`}
                  className="w-5 h-5 rounded-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={12} className="text-gray-600" />
              </div>
            )}

            <span className="text-gray-700 text-xs font-medium">
              Assigned To:
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar size={12} />
            <span className="text-xs">{formatDate(task.createdAt)}</span>
          </div>
        </div>
        <span className="font-medium text-xs">
          {task.employeeId.firstName} {task.employeeId.lastName}
        </span>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Task Completion - {task.completion}%
            </span>
          </div>
        </div>

        {/* <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
              {getPriorityText()}
            </span>
            <span className="text-xs text-gray-500">{task.completion}%</span>
          </div>
        </div> */}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Mark as Completed"
        message="Are you sure you want to move this task to Completed?"
        confirmText="Yes, Move"
        cancelText="Cancel"
        onConfirm={handleConfirmMove}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingTaskData(null);
        }}
        // onBackdropClick={handleTaskCompleteBackdropClick}
      />

      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this task? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onBackdropClick={handleBackdropClick}
      />
    </div>
  );
};

const Column = ({
  title,
  tasks,
  onStatusChange,
  onShowDetails,
  handleDeleteTask,
  handleShowEdit,
}) => {
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
        if (title === "Completed" && task.status !== "In Review") {
          return;
        }
      } catch (error) {
        // If we can't parse the data, allow the drag over for now
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
        return;
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
          badge: "bg-white text-gray-700",
        };
    }
  };

  const styles = getColumnStyles(title);

  return (
    <div
      className={`bg-gray-50 rounded-xl border ${
        isDragOver ? "border-primary bg-primary/5" : "border-gray-200"
      } ${isDisabled ? "opacity-70" : ""} transition-all duration-300 min-h-96`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`${styles.header} border-b p-4 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h2 className={`${styles.headerText} font-bold text-lg`}>{title}</h2>
          <span
            className={`${styles.badge} text-xs px-3 py-1 rounded-full font-medium`}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="p-3 max-h-[72vh] overflow-auto">
        <div className="space-y-3 pb-40">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onShowDetails={onShowDetails}
              onShowEdit={handleShowEdit}
              deleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {tasks.length === 0 && (
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

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  if (!isOpen || !task) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateCompact = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] sm:max-h-[75vh] shadow-2xl flex flex-col">
        {/* Elegant Header */}
        <div className="bg-form-header-gradient p-3 sm:p-5 rounded-t-xl text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-red-500 p-1 sm:p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900">Status:</span>
                <span className="px-2  bg-primary text-white rounded-full text-xs font-semibold border border-primary/20">
                  {task.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900">
                  Priority:
                </span>
                <span
                  className={`px-2  rounded-full text-xs font-semibold border ${
                    task.priority?.toLowerCase() === "high"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : task.priority?.toLowerCase() === "medium"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : task.priority?.toLowerCase() === "low"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {task.priority
                    ? task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)
                    : "Not set"}
                </span>
              </div>
            </div>
            <div className="w-full -mt- md:mt-0">
              <div className="">
                <span className="text-xs font-bold text-gray-900 block">
                  Completion Rate
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 bg-primary/20 rounded-full h-2 sm:h-2.5">
                    <div
                      className="bg-gradient-to-r from-primary to-[#A67C52] h-2 sm:h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${task.completion}%` }}
                    ></div>
                  </div>
                  <span className="text-primary font-bold text-xs sm:text-sm">
                    {task.completion}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800">Task Details</h3>
            <p className="text-gray-600 text-sm">{task.details}</p>
          </div>

          {/* Attachments Section */}
          {task?.attachments?.length > 0 && (
            <div className="bg-gradient-to-r from-primary/5 to-[#A67C52]/5 rounded-lg p-3 sm:p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="p-1 sm:p-1.5 bg-primary/10 rounded-lg">
                  <FileText size={14} className="sm:w-4 sm:h-4 text-primary" />
                </div>
                <span className="font-semibold text-primary text-sm sm:text-base">
                  Attachments ({task.attachments.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                {task.attachments.map((url, idx) => {
                  const isPdf = url.toLowerCase().endsWith(".pdf");
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);

                  return (
                    <div key={idx}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group hover:scale-[1.02] transition-transform duration-200"
                      >
                        {isPdf ? (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-primary/10 hover:shadow-md hover:border-primary/30 transition-all h-full min-h-[80px] sm:min-h-[96px]">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-primary truncate block text-xs sm:text-sm">
                                {url.split("/").pop()}
                              </span>
                              <span className="text-xs text-primary/60 bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded mt-1 inline-block">
                                PDF
                              </span>
                            </div>
                          </div>
                        ) : isImage ? (
                          <div className="relative overflow-hidden rounded-lg border border-primary/10 group-hover:border-primary/30 transition-all bg-white shadow-sm hover:shadow-md h-full min-h-[80px] sm:min-h-[96px]">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img
                                src={
                                  url || "/placeholder.svg?height=80&width=120"
                                }
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          // Normal link treatment
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-primary/10 hover:shadow-md hover:border-primary/30 transition-all h-full min-h-[80px] sm:min-h-[96px]">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg">
                              <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-primary truncate block text-xs sm:text-sm">
                                {new URL(url).hostname.replace("www.", "")}
                              </span>
                              <span className="text-xs text-primary/60 truncate block mt-1">
                                {url.split("/").slice(0, 3).join("/")}...
                              </span>
                              <span className="text-xs text-primary/60 bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded mt-1 inline-block">
                                LINK
                              </span>
                            </div>
                          </div>
                        )}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 sm:p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-1 sm:p-1.5 bg-primary/10 rounded-lg">
                <CheckCircle size={14} className="sm:w-4 sm:h-4 text-primary" />
              </div>
              <span className="font-semibold text-primary text-sm sm:text-base">
                Task Progress
              </span>
            </div>

            {/* Completion Time Section */}
            {task.completionTime && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/20">
                <span className="text-xs font-medium text-gray-600 mb-2 block">
                  Estimated Completion Time
                </span>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5 text-primary" />
                  <span className="text-primary font-medium text-xs sm:text-sm">
                    {task.completionTime.value} {task.completionTime.unit}
                  </span>
                </div>
              </div>
            )}

            {/* Completed Details Section */}
            {task.completedDetails && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/20">
                <span className="text-xs font-medium text-gray-600 mb-2 block">
                  Completion Details
                </span>
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {task.completedDetails}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* People Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-1 sm:p-1.5 bg-gray-100 rounded-lg">
                <User size={14} className="sm:w-4 sm:h-4 text-gray-600" />
              </div>
              <span className="font-semibold text-gray-700 text-sm sm:text-base">
                Team Members
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="bg-white/70 rounded-lg p-3 sm:p-4 border border-gray-100">
                <span className="text-xs font-medium text-gray-500 mb-2 block">
                  Created by
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  {task.assignedBy?.photoUrl ? (
                    <img
                      src={task.assignedBy.photoUrl}
                      alt={`${task.assignedBy.firstName} ${task.assignedBy.lastName}`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center border-2 border-gray-200">
                      <User size={14} className="sm:w-4 sm:h-4 text-gray-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                      {task.assignedBy.firstName} {task.assignedBy.lastName}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {task.assignedBy.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 sm:p-4 border border-gray-100">
                <span className="text-xs font-medium text-gray-500 mb-2 block">
                  Assigned to
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  {task.employeeId?.photoUrl ? (
                    <img
                      src={task.employeeId.photoUrl}
                      alt={`${task.employeeId.firstName} ${task.employeeId.lastName}`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center border-2 border-gray-200">
                      <User size={14} className="sm:w-4 sm:h-4 text-gray-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                      {task.employeeId.firstName} {task.employeeId.lastName}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {task.employeeId.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-gradient-to-br from-primary/8 via-primary/5 to-primary/10 rounded-lg p-2 sm:p-3 border border-primary/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-0.5 sm:p-1 bg-primary/15 rounded-md">
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <span className="font-semibold text-primary text-xs sm:text-sm">
                  Timeline
                </span>
              </div>
              <button
                onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors text-primary text-xs font-medium"
              >
                {isTimelineExpanded ? "Less" : "More"}
                <ArrowRight
                  size={10}
                  className={`sm:w-3 sm:h-3 transform transition-transform ${
                    isTimelineExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {/* Compact Timeline */}
            {!isTimelineExpanded ? (
              <div className="bg-white/60 rounded-md p-2 border border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    {/* Start Date or Created Date */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                          task.startDate ? "bg-green-500" : "bg-primary"
                        }`}
                      ></div>
                      <span className="text-xs font-medium text-gray-700">
                        {task.startDate ? "Started" : "Created"}
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatDateCompact(task.startDate || task.createdAt)}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                          task.dueDate &&
                          new Date(task.dueDate) < new Date() &&
                          task.status !== "Completed"
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                      ></div>
                      <span className="text-xs font-medium text-gray-700">
                        Due
                      </span>
                      <span
                        className={`text-xs ${
                          task.dueDate &&
                          new Date(task.dueDate) < new Date() &&
                          task.status !== "Completed"
                            ? "text-red-600 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {formatDateCompact(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Completed Date (only if completed) */}
                  {task.status === "Completed" && task.completedDate && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-medium text-emerald-700">
                        Done
                      </span>
                      <span className="text-xs text-emerald-600">
                        {formatDateCompact(task.completedDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Expanded Timeline */
              <div className="relative">
                <div className="space-y-4">
                  {/* Created Date */}
                  <div className="relative flex items-center gap-4">
                    <div className="relative z-10 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-md"></div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-primary/10 shadow-sm flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Created
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {formatDateShort(task.createdAt)}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Date */}
                  <div className="relative flex items-center gap-4">
                    <div className="relative z-10 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100 shadow-sm flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            Assigned
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {formatDateShort(task.assignedDate)}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  {task.startDate && (
                    <div className="relative flex items-center gap-4">
                      <div className="relative z-10 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100 shadow-sm flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                              Started
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">
                              {formatDateShort(task.startDate)}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="relative flex items-center gap-4">
                    <div
                      className={`relative z-10 w-3 h-3 rounded-full border-2 border-white shadow-md ${
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "Completed"
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                    ></div>
                    <div
                      className={`bg-white/80 backdrop-blur-sm rounded-lg p-3 border shadow-sm flex-1 ${
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "Completed"
                          ? "border-red-100"
                          : "border-orange-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide ${
                              task.dueDate &&
                              new Date(task.dueDate) < new Date() &&
                              task.status !== "Completed"
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            Due Date
                          </span>
                          <p
                            className={`text-sm font-medium mt-0.5 ${
                              task.dueDate &&
                              new Date(task.dueDate) < new Date() &&
                              task.status !== "Completed"
                                ? "text-red-700"
                                : "text-gray-900"
                            }`}
                          >
                            {formatDateShort(task.dueDate)}
                            {task.dueDate &&
                              new Date(task.dueDate) < new Date() &&
                              task.status !== "Completed" && (
                                <span className="text-xs text-red-500 ml-2 font-semibold">
                                  (OVERDUE)
                                </span>
                              )}
                          </p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.dueDate &&
                            new Date(task.dueDate) < new Date() &&
                            task.status !== "Completed"
                              ? "bg-red-300"
                              : "bg-orange-300"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Completed Date */}
                  {task.completedDate && (
                    <div className="relative flex items-center gap-4">
                      <div className="relative z-10 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-100 shadow-sm flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                              Completed
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">
                              {formatDateShort(task.completedDate)}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="relative flex items-center gap-4">
                    <div className="relative z-10 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-100 shadow-sm flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                            Last Updated
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {formatDateShort(task.updatedAt)}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DailyTaskPage() {
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    task: null,
    targetStatus: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    task: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    task: null,
  });

  const loginUser = useSelector((state) => state.userSlice.user);
  const deptId =
    loginUser?.user?.role === "DepartmentHead" ? loginUser?.user?._id : "";

  const isEmployee = loginUser?.user?.role === "Employee";

  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 9000000000,
    // departmentHead: deptId,
    departmentHead: "",
  });

  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetAllEmployeesQuery(
      {
        departmentHead: deptId,
        page: 1,
        limit: 9000000,
      },
      {
        skip: !loginUser?.user?._id,
      }
    );

  const { data: departmentData, isLoading: isDeptLoading } =
    useGetDepartmentsQuery({ page: 1, limit: 90000, isPopulate: true });

  const departments = useMemo(() => {
    if (!departmentData?.data) return [];
    return departmentData.data;
  }, [departmentData]);

  const [createDailyTask] = useCreateDailyTaskMutation();

  useEffect(() => {
    if (loginUser?.user && isEmployee) {
      setSelectedEmployee({
        value: loginUser?.user?._id,
        label: `${loginUser?.user?.firstName} ${loginUser?.user?.lastName}`,
      });
    } else {
      setSelectedEmployee({
        value: "",
        label: `All`,
      });
      // const filteredEmployees =
      //   employeeData?.data?.filter(
      //     (employee) => employee.role === "Employee"
      //   ) || [];
      // if (filteredEmployees.length > 0) {
      //   setSelectedEmployee({
      //     value: filteredEmployees[0]?._id,
      //     label: `${filteredEmployees[0]?.firstName} ${filteredEmployees[0]?.lastName}`,
      //   });
      // } else {
      //   setSelectedEmployee({ value: null, label: "All" });
      // }
    }
  }, [employeeData]);

  const loginRole = loginUser?.user?.role;
  const loginId = loginUser?.user?._id;

  const {
    data: taskData,
    isLoading,
    refetch,
  } = useGetAllDailyTasksQuery({
    page: 1,
    limit: 9000000,
    employeeId: selectedEmployee?.value,
    ...(loginRole === "DepartmentHead" && { departmentHead: loginId }),
    ...(loginRole === "Manager" && { managerId: loginId }),
    departmentId: selectedDepartment?.value,
  });

  const [updateStatus] = useUpdateDailyTaskStatusMutation();

  useEffect(() => {
    setTasks(taskData?.tasks || []);
  }, [taskData]);

  const handleStatusChange = (task, newStatus) => {
    // Check if moving to "In Review" - requires modal for employees
    if (newStatus === "In Review") {
      setReviewModal({ isOpen: true, task, targetStatus: newStatus });
      return;
    }

    // Check if moving to "Completed" from "In Review" by admin/department head/manager - requires review modal
    if (
      newStatus === "Completed" &&
      task.status === "In Review" &&
      (loginRole === "Admin" ||
        loginRole === "DepartmentHead" ||
        loginRole === "Manager")
    ) {
      setReviewModal({ isOpen: true, task, targetStatus: newStatus });
      return;
    }

    // Direct status change for other moves
    updateTaskStatus(task, newStatus);
  };

  const updateTaskStatus = async (task, newStatus, reviewData = null) => {
    await updateStatus({
      taskId: task._id,
      status: newStatus,
      ...(reviewData && {
        completion: reviewData.completion,
        completionTime: {
          value: reviewData.timeValue,
          unit: reviewData.timeUnit,
        },
      }),
    });

    refetch();
  };

  const handleShowEdit = (task) => {
    setEditModal({ isOpen: true, task });
  };

  const handleTaskUpdate = () => {
    refetch();
    setEditModal({ isOpen: false, task: null });
  };
  const handleCreateTask = async (taskPayload) => {
    try {
      await createDailyTask(taskPayload).unwrap();
      toast.success("Success", "Task created successfully!");
      refetch();
      return true;
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error(
        "Error",
        error?.data?.message || "Failed to create task. Please try again."
      );
      throw error;
    }
  };

  // const handleDeleteTask = async (task) => {
  //   try {
  //     await deleteDailyTask(task._id).unwrap();
  //     toast.success("Success", "Task deleted successfully!");
  //     refetch();
  //   } catch (error) {
  //     console.error("Failed to delete task:", error);
  //     toast.error("Error", error?.data?.message || "Failed to delete task");
  //   }
  // };

  const handleReviewSubmit = (reviewData) => {
    updateTaskStatus(reviewModal.task, reviewModal.targetStatus, reviewData);
    setReviewModal({ isOpen: false, task: null, targetStatus: null });
  };

  const handleShowDetails = (task) => {
    setDetailsModal({ isOpen: true, task });
  };

  const getTasksByStatus = (status) => {
    return tasks?.filter((task) => task.status === status);
  };

  if (isLoading) {
    return <TaskBoardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="p-4 md:pl-24 pb-20 md:pb-4">
        <div className="flex flex-col lg:flex-row justify-center lg:justify-between p-4 items-center min-w-full">
          <div className="my-2 w-full text-left mb-10 md:mb-0">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold leading-tight text-gray-900">
                Task Board
              </h1>
              <div className="ml-2 pt-2 cursor-pointer">
                <Tooltips
                  text="This Task Board helps you track and manage all tasks efficiently. Tasks are organized into four stages: To Do, In Progress, In Review, and Completed. You can assign tasks, set deadlines, and monitor progress. Use the Add Task button to create new tasks and filter by employee to view individual workloads."
                  position={isMobile ? "bottom" : "right"}
                >
                  <CircleAlert className="mb-1 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltips>
              </div>
            </div>
            <p className="text-gray-600">Manage your workflow efficiently</p>
          </div>

          <div className="w-full flex flex-col lg:flex-row justify-center lg:justify-end gap-5 items-center lg:items-end">
            {loginUser?.user?.role !== "Employee" && (
              <div>
                <SelectInput
                  disabled={isEmployee}
                  className={"z-30 min-w-72"}
                  label="Select Department"
                  isMulti={false}
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e);
                  }}
                  options={
                    loginUser?.user?.role === "DepartmentHead"
                      ? departments?.map((department) => ({
                          value: department._id,
                          label: department.name,
                        })) || []
                      : [
                          { value: null, label: "All" },
                          ...(departments?.map((department) => ({
                            value: department._id,
                            label: department.name,
                          })) || []),
                        ]
                  }
                />
              </div>
            )}
            {loginUser?.user?.role !== "Employee" && (
              <div>
                <SelectInput
                  disabled={isEmployee}
                  className={"z-30 min-w-72"}
                  label="Select Employee"
                  isMulti={false}
                  value={selectedEmployee}
                  onChange={(e) => {
                    setSelectedEmployee(e);
                  }}
                  options={[
                    { value: null, label: "All" },
                    ...(employeesData?.data?.map((employee) => ({
                      value: employee._id,
                      label: `${employee.firstName} ${employee.lastName}`,
                    })) || []),
                  ]}
                />
              </div>
            )}

            <div className="">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                className="bg-primary hover:bg-primary/90 min-w-32"
              >
                <div className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>Add Task</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <Column
              key={column}
              title={column}
              tasks={getTasksByStatus(column)}
              onStatusChange={handleStatusChange}
              onShowDetails={handleShowDetails}
              handleShowEdit={handleShowEdit}
              // handleDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </div>

      <ReviewTaskModal
        isOpen={reviewModal.isOpen}
        onClose={() =>
          setReviewModal({ isOpen: false, task: null, targetStatus: null })
        }
        onSubmit={handleReviewSubmit}
        taskDetails={reviewModal.task}
        isAdminReview={
          reviewModal.targetStatus === "Completed" &&
          (loginRole === "Admin" ||
            loginRole === "DepartmentHead" ||
            loginRole === "Manager")
        }
      />

      <TaskDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, task: null })}
        task={detailsModal.task}
      />
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeesData={employeesData}
        loggedInUser={loginUser}
        onCreateTask={handleCreateTask}
      />
      <EditTaskModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, task: null })}
        task={editModal.task}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}
