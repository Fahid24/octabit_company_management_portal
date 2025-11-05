import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery } from "@/redux/features/lms/lmsApiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/component/card";
import { Badge } from "@/component/badge";
import Button from "@/component/Button";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import { useSelector } from "react-redux";
import {
  useTrackProgressMutation,
  useGetProgressByUserAndCourseQuery,
  useCreateCertificateMutation,
} from "@/redux/features/lms/lmsApiSlice";
import { toast } from "@/component/Toast";
import CourseCompletionPage from "./component/CourseCompletionPage";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CourseViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: course,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCourseByIdQuery(id);
  const user = useSelector((state) => state.userSlice.user);
  const userId = user?.user?._id;
  const [trackProgress] = useTrackProgressMutation();
  const [createCertificate] = useCreateCertificateMutation();
  const {
    data: progress,
    isLoading: isProgressLoading,
    refetch: refetchProgress,
  } = useGetProgressByUserAndCourseQuery(
    { userId, courseId: id },
    { skip: !userId || !id }
  );

  // State for navigation and quiz
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [pdfError, setPdfError] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [unlockingModule, setUnlockingModule] = useState(false);
  const [unlockingMessage, setUnlockingMessage] = useState("");
  const [userSelectedLesson, setUserSelectedLesson] = useState(false);
  const [showCourseCompleteCongrats, setShowCourseCompleteCongrats] =
    useState(false);
  const firstLessonMarkedRef = useRef(false);

  // Move these declarations up
  const currentModule = course?.modules?.find((m) => m._id === currentModuleId);
  const currentLesson = currentModule?.lessons?.find(
    (l) => l._id === currentLessonId
  );
  const currentModuleQuiz = currentModule?.quiz;

  // Set initial module/lesson when course loads or progress loads
  useEffect(() => {
    if (
      !course ||
      !course.modules?.length ||
      isProgressLoading ||
      userSelectedLesson
    )
      return;
    let startModuleId = course.modules[0]._id;
    let startLessonId = course.modules[0].lessons[0]?._id;
    if (progress && progress.currentModuleId) {
      // Resume from last module
      const foundModule = course.modules.find(
        (m) => m._id === progress.currentModuleId
      );
      if (foundModule) {
        startModuleId = foundModule._id;
        // Find first incomplete lesson in this module
        const incompleteLesson = foundModule.lessons.find(
          (l) => !(progress.completedLessons || []).includes(l._id)
        );
        startLessonId = incompleteLesson
          ? incompleteLesson._id
          : foundModule.lessons[0]?._id;
      }
    }
    // If leftLessonId exists, resume from there
    if (progress && progress.leftLessonId) {
      const foundModule = course.modules.find((m) =>
        m.lessons.some((l) => l._id === progress.leftLessonId)
      );
      if (foundModule) {
        startModuleId = foundModule._id;
        startLessonId = progress.leftLessonId;
      }
    }
    // Only set current module/lesson if not already set
    if (!currentModuleId || !currentLessonId) {
      setCurrentModuleId(startModuleId);
      setCurrentLessonId(startLessonId);
    }
    // Mark the first lesson as completed if no progress exists for it, but do not update state after
    if (
      !isProgressLoading &&
      !userSelectedLesson &&
      userId &&
      course &&
      startModuleId &&
      startLessonId &&
      progress &&
      !(progress.completedLessons || []).includes(startLessonId) &&
      !firstLessonMarkedRef.current &&
      (!progress.completedLessons || progress.completedLessons.length === 0)
    ) {
      firstLessonMarkedRef.current = true;
      (async () => {
        try {
          await trackProgress({
            userId,
            courseId: course._id,
            lessonId: startLessonId,
            currentModuleId: startModuleId,
            leftLessonId: startLessonId,
          });
          await refetchProgress();
        } catch (e) {
          // Optionally handle error
        }
      })();
    }
  }, [
    course,
    progress,
    isProgressLoading,
    userSelectedLesson,
    trackProgress,
    refetchProgress,
    userId,
    currentModuleId,
    currentLessonId,
  ]);

  useEffect(() => {
    if (showQuiz && currentModuleQuiz) {
      // Try to load previous answers for this quiz
      let prevAnswers = progress?.quizAnswers?.[currentModuleQuiz._id] || {};
      // Initialize all answers to null if not set
      if (currentModuleQuiz?.questions) {
        prevAnswers = { ...prevAnswers };
        currentModuleQuiz.questions.forEach((q) => {
          if (typeof prevAnswers[q._id] === "undefined") {
            prevAnswers[q._id] = null;
          }
        });
      }
      setQuizAnswers(prevAnswers);
      // If quiz is already completed, show results
      const quizAlreadyCompleted = (progress?.completedQuizzes || []).includes(
        currentModuleQuiz._id
      );
      if (quizAlreadyCompleted) {
        setQuizCompleted(true);
        if (currentModuleQuiz?.questions) {
          const results = currentModuleQuiz.questions.map((q) => {
            const userAnswer = prevAnswers[q._id];
            const correctAnswer =
              q.options[q.options.findIndex((opt) => opt === q.answer)];
            return {
              question: q.question,
              userAnswer,
              correctAnswer,
              isCorrect: userAnswer === correctAnswer,
              options: q.options,
            };
          });
          setQuizResults(results);
        }
      } else {
        setQuizCompleted(false);
        setQuizResults(null);
      }
    }
  }, [showQuiz, currentModuleId, progress, currentModuleQuiz]);

  // --- Certificate generation on course completion ---
  useEffect(() => {
    if (showCourseCompleteCongrats && userId && course?._id) {
      createCertificate({ userId, courseId: course._id });
    }
  }, [showCourseCompleteCongrats, userId, course, createCertificate]);

  if (!currentModuleId || !currentLessonId)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  // --- VIDEO EMBED LOGIC FOR VIDEO LESSONS (MODULE FORM STYLE, FIXED) ---
  let videoEmbed = null;
  if (
    currentLesson &&
    (currentLesson.type === "video_url" || currentLesson.type === "video")
  ) {
    const link =
      typeof currentLesson.content === "object"
        ? currentLesson.content.link
        : currentLesson.content;
    const fileUrl =
      typeof currentLesson.content === "object"
        ? currentLesson.content.fileUrl
        : undefined;
    if (link && /youtu\.be|youtube\.com/.test(link)) {
      // YouTube embed
      const match = link.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
      );
      const videoId = match ? match[1] : "";
      videoEmbed = (
        <div className="mt-2">
          {/* <div className="flex gap-2 mb-2 justify-center">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline"
            >
              Open Video in new tab
            </a>
          </div> */}
          <iframe
            width="100%"
            height="460"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded border border-gray-200 w-full"
          />
        </div>
      );
    } else if (
      link &&
      /\.(mp4|webm|ogg|mov|avi|m4v|wmv|mpeg|mpg)$/i.test(link)
    ) {
      // Direct video link
      videoEmbed = (
        <div className="mt-2">
          <div className="flex gap-2 mb-2 justify-center">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline"
            >
              Open Video in new tab
            </a>
          </div>
          <video
            src={link}
            controls
            className="rounded border border-gray-200 w-full"
            style={{ background: "#000", minHeight: "300px" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (fileUrl) {
      // Uploaded file
      videoEmbed = (
        <div className="mt-2">
          <div className="flex gap-2 mb-2 justify-center">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline"
            >
              Open Video in new tab
            </a>
          </div>
          <video
            src={fileUrl}
            controls
            className="rounded border border-gray-200 w-full"
            style={{ background: "#000", minHeight: "400px" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      videoEmbed = (
        <div className="text-red-500">
          Video URL provided, preview not available.
        </div>
      );
    }
  }

  // --- PDF PREVIEW LOGIC ---
  let pdfUrl = null;
  if (currentLesson?.type === "pdf") {
    if (typeof currentLesson.content === "object") {
      pdfUrl = (
        currentLesson.content.fileUrl ||
        currentLesson.content.link ||
        ""
      ).replace(/^http:\/\//i, "https://");
    } else if (typeof currentLesson.content === "string") {
      pdfUrl = currentLesson.content.replace(/^http:\/\//i, "https://");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }
  if (isError || !course)
    return <ErrorMessage error={error} refetch={refetch} />;

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
      case "video_url":
        return <span className="h-4 w-4 text-gray-400">📹</span>;
      case "pdf":
      case "article":
        return <span className="h-4 w-4 text-gray-400">📄</span>;
      default:
        return <span className="h-4 w-4 text-gray-400">📄</span>;
    }
  };

  const goToNextLesson = async () => {
    const currentModuleIndex = course.modules.findIndex(
      (m) => m._id === currentModuleId
    );
    const currentLessonIndex =
      currentModule?.lessons.findIndex((l) => l._id === currentLessonId) || 0;

    // If there are more lessons in the current module, go to the next lesson
    if (
      currentModule &&
      currentLessonIndex < currentModule.lessons.length - 1
    ) {
      const nextLessonId = currentModule.lessons[currentLessonIndex + 1]._id;
      setCurrentLessonId(nextLessonId);
      // Mark this lesson as completed
      if (userId && course && currentModuleId) {
        await trackProgress({
          userId,
          courseId: course._id,
          lessonId: nextLessonId,
          currentModuleId,
          leftLessonId: nextLessonId,
        });
        await refetchProgress();
      }
    }
    // If there's a quiz and it hasn't been completed, show the quiz
    else if (currentModuleQuiz && !quizCompleted && !showQuiz) {
      setShowQuiz(true);
    }
    // Only allow moving to the next module if the current module is fully completed
    else if (currentModuleIndex < course.modules.length - 1) {
      // Check if all lessons and quiz in the current module are completed
      const allLessonsDone = currentModule.lessons.every((l) =>
        (progress?.completedLessons || []).includes(l._id)
      );
      const quizDone = currentModule.quiz
        ? (progress?.completedQuizzes || []).includes(currentModule.quiz._id)
        : true;
      if (allLessonsDone && quizDone) {
        const nextModule = course.modules[currentModuleIndex + 1];
        const firstLessonId = nextModule.lessons[0]?._id;
        setCurrentModuleId(nextModule._id);
        setCurrentLessonId(firstLessonId);
        setShowQuiz(false);
        setQuizCompleted(false);
        // Mark the first lesson of the new module as completed
        if (userId && course) {
          // Wait for state to update before marking as complete
          setTimeout(async () => {
            await trackProgress({
              userId,
              courseId: course._id,
              lessonId: firstLessonId,
              currentModuleId: nextModule._id,
              leftLessonId: firstLessonId,
            });
            await refetchProgress();
          }, 0);
        }
      }
    }
  };

  const goToPreviousLesson = () => {
    const currentModuleIndex = course.modules.findIndex(
      (m) => m._id === currentModuleId
    );
    const currentLessonIndex =
      currentModule?.lessons.findIndex((l) => l._id === currentLessonId) || 0;

    let prevLessonId = null;
    let prevModuleId = null;
    if (currentLessonIndex > 0) {
      prevLessonId = currentModule.lessons[currentLessonIndex - 1]._id;
      prevModuleId = currentModuleId;
      setCurrentLessonId(prevLessonId);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      prevModuleId = prevModule._id;
      prevLessonId = prevModule.lessons[prevModule.lessons.length - 1]?._id;
      setCurrentModuleId(prevModuleId);
      setCurrentLessonId(prevLessonId);
    }
    setShowQuiz(false);
    // Track leftLessonId
    if (userId && course && prevLessonId && prevModuleId) {
      trackProgress({
        userId,
        courseId: course._id,
        currentModuleId: prevModuleId,
        leftLessonId: prevLessonId,
      });
    }
  };

  const submitQuiz = async () => {
    if (quizSubmitting) return;
    setQuizSubmitting(true);
    setQuizLoading(true);
    // Track quiz completion and send answers
    if (userId && course && currentModuleId && currentModuleQuiz?._id) {
      const payload = {
        userId,
        courseId: course._id,
        quizId: currentModuleQuiz._id,
        currentModuleId,
        answers: { ...quizAnswers }, // send as 'answers' for backend
        leftLessonId: null,
      };
      try {
        await trackProgress(payload);
        await refetchProgress();
      } catch (e) {
        console.error("Quiz submit error", e);
      }
    }
    // Evaluate quiz answers
    if (currentModuleQuiz?.questions) {
      const results = currentModuleQuiz.questions.map((q) => {
        const userAnswer = quizAnswers[q._id];
        const correctAnswer =
          q.options[q.options.findIndex((opt) => opt === q.answer)];
        return {
          question: q.question,
          userAnswer,
          correctAnswer,
          isCorrect: userAnswer === correctAnswer,
          options: q.options,
        };
      });
      setQuizResults(results);
    }
    setQuizCompleted(true);
    setQuizSubmitting(false);
    setQuizLoading(false);
  };

  const continueAfterQuiz = () => {
    const currentModuleIndex = course.modules.findIndex(
      (m) => m._id === currentModuleId
    );
    if (currentModuleIndex === course.modules.length - 1) {
      navigate("/lms/my-courses", { state: { refetch: true } });
    } else {
      goToNextLesson();
      setShowQuiz(false);
      setQuizCompleted(false);
    }
  };

  // Module/lesson locking helpers
  const isModuleLocked = (moduleIdx) => {
    if (moduleIdx === 0) return false;
    const prevModule = course.modules[moduleIdx - 1];
    // All lessons in previous module must be completed
    const allLessonsDone = prevModule.lessons.every((l) =>
      (progress?.completedLessons || []).includes(l._id)
    );
    // Quiz in previous module (if any) must be completed
    const quizDone = prevModule.quiz
      ? (progress?.completedQuizzes || []).includes(prevModule.quiz._id)
      : true;
    return !(allLessonsDone && quizDone);
  };
  const isLessonLocked = (moduleIdx, lessonIdx) => {
    if (isModuleLocked(moduleIdx)) return true;
    if (lessonIdx === 0) return false;
    const module = course.modules[moduleIdx];
    // All previous lessons in this module must be completed
    return !module.lessons
      .slice(0, lessonIdx)
      .every((l) => (progress?.completedLessons || []).includes(l._id));
  };
  const isQuizLocked = (moduleIdx) => isModuleLocked(moduleIdx);

  const isCourseCompleted = () => {
    if (!course || !progress) return false;
    const allLessons = course.modules.flatMap((m) =>
      m.lessons.map((l) => l._id)
    );
    const allQuizzes = course.modules
      .filter((m) => m.quiz)
      .map((m) => m.quiz._id);
    const lessonsDone = allLessons.every((id) =>
      (progress.completedLessons || []).includes(id)
    );
    const quizzesDone = allQuizzes.every((id) =>
      (progress.completedQuizzes || []).includes(id)
    );
    return lessonsDone && quizzesDone;
  };

  const incompleteLessons =
    course?.modules?.flatMap((module) =>
      module.lessons
        .filter(
          (lesson) => !(progress?.completedLessons || []).includes(lesson._id)
        )
        .map((lesson) => ({
          moduleTitle: module.title,
          lessonTitle: lesson.title,
        }))
    ) || [];

  const incompleteQuizzes =
    course?.modules
      ?.filter((m) => m.quiz)
      .filter(
        (module) =>
          !(progress?.completedQuizzes || []).includes(module.quiz._id)
      )
      .map((module) => ({
        moduleTitle: module.title,
        quizTitle: module.quiz.title || "Quiz",
      })) || [];

  if (showCourseCompleteCongrats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CourseCompletionPage />
      </div>
    );
  }

  if (!currentModule || (!currentLesson && !showQuiz)) {
    return <div>Course not found</div>;
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="container mx-auto px-4 py-4">
        <div className="">
          {/* Course Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-16 h-12 object-cover rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <div className="flex gap-2 mt-1">
                  {(course.departments || []).map((dept) => (
                    <Badge
                      key={dept._id || dept.id}
                      variant="secondary"
                      className="text-xs bg-primary text-white"
                    >
                      {dept.name}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Course Content */}
            <div className="lg:col-span-8">
              {!showQuiz ? (
                <Card className="">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                        Currently Watching
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {currentLesson?.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {currentModule.title} • Lesson{" "}
                          {currentModule.lessons.findIndex(
                            (l) => l._id === currentLessonId
                          ) + 1}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-6">
                      {/* Lesson Content */}
                      <div className="prose max-w-none">
                        {currentLesson?.type === "article" && (
                          <div className="whitespace-pre-wrap text-gray-700">
                            {currentLesson.content}
                          </div>
                        )}
                        {(currentLesson?.type === "video_url" ||
                          currentLesson?.type === "video") && (
                          <div className="bg-gray-100 rounded-lg p-8 text-center">
                            {videoEmbed}
                          </div>
                        )}
                        {currentLesson?.type === "pdf" && (
                          <div className="bg-gray-100 rounded-lg p-8 text-center">
                            {pdfUrl ? (
                              <>
                                <div className="flex gap-2 mb-2 justify-center">
                                  <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 underline"
                                  >
                                    Open PDF in new tab
                                  </a>
                                  <a
                                    href={pdfUrl}
                                    download
                                    className={`text-xs text-green-600 underline${
                                      pdfError
                                        ? " pointer-events-none opacity-50"
                                        : ""
                                    }`}
                                    tabIndex={pdfError ? -1 : 0}
                                    aria-disabled={pdfError}
                                  >
                                    Download PDF
                                  </a>
                                </div>
                                {!pdfError ? (
                                  <iframe
                                    src={pdfUrl}
                                    title="PDF Preview"
                                    className="rounded border border-gray-200 w-full"
                                    style={{
                                      minHeight: "400px",
                                      background: "#fff",
                                    }}
                                    onError={() => setPdfError(true)}
                                  />
                                ) : (
                                  <div className="text-red-500 mt-4">
                                    PDF could not be loaded for preview.{" "}
                                    <a
                                      href={pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline text-blue-600"
                                    >
                                      Try opening in a new tab
                                    </a>
                                    .
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-red-500">
                                PDF not available for preview or download.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Navigation */}
                      <div className="flex justify-between mt-8 px-8 pb-8">
                        <Button
                          className="flex items-center gap-2"
                          onClick={goToPreviousLesson}
                          disabled={
                            course.modules.findIndex(
                              (m) => m._id === currentModuleId
                            ) === 0 &&
                            (currentModule?.lessons.findIndex(
                              (l) => l._id === currentLessonId
                            ) || 0) === 0
                          }
                          variant="outline"
                        >
                          <ArrowLeft />
                          Previous
                        </Button>
                        {/* Show Finish button only on last lesson of last module */}
                        {(() => {
                          const isLastModule =
                            course.modules.findIndex(
                              (m) => m._id === currentModuleId
                            ) ===
                            course.modules.length - 1;
                          const isLastLesson =
                            currentModule?.lessons.findIndex(
                              (l) => l._id === currentLessonId
                            ) ===
                            currentModule.lessons.length - 1;
                          const lastModuleHasQuiz = !!currentModuleQuiz;
                          if (isLastModule && isLastLesson) {
                            if (lastModuleHasQuiz) {
                              // Show Next to go to quiz
                              return (
                                <Button
                                  onClick={goToNextLesson}
                                  variant="primary"
                                >
                                  Next
                                </Button>
                              );
                            } else {
                              // No quiz, show Finish only if certificate is null
                              return progress?.certificate === null ? (
                                <Button
                                  onClick={() =>
                                    setShowCourseCompleteCongrats(true)
                                  }
                                  variant="primary"
                                >
                                  Finish
                                </Button>
                              ) : null;
                            }
                          } else {
                            return (
                              <Button
                                onClick={goToNextLesson}
                                variant="primary"
                                className="flex items-center gap-2 "
                              >
                                Next
                                <ArrowRight />
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Quiz Component
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2 leading-[1.5] text-center">
                      <span className="h-5 w-5">🏆</span>
                      Module Quiz: {currentModule.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!quizCompleted ? (
                      quizLoading ? (
                        <div className="flex items-center justify-center min-h-screen">
                          <Loader />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {currentModuleQuiz?.questions.map(
                            (question, index) => (
                              <div key={question._id} className="space-y-4">
                                <h3 className="font-medium">
                                  {index + 1}. {question.question}
                                </h3>
                                <div className="space-y-2">
                                  {question.options.map((option, idx) => (
                                    <div
                                      className="flex items-center space-x-2"
                                      key={idx}
                                    >
                                      <input
                                        type="radio"
                                        id={`${question._id}-${idx}`}
                                        name={question._id}
                                        value={JSON.stringify(option)}
                                        checked={
                                          typeof quizAnswers[question._id] !==
                                            "undefined" &&
                                          JSON.stringify(
                                            quizAnswers[question._id]
                                          ) === JSON.stringify(option)
                                        }
                                        onChange={(e) =>
                                          setQuizAnswers((prev) => ({
                                            ...prev,
                                            [question._id]: JSON.parse(
                                              e.target.value
                                            ),
                                          }))
                                        }
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <label
                                        htmlFor={`${question._id}-${idx}`}
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                          <Button
                            onClick={submitQuiz}
                            disabled={
                              quizSubmitting ||
                              Object.keys(quizAnswers).length !==
                                currentModuleQuiz?.questions.length
                            }
                            className="w-full"
                          >
                            {quizSubmitting ? "Submitting..." : "Submit Quiz"}
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="space-y-6">
                        {isCourseCompleted() && !showCourseCompleteCongrats ? (
                          <div className="flex flex-col items-center justify-center min-h-[20vh]">
                            <span className="h-16 w-16 text-green-600 mx-auto block text-6xl">
                              ✓
                            </span>
                            <h3 className="text-xl font-semibold">
                              Quiz Completed!
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Great job! You have completed this course.
                            </p>
                            {/* Only show Finish Course button if certificate is null */}
                            {progress?.certificate === null && (
                              <Button
                                onClick={() =>
                                  setShowCourseCompleteCongrats(true)
                                }
                                className="mt-2"
                              >
                                Finish Course
                              </Button>
                            )}
                          </div>
                        ) : isCourseCompleted() &&
                          showCourseCompleteCongrats ? (
                          <div className="flex flex-col items-center justify-center min-h-[20vh]">
                            <div className="text-4xl mb-4">🎉</div>
                            <div className="text-2xl font-bold mb-2">
                              Congratulations!
                            </div>
                            <div className="text-lg mb-6">
                              You have completed this course.
                            </div>
                            <Button
                              onClick={() =>
                                navigate("/lms/my-courses", {
                                  state: { refetch: true },
                                })
                              }
                            >
                              Go to My Courses
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <span className="h-16 w-16 text-green-600 mx-auto block text-6xl">
                              ✓
                            </span>
                            <h3 className="text-xl font-semibold">
                              Quiz Completed!
                            </h3>
                            <p className="text-gray-600">
                              Great job! You can now continue to the next
                              module.
                            </p>
                          </div>
                        )}
                        {quizResults && (
                          <div className="mt-8">
                            <h4 className="text-lg font-semibold mb-4">
                              Quiz Review
                            </h4>
                            <ul className="space-y-4">
                              {quizResults.map((result, idx) => (
                                <li key={idx} className="border rounded-lg p-4">
                                  <div className="font-medium mb-2">
                                    {idx + 1}. {result.question}
                                  </div>
                                  <div className="mb-1">
                                    <span
                                      className={
                                        result.isCorrect
                                          ? "text-green-600"
                                          : "text-red-600 font-semibold"
                                      }
                                    >
                                      Your answer:{" "}
                                      {result.userAnswer || (
                                        <span className="italic text-gray-400">
                                          No answer
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  {!result.isCorrect && (
                                    <div className="text-blue-600">
                                      Correct answer: {result.correctAnswer}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {/* Next button for quiz navigation */}
                            {(() => {
                              const currentModuleIndex =
                                course.modules.findIndex(
                                  (m) => m._id === currentModuleId
                                );
                              const isLastModule =
                                currentModuleIndex ===
                                course.modules.length - 1;
                              if (!isLastModule) {
                                return (
                                  <Button
                                    className="mt-6 w-full"
                                    onClick={() => {
                                      goToNextLesson();
                                      setShowQuiz(false);
                                      setQuizCompleted(false);
                                    }}
                                  >
                                    Next
                                  </Button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Course Sidebar */}
            <div className="lg:col-span-4">
              <Card className="h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-base">Course Content</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-5">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={module._id} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-5">
                          {module.lessons.map((lesson, lessonIndex) => {
                            const isCompleted = (
                              progress?.completedLessons || []
                            ).includes(lesson._id);
                            return (
                              <button
                                key={lesson._id}
                                onClick={async () => {
                                  if (isLessonLocked(moduleIndex, lessonIndex))
                                    return;
                                  setUserSelectedLesson(true);
                                  if (isModuleLocked(moduleIndex)) {
                                    setUnlockingModule(true);
                                    setUnlockingMessage(
                                      "Unlocking, please wait..."
                                    );
                                    setCurrentModuleId(module._id);
                                    setCurrentLessonId(lesson._id);
                                    setShowQuiz(false);
                                    try {
                                      await trackProgress({
                                        userId,
                                        courseId: course._id,
                                        currentModuleId: module._id,
                                        leftLessonId: lesson._id,
                                      });
                                      await refetchProgress();
                                    } catch (err) {
                                      toast.error(
                                        "Unlock Failed",
                                        err?.message ||
                                          "Could not unlock module. Please try again."
                                      );
                                    } finally {
                                      setUnlockingModule(false);
                                      setUnlockingMessage("");
                                    }
                                  } else {
                                    setCurrentModuleId(module._id);
                                    setCurrentLessonId(lesson._id);
                                    setShowQuiz(false);
                                    await trackProgress({
                                      userId,
                                      courseId: course._id,
                                      lessonId: lesson._id,
                                      currentModuleId: module._id,
                                      leftLessonId: lesson._id,
                                    });
                                    await refetchProgress();
                                  }
                                }}
                                className={`w-full px-6 py-2 text-left text-base flex items-center gap-2 hover:bg-primary/90 hover:text-white rounded-lg shadow-sm shadow-primary border border-slate-50 h-16 ${
                                  lesson._id === currentLessonId
                                    ? "bg-primary text-white"
                                    : isLessonLocked(moduleIndex, lessonIndex)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "text-gray-600"
                                }`}
                                disabled={
                                  isLessonLocked(moduleIndex, lessonIndex) ||
                                  unlockingModule
                                }
                              >
                                {getLessonIcon(lesson.type)}
                                <span className="flex-1">
                                  {lesson.title?.length > 85
                                    ? lesson.title.slice(0, 85) + "..."
                                    : lesson.title}
                                </span>
                                <span
                                  className={`ml-2 text-xs ${
                                    isCompleted
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {isCompleted ? "✓" : "○"}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-col gap-3">
                          {module.quiz &&
                            (() => {
                              const isQuizCompleted = (
                                progress?.completedQuizzes || []
                              ).includes(module.quiz._id);
                              return (
                                <button
                                  onClick={() => {
                                    if (isQuizLocked(moduleIndex)) return;
                                    setCurrentModuleId(module._id);
                                    setShowQuiz(true);
                                  }}
                                  className={`w-full px-6 py-2 text-left text-base flex items-center gap-2 hover:bg-primary/90 hover:text-white rounded-lg shadow-sm shadow-primary h-16 mb-5 ${
                                    showQuiz && module._id === currentModuleId
                                      ? "bg-primary text-white"
                                      : isQuizLocked(moduleIndex)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "text-gray-600"
                                  }`}
                                  disabled={isQuizLocked(moduleIndex)}
                                >
                                  <span className="h-4 w-4">🏆</span>
                                  <span>Module Quiz</span>
                                  <span
                                    className={`ml-2 text-xs ${
                                      isQuizCompleted
                                        ? "text-green-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {isQuizCompleted ? "✓" : "○"}
                                  </span>
                                </button>
                              );
                            })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {unlockingModule && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40">
              <div className="flex items-center justify-center min-h-screen">
                <Loader />
              </div>
              <div className="mt-4 text-white text-lg font-semibold drop-shadow-lg">
                {unlockingMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
