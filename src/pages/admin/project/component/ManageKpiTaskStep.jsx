/* eslint-disable react/prop-types */
import Button from "@/component/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/component/card";
import { FloatingInput } from "@/component/FloatiingInput";
import {
  ChevronDown,
  ChevronRight,
  ListTodo,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const ManageKpiTaskStep = ({
  formData,
  departmentTasks,
  setDepartmentTasks,
}) => {
  // console.log(formData);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [expandedCriteria, setExpandedCriteria] = useState({});

  useEffect(() => {
    if (formData?.departments?.length > 0) {
      // Expand first department
      setExpandedDepartments({ [formData.departments[0].value]: true });

      // Expand first criteria of each department
      const initialCriteriaState = {};
      formData.departments.forEach((dept) => {
        if (dept.kpiCriteria?.length > 0) {
          initialCriteriaState[`${dept.value}-0`] = true;
        }
      });
      setExpandedCriteria(initialCriteriaState);
    }
  }, [formData.departments]);

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

  const addTask = (departmentId, criteriaIndex, task) => {
    if (!task.trim()) return;

    const key = `${departmentId}-${criteriaIndex}`;
    setDepartmentTasks((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        { id: Date.now(), description: task, criteriaIndex },
      ],
    }));
  };

  const removeTask = (departmentId, criteriaIndex, taskId) => {
    const key = `${departmentId}-${criteriaIndex}`;
    setDepartmentTasks((prev) => ({
      ...prev,
      [key]: prev[key]?.filter((task) => task.id !== taskId) || [],
    }));
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

  const TaskInput = ({ onAddTask }) => {
    const [taskDescription, setTaskDescription] = useState("");

    const handleAddTask = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (taskDescription.trim()) {
        onAddTask(taskDescription.trim());
        setTaskDescription("");
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleAddTask();
      }
    };

    return (
      <div className="flex gap-2">
        <FloatingInput
          label="Task Description"
          name="taskDescription"
          type="text"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onKeyPress={handleKeyPress}
          // placeholder="Enter task description..."
          className="min-w-32"
        />
        <div className="flex items-center">
          <Button
            type="button"
            onClick={(e) => {
              handleAddTask(e);
              e.stopPropagation();
              e.preventDefault();
            }}
            className="bg-primary hover:bg-primary text-white flex items-center justify-center md:min-w-28 rounded-lg py-3"
            size="sm"
          >
            <Plus size={16} className="md:mr-1" />
            <span className="hidden md:inline">Add Task</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          KPI & Task Management
        </h3>
        <p className="text-gray-600">
          Create task descriptions for each department&apos;s KPI criteria
        </p>
      </div>

      {formData?.departments?.map((department) => {
        const isDepartmentExpanded =
          expandedDepartments[department.value] || false;

        return (
          <Card
            key={department.value}
            className="border-2 border-gray-200 hover:border-primary transition-colors"
          >
            <CardHeader
              className="bg-gradient-to-r from-primary/10 to-primary/10 cursor-pointer"
              onClick={() => toggleDepartment(department.value)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-primary">
                    <Users size={20} />
                    {department.label}
                  </CardTitle>
                  <CardDescription>
                    Add task descriptions for each KPI criteria in this
                    department
                  </CardDescription>
                </div>

                <span className="text-gray-600">
                  {isDepartmentExpanded ? (
                    <ChevronDown size={25} />
                  ) : (
                    <ChevronRight size={25} />
                  )}
                </span>
              </div>
            </CardHeader>

            {isDepartmentExpanded && (
              <div className="p-6 space-y-6">
                {/* KPI Criteria and Task Creation */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    KPI Criteria & Task Descriptions
                  </h4>
                  {department.kpiCriteria?.map((criteria, criteriaIndex) => {
                    const taskKey = `${department.value}-${criteriaIndex}`;
                    // console.log(taskKey);
                    const tasks = departmentTasks[taskKey] || [];
                    const isCriteriaExpanded =
                      expandedCriteria[taskKey] || false;

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

                        {/* Task Creation Section */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Task Descriptions for this Criteria
                          </label>
                          <TaskInput
                            onAddTask={(task) =>
                              addTask(department.value, criteriaIndex, task)
                            }
                          />
                        </div>

                        {/* Display Tasks for this criteria */}
                        {tasks?.length > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                              Task Descriptions:
                            </h6>
                            <div className="space-y-2">
                              {tasks?.map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between bg-white p-3 rounded border"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 font-mono">
                                      {taskIndex + 1}.
                                    </span>
                                    <span className="text-sm">
                                      {task.description}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeTask(
                                        department.value,
                                        criteriaIndex,
                                        task.id
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
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
          </Card>
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

export default ManageKpiTaskStep;
