/* eslint-disable react/prop-types */
import { CustomCheckbox } from "@/component/CustomCheckbox";
import SelectInput from "@/component/select/SelectInput";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { useGetAssignmentsByProjectIdQuery } from "@/redux/features/admin/project/projectApiSlice";
import { User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

const UpdateAssignTaskStep = ({
  existingAssignmentData = [],
  userData = [],
  assignments,
  setAssignments,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get all employees data from userData.data
  const allEmployees = userData || [];

  // Initialize state from existing assignment data
  useEffect(() => {
    if (existingAssignmentData?.length > 0) {
      const initialAssignments = [];

      existingAssignmentData.forEach((department) => {
        department.assignments?.forEach((assignment) => {
          // Get assigned task IDs from existing data
          const assignedTaskIds =
            assignment.tasks
              ?.filter((task) => task.assigned)
              ?.map((task) => task._id) || [];

          // Only add to assignments if employee has at least one task assigned
          if (assignedTaskIds.length > 0) {
            initialAssignments.push({
              taskIds: assignedTaskIds,
              employeeId: assignment.employeeId,
              employeeName: assignment.employeeName,
              departmentId: department.departmentId,
              wasPreAssigned: true, // Mark as previously assigned
            });
          }
        });
      });

      setAssignments(initialAssignments);
    }
  }, [existingAssignmentData]);

  // Get employees currently shown in assignments table
  const getAssignedEmployeeIds = () => {
    return assignments.map((assignment) => assignment.employeeId);
  };

  // Get available employees for a department (not currently in assignments table)
  // const getAvailableEmployees = (departmentId) => {
  //   if (!departmentId || !allEmployees) return []

  //   const assignedEmployeeIds = getAssignedEmployeeIds()

  //   return allEmployees
  //     .filter((emp) => {
  //       const empDeptId = emp?.department?._id?.toString()
  //       const targetDeptId = departmentId?.toString()

  //       return empDeptId === targetDeptId && emp?.role === "Employee" && !assignedEmployeeIds.includes(emp._id)
  //     })
  //     .map((emp) => ({
  //       label: `${emp.firstName} ${emp.lastName}`,
  //       value: emp._id,
  //       departmentId: emp.department._id,
  //       role: emp.role,
  //     }))
  // }

  const getAvailableEmployees = (departmentId) => {
    if (!departmentId || !allEmployees) return [];
    const assignedEmployeeIds = getAssignedEmployeeIds();
    return allEmployees
      .filter((emp) => {
        return !assignedEmployeeIds.includes(emp._id);
      })
      .map((emp) => ({
        label: `${emp?.firstName} ${emp?.lastName}`,
        value: emp?._id,
        departmentId: emp?.department?._id,
        role: emp?.role,
      }));
  };

  const handleEmployeeSelect = (departmentId, selectedOption) => {
    if (!selectedOption) return;

    const { value: employeeId, label: employeeName } = selectedOption;

    // Add new assignment entry
    setAssignments((prev) => [
      ...prev,
      {
        taskIds: [],
        employeeId,
        employeeName,
        departmentId,
        wasPreAssigned: false, // Mark as newly added
      },
    ]);
  };

  // Handle task selection/deselection
  const handleTaskSelect = (employeeId, taskId, isChecked) => {
    setAssignments((prev) => {
      const updatedAssignments = prev.map((assignment) => {
        if (assignment.employeeId === employeeId) {
          const newTaskIds = isChecked
            ? [...assignment.taskIds, taskId]
            : assignment.taskIds.filter((id) => id !== taskId);

          return {
            ...assignment,
            taskIds: newTaskIds,
          };
        }
        return assignment;
      });

      // Only remove employees who are newly added (not pre-assigned) and have no tasks
      return updatedAssignments.filter((assignment) => {
        if (assignment.taskIds.length === 0 && !assignment.wasPreAssigned) {
          return false; // Remove newly added employees with no tasks
        }
        return true; // Keep all others (including pre-assigned with empty tasks)
      });
    });
  };

  // Handle removing an employee
  const handleRemoveEmployee = (employeeId) => {
    setAssignments((prev) =>
      prev
        .map((assignment) => {
          if (assignment.employeeId === employeeId) {
            if (assignment.wasPreAssigned) {
              // For previously assigned employees, just clear their tasks
              return {
                ...assignment,
                taskIds: [],
              };
            }
            // For newly added employees, they will be filtered out below
            return assignment;
          }
          return assignment;
        })
        .filter((assignment) => {
          // Remove newly added employees (not pre-assigned) when they're being removed
          if (
            assignment.employeeId === employeeId &&
            !assignment.wasPreAssigned
          ) {
            return false;
          }
          return true;
        })
    );
  };

  // Check if a task is assigned to an employee
  const isTaskAssigned = (employeeId, taskId) => {
    const assignment = assignments.find((a) => a.employeeId === employeeId);
    return assignment?.taskIds?.includes(taskId) || false;
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto md:py-8">
      <div className="space-y-8">
        {existingAssignmentData.map((department) => {
          const departmentAssignments = assignments.filter(
            (assignment) => assignment.departmentId === department.departmentId
          );
          const availableEmployees = getAvailableEmployees(
            department.departmentId
          );

          return (
            <div
              key={department.departmentId}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Department Header */}
              <div className="bg-form-header-gradient px-4 md:px-8 py-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                      {department.departmentName}
                    </h2>
                    <p className="text-xs md:text-base text-gray-800 mt-1">
                      {department.tasks?.length || 0} tasks available •{" "}
                      {departmentAssignments.length} employees assigned
                    </p>
                  </div>
                  <div className="text-gray-800 border-2 border-primary rounded-full p-3">
                    <Users className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8">
                {/* Employee Selection */}
                {getAvailableEmployees(department?.departmentId)?.length >
                  0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <User />
                      </div>
                      <h3 className="text-sm md:text-lg font-semibold text-gray-800">
                        Add Employee
                      </h3>
                    </div>
                    <div className="">
                      <SelectInput
                        label="Select Employee"
                        options={availableEmployees}
                        value={null}
                        onChange={(selectedOption) =>
                          handleEmployeeSelect(
                            department.departmentId,
                            selectedOption
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {getAvailableEmployees(department?.departmentId)?.length ===
                  0 && (
                  <p className="text-gray-500 text-center pb-5">
                    No available employees
                  </p>
                )}

                {/* Assigned Employees and Tasks */}
                {departmentAssignments.length > 0 ? (
                  departmentAssignments.map((assignment) => (
                    <div
                      key={`${assignment.employeeId}-${department.departmentId}`}
                      className="bg-gray-50 rounded-xl p-2 md:p-5 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 mb-6"
                    >
                      {/* Employee Info */}
                      <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-start md:items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="bg-primary text-white rounded-full p-3 mr-4">
                            <User />
                          </div>
                          <div>
                            <h4 className="text-base md:text-xl font-semibold text-gray-800">
                              {assignment.employeeName}
                            </h4>
                            <p className="text-xs md:text-base text-gray-600">
                              Employee ID: {assignment.employeeId?.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary text-white px-4 py-0.5 md:py-2 rounded-full text-xs md:text-sm font-medium">
                            {assignment.taskIds?.length || 0} task
                            {assignment.taskIds?.length !== 1 ? "s" : ""}{" "}
                            assigned
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveEmployee(assignment.employeeId);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 md:p-2 transition-colors duration-200"
                            title={`${
                              assignment.wasPreAssigned
                                ? "Remove All Pre-Assigned Tasks"
                                : "Remove Employee"
                            } `}
                          >
                            <X className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div>
                        <h5 className="text-lg font-medium text-gray-800 mb-4">
                          Available Tasks
                        </h5>
                        <div className="grid gap-2">
                          {department.tasks?.map((task) => (
                            <div
                              key={task._id}
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-primary transition-colors duration-200"
                            >
                              <CustomCheckbox
                                checked={isTaskAssigned(
                                  assignment.employeeId,
                                  task._id
                                )}
                                onChange={(e) =>
                                  handleTaskSelect(
                                    assignment.employeeId,
                                    task._id,
                                    e.target.checked
                                  )
                                }
                                label={task.details}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No employees assigned to this department yet.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Available tasks: {department.tasks?.length || 0}
                    </p>
                  </div>
                )}

                {/* No available employees message */}
                {availableEmployees?.length === 0 &&
                  departmentAssignments.length > 0 && (
                    <div className="text-center py-4 mt-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 font-medium">
                        All employees in this department have been assigned
                        tasks.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug Info */}
      {/* <div className="bg-gray-100 p-4 rounded-lg mt-8">
        <h3 className="font-bold mb-2">Current Assignments State:</h3>
        <pre className="text-xs overflow-auto bg-white p-2 rounded border">{JSON.stringify(assignments, null, 2)}</pre>
      </div> */}
    </div>
  );
};

export default UpdateAssignTaskStep;
