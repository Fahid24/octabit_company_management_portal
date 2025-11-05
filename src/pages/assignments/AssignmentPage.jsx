/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import { CircleAlert } from "lucide-react";
import {
  useGetAllTasksForEmployeeBoardQuery,
  useUpdateTaskStatusMutation,
} from "@/redux/features/task/taskApiSlice";
import { useSelector } from "react-redux";
import SelectInput from "@/component/select/SelectInput";
import { useGetProjectsQuery } from "@/redux/features/admin/project/projectApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import ActiveFilters from "@/component/ActiveFilters";
import { TaskBoardSkeleton } from "./components/JobBoardSkeleton";
import JobTaskColumn from "./components/JobTaskColumn";
import JobTaskDetailsModal from "./components/JobTaskDetailsModal";
import JobTaskReviewModal from "./components/JobTaskReviewModal";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook

const columns = ["To Do", "In Progress", "In Review", "Completed"];

export default function AssignmentPage() {
  // const [tasks, setTasks] = useState([]);
  // console.log(tasks);
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const [selectedProject, setSelectedProject] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    task: null,
    targetStatus: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    task: null,
  });

  const loginUser = useSelector((state) => state.userSlice.user);
  const isEmployee = loginUser?.user?.role === "Employee";
  const deptId =
    loginUser?.user?.role === "DepartmentHead" ? loginUser?.user?._id : "";

  // const { data: projectsData, isLoading: isLoadingProjects } =
  //   useGetEmployeeProjectQuery(selectedEmployee?.value, {
  //     skip: !selectedEmployee?.value,
  //   });

  const {
    data: projectsDataForEmployee,
    isLoading: isLoadingProjectsForEmployee,
  } = useGetProjectsQuery({
    page: 1,
    limit: 9000000,
    departmentHead: deptId,
    employeeId: isEmployee
      ? loginUser?.user?._id
      : selectedEmployee?.value || null,
  });

  // console.log(projectsDataForEmployee);

  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetAllEmployeesQuery(
      {
        page: 1,
        limit: 9000000,
        departmentHead: deptId,
      },
      {
        skip: !loginUser?.user?._id,
      }
    );

  useEffect(() => {
    if (loginUser?.user?.role === "Employee") {
      setSelectedEmployee([
        {
          value: loginUser?.user?._id,
          label: `${loginUser?.user?.firstName} ${loginUser?.user?.lastName}`,
        },
      ]);
    }
  }, [loginUser]);
  // console.log("selectedEmployee", selectedEmployee);

  const loginRole = loginUser?.user?.role;
  const loginId = loginUser?.user?._id;
  const {
    data: taskData,
    isLoading,
    refetch,
  } = useGetAllTasksForEmployeeBoardQuery({
    employeeId:
      loginRole === "Employee"
        ? [loginId]
        : (Array.isArray(selectedEmployee)
            ? selectedEmployee
            : [selectedEmployee]
          )?.map((emp) => emp.value) || [],
    projectId: selectedProject?.map((proj) => proj.value) || [],
    ...(loginRole === "DepartmentHead" && { departmentHead: loginId }),
    ...(loginRole === "Manager" && { managerId: loginId }),
  });

  // console.log(taskData);

  const [updateStatus] = useUpdateTaskStatusMutation();

  // useEffect(() => {
  //   setTasks(taskData?.tasks || []);
  // }, [taskData]);

  // console.log(taskData);

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
    // console.log("Task Status Update:", {
    //   taskId: task._id,
    //   oldStatus: task.status,
    //   newStatus: newStatus,
    //   reviewData: reviewData,
    // })

    // setTasks((prevTasks) =>
    //   prevTasks.map((t) =>
    //     t._id === task._id
    //       ? {
    //           ...t,
    //           status: newStatus,
    //           ...(reviewData && {
    //             completion: reviewData.completion,
    //             timeSpent: {
    //               value: reviewData.timeValue,
    //               unit: reviewData.timeUnit,
    //             },
    //           }),
    //         }
    //       : t,
    //   ),
    // )
  };

  const handleReviewSubmit = (reviewData) => {
    // Determine the final status based on who is submitting
    const isAdminReview =
      reviewModal.targetStatus === "Completed" &&
      (loginRole === "Admin" ||
        loginRole === "DepartmentHead" ||
        loginRole === "Manager");

    const finalStatus = isAdminReview ? "Completed" : reviewModal.targetStatus;

    updateTaskStatus(reviewModal.task, finalStatus, reviewData);
    setReviewModal({ isOpen: false, task: null, targetStatus: null });
  };

  const handleShowDetails = (task) => {
    setDetailsModal({ isOpen: true, task });
  };

  const getTasksByStatus = (status) => {
    return taskData?.tasks?.filter((task) => task.status === status);
  };

  if (isLoading) {
    return <TaskBoardSkeleton />;
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 ">
      <div className="">
        <div className="flex flex-col md:flex-row justify-between items-center min-w-full mb-5">
          <div className="mb-5 w-full text-center md:text-left">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
                Project Board
              </h1>
              <div className="ml-2 pt-2 cursor-pointer">
                <Tooltips
                  text="This Project Board visually tracks task progress across four stages: To Do, In Progress, In Review, and Completed. Each task card shows details like title, assignee, department, due date, and progress. Filters at the top help refine the view by employee or project for better workflow management."
                  position={isMobile ? "bottom" : "right"}
                >
                  <CircleAlert className="mb-1 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltips>
              </div>
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              Manage your workflow efficiently
            </p>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-3 justify-center items-center z-20">
            {loginUser?.user?.role !== "Employee" && (
              <SelectInput
                disabled={isEmployee}
                className={"z-50 max-w-80 mx-auto"}
                label="Select Employee"
                isMulti={true}
                value={selectedEmployee}
                onChange={(e) => {
                  // console.log(e);
                  setSelectedEmployee(e);

                  // setSelectedProject(null);
                }}
                options={[
                  // { value: "", label: "All" },
                  ...(employeeData?.data
                    ?.filter((employee) => employee.role === "Employee")
                    .map((employee) => ({
                      value: employee._id,
                      label: `${employee.firstName} ${employee.lastName}`,
                    })) || []),
                ]}
              />
            )}
            <SelectInput
              className={"z-40 max-w-80 mx-auto"}
              label="Select Project"
              isMulti={true}
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e);
              }}
              options={[
                // { value: null, label: "All Projects" },
                ...(projectsDataForEmployee?.projects?.map((project) => ({
                  value: project._id,
                  label: project.name,
                })) || []),
              ]}
            />
          </div>
        </div>

        {loginUser?.user?.role !== "Employee" && (
          <div className="mb-4 flex justify-center items-center">
            <div className="mx-auto">
              <ActiveFilters
                filter={{
                  employee:
                    (Array.isArray(selectedEmployee)
                      ? selectedEmployee
                      : [selectedEmployee]
                    )?.map((item) => item.value) || [],
                  project: selectedProject?.map((item) => item.value) || [],
                }}
                optionLabels={{
                  employee: (Array.isArray(selectedEmployee)
                    ? selectedEmployee
                    : [selectedEmployee]
                  )?.reduce((acc, item) => {
                    acc[item.value] = item.label;
                    return acc;
                  }, {}),
                  project: selectedProject?.reduce((acc, item) => {
                    acc[item.value] = item?.label;
                    return acc;
                  }, {}),
                }}
                onRemove={(key, val) => {
                  if (key === "employee") {
                    setSelectedEmployee((prev) =>
                      prev.filter((item) => item?.value !== val)
                    );
                  } else if (key === "project") {
                    setSelectedProject((prev) =>
                      prev.filter((item) => item?.value !== val)
                    );
                  }
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            // console.log(getTasksByStatus(column));
            return (
              <JobTaskColumn
                key={column}
                title={column}
                tasks={getTasksByStatus(column)}
                onStatusChange={handleStatusChange}
                onShowDetails={handleShowDetails}
              />
            );
          })}
        </div>
      </div>

      <JobTaskReviewModal
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

      <JobTaskDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, task: null })}
        task={detailsModal.task}
      />
    </div>
  );
}
