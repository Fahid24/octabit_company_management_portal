import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/component/card";
import Button from "@/component/Button";
import { TitleDivider } from "@/component/TitleDevider";
import { FileUpload } from "@/component/FileUpload";

/**
 * Generic request form for maintenance/equipment
 * @param {Object} props
 * @param {string} props.title - Form title
 * @param {string} props.description - Form description
 * @param {Array} props.fields - Array of field configs: { name, label, type, icon, options, ... }
 * @param {Object} props.formState - The form state object
 * @param {Function} props.setFormState - Setter for form state
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.isEdit - Edit mode flag
 * @param {boolean} props.isLoading - Loading state for submit
 * @param {boolean} props.isUpdating - Loading state for update
 * @param {string} [props.error] - Error message
 * @param {string} [props.updateError] - Update error message
 */
export default function RequestForm({
  title,
  description,
  fields,
  formState,
  setFormState,
  onSubmit,
  onCancel,
  isEdit,
  isLoading,
  isUpdating,
  error,
  updateError,
  submitLabel = "Submit",
  editLabel = "Save Changes",
  cancelLabel = "Cancel",
}) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className=" bg-form-header-gradient">
          <CardTitle className="text-b text-center mb-1">{title}</CardTitle>
          <CardDescription className="text- text-center">
            <TitleDivider
              color="black"
              className={"-mt-0"}
              title={description}
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {fields.map((field, idx) => {
              if (field.type === "textarea") {
                const FloatingTextarea = field.component;
                return (
                  <div className="space-y-2 pt-4" key={field.name}>
                    <FloatingTextarea
                      id={field.name}
                      value={formState[field.name]}
                      label={field.label}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          [field.name]: e.target.value,
                        })
                      }
                      className="min-h-[80px]"
                      required={field.required}
                    />
                  </div>
                );
              }
              if (field.type === "file") {
                return (
                  <div className="space-y-2" key={field.name}>
                    <FileUpload
                      label={field.label}
                      onChange={(value) =>
                        setFormState((prev) => ({
                          ...prev,
                          [field.name]: value
                            ? Array.isArray(value)
                              ? value
                              : [value]
                            : [],
                        }))
                      }
                      value={formState[field.name]}
                      accept={field.accept}
                      isMultiFile={field.isMultiFile}
                      required={field.required}
                      onFileClick={(file) => {
                        if (file?.fileUrl) {
                          window.open(file.fileUrl, "_blank");
                        } else {
                          console.warn("No file URL available.");
                        }
                      }}
                    />
                  </div>
                );
              }
              if (field.type === "select") {
                const SelectInputComp = field.component;
                // Find the selected option object for correct value display
                const selectedOption =
                  (field.options || []).find(
                    (opt) => opt.value === formState[field.name]
                  ) || null;
                return (
                  <div className={field.gridClass || "space-y-2"} key={field.name}>
                    <SelectInputComp
                      id={field.name}
                      label={field.label}
                      icon={field.icon}
                      options={field.options}
                      value={selectedOption}
                      required={field.required}
                      onChange={(option) => {
                        const value =
                          option && option.value !== undefined
                            ? option.value
                            : typeof option === "string"
                            ? option
                            : "";
                        setFormState({ ...formState, [field.name]: value });
                      }}
                    />
                  </div>
                );
              }
              const FloatingInput = field.component;
              return (
                <div
                  className={field.gridClass || "space-y-2"}
                  key={field.name}
                >
                  <FloatingInput
                    id={field.name}
                    icon={field.icon}
                    label={field.label}
                    type={field.type}
                    value={formState[field.name]}
                    options={field.options}
                    min={field.min}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        [field.name]: e.target.value,
                      })
                    }
                    required={field.required}
                  />
                </div>
              );
            })}
            <div className="flex gap-2">
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isEdit
                  ? isUpdating
                    ? "Saving..."
                    : editLabel
                  : isLoading
                  ? "Submitting..."
                  : submitLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            </div>
          </form>
          {error && (
            <div className="text-red-500 text-sm text-center mt-2">{error}</div>
          )}
          {updateError && (
            <div className="text-red-500 text-sm text-center mt-2">
              {updateError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
        