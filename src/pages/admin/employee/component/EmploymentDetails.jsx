import { FloatingInput } from "@/component/FloatiingInput";
import { useEffect, useState } from "react";
import {
  designationOptions,
  employmentTypeOptions,
  jobTypeOptions,
  statusOptions,
  roleOptions,
  workLocationOptions,
  shiftOptions,
} from "./const";
import Button from "@/component/Button";
import { TitleDivider } from "@/component/TitleDevider";
import {
  BriefcaseIcon,
  CalendarIcon,
  Loader2,
  ShieldCheck,
  ShieldOff,
  LocateFixed,
  Hash,
  HardDrive,
  BookUser,
  SunMoon,
} from "lucide-react";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import ConfirmDialog from "@/component/ConfirmDialog";
import LazyImage from "@/utils/LazyImage";
import verified from "@/assets/verified.png";
import notVerified from "@/assets/notverified.png";
import SelectInput from "@/component/select/SelectInput";

const EmploymentDetails = ({
  formData,
  setFormData,
  handleChange,
  errors,
  employeeData,
  refetchEmployee,
  isEditMode,
  isAdmin,
  setErrors,
  hasExperience,
  setHasExperience,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (formData.prevWorkExperience.length > 0) {
      setHasExperience(formData.prevWorkExperience?.length > 0);
    }
  }, [formData.prevWorkExperience]);

  const { data: departmentsData, isLoading: deptLoading } =
    useGetDepartmentsQuery({
      limit: 1000,
      isPopulate: true,
    });
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const departmentOptions =
    departmentsData?.data?.map((d) => ({
      label: d?.name,
      value: d?._id,
    })) || [];

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newExperience = [...prevData.prevWorkExperience];
      newExperience[index] = {
        ...newExperience[index],
        [name]: value,
      };
      return {
        ...prevData,
        prevWorkExperience: newExperience,
      };
    });

    // Clear error for this specific experience field when user types
    const errorKey = `prevWorkExperience.${index}.${name}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateExperiences = () => {
    const newErrors = {};

    if (hasExperience && formData.prevWorkExperience.length === 0) {
      newErrors.prevWorkExperience = "Please add at least one work experience";
      return newErrors;
    }

    if (hasExperience) {
      formData.prevWorkExperience.forEach((exp, index) => {
        if (!exp.designation?.trim()) {
          newErrors[`prevWorkExperience.${index}.designation`] =
            "Designation is required";
        }
        if (!exp.joiningDate?.trim()) {
          newErrors[`prevWorkExperience.${index}.joiningDate`] =
            "Joining date is required";
        }
        if (!exp.endDate?.trim()) {
          newErrors[`prevWorkExperience.${index}.endDate`] =
            "End date is required";
        }
      });
    }
    return newErrors;
  };

  const validateAllExperiences = () => {
    const experienceErrors = validateExperiences();
    const hasErrors = Object.keys(experienceErrors).length > 0;

    if (hasErrors) {
      setErrors((prev) => ({
        ...prev,
        ...experienceErrors,
      }));
      return false;
    }
    return true;
  };

  const addExperience = () => {
    if (validateAllExperiences()) {
      setFormData((prevData) => ({
        ...prevData,
        prevWorkExperience: [
          ...prevData.prevWorkExperience,
          {
            designation: "",
            joiningDate: "",
            endDate: "",
            jobType: "",
            employmentType: "",
          },
        ],
      }));
    } else {
      alert(
        "Please fill in 'Designation', 'Joining Date', and 'End Date' for all existing experiences before adding another."
      );
    }
  };

  const deleteExperience = (index) => {
    setFormData((prevData) => {
      const newExperience = prevData.prevWorkExperience.filter(
        (_, i) => i !== index
      );
      return {
        ...prevData,
        prevWorkExperience: newExperience,
      };
    });
  };

  const handleExperienceCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setHasExperience(isChecked);
    if (!isChecked) {
      // Clear experience data if checkbox is unchecked
      setFormData((prevData) => ({
        ...prevData,
        prevWorkExperience: [],
      }));

      // Clear all experience-related errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("prevWorkExperience")) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    } else {
      // Add initial experience box if checked and no experience exists
      if (formData.prevWorkExperience.length === 0) {
        setFormData((prevData) => ({
          ...prevData,
          prevWorkExperience: [
            {
              designation: "",
              joiningDate: "",
              endDate: "",
              jobType: "",
              employmentType: "",
            },
          ],
        }));
      }
    }
  };

  // Verification functionalities

  const handleUpdateClick = () => {
    const experiences = formData.prevWorkExperience;

    if (!experiences || experiences.length === 0) {
      toast.error(
        "No experience added",
        "Please add at least one work experience before verifying."
      );
      setErrorMessage(
        "Please add at least one work experience before verifying."
      );
      return false;
    }

    // Validate each experience entry
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      if (
        !exp.designation?.trim() ||
        !exp.joiningDate?.trim() ||
        !exp.endDate?.trim()
      ) {
        toast.error(
          "Incomplete experience entry",
          `Please fill out designation, joining date, and end date in experience #${
            i + 1
          }.`
        );
        setErrorMessage(`Incomplete experience entry at row ${i + 1}.`);
        return false;
      }
    }

    // Passed all validations
    setErrorMessage("");
    setIsDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateEmployee({
        id: employeeData?._id,
        isPreviouslyEmployed: true,
        prevWorkExperience: formData.prevWorkExperience,
      }).unwrap();
      toast.success(
        "Success",
        "Employee previously employed status verified successfully!"
      );

      await refetchEmployee();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message ||
          "Failed to verify employee previously employed status."
      );
    }
  };

  // Function to get error for specific experience field
  const getExperienceError = (index, fieldName) => {
    return errors[`prevWorkExperience.${index}.${fieldName}`];
  };

  const handleCancelUpdate = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      {isAdmin && (
        <>
          <TitleDivider
            color="primary"
            className={"text-gray-900"}
            title="Employment Details"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-black">
            {deptLoading ? (
              <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
            ) : (
              <SelectInput
                label="Department"
                name="department"
                value={
                  departmentOptions.find(
                    (opt) => opt.value === formData.department
                  ) || null
                }
                onChange={(option) => {
                  handleChange({
                    target: { name: "department", value: option?.value || "" },
                  });
                }}
                error={errors.department}
                options={departmentOptions}
                icon={<BriefcaseIcon className="h-5 w-5" />}
                required={true}
              />
            )}

            <SelectInput
              label="Designation"
              name="designation"
              value={
                designationOptions.find(
                  (opt) => opt.value === formData.designation
                ) || null
              }
              onChange={(option) => {
                handleChange({
                  target: { name: "designation", value: option?.value || "" },
                });
              }}
              error={errors.designation}
              options={designationOptions}
              icon={<BriefcaseIcon className="h-5 w-5" />}
              required={true}
            />

            <SelectInput
              label="Role"
              name="role"
              value={
                roleOptions.find((opt) => opt.value === formData.role) || null
              }
              onChange={(option) => {
                handleChange({
                  target: { name: "role", value: option?.value || "" },
                });
              }}
              error={errors.role}
              options={roleOptions}
              icon={<BookUser className="h-5 w-5" />}
              required={true}
            />

            <SelectInput
              label="Employment Type"
              name="employmentType"
              value={
                employmentTypeOptions.find(
                  (opt) => opt.value === formData.employmentType
                ) || null
              }
              onChange={(option) => {
                handleChange({
                  target: {
                    name: "employmentType",
                    value: option?.value || "",
                  },
                });
              }}
              error={errors.employmentType}
              options={employmentTypeOptions}
              icon={<BriefcaseIcon className="h-5 w-5" />}
              required={true}
            />

            <FloatingInput
              label="Employee ID"
              name="employeeId"
              type="text"
              value={formData.employeeId || ""}
              onChange={handleChange}
              error={errors.employeeId}
              icon={<Hash className="h-5 w-5" />}
              required={true}
            />

            <SelectInput
              label="Work Location"
              name="workLocation"
              value={
                workLocationOptions.find(
                  (opt) => opt.value === formData.workLocation
                ) || null
              }
              onChange={(option) => {
                handleChange({
                  target: { name: "workLocation", value: option?.value || "" },
                });
              }}
              error={errors.workLocation}
              options={workLocationOptions}
              icon={<LocateFixed className="h-5 w-5" />}
              required={true}
            />

            <FloatingInput
              label="Storage Size"
              name="storageLimit.value"
              type="number"
              value={formData.storageLimit?.value || ""}
              onChange={handleChange}
              error={errors["storageLimit.value"]}
              icon={<HardDrive className="h-5 w-5" />}
              required={true}
            />

            <SelectInput
              label="Storage Unit"
              name="storageLimit.unit"
              value={
                [
                  { value: "MB", label: "MB" },
                  { value: "GB", label: "GB" },
                ].find((opt) => opt.value === formData.storageLimit?.unit) || {
                  value: "MB",
                  label: "MB",
                }
              }
              onChange={(option) => {
                handleChange({
                  target: {
                    name: "storageLimit.unit",
                    value: option?.value || "MB",
                  },
                });
              }}
              error={errors["storageLimit.unit"]}
              options={[
                { value: "MB", label: "MB" },
                { value: "GB", label: "GB" },
              ]}
              icon={<HardDrive className="h-5 w-5" />}
            />

            <SelectInput
              label="Status"
              name="status"
              value={
                statusOptions.find((opt) => opt.value === formData.status) ||
                null
              }
              onChange={(option) => {
                handleChange({
                  target: { name: "status", value: option?.value || "" },
                });
              }}
              error={errors.status}
              options={statusOptions}
              icon={<BriefcaseIcon className="h-5 w-5" />}
              required={true}
            />

            <SelectInput
              label="Shift"
              name="shift"
              value={
                shiftOptions.find((opt) => opt.value === formData.shift) || null
              }
              onChange={(option) => {
                handleChange({
                  target: { name: "shift", value: option?.value || "" },
                });
              }}
              error={errors.shift}
              options={shiftOptions}
              icon={<SunMoon className="h-5 w-5" />}
              required={true}
            />

            <FloatingInput
              label="Joining Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              icon={<CalendarIcon className="h-5 w-5" />}
            />

            <FloatingInput
              label="Termination Date"
              name="terminationDate"
              type="date"
              value={formData.terminationDate || ""}
              onChange={handleChange}
              error={errors.terminationDate}
              icon={<CalendarIcon className="h-5 w-5" />}
            />
          </div>
        </>
      )}

      <div className="mt-8">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-primary rounded "
            checked={hasExperience}
            onChange={handleExperienceCheckboxChange}
          />
          <span className="text-lg font-medium text-gray-700">
            Have previous experience?
          </span>
        </label>
      </div>

      {hasExperience && (
        <>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-primary mt-4 mb-4">
              Work Experience
            </h2>
            {isEditMode && isAdmin && (
              <div className="mt-3">
                {employeeData?.isPreviouslyEmployed ? (
                  <Tooltip text={"Previously Employed"} position="right">
                    <LazyImage src={verified} alt="Logo" imgClass={"h-8 w-8"} />
                  </Tooltip>
                ) : (
                  <Tooltip text={"Verify This Employment"} position="right">
                    <button
                      type="button"
                      onClick={handleUpdateClick}
                      className=""
                    >
                      {isUpdating ? (
                        <Loader2
                          size={18}
                          className="animate-spin text-primary"
                        />
                      ) : (
                        <LazyImage
                          src={notVerified}
                          alt="Logo"
                          imgClass={"h-8 w-8"}
                        />
                      )}
                    </button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {formData.prevWorkExperience.map((exp, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 space-y-4 relative"
              >
                {index > 0 && ( // Only show delete button for experiences after the first one
                  <button
                    type="button"
                    onClick={() => deleteExperience(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    aria-label={`Delete experience ${index + 1}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
                <h3 className="text-xl font-medium text-gray-700">
                  Experience {index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput
                    label="Designation"
                    name="designation"
                    value={exp.designation}
                    onChange={(e) => handleExperienceChange(index, e)}
                    error={getExperienceError(index, "designation")}
                    required={!isAdmin}
                  />
                  <FloatingInput
                    label="Job Type"
                    name="jobType"
                    type="select"
                    options={jobTypeOptions}
                    value={exp.jobType}
                    onChange={(e) => handleExperienceChange(index, e)}
                    error={getExperienceError(index, "jobType")}
                    required={!isAdmin}
                  />
                  <FloatingInput
                    label="Joining Date"
                    name="joiningDate"
                    type="date"
                    value={exp.joiningDate}
                    onChange={(e) => handleExperienceChange(index, e)}
                    error={getExperienceError(index, "joiningDate")}
                    required={!isAdmin}
                  />
                  <FloatingInput
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(index, e)}
                    error={getExperienceError(index, "endDate")}
                    required={!isAdmin}
                  />
                  <FloatingInput
                    label="Employment Type"
                    name="employmentType"
                    type="select"
                    options={employmentTypeOptions}
                    value={exp.employmentType}
                    onChange={(e) => handleExperienceChange(index, e)}
                    error={getExperienceError(index, "employmentType")}
                    required={!isAdmin}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button type="button" onClick={addExperience} className="">
              Add More Experience
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={isDialogOpen}
        title="Verify Employment"
        message={`Are you sure you want to verify this employment? This action cannot be undone.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </div>
  );
};

export default EmploymentDetails;
