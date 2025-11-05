import {
  BadgeInfo,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListTodo,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CreateProjectStep from "./component/CreateProjectStep";
import ManageKpiTaskStep from "./component/ManageKpiTaskStep";
import AssignTaskStep from "./component/AssignTaskStep";
import { toast } from "@/component/Toast";
import { TitleDivider } from "@/component/TitleDevider";
import { StepProgress } from "@/component/StepProgress";
import {
  useGetAllAssignedTasksByProjectIdQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from "@/redux/features/admin/project/projectApiSlice";
import {
  useAssignTasksToEmployeesMutation,
  useGetAllTasksByProjectIdQuery,
  useUpdateBulkTaskMutation,
} from "@/redux/features/task/taskApiSlice";
import UpdateManageKpiTaskStep from "./component/UpdateManageKpiTaskStep";
import UpdateAssignTaskStep from "./component/UpdateAssignTaskStep";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import Loader from "@/component/Loader";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";

const UpdateProjectPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([0, 1, 2]);
  const [departmentTasks, setDepartmentTasks] = useState({});
  const [assignments, setAssignments] = useState([]);
  // console.log(assignments);
  const [errors, setErrors] = useState({});
  const [isAllDepartments, setIsAllDepartments] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    description: "",
    dueDate: "",
    startDate: "",
    departments: [],
    managers: [],
  });

  // console.log(formData);

  // console.log(departmentTasks);

  const loginUser = useSelector((state) => state.userSlice.user);

  const { projectId } = useParams();

  const navigate = useNavigate();
  const formRef = useRef(null);

  const { data: userData } = useGetEmployeesQuery({
    page: 1,
    limit: 100000,
    isPopulate: true,
  });

  const {
    data: projectData,
    isLoading: isLoadingProjectData,
    refetch: refetchProjectData,
  } = useGetProjectQuery(projectId, {
    skip: !projectId,
  });
  // console.log(projectData);

  const {
    data: allTasks,
    isLoading: isLoadingAllTasks,
    refetch: refetchAllTasks,
  } = useGetAllTasksByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: existingAssignedTasks,
    refetch,
    isLoading: isLoadingExistingAssignedTasks,
  } = useGetAllAssignedTasksByProjectIdQuery(projectId, {
    skip: currentStep === 0,
  });

  const [assignTasksToEmployees, { isLoading: isAssigningTasks }] =
    useAssignTasksToEmployeesMutation();

  const { data: departments } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
    isPopulate: true,
  });

  // console.log(existingAssignedTasks);

  // console.log(projectData?.project);
  // console.log(formData);

  useEffect(() => {
    if (projectData?.project && departments?.data) {
      const projectDepartments = projectData?.project?.isProjectBasedKpi
        ? projectData?.project?.projectKpi?.map((dept) => ({
            value: dept?.department?._id,
            label: dept?.department?.name,
            kpiCriteria: dept?.kpiCriteria,
          }))
        : projectData?.project?.departments?.map((dept) => ({
            value: dept?.department?._id,
            label: dept?.department?.name,
            kpiCriteria: dept?.kpiCriteria,
          }));

      // Check if project has all departments
      const allDeptIds = departments.data.map((d) => d._id);
      const projectDeptIds = projectDepartments?.map((d) => d.value) || [];

      const hasAllDepartments =
        allDeptIds.length > 0 &&
        allDeptIds.every((id) => projectDeptIds.includes(id));

      // Get all department options if "All" is selected
      const allDepartments = hasAllDepartments
        ? departments.data.map((dept) => ({
            value: dept._id,
            label: dept.name,
            kpiCriteria: dept.kpiCriteria,
            managers: dept.projectManagers?.map((manager) => ({
              label: `${manager?.firstName} ${manager?.lastName}`,
              value: manager?._id,
            })),
          }))
        : projectDepartments;

      setFormData((prev) => ({
        ...prev,
        projectId: projectData?.project?._id,
        name: projectData?.project?.name,
        description: projectData?.project?.description,
        dueDate: projectData?.project?.dueDate,
        startDate: projectData?.project?.startDate,
        departments: allDepartments || [],
        managers: projectData?.project?.managers?.map((mgr) => ({
          value: mgr?._id,
          label: `${mgr?.firstName} ${mgr?.lastName}`,
        })),
      }));

      setIsAllDepartments(hasAllDepartments);
    }
  }, [projectData, departments?.data]);

  const [updateProject, { isLoading: isProjectUpdating }] =
    useUpdateProjectMutation();

  const [updateBulkTask, { isLoading: isBulkTaskUpdating }] =
    useUpdateBulkTaskMutation();

  const steps = [
    {
      id: "basic",
      title: "Basic Info",
      icon: BadgeInfo,
      fullTitle: "Basic Information",
    },
    { id: "task", title: "KPI/Task", icon: ListTodo, fullTitle: "KPI/Task" },
    {
      id: "assign",
      title: "Assign Tasks",
      icon: Users,
      fullTitle: "Assign Tasks",
    },
  ];

  const hasAnyTasks = () => {
    return Object.values(departmentTasks).some((tasks) => tasks?.length > 0);
  };

  const validateStep = (stepIndex = currentStep) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.name) newErrors.name = "Project name is required";
      if (formData.departments?.length === 0)
        newErrors.departments = "Select at least one department";
      // if (formData.managers?.length === 0)
      //   newErrors.managers = "Select at least one manager";
    }

    if (stepIndex === 1 && !hasAnyTasks()) {
      newErrors.tasks = "Please add at least one task";
      toast.error(
        "No tasks added",
        "Please add at least one task before proceeding",
        3000
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepClick = (stepIndex) => {
    // Allow going back to previous steps without validation
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
      return;
    }

    if (validateStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([0, 1, 2]);
      }
      setCurrentStep(stepIndex);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes(".")) {
      const keys = name.split(".");
      const lastKey = keys.pop();

      setFormData((prev) => {
        // Create a deep copy of the previous state
        const newData = { ...prev };

        // Navigate to the nested object
        let current = newData;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          // Ensure the path exists
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }

        // Set the value
        current[lastKey] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (validateStep()) {
      // Add current step to completed steps
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([0, 1, 2]);
      }

      // Move to next step
      const nextStep = Math.min(currentStep + 1, steps?.length - 1);
      setCurrentStep(nextStep);

      // Scroll to top of form
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    // Scroll to top of form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation including terms acceptance
    if (validateStep(currentStep, true)) {
      try {
        const response1 = await updateProject({
          data: {
            ...formData,
            departments: isAllDepartments
              ? departments.data.map((d) => d._id)
              : formData.departments?.map((dept) => dept.value),
            managers: formData?.managers?.map((mgr) => mgr.value),
          },
          id: projectId,
        }).unwrap();

        refetchProjectData();

        toast.success("Success!", "Project Updated Successfully", 2000);
        if (response1?.success) {
          handleNext();
          setFormData((prev) => ({
            ...prev,
            projectId: response1?.project?._id,
          }));
        }
      } catch (error) {
        console.error("Project Update failed:", error);
        toast.error("Project Update failed", error?.data?.error, 5000);
      }
    }
  };

  // Function to submit all tasks
  const submitAllTasks = async () => {
    // console.log(prepareTaskData());

    try {
      // Simulate API call
      const response2 = await updateBulkTask(departmentTasks).unwrap();
      // console.log(response2);

      refetchAllTasks();
      refetch();

      toast.success("Success!", "Task Updated Successfully", 2000);

      if (response2?.success) {
        await handleNext();
      }
      setDepartmentTasks({});
    } catch (error) {
      console.error("Task Update failed:", error);
      alert("Update failed: " + error.message);
    }
  };

  const handleAssign = async () => {
    if (assignments?.length === 0) {
      toast.error(
        "No assignments",
        "Please assign tasks to employees before proceeding",
        3000
      );
      return;
    }
    try {
      await assignTasksToEmployees({
        projectId: formData?.projectId,
        assignedBy: loginUser?.user?._id,
        assignmentsData: assignments,
      });
      //   await assignTasksToEmployees(validAssignments);

      toast.success("Success!", "Task Assigned Successfully", 2000);

      handleNext();

      refetch();

      navigate("/project-list");
      setAssignments([]);
      setFormData({
        projectId: "",
        name: "",
        description: "",
        dueDate: "",
        startDate: "",
        departments: [],
        managers: [],
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Failed to assign task:", error);
      alert("Update failed: " + error.message);
    }
  };

  const onTasksChange = (e) => {
    setDepartmentTasks(e);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return isLoadingProjectData ? (
          <Loader />
        ) : (
          <CreateProjectStep
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            isAllDepartments={isAllDepartments}
            setIsAllDepartments={setIsAllDepartments}
            errors={errors}
            setErrors={setErrors}
            departments={departments || []}
          />
        );
      case 1:
        return isLoadingAllTasks ? (
          <Loader />
        ) : (
          <UpdateManageKpiTaskStep
            formData={formData}
            tasks={allTasks?.tasks || []}
            onTasksChange={onTasksChange}
          />
        );
      case 2:
        return isLoadingExistingAssignedTasks ? (
          <Loader />
        ) : (
          <UpdateAssignTaskStep
            assignments={assignments}
            setAssignments={setAssignments}
            existingAssignmentData={existingAssignedTasks?.departments || []}
            userData={userData?.data || []}
          />
        );
      default:
        return null;
    }
  };
  // console.log("currentStep:", currentStep);
  return (
    <div className="min-h-screen flex items-center justify-center mb-20 md:mb-0 p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-visible transition-all duration-300">
          {/* Header */}
          <div className="relative h-42 bg-form-header-gradient p-6">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
            <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>

            <div>
              <h1 className="text-xl md:text-3xl font-semibold text-gray-700 text-center mt-2">
                {currentStep == 0
                  ? "Update Project"
                  : currentStep == 1
                  ? "Manage KPIs & Tasks"
                  : "Assign Tasks to Employees"}
              </h1>
              <TitleDivider color="white" className={"-mt-0"} title={""} />
              <p className="text-sm md:text-base text-gray-800 font-semibold text-center">
                Define your project structure, assign teams, and set performance
                criteria
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="pt-10 md:pt-16 px-6">
            <StepProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
            />
          </div>

          <div className="p-6">
            <div>
              <div className="transition-opacity duration-300">
                {renderStepContent()}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${
                    currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <ChevronLeftIcon className="mr-1 h-5 w-5" />
                  Previous
                </button>

                {currentStep < steps?.length - 1 ? (
                  <button
                    type="button"
                    onClick={async (e) => {
                      // validateStep will block progression if invalid
                      if (currentStep === 0) {
                        await handleSubmit(e);
                      }
                      if (currentStep === 1 && hasAnyTasks()) {
                        await submitAllTasks();
                      }
                      // if (currentStep === 2) {
                      //   handleAssign();
                      // }
                    }}
                    className="flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                  >
                    {currentStep == 0 ? (
                      <span>
                        {isProjectUpdating
                          ? "Updating Project..."
                          : "Update Project"}
                      </span>
                    ) : (
                      <span>
                        {isBulkTaskUpdating
                          ? "Updating Tasks..."
                          : "Update Tasks"}
                      </span>
                    )}
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={isAssigningTasks}
                    className="flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAssigningTasks ? (
                      <>
                        <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        Assign Tasks
                        <CheckIcon className="ml-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProjectPage;
