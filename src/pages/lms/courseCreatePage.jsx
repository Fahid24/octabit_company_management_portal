"use client";

import { useState } from "react";
import { CourseInfoForm } from "@/pages/lms/component/course-info-form";
import { ModulesForm } from "@/pages/lms/component/modules-form";
import { QuizForm } from "@/pages/lms/component/quiz-form";
import { CoursePreview } from "@/pages/lms/component/course-preview";
import Button from "@/component/Button";
import { Card, CardContent } from "@/component/card";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  ListChecks,
  Eye,
} from "lucide-react";
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "@/redux/features/lms/lmsApiSlice";
import { useNavigate } from "react-router-dom";
import { StepProgress } from "@/component/StepProgress";
import { TitleDivider } from "@/component/TitleDevider";

// Helper to generate a random 24-char hex string (like MongoDB ObjectId)
function generateObjectId() {
  // Generate a 24-character hex string
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function transformCourseData(courseData) {
  return {
    ...courseData,
    modules: (courseData.modules || []).map((module) => {
      const moduleQuiz = (courseData.quizzes || []).find(
        (q) => q.moduleId === module.id
      );
      return {
        _id: module._id || generateObjectId(),
        title: module.title,
        lessons: (module.lessons || []).map((lesson) => ({
          _id: lesson._id || generateObjectId(),
          title: lesson.title,
          type: lesson.type,
          content:
            lesson.type === "pdf" || lesson.type === "file"
              ? typeof lesson.content === "string" && lesson.content
                ? lesson.content
                : lesson.content?.fileUrl || lesson.content?.link || ""
              : lesson.type === "video" || lesson.type === "link"
              ? typeof lesson.content === "string" && lesson.content
                ? lesson.content
                : lesson.content?.link || lesson.content?.fileUrl || ""
              : typeof lesson.content === "string"
              ? lesson.content
              : "",
        })),
        ...(moduleQuiz
          ? {
              quiz: {
                _id: moduleQuiz._id || generateObjectId(),
                questions: (moduleQuiz.questions || []).map((q) => {
                  const options = [q.option1, q.option2, q.option3, q.option4];
                  return {
                    _id: q._id || generateObjectId(),
                    question: q.question,
                    options,
                    answer: options[q.answer - 1], // answer is 1-based index
                  };
                }),
                createdAt: new Date().toISOString(),
              },
            }
          : {}),
      };
    }),
    quizzes: undefined, // Remove quizzes from top-level
  };
}

export const CreateCourse = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [courseData, setCourseData] = useState({
    title: "",
    summary: "",
    description: "",
    thumbnail: "",
    departments: [],
    level: "",
    language: "",
    tags: [],
    modules: [],
    quizzes: [],
  });

  const [createCourse, { isLoading, isSuccess, isError, error }] =
    useCreateCourseMutation();
  const [
    updateCourse,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateCourseMutation();
  const navigate = useNavigate();

  const updateCourseData = (data) => {
    setCourseData((prev) => ({ ...prev, ...data }));
    // Clear validation errors when data is updated
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const updatedErrors = { ...validationErrors };
      Object.keys(data).forEach((key) => {
        delete updatedErrors[key];
      });
      setValidationErrors(updatedErrors);
    }
  };

  const validateCurrentStep = () => {
    const errors = {};

    if (currentStep === 1) {
      // Validate Module Info step
      if (!courseData.title.trim()) {
        errors.title = "Module title is required";
      }
      if (!courseData.summary.trim()) {
        errors.summary = "Module summary is required";
      }
      if (!courseData.description.trim()) {
        errors.description = "Module description is required";
      }
      if (!courseData.level) {
        errors.level = "Level is required";
      }
      if (!courseData.departments || courseData.departments.length === 0) {
        errors.departments = "At least one department is required";
      }
      if (!courseData.language) {
        errors.language = "Language is required";
      }
    }
    // Add validation for Modules step
    if (currentStep === 2) {
      if (!courseData.modules || courseData.modules.length === 0) {
        errors.modules = "At least one module is required";
      } else {
        courseData.modules.forEach((module, idx) => {
          if (!module.lessons || module.lessons.length === 0) {
            errors[`module_${idx}_lessons`] = `Module ${idx + 1} must have at least one lesson`;
          }
        });
      }
    }

    // Add validation for Quizzes step if needed
    if (currentStep === 3) {
      // We could add validation for quizzes here
      // For example, checking if each module that should have a quiz has one
      if (courseData.modules && courseData.modules.length > 0) {
        // Example validation - uncomment if needed
        /*
        courseData.modules.forEach((module, idx) => {
          const hasQuiz = courseData.quizzes.some(q => q.moduleId === module.id);
          if (!hasQuiz) {
            errors[`module_${idx}_quiz`] = `Module "${module.title}" requires a quiz`;
          }
        });
        */
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = (currentStep / 4) * 100;

  const steps = [
    {
      id: 1,
      title: "Module Info",
      description: "Basic Module information",
      icon: FileText,
    },
    {
      id: 2,
      title: "Modules",
      description: "Add modules and lessons",
      icon: Layers,
    },
    {
      id: 3,
      title: "Quizzes",
      description: "Create quizzes for modules",
      icon: ListChecks,
    },
    { id: 4, title: "Preview", description: "Review and publish", icon: Eye },
  ];

  const handlePublish = async () => {
    try {
      const payload = transformCourseData({
        ...courseData,
        departments: (courseData.departments || []).map((d) =>
          typeof d === "object" && d !== null ? d.id || d.value : d
        ),
        status: "Published",
      });
      await createCourse(payload).unwrap();
      navigate("/lms/course-list", { state: { refetch: true } });
    } catch (err) {
      // Optionally, show an error message here
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = transformCourseData({
        ...courseData,
        departments: (courseData.departments || []).map((d) =>
          typeof d === "object" && d !== null ? d.id || d.value : d
        ),
        status: "Draft",
      });
      await createCourse(payload).unwrap();
      navigate("/lms/course-list", { state: { refetch: true } });
    } catch (err) {
      // Optionally, show an error message here
    }
  };

  const handleUpdate = async () => {
    try {
      // Use _id or id from courseData for update
      const courseId = courseData._id || courseData.id;
      if (!courseId) throw new Error("No course ID found for update");
      const payload = transformCourseData({
        ...courseData,
        departments: (courseData.departments || []).map((d) =>
          typeof d === "object" && d !== null ? d.id || d.value : d
        ),
        status: "Published",
      });
      await updateCourse({ id: courseId, courseData: payload }).unwrap();
      // Optionally, redirect or show a success message here
    } catch (err) {
      // Optionally, show an error message here
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      {/* Step Content */}
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="relative h-42 bg-form-header-gradient pt-4 p-1">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>

          <div>
            <h1 className="text-3xl font-semibold text-gray-800 text-center mt-2">
              Create Learning Module
            </h1>
            <TitleDivider
              color="black"
              className={"-mt-0 "}
              title={steps[currentStep - 1].title}
            />
          </div>
        </div>
        <div className="pt-6 px-6">
          <StepProgress
            steps={steps}
            currentStep={currentStep - 1}
            onStepClick={(idx) => setCurrentStep(idx + 1)}
          />
        </div>
        <CardContent>
          {currentStep === 1 && (
            <>
              {/* Show validation errors for course info */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following issues:
                    </h3>
                  </div>
                  <ul className="ml-6 list-disc text-sm space-y-1 text-red-700">
                    {Object.entries(validationErrors).map(([key, msg]) => (
                      <li key={key}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              <CourseInfoForm
                data={courseData}
                updateData={updateCourseData}
                validationErrors={validationErrors}
              />
            </>
          )}
          {currentStep === 2 && (
            <>
              {/* Show validation errors for modules/lessons */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following issues:
                    </h3>
                  </div>
                  <ul className="ml-6 list-disc text-sm space-y-1 text-red-700">
                    {validationErrors.modules && (
                      <li>{validationErrors.modules}</li>
                    )}
                    {Object.entries(validationErrors)
                      .filter(([key]) => key.startsWith("module_") && key.endsWith("_lessons"))
                      .map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                  </ul>
                </div>
              )}
              <ModulesForm
                data={courseData}
                updateData={updateCourseData}
                validationErrors={validationErrors}
              />
            </>
          )}
          {currentStep === 3 && (
            <>
              {/* Show validation errors for quizzes if needed */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following issues:
                    </h3>
                  </div>
                  <ul className="ml-6 list-disc text-sm space-y-1 text-red-700">
                    {Object.entries(validationErrors)
                      .filter(([key]) => key.includes("quiz"))
                      .map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                  </ul>
                </div>
              )}
              <QuizForm data={courseData} updateData={updateCourseData} validationErrors={validationErrors} />
            </>
          )}
          {currentStep === 4 && <CoursePreview data={courseData} />}
        </CardContent>
        <CardContent>
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep === 4 ? (
              <div className="flex gap-4">
                <Button onClick={handlePublish} disabled={isLoading}>
                  {isLoading ? "Publishing..." : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save as Draft"}
                </Button>
              </div>
            ) : (
              <Button onClick={nextStep} disabled={isLoading}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isError && (
        <div className="text-red-600 mt-4 text-center">
          {error?.data?.message || "Failed to publish module."}
        </div>
      )}
      {isUpdateError && (
        <div className="text-red-600 mt-4 text-center">
          {updateError?.data?.message || "Failed to update module."}
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
