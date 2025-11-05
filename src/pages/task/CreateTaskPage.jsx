import Button from "@/component/Button";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import { TitleDivider } from "@/component/TitleDevider";
import LazyImage from "@/utils/LazyImage";
import { useState } from "react";
import logo from "../../../public/logo.png";
import { useParams } from "react-router-dom";
import { useGetProjectQuery } from "@/redux/features/admin/project/projectApiSlice";

const CreateTaskPage = () => {
  const [formErrors, setFormErrors] = useState({});
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: [
      {
        isCompleted: false,
        detail: "",
        value: "",
      },
    ],
    dueDate: "",
    priority: "",
  });

  const { projectId } = useParams();
  // console.log(projectId);

  const { data: projectData } = useGetProjectQuery(projectId, {
    skip: !projectId,
  });
  // console.log("Project Data:", projectData);

  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    // Priority validation
    if (!formData.priority) {
      errors.priority = "Priority is required";
    }

    // Due date validation
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    // Description validation - always required
    const descriptionErrors = [];

    formData.description.forEach((item, index) => {
      const rowError = {};

      if (!item.detail.trim()) {
        rowError.detail = "Task detail is required";
      }

      const value = Number(item.value);
      if (item.value === "" || isNaN(value) || value < 0 || value > 100) {
        rowError.value = "Value must be between 0 and 100";
      }

      if (Object.keys(rowError).length > 0) {
        descriptionErrors[index] = rowError;
      }
    });

    if (descriptionErrors.length > 0) {
      errors.description = descriptionErrors;
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleDescriptionChange = (index, field, value) => {
    const updated = [...formData.description];

    if (field === "value") {
      updated[index][field] = value === "" ? "" : value;
    } else if (field === "isCompleted") {
      updated[index][field] = value;
    } else {
      updated[index][field] = value;
    }

    setFormData((prev) => ({
      ...prev,
      description: updated,
    }));

    // Clear specific description field error
    setFormErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors.description?.[index]?.[field]) {
        const descriptionErrors = [...(updatedErrors.description || [])];
        const rowErrors = { ...descriptionErrors[index] };

        delete rowErrors[field];

        if (Object.keys(rowErrors).length > 0) {
          descriptionErrors[index] = rowErrors;
        } else {
          descriptionErrors[index] = undefined;
        }

        const hasAnyError = descriptionErrors.some((row) => row !== undefined);
        if (hasAnyError) {
          updatedErrors.description = descriptionErrors;
        } else {
          delete updatedErrors.description;
        }
      }

      return updatedErrors;
    });
  };

  const handleAddDescription = () => {
    const hasEmptyFields = formData.description.some(
      (item) => !item.detail.trim() || String(item.value).trim() === ""
    );

    if (hasEmptyFields) {
      setFormErrors((prev) => {
        const updatedErrors = {
          ...prev,
          description: [...(prev.description || [])],
        };

        formData.description.forEach((item, index) => {
          updatedErrors.description[index] = {
            detail: !item.detail.trim() ? "Task detail is required" : "",
            value: String(item.value).trim() === "" ? "Value is required" : "",
          };
        });

        return updatedErrors;
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      description: [
        ...prev.description,
        { isCompleted: false, detail: "", value: "" },
      ],
    }));
    setDescriptionTouched(true);
  };

  const handleRemoveDescription = (index) => {
    if (formData.description.length === 1) return; // Can't delete the initial row

    const updated = [...formData.description];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      description: updated,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      alert("Please fix the form errors before submitting.");
      return;
    }

    // Format the data for submission
    const taskData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      description: formData.description.map((item) => ({
        ...item,
        value: Number(item.value),
      })),
    };

    // console.log("Task created:", taskData);
    alert("Task created successfully!");

    // Reset form
    setFormData({
      title: "",
      description: [{ isCompleted: false, detail: "", value: "" }],
      dueDate: "",
      priority: "",
    });
    setFormErrors({});
    setDescriptionTouched(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-green-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="relative h-42 bg-gradient-to-r from-primary to-primary p-6">
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <LazyImage src={logo} imgClass="max-w-12 mx-auto" alt="" />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
            <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>

            <div>
              <h1 className="text-3xl font-semibold text-white text-center mt-2">
                Create New Task
              </h1>
              <TitleDivider
                color="white"
                className={"-mt-0 text-xs text-white text-center"}
                title={
                  "Define the task, assign a team member, and set deliverables with a deadline."
                }
              />
            </div>
          </div>
          <div className=" mx-auto py-12 px-4">
            <div className=" ">
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <FloatingInput
                  label="Task Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  error={formErrors?.title}
                />

                {/* Description Fields */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    {formData?.description?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-3 py-2 border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200"
                      >
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="col-span-1">
                            <CustomCheckbox
                              checked={item.isCompleted}
                              onChange={(e) =>
                                handleDescriptionChange(
                                  index,
                                  "isCompleted",
                                  e.target.checked
                                )
                              }
                            />
                          </div>

                          <div className="col-span-7">
                            <FloatingInput
                              label="Task Details..."
                              type="text"
                              value={item?.detail}
                              onChange={(e) => {
                                handleDescriptionChange(
                                  index,
                                  "detail",
                                  e.target.value
                                );
                              }}
                              error={
                                formErrors?.description?.[index]?.detail
                                  ? formErrors?.description[index]?.detail
                                  : ""
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <FloatingInput
                              label="Task Value (%)"
                              type="number"
                              min="0"
                              max="100"
                              value={item.value}
                              onChange={(e) =>
                                handleDescriptionChange(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              error={
                                formErrors?.description?.[index]?.value
                                  ? formErrors?.description[index]?.value
                                  : ""
                              }
                            />
                          </div>

                          <div className="col-span-1">
                            {/* Delete Button */}
                            {formData.description.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDescription(index)}
                                className="mt-2 w-8 h-8 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 border-2 border-red-200 hover:border-red-500"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDescription}
                    className="w-full py-4 px-6 text-primary bg-primary/10 border-2 border-primary/30 border-dashed rounded-xl hover:bg-primary/15 hover:border-primary/20 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Another Task Detail
                  </button>
                </div>

                {/* Due Date and Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    error={formErrors?.dueDate ? formErrors.dueDate : ""}
                  />

                  <SelectInput
                    label="Task Priority"
                    isMulti={false}
                    value={{
                      label: formData.priority,
                      value: formData.priority,
                    }}
                    onChange={(e) => handleInputChange("priority", e?.value)}
                    options={[
                      {
                        label: "Low",
                        value: "Low",
                      },
                      {
                        label: "Medium",
                        value: "Medium",
                      },
                      {
                        label: "High",
                        value: "High",
                      },
                      {
                        label: "Urgent",
                        value: "Urgent",
                      },
                    ]}
                    error={formErrors.departmentHead}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={() => {
                      setFormData({
                        title: "",
                        description: [
                          { isCompleted: false, detail: "", value: "" },
                        ],
                        dueDate: "",
                        priority: "",
                      });
                      setFormErrors({});
                      setDescriptionTouched(false);
                    }}
                    className="bg-gray-500"
                  >
                    Reset Form
                  </Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Live Preview
                </h3>
              </div>
              <div className="p-6">
                <pre className="text-sm text-gray-600 overflow-x-auto bg-gray-50 p-4 rounded-lg border">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;
