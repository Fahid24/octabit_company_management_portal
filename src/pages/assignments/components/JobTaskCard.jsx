/* eslint-disable react/prop-types */
import ConfirmDialog from "@/component/ConfirmDialog";
import {
  Calendar,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

export default function JobTaskCard ({ task, onStatusChange, onShowDetails }) {
  // console.log(task);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTaskData, setPendingTaskData] = useState(null);

  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  const loginUser = useSelector((state) => state.userSlice.user);
  const isEmployee = loginUser?.user?.role === "Employee";
  const loginRole = loginUser?.user?.role;

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

    return actions;
  };

  const getTaskPriorityColor = () => {
    // You can add priority logic here based on task data
    return "bg-orange-100 text-orange-800";
  };

  const handleConfirmMove = () => {
    if (pendingTaskData) {
      onStatusChange(pendingTaskData, "Completed");
      setPendingTaskData(null);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="">
      <div
        onDoubleClick={() => onShowDetails(task)}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify(task));
        }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 border-t-2 border-l-2 p-4 mb-3 cursor-move hover:shadow-md transition-all duration-200 ${task?.status == "To Do"
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
        <div className="flex justify-between items-start mb-3">
          <h3 onClick={() => onShowDetails(task)} className="text-gray-900 font-semibold text-sm leading-tight line-clamp-2 text-wrap cursor-pointer">
            {task?.details}
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
                {getAvailableActions(task?.status).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (action?.action === "details") {
                        // console.log(action?.action);
                        onShowDetails(task);
                        setShowOptions(false);
                        return;
                      }

                      // If moving to Completed from In Review, use appropriate flow
                      if (
                        action.status === "Completed" &&
                        task.status === "In Review"
                      ) {
                        // For admin/department head/manager, use review modal; for others, use confirmation
                        if (loginRole === "Admin" || loginRole === "DepartmentHead" || loginRole === "Manager") {
                          onStatusChange(task, action.status);
                        } else {
                          setPendingTaskData({ ...task }); // pass task data
                          setConfirmOpen(true);
                        }
                        setShowOptions(false);
                        return;
                      }

                      // Otherwise do normal status change
                      onStatusChange(task, action?.status);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                  >
                    <action.icon size={14} />
                    {action?.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-700">
            {task?.department?.name}
          </span>
          {/* <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
            {task.kpi.criteria}
          </span> */}
        </div>

        {/* Assignee and date */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {/* <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={12} className="text-gray-600" />
            </div> */}
            <span className="text-gray-700 text-xs font-medium">
              Assigned To:
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar size={12} />
            <span className="text-xs">{formatDate(task?.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center -space-x-2">
          {task?.assignedEmployees?.slice(0, 3)?.map((assigned, index) => {
            const employee = assigned?.employee;
            const initials =
              employee?.firstName?.charAt(0)?.toUpperCase() ?? "?";
            const fullName = `${employee?.firstName ?? ""} ${employee?.lastName ?? ""
              }`;
            const email = employee?.email ?? "";

            return (
              <div key={employee?._id || index} className="relative group mt-1">
                {/* Avatar */}
                {employee?.photoUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                    src={employee?.photoUrl}
                    className="w-8 h-8 rounded-full border-2 border-white cursor-pointer object-cover object-center text-xs"
                    alt={fullName}
                  />
                  </div>
                  
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold border-2 border-white cursor-pointer">
                    {initials}
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:flex flex-col items-start z-30 bg-black text-white text-xs rounded-md shadow-md px-3 py-2 whitespace-nowrap min-w-max">
                  <div className="font-semibold">{fullName}</div>
                  <div className="text-white">{email}</div>
                </div>
              </div>
            );
          })}

          {/* Overflow Avatar */}
          {task?.assignedEmployees?.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center text-sm font-semibold border-2 border-white overflow-visible mt-1 z-20">
              +{task?.assignedEmployees.length - 3}
            </div>
          )}
        {
          task?.assignedEmployees?.length === 1 && (
            <div className=" text-xs text-gray-500 mt-1">
              <p className="pl-3 font-semibold text-gray-800">{task?.assignedEmployees[0]?.employee?.firstName} {task?.assignedEmployees[0]?.employee?.lastName}</p>
              <p className="text-gray-600 pl-3 text-[10px] -mt-1">{task?.assignedEmployees[0]?.employee?.email}</p>
            </div>
          )
        }

        </div>

        <div className="mt-1 pt-2 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] truncate font-medium ${getTaskPriorityColor()}`}
            >
              {task?.kpi?.criteria}
            </span>
            <span className="text-xs text-gray-500">{task?.completion}%</span>
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
      />
    </div>
  );
};