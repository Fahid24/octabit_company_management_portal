import { TitleDivider } from "@/component/TitleDevider";

import { StepProgress } from "@/component/StepProgress";
import {
  BadgeInfo,
  CheckIcon,
  ChevronRightIcon,
  ListTodo,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/component/Toast";
import {
  useAddKpiMutation,
  useCreateProjectMutation,
} from "@/redux/features/admin/project/projectApiSlice";
import { useSelector } from "react-redux";
import {
  useAssignTasksToEmployeesMutation,
  useCreateBulkTaskMutation,
} from "@/redux/features/task/taskApiSlice";
import { useNavigate } from "react-router-dom";
import CreateProjectStep from "./component/CreateProjectStep";
import ManageKpiTaskStep from "./component/ManageKpiTaskStep";
import AssignTaskStep from "./component/AssignTaskStep";
import KpiCriteriaModal from "./component/KpiCriteriaModal";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";

const CreateProjectPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllDepartments, setIsAllDepartments] = useState(false);

  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    description: "",
    dueDate: "",
    startDate: "",
    departments: [],
    managers: [],
    isProjectBasedKpi: false,
    projectKpi: [],
    modifiedDepartments: [],
  });
  // console.log(formData);

  const [departmentTasks, setDepartmentTasks] = useState({});
  // console.log(departmentTasks);
  const [assignments, setAssignments] = useState([]);
  // console.log(assignments);

  const loginUser = useSelector((state) => state.userSlice.user);

  const navigate = useNavigate();

  const [createProject, { isLoading: isProjectCreating }] =
    useCreateProjectMutation();
  const [createBulkTask, { isLoading: isBulkTaskCreating }] =
    useCreateBulkTaskMutation();

  const [assignTasksToEmployees, { isLoading: isAssigningTasks }] =
    useAssignTasksToEmployeesMutation();

  const [addKpi, { isLoading: isKpiCreating }] = useAddKpiMutation();

  const { data: departments } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
    isPopulate: true,
  });

  const [errors, setErrors] = useState({});
  // console.log(errors);

  const formRef = useRef(null);

  const steps = [
    {
      id: "basic",
      title: "Basic Info",
      icon: BadgeInfo,
      fullTitle: "Basic Information",
    },
    {
      id: "task",
      title: "KPI/Task",
      icon: ListTodo,
      fullTitle: "KPI/Task",
    },
    {
      id: "assign",
      title: "Assign Tasks",
      icon: Users,
      fullTitle: "Assign Tasks",
    },
  ];

  const formatTasksData = () => {
    const data = [];

    formData.departments.forEach((department) => {
      const departmentData = {
        departmentId: department.value,
        criteria: [],
      };

      department.kpiCriteria?.forEach((criteria, criteriaIndex) => {
        const key = `${department.value}-${criteriaIndex}`;
        const tasks = departmentTasks[key] || [];

        if (tasks?.length > 0) {
          departmentData.criteria.push({
            kpi: criteria.kpi._id,
            details: tasks.map((task) => task.description),
          });
        }
      });

      // Only add department if it has criteria with tasks
      if (departmentData.criteria.length > 0) {
        data.push(departmentData);
      }
    });

    return { data };
  };

  const hasAnyTasks = () => {
    return Object.values(departmentTasks).some((tasks) => tasks?.length > 0);
  };

  const validateStep = (stepIndex = currentStep) => {
    const newErrors = {};

    // Validation for each step
    if (stepIndex === 0) {
      // Personal Info validation
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
      // Add current step to completed steps if it's not already there
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      // Navigate to the clicked step
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
  const handleNext = () => {
    if (validateStep()) {
      // Add current step to completed steps
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
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
  // const handlePrevious = () => {
  //   setCurrentStep((prev) => Math.max(prev - 1, 0));
  //   // Scroll to top of form
  //   if (formRef.current) {
  //     formRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation including terms acceptance
    if (validateStep(currentStep, true)) {
      try {
        const response1 = await createProject({
          ...formData,
          projectId: null,
          departments: formData?.departments?.map((dept) => dept.value),
          managers: formData?.managers?.map((mgr) => mgr.value),
        }).unwrap();
        // console.log(response1);

        // Redirect to success page or login
        toast.success("Success!", "Project Created Successfully", 2000);
        if (response1?.success) {
          setIsModalOpen(true);
          // handleNext();
          setFormData((prev) => ({
            ...prev,
            projectId: response1?.project?._id,
          }));
        }
      } catch (error) {
        console.error("Project Creation failed:", error);
        toast.error("Project Creation failed", error?.data?.message, 5000);
      }
    }
  };

  const handleModalSubmit = async (data) => {
    // console.log(data);
    const response = await addKpi(data).unwrap();
    // console.log("Final KPI Data:", response);

    if (response?.success) {
      toast.success("Added Successfully !", response?.message, 2000);

      const updatedData = {
        departments: response?.project?.projectKpi?.map((dept) => ({
          label: dept.department.name,
          value: dept.department._id,
          kpiCriteria: dept.kpiCriteria.map((kpiItem) => ({
            kpi: {
              _id: kpiItem.kpi._id,
              criteria: kpiItem.kpi.criteria,
              isDeleted: false,
              createdAt: null,
              updatedAt: null,
            },
            value: kpiItem.value,
          })),
        })),
      };

      // const newValueMap = new Map();

      // response?.project?.projectKpi.forEach((dept) => {
      //   const deptId = dept.department._id;
      //   dept.kpiCriteria.forEach((kpiItem) => {
      //     newValueMap.set(`${deptId}_${kpiItem.kpi._id}`, kpiItem.value);
      //   });
      // });

      // // Merge the values
      // const mergedDepartments = formData.departments.map((dept) => {
      //   return {
      //     ...dept,
      //     kpiCriteria: dept.kpiCriteria.map((kpiItem) => {
      //       const newValue = newValueMap.get(
      //         `${dept.value}_${kpiItem.kpi._id}`
      //       );
      //       return {
      //         ...kpiItem,
      //         value: newValue !== undefined ? newValue : kpiItem.value,
      //       };
      //     }),
      //   };
      // });

      // const updatedData = { departments: mergedDepartments };

      // console.log(JSON.stringify(updatedData, null, 2));

      setFormData((prev) => ({
        ...prev,
        isProjectBasedKpi: response?.project?.isProjectBasedKpi,
        projectKpi: response?.kpi,
        departments: updatedData.departments,
      }));
      setIsModalOpen(false);
      handleNext();
    }
  };

  // Function to submit all tasks
  const submitAllTasks = async () => {
    if (formatTasksData()?.data?.length === 0) {
      toast.error(
        "No tasks added",
        "Please add at least one task before proceeding",
        3000
      );
      return;
    }

    const data = {
      projectId: formData.projectId,
      createdBy: loginUser?.user?._id,
      data: formatTasksData()?.data || [],
    };
    // console.log(data);

    try {
      // Simulate API call
      const response2 = await createBulkTask(data).unwrap();
      // console.log(response2);

      toast.success("Success!", "Task Created Successfully", 2000);

      if (response2?.success) {
        handleNext();
      }
      // const formattedData = formatTasksData();
      // console.log("Formatted tasks data:", formattedData);

      // alert("All tasks submitted successfully!");

      // Clear all tasks after successful submission
      setDepartmentTasks({});
    } catch (error) {
      console.error("Task submission failed:", error);
      alert("Submission failed: " + error.message);
    }
  };

  // Function to handle form submission
  const handleAssign = async () => {
    const validAssignments = assignments
      .filter((assignment) => assignment?.taskIds?.length > 0)
      .map(({ taskIds, employeeId, assignedBy }) => ({
        taskIds,
        employeeId,
        assignedBy,
      }));

    try {
      await assignTasksToEmployees({
        projectId: formData?.projectId,
        assignedBy: loginUser?.user?._id,
        assignmentsData: validAssignments,
      });

      toast.success("Success!", "Task Assigned Successfully", 2000);

      handleNext();

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
      alert("Submission failed: " + error.message);
    }
  };

  // console.log("Department Data:", departmentData);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CreateProjectStep
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            isAllDepartments={isAllDepartments}
            setIsAllDepartments={setIsAllDepartments}
            errors={errors}
            setErrors={setErrors}
            departments={departments}
          />
        );
      case 1:
        return (
          <ManageKpiTaskStep
            formData={formData}
            departmentTasks={departmentTasks}
            setDepartmentTasks={setDepartmentTasks}
          />
        );
      case 2:
        return (
          <AssignTaskStep
            formData={formData}
            currentStep={currentStep}
            assignments={assignments}
            setAssignments={setAssignments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mb-20 md:mb-0">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-t-2xl rounded-b-2xl shadow-2xl overflow-visible transition-all duration-300">
          {/* Header */}
          <div className="relative rounded-t-2xl  h-42 bg-form-header-gradient p-6">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
            <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>

            <div>
              <h1 className="text-xl md:text-3xl font-semibold text-gray-700 text-center mt-2">
                {currentStep == 0
                  ? "Create New Project"
                  : currentStep == 1
                  ? "Manage KPIs & Tasks"
                  : "Assign Tasks to Employees"}
              </h1>
              <TitleDivider color="white" className={"-mt-0"} title={""} />
              <p className="text-gray-800 text-center">
                Define your project structure, assign teams, and set performance
                criteria
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="pt-16 px-6">
            <StepProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
              isDisabled={true}
            />
          </div>

          <div className="p-6 ">
            <div>
              <div className="transition-opacity  duration-300">
                {renderStepContent()}
              </div>

              <div className="flex justify-end mt-8">
                {/* <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${
                    currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <ChevronLeftIcon className="mr-1 h-5 w-5" />
                  Previous
                </button> */}

                {currentStep < steps?.length - 1 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      // validateStep will block progression if invalid

                      if (currentStep === 0) {
                        handleSubmit(e);
                      }

                      if (currentStep === 1) {
                        submitAllTasks();
                      }

                      // if (currentStep === 2) {
                      //   handleAssign();
                      // }
                    }}
                    className="flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                  >
                    {currentStep == 0 ? (
                      <span>
                        {isProjectCreating
                          ? "Creating Project..."
                          : "Create Project"}
                      </span>
                    ) : (
                      <span>
                        {isBulkTaskCreating
                          ? "Creating Tasks..."
                          : "Create Tasks"}
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
      <KpiCriteriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departments={formData?.departments || []}
        projectId={formData?.projectId}
        onSubmitData={handleModalSubmit}
        handleNext={handleNext}
      />
    </div>
  );
};

export default CreateProjectPage;
