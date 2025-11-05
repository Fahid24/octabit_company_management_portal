import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useUpdateLearningRequestMutation,
  useCreateLearningRequestMutation,
} from "@/redux/features/learning/learningApiSlice";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { toast } from "@/component/Toast";
import Button from "@/component/Button";
import { Calendar, BookOpen, Flag, Type } from "lucide-react";
import { TitleDivider } from "@/component/TitleDevider";
import SelectInput from "@/component/select/SelectInput";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "urgent", label: "Urgent" },
];

const formatOptions = [
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
  { value: "course", label: "Online Course" },
  { value: "book", label: "Book" },
  { value: "mentor", label: "Mentorship" },
];

const LearningRequestForm = ({ existingRequest, open = false, onSuccess }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;

  // Form state
  const [formData, setFormData] = useState({
    topicTitle: "",
    educationType: null,
    topicDescription: "",
    justification: "",
    preferredLearningFormat: formatOptions[0], // use object
    priority: priorityOptions[1], // default to Medium
    expectedCompletionDate: "",
  });
  const [errors, setErrors] = useState({});
  const [createLearningRequest, { isLoading: isCreating }] =
    useCreateLearningRequestMutation();
  const [updateLearningRequest, { isLoading: isUpdating }] =
    useUpdateLearningRequestMutation();

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Create date object from the UTC string
    const date = new Date(dateString);

    // Get year, month, and day components in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Format as YYYY-MM-DD
    return `${year}-${month}-${day}`;
  };


  // Populate form with existing data when loaded
  useEffect(() => {
    if (existingRequest) {
      setFormData({
        topicTitle: existingRequest.topicTitle || "",
        educationType:
          {
            value: existingRequest.educationType,
            label: existingRequest.educationType,
          } || null,
        topicDescription: existingRequest.topicDescription || "",
        justification: existingRequest.justification || "",
        preferredLearningFormat:
          formatOptions.find(
            (opt) =>
              opt.value === existingRequest.preferredLearningFormat ||
              opt.label === existingRequest.preferredLearningFormat
          ) || formatOptions[0],
        priority:
          priorityOptions.find(
            (opt) =>
              opt.value === existingRequest.priority ||
              opt.label === existingRequest.priority
          ) || priorityOptions[1],
        expectedCompletionDate: existingRequest.expectedCompletionDate
          ? formatDateForInput(existingRequest.expectedCompletionDate)
          : "",
      });
    }
  }, [existingRequest]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.topicTitle.trim())
      newErrors.topicTitle = "Topic title is required.";
    if (!formData.topicDescription.trim())
      newErrors.topicDescription = "Topic description is required.";
    if (!formData.educationType)
      newErrors.educationType = "Education type is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Validation Error", "Please fill in all required fields.");
      return;
    }
    try {
      const payload = {
        ...formData,
        educationType: formData.educationType.value,
        preferredLearningFormat: formData.preferredLearningFormat.value,
        priority: formData.priority.value,
        employeeId,
      };
      if (existingRequest && existingRequest._id) {
        await updateLearningRequest({
          id: existingRequest._id,
          data: payload,
        }).unwrap();
        toast.success("Success", "Learning request updated successfully!");
      } else {
        await createLearningRequest(payload).unwrap();
        toast.success("Success", "Learning request created successfully!");
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(
          user?.user?.role === "Admin" ? "/applications" : "/learning-requests"
        );
      }
    } catch (err) {
      toast.error("Error", err?.data?.message || "Failed to submit request.");
    }
  };

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigate(
        user?.user?.role === "Admin" ? "/applications" : "/learning-requests"
      );
    }
  };

  return (
    <div className={`${open ? "" : "p-4 md:pl-24 pb-20 md:pb-4"}`}>
      <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="relative rounded-t-2xl  h-42 bg-form-header-gradient p-6">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/30"></div>
          <div className="absolute bottom-5 left-8 h-8 w-8 rounded-full bg-white/20"></div>

          <div>
            <h1 className="text-xl md:text-3xl font-semibold text-gray-700 text-center mt-2">
              {existingRequest
                ? "Update Education Request"
                : "Create Education Request"}
            </h1>
            <TitleDivider color="primary" className={"-mt-0"} title={""} />
            <p className="text-sm sm:text-base font-semibold text-gray-800 text-center -mt-3">
              Want to grow your skills🚀 or attend a training?
            </p>
            <p className="text-xs sm:text-sm text-gray-800 text-center">
              Use this form to request support for educational opportunities
              like conferences, certifications, or courses. You can also suggest
              training topics you&apos;d like us to offer internally. Eligible
              employees can receive up to $1,500 per calendar year* through our
              education assistance benefit.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-8 shadow rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {existingRequest && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  Updating request for:{" "}
                  <span className="font-semibold">
                    {existingRequest?.topicTitle}
                  </span>
                </p>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
              <FloatingInput
                label="Topic Title"
                name="topicTitle"
                value={formData.topicTitle}
                onChange={handleChange}
                error={errors.topicTitle}
                icon={<BookOpen className="h-5 w-5" />}
                required
              />

              <SelectInput
                className={"z-30 -mt-0.5"}
                label="Education Type"
                isMulti={false}
                value={formData.educationType}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    educationType: selectedOption,
                  }));
                  if (errors.educationType) {
                    setErrors((prev) => ({
                      ...prev,
                      educationType: null,
                    }));
                  }
                }}
                options={[
                  { value: "Internal Training", label: "Internal Training" },
                  {
                    value: "In-Person Conference",
                    label: "In-Person Conference",
                  },
                  { value: "Online Training", label: "Online Training" },
                ]}
                error={errors.educationType}
              />
            </div>

            <FloatingTextarea
              // label="Topic Description"
              name="topicDescription"
              value={formData.topicDescription}
              onChange={handleChange}
              error={errors.topicDescription}
              placeholder="Please include more information about the training you're interested in receiving. If this is a conference or course, please include as many details as possible, a link to their website if you have it, dates, cost, etc"
              required
            />
            <FloatingTextarea
              // label="Justification"
              name="justification"
              value={formData.justification}
              placeholder="Tell us how this course will help you grow in your role or support the team. Help us understand the value and why this matters to you."
              onChange={handleChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectInput
                label="Preferred Learning Format"
                value={formData.preferredLearningFormat}
                options={formatOptions}
                icon={<Type className="h-5 w-5" />}
                onChange={(option) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredLearningFormat: option,
                  }))
                }
                required
              />
              <SelectInput
                label="Priority"
                value={formData.priority}
                options={priorityOptions}
                icon={<Flag className="h-5 w-5" />}
                onChange={(option) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: option,
                  }))
                }
                required
              />
            </div>
            <FloatingInput
              label="Expected Completion Date"
              name="expectedCompletionDate"
              type="date"
              value={formData.expectedCompletionDate}
              onChange={handleChange}
              icon={<Calendar className="h-5 w-5" />}
            />
            <div className="flex justify-end pt-4 space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? "Submitting..."
                  : existingRequest
                  ? "Update Request"
                  : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LearningRequestForm;
