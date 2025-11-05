/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ListTodo,
  Plus,
  Trash2,
  Users,
  Edit3,
} from "lucide-react";
import { useSelector } from "react-redux";
import { FloatingInput } from "@/component/FloatiingInput";

const UpdateKpiTaskStep = ({ formData, tasks = [], onTasksChange }) => {
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [departmentTasks, setDepartmentTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);

  const loginUser = useSelector((state) => state.userSlice.user);

  // Track changes for API submission
  const [taskChanges, setTaskChanges] = useState({
    projectId: formData?.projectId || "",
    createdBy: loginUser?.user?._id || "",
    oldTasks: [],
    newTasks: [],
    deleteTasks: [],
  });

  // Initialize tasks from props
  useEffect(() => {
    if (tasks?.length > 0 && formData?.departments?.length > 0) {
      const initialTasksMap = {};

      // Group tasks by department and KPI criteria
      tasks.forEach((task) => {
        const deptId = task.department?._id;
        const kpiId = task.kpi?._id;

        // Find the department and criteria index
        const deptIndex = formData.departments.findIndex(
          (d) => d.value === deptId
        );
        if (deptIndex === -1) return;

        const criteriaIndex = formData.departments[
          deptIndex
        ].kpiCriteria.findIndex((c) => c.kpi._id === kpiId);
        if (criteriaIndex === -1) return;

        const key = `${deptId}-${criteriaIndex}`;
        if (!initialTasksMap[key]) {
          initialTasksMap[key] = [];
        }

        initialTasksMap[key].push({
          id: task._id,
          description: task.details,
          criteriaIndex,
          isExisting: true,
          kpiId: kpiId,
          departmentId: deptId,
          originalTask: task,
        });
      });

      setDepartmentTasks(initialTasksMap);

      // Initialize oldTasks with all existing tasks
      setTaskChanges((prev) => ({
        ...prev,
        projectId: tasks[0]?.project?._id || formData?.projectId || "",
        createdBy: tasks[0]?.createdBy?._id || formData?.createdBy || "",
        oldTasks: tasks.map((task) => ({
          _id: task._id,
          details: task.details,
          kpi: task.kpi?._id,
          department: task.department?._id,
        })),
      }));
    }
  }, [tasks, formData]);

  // Initialize expanded states
  useEffect(() => {
    if (formData?.departments?.length > 0) {
      setExpandedDepartments({ [formData.departments[0].value]: true });

      const initialCriteriaState = {};
      formData.departments.forEach((dept) => {
        if (dept.kpiCriteria?.length > 0) {
          initialCriteriaState[`${dept.value}-0`] = true;
        }
      });
      setExpandedCriteria(initialCriteriaState);
    }
  }, [formData?.departments]);

  // Update parent component with task changes
  useEffect(() => {
    if (onTasksChange) {
      onTasksChange(taskChanges);
    }
  }, [taskChanges, onTasksChange]);

  const toggleDepartment = (deptId) => {
    setExpandedDepartments((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

  const toggleCriteria = (deptId, criteriaIndex) => {
    const key = `${deptId}-${criteriaIndex}`;
    setExpandedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addTask = (departmentId, criteriaIndex, task, kpiId) => {
    if (!task.trim()) return;

    const key = `${departmentId}-${criteriaIndex}`;
    const newTaskId = `new-${Date.now()}`;

    setDepartmentTasks((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        {
          id: newTaskId,
          description: task,
          criteriaIndex,
          isExisting: false,
          kpiId,
          departmentId,
        },
      ],
    }));

    setTaskChanges((prev) => ({
      ...prev,
      newTasks: [
        ...prev.newTasks,
        {
          kpiId,
          details: task,
          department: departmentId,
        },
      ],
    }));
  };

  const removeTask = (departmentId, criteriaIndex, taskId, isExisting) => {
    const key = `${departmentId}-${criteriaIndex}`;

    setDepartmentTasks((prev) => ({
      ...prev,
      [key]: prev[key]?.filter((task) => task.id !== taskId) || [],
    }));

    if (isExisting) {
      setTaskChanges((prev) => ({
        ...prev,
        deleteTasks: [...prev.deleteTasks, taskId],
        oldTasks: prev.oldTasks.filter((task) => task._id !== taskId),
      }));
    } else {
      const taskToRemove = departmentTasks[key]?.find((t) => t.id === taskId);
      if (taskToRemove) {
        setTaskChanges((prev) => ({
          ...prev,
          newTasks: prev.newTasks.filter(
            (t) =>
              !(
                t.details === taskToRemove.description &&
                t.kpiId === taskToRemove.kpiId &&
                t.department === taskToRemove.departmentId
              )
          ),
        }));
      }
    }
  };

  const startEditingTask = (departmentId, criteriaIndex, task) => {
    setEditingTask({
      departmentId,
      criteriaIndex,
      taskId: task.id,
      isExisting: task.isExisting,
      originalDescription: task.description,
    });
  };

  const updateTask = (
    departmentId,
    criteriaIndex,
    taskId,
    newDescription,
    isExisting,
    kpiId
  ) => {
    const key = `${departmentId}-${criteriaIndex}`;

    setDepartmentTasks((prev) => ({
      ...prev,
      [key]:
        prev[key]?.map((task) =>
          task.id === taskId ? { ...task, description: newDescription } : task
        ) || [],
    }));

    if (isExisting) {
      setTaskChanges((prev) => ({
        ...prev,
        oldTasks: prev.oldTasks.map((task) =>
          task._id === taskId ? { ...task, details: newDescription } : task
        ),
      }));
    } else {
      const taskToUpdate = departmentTasks[key]?.find((t) => t.id === taskId);
      if (taskToUpdate) {
        setTaskChanges((prev) => ({
          ...prev,
          newTasks: prev.newTasks.map((t) =>
            t.details === taskToUpdate.description &&
            t.kpiId === kpiId &&
            t.department === departmentId
              ? { ...t, details: newDescription }
              : t
          ),
        }));
      }
    }

    setEditingTask(null);
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  const CollapsibleSection = ({
    title,
    isOpen,
    onToggle,
    children,
    className = "",
    icon,
  }) => {
    return (
      <div className={`border rounded-lg overflow-hidden ${className}`}>
        <div
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-600">{icon}</span>}
            <h4 className="font-medium text-gray-800">{title}</h4>
          </div>
          <span className="text-gray-600">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </div>
        {isOpen && <div className="p-4 bg-white">{children}</div>}
      </div>
    );
  };

  const TaskInput = ({
    onAddTask,
    onUpdateTask,
    isEditing,
    initialValue,
    onCancel,
    kpiId,
  }) => {
    const [taskDescription, setTaskDescription] = useState(initialValue || "");

    useEffect(() => {
      setTaskDescription(initialValue || "");
    }, [initialValue]);

    const handleAddOrUpdate = () => {
      if (taskDescription.trim()) {
        if (isEditing) {
          onUpdateTask(taskDescription.trim());
        } else {
          onAddTask(taskDescription.trim(), kpiId);
          setTaskDescription("");
        }
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddOrUpdate();
      }
    };

    return (
      <div className="flex gap-2 w-full">
        {/* <input
          type="text"
          placeholder="Enter task description..."
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onKeyDown={handleKeyPress}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex-1"
        /> */}
        <FloatingInput
          label="Enter task description..."
          type="text"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <div className="flex items-center gap-2 ">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAddOrUpdate();
            }}
            className="bg-primary hover:bg-primary text-white flex items-center justify-center min-w-12 md:min-w-32 rounded-lg py-3 px-4"
          >
            {isEditing ? (
              <>
                <Edit3 size={16} className="md:mr-1" />
                <span className="hidden md:inline">Update</span>
              </>
            ) : (
              <>
                <Plus size={16} className="md:mr-1" />
                <span className="hidden md:inline">Add Task</span>
              </>
            )}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center rounded-lg py-3 px-4"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Update KPI & Task Management
        </h3>
        <p className="text-sm md:text-base text-gray-600">
          Update task descriptions for each department&apos;s KPI criteria.
          Click on tasks to edit them.
        </p>
      </div>

      {formData?.departments?.map((department) => {
        const isDepartmentExpanded =
          expandedDepartments[department.value] || false;

        return (
          <div
            key={department.value}
            className="border-2 border-gray-200 hover:border-primary transition-colors rounded-lg"
          >
            <div
              className="bg-gradient-to-r from-primary/10 to-primary/10 cursor-pointer p-6"
              onClick={() => toggleDepartment(department.value)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-primary text-lg font-semibold">
                    <Users size={20} />
                    {department.label}
                  </h2>
                  <p className="text-gray-600 text-xs md:text-base">
                    Update task descriptions for each KPI criteria in this
                    department
                  </p>
                </div>

                <span className="text-gray-600">
                  {isDepartmentExpanded ? (
                    <ChevronDown size={25} />
                  ) : (
                    <ChevronRight size={25} />
                  )}
                </span>
              </div>
            </div>

            {isDepartmentExpanded && (
              <div className="p-2 md:p-6 space-y-6 ">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    KPI Criteria & Task Descriptions
                  </h4>
                  {department.kpiCriteria?.map((criteria, criteriaIndex) => {
                    const taskKey = `${department.value}-${criteriaIndex}`;
                    const tasks = departmentTasks[taskKey] || [];
                    const isCriteriaExpanded =
                      expandedCriteria[taskKey] || false;

                    const isEditingThisCriteria =
                      editingTask &&
                      editingTask.departmentId === department.value &&
                      editingTask.criteriaIndex === criteriaIndex;

                    return (
                      <CollapsibleSection
                        key={criteriaIndex}
                        title={
                          criteria.kpi?.criteria ||
                          `KPI Criteria ${criteriaIndex + 1}`
                        }
                        isOpen={isCriteriaExpanded}
                        onToggle={() =>
                          toggleCriteria(department.value, criteriaIndex)
                        }
                        className="mb-4"
                      >
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-3">
                            Target Value:{" "}
                            <span className="font-medium">
                              {criteria.value}%
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isEditingThisCriteria ? "Update" : "Add"} Task
                            Descriptions for this Criteria
                          </label>
                          <TaskInput
                            onAddTask={(task, kpiId) =>
                              addTask(
                                department.value,
                                criteriaIndex,
                                task,
                                criteria.kpi._id
                              )
                            }
                            onUpdateTask={(newDescription) =>
                              updateTask(
                                editingTask.departmentId,
                                editingTask.criteriaIndex,
                                editingTask.taskId,
                                newDescription,
                                editingTask.isExisting,
                                criteria.kpi._id
                              )
                            }
                            isEditing={isEditingThisCriteria}
                            initialValue={
                              isEditingThisCriteria
                                ? editingTask.originalDescription
                                : ""
                            }
                            onCancel={cancelEditing}
                            kpiId={criteria.kpi._id}
                          />
                        </div>

                        {tasks?.length > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                              Task Descriptions:
                            </h6>
                            <div className="space-y-2">
                              {tasks?.map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between bg-white p-3 rounded border hover:bg-gray-50 transition-colors"
                                >
                                  <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() =>
                                      startEditingTask(
                                        department.value,
                                        criteriaIndex,
                                        task
                                      )
                                    }
                                  >
                                    <span className="text-xs text-gray-500 font-mono">
                                      {taskIndex + 1}.
                                    </span>
                                    <span className="text-sm">
                                      {task.description}
                                    </span>
                                    {/* {task.isExisting && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Existing
                                      </span>
                                    )}
                                    {!task.isExisting && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">New</span>
                                    )} */}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      removeTask(
                                        department.value,
                                        criteriaIndex,
                                        task.id,
                                        task.isExisting
                                      );
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CollapsibleSection>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {formData?.departments?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ListTodo size={48} className="mx-auto mb-4 opacity-50" />
          <p>
            Please select departments in the previous step to manage KPIs and
            tasks.
          </p>
        </div>
      )}
    </div>
  );
};

export default UpdateKpiTaskStep;
