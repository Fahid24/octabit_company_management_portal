import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CourseInfoForm } from "@/pages/lms/component/course-info-form";
import { ModulesForm } from "@/pages/lms/component/modules-form";
import { QuizForm } from "@/pages/lms/component/quiz-form";
import { CoursePreview } from "@/pages/lms/component/course-preview";
import Button from "@/component/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";
import { StepProgress } from "@/component/StepProgress";
import { useUpdateCourseMutation } from "@/redux/features/lms/lmsApiSlice";
import { Eye, FileText, Layers, ListChecks } from "lucide-react";
import { TitleDivider } from "@/component/TitleDevider";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";

// Helper to generate a random 24-char hex string (like MongoDB ObjectId)
function generateObjectId() {
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

// Normalize quizzes to the format expected by QuizForm
function normalizeQuizzes(course) {
  // Collect quizzes from course.quizzes
  let quizzesFromQuizzes = [];
  if (Array.isArray(course.quizzes)) {
    quizzesFromQuizzes = course.quizzes
      .filter((q) => q && (q.questions || (q.quiz && q.quiz.questions)))
      .map((q) => ({
        ...q,
        id: q.id || q._id || generateObjectId(),
        moduleId: String(
          q.moduleId ||
            q.module_id ||
            (q.module && (q.module.id || q.module._id))
        ),
        questions: (q.questions || (q.quiz && q.quiz.questions) || []).map(
          (qq) => ({
            ...qq,
            id: qq.id || qq._id || generateObjectId(),
            option1: qq.options ? qq.options[0] : qq.option1 || "",
            option2: qq.options ? qq.options[1] : qq.option2 || "",
            option3: qq.options ? qq.options[2] : qq.option3 || "",
            option4: qq.options ? qq.options[3] : qq.option4 || "",
            answer:
              typeof qq.answer === "number"
                ? qq.answer
                : qq.options && typeof qq.answer === "string"
                ? qq.options.findIndex((opt) => opt === qq.answer) + 1
                : 1,
          })
        ),
      }));
  }

  // Collect quizzes from modules
  let quizzesFromModules = [];
  if (Array.isArray(course.modules)) {
    quizzesFromModules = course.modules.flatMap((m) => {
      if (!m.quiz) return [];
      // If m.quiz is an array, map each; if object, wrap in array
      const quizzes = Array.isArray(m.quiz) ? m.quiz : [m.quiz];
      return quizzes.map((qz) => ({
        id: qz.id || qz._id || generateObjectId(),
        moduleId: String(m.id || m._id),
        questions: (qz.questions || []).map((qq) => ({
          ...qq,
          id: qq.id || qq._id || generateObjectId(),
          option1: qq.options ? qq.options[0] : qq.option1 || "",
          option2: qq.options ? qq.options[1] : qq.option2 || "",
          option3: qq.options ? qq.options[2] : qq.option3 || "",
          option4: qq.options ? qq.options[3] : qq.option4 || "",
          answer:
            qq.options && typeof qq.answer === "string"
              ? qq.options.findIndex((opt) => opt === qq.answer) + 1
              : typeof qq.answer === "number"
              ? qq.answer
              : 1,
        })),
      }));
    });
  }

  // Merge, preferring quizzesFromQuizzes if moduleId matches
  const all = [...quizzesFromModules, ...quizzesFromQuizzes];
  const seen = new Set();
  const deduped = all.filter((q) => {
    if (!q.moduleId) return false;
    if (seen.has(q.moduleId)) return false;
    seen.add(q.moduleId);
    return true;
  });
  return deduped;
}

function transformCourseData(courseData) {
  return {
    ...courseData,
    modules: (courseData.modules || []).map((module) => {
      const moduleId = module.id || module._id || generateObjectId();
      const moduleQuiz = (courseData.quizzes || []).find(
        (q) => q.moduleId === moduleId
      );
      return {
        id: moduleId,
        title: module.title,
        lessons: (module.lessons || []).map((lesson) => ({
          id: lesson.id || lesson._id || generateObjectId(),
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
                id: moduleQuiz.id || moduleQuiz._id || generateObjectId(),
                questions: (moduleQuiz.questions || []).map((q) => {
                  const options = [q.option1, q.option2, q.option3, q.option4];
                  return {
                    id: q.id || q._id || generateObjectId(),
                    question: q.question,
                    options,
                    answer: options[q.answer - 1],
                  };
                }),
                createdAt: new Date().toISOString(),
              },
            }
          : {}),
      };
    }),
    quizzes: undefined,
  };
}

export const EditCourse = () => {
  const location = useLocation();
  const course = location.state?.course || {};
  // Debug logging
  // console.log("RAW COURSE DATA:", course);
  // console.log("NORMALIZED QUIZZES:", normalizeQuizzes(course));
  const initialCourseData = {
    ...course,
    departments: Array.isArray(course.departments)
      ? course.departments.map((dep) =>
          typeof dep === "object" && dep !== null ? dep._id || dep.id : dep
        )
      : [],
    tags: course.tags || [],
    modules: Array.isArray(course.modules)
      ? course.modules.map((module) => ({
          ...module,
          id: String(module.id || module._id || generateObjectId()),
        }))
      : [],
    quizzes: normalizeQuizzes(course),
    title: course.title || "",
    summary: course.summary || "",
    description: course.description || "",
    thumbnail: course.thumbnail || "",
    level: course.level || "",
    language: course.language || "",
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState(initialCourseData);
  const navigate = useNavigate();

  const [
    updateCourse,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateCourseMutation();

  const { data: departmentsApiData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery({ isPopulate: false });
  const departmentOptions = Array.isArray(departmentsApiData?.data)
    ? departmentsApiData.data
        .filter((d) => !d.isDeleted)
        .map((dept) => ({ _id: dept._id, name: dept.name }))
    : [];

  const updateCourseData = (data) => {
    setCourseData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      id: 1,
      title: "Module Info",
      description: "Basic module information",
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

  const handleUpdate = async () => {
    try {
      const courseId = courseData._id || courseData.id;
      if (!courseId) throw new Error("No course ID found for update");
      const payload = transformCourseData({
        ...courseData,
        departments: (courseData.departments || []).map((d) =>
          typeof d === "object" && d !== null ? d._id || d.id || d.value : d
        ),
        status: "Published",
      });
      await updateCourse({ id: courseId, courseData: payload }).unwrap();
      navigate("/lms/course-list", { state: { refetch: true } });
    } catch {
      // Optionally handle error here
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      {/* Step Content */}
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="relative h-42 bg-gradient-to-r  from-primary to-primary pt-4 p-1">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-12 left-8 h-8 w-8 rounded-full bg-white/10"></div>

          <div>
            <h1 className="text-3xl font-semibold text-white text-center mt-2">
              Update Learning Module
            </h1>
            <TitleDivider
              color="white"
              className={"-mt-0"}
              title={steps[currentStep - 1].title}
            />
          </div>
        </div>
        <div className="pt-6 px-6">
          <StepProgress
            steps={steps}
            currentStep={currentStep - 1}
            onStepClick={(idx) => setCurrentStep(idx + 1)}
            completedSteps={Array.from(
              { length: currentStep - 1 },
              (_, i) => i
            )}
          />
        </div>
        <CardHeader>
          <CardTitle>{}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <CourseInfoForm data={courseData} updateData={updateCourseData} />
          )}
          {currentStep === 2 && (
            <ModulesForm data={courseData} updateData={updateCourseData} />
          )}
          {currentStep === 3 && (
            <QuizForm data={courseData} updateData={updateCourseData} />
          )}
          {currentStep === 4 && (
            <CoursePreview
              data={courseData}
              showActions={false}
              departmentsList={departmentOptions}
            />
          )}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              {/* <ChevronLeft className="h-4 w-4 mr-2" /> */}
              Previous
            </Button>
            {currentStep === 4 ? null : (
              <Button onClick={nextStep}>
                Next
                {/* <ChevronRight className="h-4 w-4 ml-2" /> */}
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                variant="outline"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Module"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isUpdateError && (
        <div className="text-red-600 mt-4 text-center">
          {updateError?.data?.message || "Failed to update module."}
        </div>
      )}
    </div>
  );
};

export default EditCourse;
