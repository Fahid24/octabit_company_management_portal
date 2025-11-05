import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateIncidentMutation,
  useGetAllIncidentsQuery,
} from "@/redux/features/incident/incidentApiSlice";
import { FloatingInput } from "@/component/FloatiingInput";
import { TitleDivider } from "@/component/TitleDevider";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { CalendarIcon, FileTextIcon, AlertCircleIcon } from "lucide-react";
import { toast } from "@/component/Toast";
import { useSelector } from "react-redux";
import Select from "react-select";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import SelectInput from "@/component/select/SelectInput";

const IncidentCreateForm = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.userSlice);
  const { refetch } = useGetAllIncidentsQuery();

  // console.log("userr", user);

  const [formData, setFormData] = useState({
    completedBy: user.user?._id || "", // Get user ID from auth state
    completedDate: new Date().toISOString(),
    incidentDateTime: "",
    personsInvolved: [],
    incidentDescription: "",
    witnesses: [],
    injuries: "",
    reportedTo: "",
    howReported: "form",
    followUpActions: "",
    signature: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [createIncident] = useCreateIncidentMutation();

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetAllEmployeesQuery({ page: 1, limit: 1000 });

  const employeeOptions =
    employeesData?.data?.map((emp) => ({
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName}`,
    })) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (checked) => {
    setTermsAccepted(checked);
    if (errors.terms) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.incidentDateTime)
      newErrors.incidentDateTime = "Incident date and time is required";
    if (!formData.personsInvolved.length)
      newErrors.personsInvolved = "Persons involved is required";
    if (!formData.incidentDescription)
      newErrors.incidentDescription = "Incident description is required";
    if (!formData.witnesses.length)
      newErrors.witnesses = "Witnesses information is required";
    if (!formData.injuries)
      newErrors.injuries = "Injuries information is required";
    if (!formData.followUpActions)
      newErrors.followUpActions = "Follow-up actions are required";
    if (!termsAccepted)
      newErrors.terms = "You must accept the terms to continue";
    if (!formData.signature) newErrors.signature = "Signature is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const payload = {
          completedBy: formData.completedBy,
          completedDate: new Date(formData.completedDate).toISOString(),
          incidentDateTime: formData.incidentDateTime
            ? new Date(formData.incidentDateTime).toISOString()
            : "",
          personsInvolved: formData.personsInvolved,
          incidentDescription: formData.incidentDescription,
          witnesses: formData.witnesses,
          injuries: formData.injuries,
          reportedTo: formData.reportedTo,
          howReported: formData.howReported,
          followUpActions: formData.followUpActions,
          signature: formData.signature,
        };

        await createIncident(payload).unwrap();
        toast.success("Success", "Incident report created successfully!");
        // Refetch incidents data
        await refetch();
        // Navigate to incidents page after successful submission
        navigate("/incidents");
      } catch (err) {
        toast.error(
          "Error",
          err?.data?.message || "Failed to create incident report"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-24 md:pb-10">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl">
        {/* Header */}
        <div className="relative h-42 bg-form-header-gradient p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mt-2">
              Incident Report
            </h1>
            <TitleDivider
              color="black"
              className={"-mt-0 text-center"}
              title="Create New Incident Report"
            />
          </div>
        </div>

        {/* Form */}
        <div className="p-4 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <SelectInput
                isMulti
                isSearchable
                label="Persons Involved"
                className="z-50"
                options={employeeOptions}
                value={employeeOptions.filter((opt) =>
                  formData.personsInvolved?.includes(opt.value)
                )}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    personsInvolved: selected
                      ? selected.map((opt) => opt.value)
                      : [],
                  }));
                  if (errors.personsInvolved) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.personsInvolved;
                      return newErrors;
                    });
                  }
                }}
                isLoading={isLoadingEmployees}
                placeholder="Select or search employees"
                classNamePrefix="react-select"
              />
              {errors.personsInvolved && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.personsInvolved}
                </p>
              )}
            </div>

            <div>
              <SelectInput
                isMulti
                isSearchable
                label="Witnesses"
                options={employeeOptions}
                value={employeeOptions.filter((opt) =>
                  formData.witnesses?.includes(opt.value)
                )}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    witnesses: selected ? selected.map((opt) => opt.value) : [],
                  }));
                  if (errors.witnesses) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.witnesses;
                      return newErrors;
                    });
                  }
                }}
                isLoading={isLoadingEmployees}
                placeholder="Select or search employees"
                className="react-select-container z-40"
                classNamePrefix="react-select"
              />
              {errors.witnesses && (
                <p className="mt-1 text-xs text-red-500">{errors.witnesses}</p>
              )}
            </div>

            <FloatingInput
              label="Injuries"
              name="injuries"
              value={formData.injuries}
              onChange={handleChange}
              error={errors.injuries}
              icon={<AlertCircleIcon className="h-5 w-5" />}
              required
            />

            <div>
              <SelectInput
                isSearchable
                options={employeeOptions}
                label="Reported To"
                value={
                  employeeOptions.find(
                    (opt) => opt.value === formData.reportedTo
                  ) || null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    reportedTo: selected ? selected.value : "",
                  }));
                  if (errors.reportedTo) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.reportedTo;
                      return newErrors;
                    });
                  }
                }}
                isLoading={isLoadingEmployees}
                placeholder="Select or search employee"
                className="react-select-container z-30"
                classNamePrefix="react-select"
              />
              {errors.reportedTo && (
                <p className="mt-1 text-xs text-red-500">{errors.reportedTo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Date & Time
              </label>
              <FloatingInput
                label=""
                name="incidentDateTime"
                type="datetime-local"
                value={formData.incidentDateTime}
                onChange={handleChange}
                error={errors.incidentDateTime}
                icon={<CalendarIcon className="h-5 w-5" />}
                required
                max={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="incidentDescription"
                value={formData.incidentDescription}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={4}
                required
              />
              {errors.incidentDescription && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.incidentDescription}
                </p>
              )}
            </div>

            <FloatingInput
              label="Follow-up Actions"
              name="followUpActions"
              value={formData.followUpActions}
              onChange={handleChange}
              error={errors.followUpActions}
              icon={<FileTextIcon className="h-5 w-5" />}
              required
              multiline
            />

            <FloatingInput
              label="Signature"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              error={errors.signature}
              required
            />

            {/* Signature Field */}
            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature <span className="text-red-500">*</span>
                </label>
                <FloatingInput
                  type="text"
                  name="signature"
                  value={formData.signature}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Type your name as signature"
                  required
                />
                {errors.signature && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.signature}
                  </p>
                )}
              </div> */}

            <div className="mt-4">
              <CustomCheckbox
                label="I certify that all information provided is true and accurate"
                checked={termsAccepted}
                onChange={handleCheckboxChange}
              />
              {errors.terms && (
                <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentCreateForm;
