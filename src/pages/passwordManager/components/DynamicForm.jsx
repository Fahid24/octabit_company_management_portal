import React, { useState, useEffect } from "react";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Button from "@/component/Button";
import { toast } from "@/component/Toast";

const DynamicForm = ({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitText = "Save",
  validate, // <-- added
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialValues || {});
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    const requiredErrors = {};
    fields.forEach(({ name, required }) => {
      if (required && !formData[name]) {
        requiredErrors[name] = `${
          name[0].toUpperCase() + name.slice(1)
        } is required.`;
      }
    });

    const extraErrors =
      typeof validate === "function" ? validate(formData) || {} : {};
    const combined = { ...requiredErrors, ...extraErrors };

    setErrors(combined);
    if (Object.keys(combined).length > 0) {
      toast.error("Validation", "Please fill the highlighted fields.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      {fields.map(({ name, label, type = "text", required }) =>
        name === "description" || type === "textarea" ? (
          <FloatingTextarea
            key={name}
            id={name}
            className="mt-6" // added spacing similar to CreateTaskModal.jsx
            label={
              required ? (
                <span>
                  {label} <span className="text-red-500">*</span>
                </span>
              ) : (
                label
              )
            }
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            error={errors[name]}
            rows={4}
          />
        ) : (
          <FloatingInput
            key={name}
            label={
              required ? (
                <span>
                  {label} <span className="text-red-500">*</span>
                </span>
              ) : (
                label
              )
            }
            name={name}
            type={type}
            value={formData[name] || ""}
            onChange={handleChange}
            error={errors[name]}
          />
        )
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button className="bg-gray-500" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>{submitText}</Button>
      </div>
    </>
  );
};

export default DynamicForm;
