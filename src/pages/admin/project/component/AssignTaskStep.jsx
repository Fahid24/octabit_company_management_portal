/* eslint-disable react/prop-types */
import { CustomCheckbox } from "@/component/CustomCheckbox";
import Loader from "@/component/Loader";
import SelectInput from "@/component/select/SelectInput";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { useGetDepartmentWiseTasksByProjectIdQuery } from "@/redux/features/admin/project/projectApiSlice";
import { CheckIcon, User, Users } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

const AssignTaskStep = ({
  formData,
  currentStep,
  assignments,
  setAssignments,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [selectedEmployeesList, setSelectedEmployeesList] = useState([]);
  // console.log(selectedEmployeesList);
  const [selectedEmployeesPerDept, setSelectedEmployeesPerDept] = useState({});

  const loginUser = useSelector((state) => state.userSlice.user);

  const { data: assignableTaskData, isLoading: isLoadingTasks } =
    useGetDepartmentWiseTasksByProjectIdQuery(formData?.projectId, {
      skip: currentStep !== 2,
    });

  const departmentData = assignableTaskData?.data || [];

  const { data: userData } = useGetEmployeesQuery({
    page: 1,
    limit: 100000,
    isPopulate: true,
  });

  const userSelectData = userData?.data?.map((user) => ({
    label: `${user.firstName} ${user.lastName} `,
    value: user._id,
    departmentId: user.department?._id,
    department: user.department?.name,
    email: user.email,
    role: user.role,
  }));

  // const getAvailableEmployees = (departmentId) => {
  //   // console.log(departmentId);
  //   if (!departmentId) return [];

  //   const selectedIds = selectedEmployees[departmentId] || [];

  //   // Verify we have the right data
  //   if (!Array.isArray(userSelectData)) {
  //     console.error("userSelectData is not an array:", userSelectData);
  //     return [];
  //   }

  //   return userSelectData?.filter((emp) => {
  //     // Compare IDs as strings to avoid type mismatches
  //     const empDeptId = emp?.departmentId?.toString();
  //     const targetDeptId = departmentId?.toString();

  //     return (
  //       empDeptId === targetDeptId &&
  //       emp?.role === "Employee" &&
  //       !selectedIds.includes(emp?.value)
  //     );
  //   });
  // };
  const getAvailableEmployees = (departmentId) => {
    // console.log(departmentId);
    // if (!departmentId) return [];

    // const selectedIds = selectedEmployees[departmentId] || [];
    // console.log(selectedIds);

    // Verify we have the right data
    if (!Array.isArray(userSelectData)) {
      console.error("userSelectData is not an array:", userSelectData);
      return [];
    }

    return userSelectData?.filter((emp) => {
      return !selectedEmployeesList.includes(emp?.value);
    });
  };

  const handleEmployeeSelect = (departmentId, selectedOption) => {
    if (!selectedOption) return;

    const { value: employeeId, label: employeeName } = selectedOption;

    // Update selected employees for this department
    setSelectedEmployees((prev) => ({
      ...prev,
      [departmentId]: [...(prev[departmentId] || []), employeeId],
    }));

    setSelectedEmployeesList((prev) => [...prev, employeeId]);
    setSelectedEmployeesPerDept((prev) => ({
      ...prev,
      [departmentId]: null,
    }));

    // Add new assignment entry
    setAssignments((prev) => [
      ...prev,
      {
        taskIds: [],
        employeeId,
        assignedBy: loginUser.user._id,
        employeeName,
        departmentId,
      },
    ]);
  };

  const handleTaskSelect = (employeeId, taskId, isChecked) => {
    // console.log({ employeeId, taskId, isChecked });
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.employeeId === employeeId) {
          return {
            ...assignment,
            taskIds: isChecked
              ? [...assignment.taskIds, taskId]
              : assignment.taskIds.filter((id) => id !== taskId),
          };
        }
        return assignment;
      })
    );
  };

  return (
    <div className="">
      {isLoadingTasks ? (
        <Loader />
      ) : (
        <div className=" mx-auto">
          {/* Department Cards */}
          <div className="space-y-8">
            {departmentData?.map((department) => {
              return (
                <div
                  key={department?.departmentId}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Department Header */}
                  <div className="bg-form-header-gradient px-4 md:px-8 py-6">
                    <div className="flex items-start md:items-center justify-between">
                      <div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                          {department?.departmentName}
                        </h2>
                        <p className="text-sm md:text-base text-gray-800 mt-1">
                          {department?.tasks?.length || 0} tasks available •{" "}
                          {
                            assignments?.filter(
                              (a) =>
                                a?.departmentId === department?.departmentId
                            )?.length
                          }{" "}
                          employees assigned
                        </p>
                      </div>
                      <div className="text-gray-800 border-2 border-primary rounded-full p-1.5 md:p-3">
                        <Users className="h-4 w-4" />
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
                            options={getAvailableEmployees()}
                            value={
                              selectedEmployeesPerDept[
                                department?.departmentId
                              ] || null
                            }
                            onChange={(selectedOption) => {
                              setSelectedEmployeesPerDept((prev) => ({
                                ...prev,
                                [department?.departmentId]: selectedOption,
                              }));
                              handleEmployeeSelect(
                                department?.departmentId,
                                selectedOption
                              );
                            }}
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
                    {assignments
                      .filter(
                        (assignment) =>
                          assignment?.departmentId === department?.departmentId
                      )
                      .map((assignment) => (
                        <div
                          key={`${assignment?.employeeId}-${assignment?.departmentId}`}
                          className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                        >
                          {/* Employee Info */}
                          <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-start md:items-center justify-between mb-6">
                            <div className="flex items-center">
                              <div className="bg-primary text-white rounded-full p-3 mr-4">
                                <User className="h-4 w-4 md:h-8 md:w-8" />
                              </div>
                              <div>
                                <h4 className="text-sm md:text-xl font-semibold text-gray-800">
                                  {assignment?.employeeName}
                                </h4>
                                <p className="text-xs md:text-base text-gray-600">
                                  Employee ID:{" "}
                                  {assignment?.employeeId?.slice(-8)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="bg-primary text-white px-4 py-0.5 md:py-2 rounded-full text-xs md:text-sm font-medium">
                                {assignment?.taskIds?.length} Task
                                {assignment?.taskIds?.length !== 1
                                  ? "s"
                                  : ""}{" "}
                                Assigned
                              </div>
                            </div>
                          </div>

                          {/* Tasks */}
                          <div>
                            <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                              {/* <TaskIcon className="w-5 h-5 text-gray-600 mr-2" /> */}
                              Available Tasks
                            </h5>
                            <div className="grid gap-2">
                              {department?.tasks?.map((task) => (
                                <div
                                  key={task?.taskId}
                                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-primary transition-colors duration-200"
                                >
                                  <CustomCheckbox
                                    checked={assignment?.taskIds?.includes(
                                      task?.taskId
                                    )}
                                    onChange={(e) =>
                                      handleTaskSelect(
                                        assignment?.employeeId,
                                        task?.taskId,
                                        e.target.checked
                                      )
                                    }
                                    label={task?.description}
                                    className="w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* No more employees message */}
                    {selectedEmployees[department?.departmentId]?.length > 0 &&
                      getAvailableEmployees(department?.departmentId)
                        ?.length === 0 && (
                        <div className="text-center py-4 mt-3">
                          <div className="bg-green-100 rounded-full p-4 w-14 h-14 mx-auto mb-4">
                            <CheckIcon
                              strokeWidth={4}
                              className="w-6 h-6 text-green-600"
                            />
                          </div>
                          <p className="text-gray-600 font-medium">
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
        </div>
      )}
    </div>
  );
};

export default AssignTaskStep;
