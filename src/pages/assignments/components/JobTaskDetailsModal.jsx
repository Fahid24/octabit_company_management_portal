/* eslint-disable react/prop-types */

import { CheckCircle, Clock, Target, User, X } from "lucide-react";

const JobTaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;
  // console.log(task);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-form-header-gradient p-5 rounded-t-xl text-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                {task?.details}
              </h2>
              <span className="inline-block px-3 py-1  backdrop-blur-sm text-gray-800 rounded-full text-sm font-medium border border-white/70">
                {task?.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-red-500  p-2 hover:bg-red-300/50 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Project Information */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Target size={18} className="text-primary" />
              </div>
              Project Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/70 rounded-lg p-3 border border-primary/10">
                <span className="font-medium text-primary/80 block mb-1">
                  Project Name:
                </span>
                <p className="text-gray-800 font-medium">
                  {task?.project?.name}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-primary/10">
                <span className="font-medium text-primary/80 block mb-1">
                  Department:
                </span>
                <p className="text-gray-800 font-medium">
                  {task?.department?.name}
                </p>
              </div>
              <div className="md:col-span-2 bg-white/70 rounded-lg p-3 border border-primary/10">
                <span className="font-medium text-primary/80 block mb-1">
                  Project Description:
                </span>
                <p className="text-gray-800">
                  {task?.project?.description || "No description available"}
                </p>
              </div>
              <div className="md:col-span-2 bg-white/70 rounded-lg p-3 border border-primary/10">
                <span className="font-medium text-primary/80 block mb-1">
                  Department Description:
                </span>
                <p className="text-gray-800">{task?.department?.description}</p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="bg-gradient-to-r from-primary/8 to-primary/12 rounded-lg p-4 border border-primary/25">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-primary/15 rounded-lg">
                <CheckCircle size={18} className="text-primary" />
              </div>
              Task Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/80 rounded-lg p-3 border border-primary/15">
                <span className="font-medium text-primary/80 block mb-1">
                  KPI Criteria:
                </span>
                <p className="text-gray-800">{task?.kpi?.criteria}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-primary/15">
                <span className="font-medium text-primary/80 block mb-2">
                  Completion:
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-primary/20 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-primary to-[#A67C52] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${task?.completion}%` }}
                    ></div>
                  </div>
                  <span className="text-primary font-bold text-sm">
                    {task?.completion}%
                  </span>
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-primary/15">
                <span className="font-medium text-primary/80 block mb-1">
                  Status:
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    task?.isCompleted
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-primary/10 text-primary/70 border border-primary/20"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      task?.isCompleted ? "bg-primary" : "bg-primary/60"
                    }`}
                  ></div>
                  {task?.isCompleted ? "Completed" : "In Progress"}
                </div>
              </div>
              {/* Completion Time Section */}
              {task?.completionTime && (
                <div className="bg-white/80 rounded-lg p-3 border border-primary/15">
                  <span className="font-medium text-primary/80 block mb-2">
                    Estimated Completion Time:
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <span className="text-primary font-medium text-sm">
                      {task?.completionTime?.value} {task?.completionTime?.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* People Information */}
          <div className="bg-gradient-to-r from-primary/6 to-primary/10 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-primary/12 rounded-lg">
                <User size={18} className="text-primary" />
              </div>
              People
            </h3>

            {task?.assignedEmployees?.map((employee, i) => {
              const employeeData = employee?.employee;
              const assignedBy = employee?.assignedBy;
              // console.log(employee);
              const initials =
                employeeData?.firstName?.charAt(0)?.toUpperCase() ?? "?";
              const assignedByInitials =
                assignedBy?.firstName?.charAt(0)?.toUpperCase() ?? "?";
              const fullName = `${employeeData?.firstName ?? ""} ${
                employeeData?.lastName ?? ""
              }`;
              return (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm m-2 border border-primary/12 rounded-lg shadow-sm"
                >
                  <div className="bg-white/70 rounded-lg p-3 ">
                    <span className="font-medium text-primary/80 block mb-1">
                      Assigned By:
                    </span>
                    <div className="flex items-center gap-3">
                      <div>
                        {assignedBy?.photoUrl ? (
                          <img
                            src={assignedBy?.photoUrl}
                            className="w-8 h-8 rounded-full border-2 border-white cursor-pointer object-cover object-center"
                            alt={fullName}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold border-2 border-white cursor-pointer">
                            {assignedByInitials}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">
                          {employee?.assignedBy?.firstName}{" "}
                          {employee?.assignedBy?.lastName}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {employee?.assignedBy?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <span className="font-medium text-primary/80 block mb-1">
                      Assigned To:
                    </span>
                    <div className="flex items-center gap-3">
                      <div>
                        {employeeData?.photoUrl ? (
                          <img
                            src={employeeData?.photoUrl}
                            className="w-8 h-8 rounded-full border-2 border-white cursor-pointer object-cover object-center"
                            alt={fullName}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold border-2 border-white cursor-pointer">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">
                          {employee?.employee?.firstName}{" "}
                          {employee?.employee?.lastName}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {employee?.employee?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="bg-gradient-to-r from-primary/4 to-primary/8 rounded-lg p-4 border border-primary/18">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Clock size={18} className="text-primary" />
              </div>
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/70 rounded-lg p-3 border border-primary/12">
                <span className="font-medium text-primary/80 block mb-1">
                  Created At:
                </span>
                <p className="text-gray-800 font-medium">
                  {formatDate(task?.createdAt)}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-primary/12">
                <span className="font-medium text-primary/80 block mb-1">
                  Last Updated:
                </span>
                <p className="text-gray-800 font-medium">
                  {formatDate(task?.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Information */}
          {/* <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Technical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Task ID:</span>
                <p className="text-gray-800 mt-1 font-mono text-xs">
                  {task._id}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Project ID:</span>
                <p className="text-gray-800 mt-1 font-mono text-xs">
                  {task.project._id}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Department ID:
                </span>
                <p className="text-gray-800 mt-1 font-mono text-xs">
                  {task.department._id}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">KPI ID:</span>
                <p className="text-gray-800 mt-1 font-mono text-xs">
                  {task.kpi._id}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default JobTaskDetailsModal;
