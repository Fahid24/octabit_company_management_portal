import {
  CalendarDays,
  Clock,
  Users,
  Target,
  Building2,
  Mail,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/component/badge";
import Button from "@/component/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/card";
import { Progress } from "@/component/Progress";
import { Avatar, AvatarFallback } from "@/component/avater";
import { useParams } from "react-router-dom";
import { useGetProjectQuery } from "@/redux/features/admin/project/projectApiSlice";
import Loader from "@/component/Loader";
import { useEffect, useState } from "react";

export default function ProjectViewPage() {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const { id } = useParams();
  const { data: projectData, isLoading, isError } = useGetProjectQuery(id);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [showAllManagers, setShowAllManagers] = useState(false);

  useEffect(() => {
    if (projectData?.progress?.NotStarted != null) {
      const timer = setTimeout(() => {
        setAnimatedProgress(projectData.progress.NotStarted);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projectData?.progress?.NotStarted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <Loader />
      </div>
    );
  }

  if (isError || !projectData || !projectData?.project) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center text-red-500">
        Project not found or failed to load.
      </div>
    );
  }
  const { project, progress } = projectData;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(project.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  };

  const calculateProgress = () => {
    const startDate = new Date(project.startDate);
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    const totalDays = (dueDate - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  return (
    <div className="md:pl-24 pb-20 md:pb-4">
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"></div>

        {/* Decorative Elements */}
        {/* <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-5 rounded-full translate-y-24 -translate-x-24"></div> */}

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 text-gray-800">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                  Project Overview
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {project.name}
              </h1>
              <p className="text-lg opacity-90 mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">Start</p>
                    <p className="font-semibold text-sm">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">Due</p>
                    <p className="font-semibold text-sm">
                      {formatDate(project.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Progress Circle */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <svg
                  className="w-40 h-40 transform -rotate-90"
                  viewBox="0 0 160 160"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="#8A6642"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${(animatedProgress / 100) * 377} 377`}
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dasharray 2s ease-in-out",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                  <span className="text-2xl font-bold">
                    {progress.NotStarted}%
                  </span>
                  <span className="text-xs opacity-75">Not Started</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Status Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg font-bold">
                {project.departments.length}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Departments</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg font-bold">
                {project.managers.length}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Managers</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg font-bold">
                {project.employees.length}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Employees</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg font-bold">
                {calculateDaysRemaining()}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Days Left</h3>
          </div>
        </div>
      </div>

      {/* Compact Timeline Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Project Timeline
          </h2>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200 rounded-full"></div>
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-primary rounded-full transition-all duration-2000 ease-out"
              style={{ height: `${calculateProgress()}%` }}
            ></div>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Project Started
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg z-10"></div>
                <div className="flex-1 pl-6"></div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 pr-6"></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white shadow-lg z-10"></div>
                <div className="flex-1 text-left pl-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Current Status
                  </h3>
                  <p className="text-gray-600 text-sm">{project.status}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 text-right pr-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Project Due
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {formatDate(project.dueDate)}
                  </p>
                </div>
                <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white shadow-lg z-10"></div>
                <div className="flex-1 pl-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Departments Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Departments
        </h2>

        <div className="space-y-4">
          {project?.departments
            ?.slice(0, showAllDepartments ? project.departments.length : 3)
            .map((dept, index) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  {/* Compact Department Info */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-primary to-[#6B4E3D] p-5 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-1">
                          {dept.department.name}
                        </h3>
                        <p className="opacity-90 text-sm mb-3">
                          {dept.department.description}
                        </p>

                        {/* Compact Department Head */}
                        <div className="border-t border-white border-opacity-20 pt-3">
                          <p className="text-xs opacity-75 mb-2">
                            Department Head
                            {Array.isArray(dept.departmentHeads) &&
                            dept.departmentHeads.length > 1
                              ? "s"
                              : ""}
                          </p>

                          {Array.isArray(dept.departmentHeads) &&
                          dept.departmentHeads.length > 0 ? (
                            dept.departmentHeads.map((head, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 mb-1"
                              >
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white bg-opacity-20 relative">
                                  {head.photoUrl && head.photoUrl.trim() ? (
                                    <img
                                      src={head.photoUrl}
                                      alt={`${head.firstName} ${head.lastName}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        const fallback =
                                          e.target.parentNode.querySelector(
                                            ".fallback-initials"
                                          );
                                        if (fallback) {
                                          fallback.style.display = "flex";
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <span
                                    className={`fallback-initials font-bold text-xs flex items-center justify-center w-full h-full absolute inset-0 ${
                                      head.photoUrl && head.photoUrl.trim()
                                        ? "hidden"
                                        : "flex"
                                    }`}
                                  >
                                    {head.firstName?.charAt(0)}
                                    {head.lastName?.charAt(0)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm truncate">
                                    {head.firstName} {head.lastName}
                                  </p>
                                  <p className="text-xs opacity-75 truncate">
                                    {head.email}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs italic text-white opacity-60">
                              No department head assigned
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact KPI Section */}
                  <div className="lg:col-span-3 p-5">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      KPI Criteria
                    </h4>
                    <div className="space-y-3">
                      {dept.kpiCriteria.map((kpi) => (
                        <div key={kpi.kpi.id} className="group">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700 text-sm">
                              {kpi.kpi.criteria}
                            </span>
                            <span className="font-bold text-primary text-sm">
                              {kpi.value}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-[#6B4E3D] rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg"
                              style={{ width: `${kpi.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {project?.departments.length > 3 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAllDepartments(!showAllDepartments)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {showAllDepartments ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  View Less
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  View More ({project?.departments.length - 3} more departments)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Compact Team Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Team Members
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compact Managers */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Project Managers
            </h3>
            <div className="space-y-3">
              {project.managers
                ?.slice(0, showAllManagers ? project.managers.length : 3)
                .map((manager) => (
                  <div
                    key={manager._id}
                    className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-[#6B4E3D] text-white font-bold relative">
                        {manager.photoUrl && manager.photoUrl.trim() ? (
                          <img
                            src={manager.photoUrl}
                            alt={`${manager.firstName} ${manager.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback =
                                e.target.parentNode.querySelector(
                                  ".fallback-initials"
                                );
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <span
                          className={`fallback-initials items-center justify-center w-full h-full absolute inset-0 ${
                            manager.photoUrl && manager.photoUrl.trim()
                              ? "hidden"
                              : "flex"
                          }`}
                        >
                          {manager.firstName.charAt(0)}
                          {manager.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">
                          {manager.firstName} {manager.lastName}
                        </h4>
                        <p className="text-primary font-medium text-sm">
                          {manager.designation || "N/A"}
                        </p>
                        <p className="text-gray-600 text-xs truncate">
                          {manager.email}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    </div>
                  </div>
                ))}
            </div>
            {project.managers.length > 3 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAllManagers(!showAllManagers)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                >
                  {showAllManagers ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      View Less
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      View More ({project.managers.length - 3} more managers)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Compact Employees */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Employees</h3>
            <div className="grid grid-cols-1 gap-3">
              {project.employees?.length > 0 ? (
                project.employees
                  ?.slice(0, showAllEmployees ? project.employees.length : 3)
                  .map((emp) => (
                    <div
                      key={emp.employee._id}
                      className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-[#6B4E3D] text-white font-bold flex-shrink-0 relative">
                          {emp.employee.photoUrl &&
                          emp.employee.photoUrl.trim() ? (
                            <img
                              src={emp.employee.photoUrl}
                              alt={`${emp.employee.firstName} ${emp.employee.lastName}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fallback =
                                  e.target.parentNode.querySelector(
                                    ".fallback-initials"
                                  );
                                if (fallback) {
                                  fallback.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <span
                            className={`fallback-initials items-center justify-center w-full h-full absolute inset-0 ${
                              emp.employee.photoUrl &&
                              emp.employee.photoUrl.trim()
                                ? "hidden"
                                : "flex"
                            }`}
                          >
                            {emp.employee.firstName.charAt(0)}
                            {emp.employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">
                            {emp.employee.firstName} {emp.employee.lastName}
                          </h4>
                          <p className="text-primary font-medium text-sm">
                            {emp.employee.role}
                          </p>
                          <p className="text-gray-600 text-xs truncate">
                            {emp.employee.email}
                          </p>
                          {/* <p className="text-gray-500 text-xs">
                          Assigned: {formatDate(emp.assignedAt)}
                        </p> */}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <p className="text-gray-500 text-xs">
                    No Employees Assigned.
                  </p>
                </div>
              )}
            </div>
            {project?.employees?.length > 3 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAllEmployees(!showAllEmployees)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                >
                  {showAllEmployees ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      View Less
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      View More ({project?.employees?.length - 3} more
                      employees)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Footer Info */}
      <div className="bg-gradient-to-r from-primary to-[#6B4E3D] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="font-semibold mb-1">Project ID</h4>
              <p className="font-mono text-xs opacity-90">{project.id}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Created</h4>
              <p className="opacity-90 text-sm">
                {formatDate(project.createdAt)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Last Updated</h4>
              <p className="opacity-90 text-sm">
                {formatDate(project.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
