"use client"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import Thumbnail from "@/assets/Thumbnail.png"
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card"
import { Badge } from "@/component/badge"
import { Progress } from "@/component/Progress"
import Button from "@/component/Button"
import { BookOpen, Clock, Award, Play, TrendingUp, CircleAlert } from "lucide-react"
import { useSelector } from "react-redux"
import {
  useGetUserSummariesQuery,
  useTrackProgressMutation,
  useLazyGetCertificateQuery,
} from "@/redux/features/lms/lmsApiSlice"
import { toast } from "@/component/Toast"
import Loader from "@/component/Loader"
import ErrorMessage from "@/component/isError"
import Modal from "@/component/Modal"
import html2canvas from "html2canvas"
import { Facebook, Twitter, Linkedin, Download, LinkIcon, MessageCircle } from "lucide-react"
import * as pdfjsLib from "pdfjs-dist"
import LazyImage from "@/utils/LazyImage"
import Tooltips from "@/component/Tooltip2"
import useIsMobile from "@/hook/useIsMobile"
import Pagination from "@/component/Pagination"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function StudentDashboard() {
  const isMobile = useIsMobile()
  const [triggerDownload] = useLazyGetCertificateQuery()
  const [showPreview, setShowPreview] = useState(false)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [certificateUrl, setCertificateUrl] = useState("")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState("")

  // Tab and pagination state
  const [activeTab, setActiveTab] = useState("available")
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Get user info from Redux (userSlice)
  const user = useSelector((state) => state.userSlice.user)
  const userId = user?.user?._id
  const userPrimaryColor = user?.user?.primaryColor || "primary"

  // Try to get departmentId from user object
  const departmentId = user?.user?.department?._id || user?.user?.department || ""
  const location = useLocation()

  // Fetch courses from API
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserSummariesQuery({ userId, departmentId }, { skip: !userId || !departmentId })

  // Refetch if navigated with refetch flag
  useEffect(() => {
    if (location.state?.refetch) {
      refetch()
    }
  }, [location.state, refetch])

  // Reset pagination when tab changes or limit changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, limit])

  const handleDownload = async (courseId) => {
    try {
      const result = await triggerDownload({ userId, courseId }).unwrap()
      // If backend returns an object with a url property
      if (result && typeof result === "object" && typeof result.url === "string" && result.url.startsWith("http")) {
        // Fetch the file as a blob to force download, never open in new tab
        const response = await fetch(result.url)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `Certificate-${courseId}.pdf`
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        toast.success("Download started", "Your certificate is being downloaded.")
        return
      }

      // If backend returns a direct URL string
      if (typeof result === "string" && result.startsWith("http")) {
        // Fetch the file as a blob to force download, never open in new tab
        const response = await fetch(result)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `Certificate-${courseId}.pdf`
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        toast.success("Download started", "Your certificate is being downloaded.")
        return
      }

      // Fallback for Blob (old behavior)
      if (result instanceof Blob) {
        const blobUrl = URL.createObjectURL(result)
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `Certificate-${courseId}.pdf`
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        toast.success("Download started", "Your certificate is being downloaded.")
        return
      }

      // If neither, show error
      console.error("Invalid certificate response:", result)
      toast.error("Invalid file", "Server did not return a valid certificate.")
    } catch (err) {
      console.error("Download failed:", err)
      toast.error("Download failed", "Unable to fetch certificate.")
    }
  }

  // Fetch certificate for preview
  const handlePreview = async (course) => {
    setIsLoadingPreview(true)
    setPreviewCourse(course)
    setShowPreview(true)
    try {
      const result = await triggerDownload({
        userId,
        courseId: course.id,
      }).unwrap()
      let url = ""
      if (result && typeof result === "object" && typeof result.url === "string" && result.url.startsWith("http")) {
        url = result.url
      } else if (typeof result === "string" && result.startsWith("http")) {
        url = result
      } else if (result instanceof Blob) {
        url = URL.createObjectURL(result)
      }
      setCertificateUrl(url)
    } catch {
      toast.error("Preview failed", "Unable to fetch certificate.")
      setCertificateUrl("")
    } finally {
      setIsLoadingPreview(false)
    }
  }

  // Print handler
  const handlePrint = () => {
    if (!certificateUrl) return
    const win = window.open(certificateUrl, "_blank")
    if (win) {
      win.addEventListener("load", () => {
        win.print()
      })
    }
  }

  // Share handler
  const handleShare = async () => {
    if (navigator.share && certificateUrl) {
      try {
        await navigator.share({
          title: `Certificate - ${previewCourse?.title}`,
          url: certificateUrl,
        })
      } catch {
        // Optionally handle error or ignore
      }
    } else {
      toast.error("Share not supported", "Your browser does not support sharing.")
    }
  }

  // Helper to convert PDF to image (returns dataUrl)
  const pdfToImage = async (pdfUrl) => {
    try {
      let loadingTask
      if (pdfUrl) {
        const response = await fetch(pdfUrl)
        const arrayBuffer = await response.arrayBuffer()
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        // console.log("PDF loading task created", loadingTask)
      } else {
        loadingTask = pdfjsLib.getDocument(pdfUrl)
      }
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: context, viewport }).promise
      // console.log("PDF rendered to canvas", canvas)
      return canvas.toDataURL("image/png")
    } catch (e) {
      if (e && e.message && e.message.toLowerCase().includes("cors")) {
        toast.error("CORS error: PDF server does not allow access. Please use a local or CORS-enabled PDF.")
      } else {
        toast.error("Failed to convert PDF to image")
      }
      return null
    }
  }

  // Update handleCaptureAsPng to support PDF
  const handleCaptureAsPng = async () => {
    if (!certificateUrl) return null
    if (certificateUrl.endsWith(".pdf") || certificateUrl.includes(".pdf?") || certificateUrl.includes(".pdf#")) {
      // Convert PDF to image
      return await pdfToImage(certificateUrl)
    }
    // Try to capture the iframe's content (works only if same-origin)
    const iframe = document.querySelector("iframe[title='Certificate Preview']")
    if (!iframe) {
      toast.error("No certificate preview found")
      return
    }
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      const body = iframeDoc.body
      const canvas = await html2canvas(body)
      const dataUrl = canvas.toDataURL("image/png")
      setShareImageUrl(dataUrl)
      return dataUrl
    } catch (e) {
      toast.error("Unable to capture certificate as image. Only same-origin content can be captured.")
      return null
    }
  }

  // Social share handlers
  const handleSocialShare = async (platform) => {
    const dataUrl = await handleCaptureAsPng()
    // console.log("dataUrl for social share:", dataUrl)
    if (!dataUrl) return
    // Download PNG for user to upload manually
    if (platform === "download") {
      // console.log("Downloading image...")
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `Certificate-${previewCourse?.title || "certificate"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
    // Copy link to clipboard
    if (platform === "copy") {
      await navigator.clipboard.writeText(certificateUrl)
      toast.success("Link copied to clipboard")
      return
    }
    // Social share links (cannot upload image directly)
    const shareUrl = window.location.href
    const text = `Check out my certificate for ${previewCourse?.title || "a course"}!`
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
        "_blank",
      )
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`, "_blank")
    }
  }

  // Defensive fallback for empty data
  const courseList = Array.isArray(courses?.data) ? courses?.data : []

  // Filter logic (same as before, but using API data)
  const enrolledCourses = courseList.filter((course) => course.enrolled)
  const availableCourses = courseList.filter((course) => !course.enrolled)
  const completedCourses = courseList.filter((course) => course.completed)

  // console.log(availableCourses)

  const totalProgress =
    enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolledCourses.length)
      : 0

  const [trackProgress, { isLoading: isEnrolling }] = useTrackProgressMutation()

  // Get current tab data and pagination
  const getCurrentTabData = () => {
    switch (activeTab) {
      case "continue":
        return enrolledCourses.filter((course) => !course.completed)
      case "available":
        return availableCourses
      case "completed":
        return completedCourses
      default:
        return []
    }
  }

  const currentTabData = getCurrentTabData()
  const totalPages = Math.ceil(currentTabData.length / limit)
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const currentItems = currentTabData.slice(startIndex, endIndex)

  // Tab configuration
  const tabs = [
    {
      id: "continue",
      label: "Continue Learning",
      count: enrolledCourses.filter((course) => !course.completed).length,
      show: enrolledCourses.filter((course) => !course.completed).length > 0,
    },
    {
      id: "available",
      label: "Available Modules",
      count: availableCourses.length,
      show: true,
    },
    {
      id: "completed",
      label: "Completed Courses",
      count: completedCourses.length,
      show: completedCourses.length > 0,
    },
  ]

  const visibleTabs = tabs.filter((tab) => tab.show)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (isError) {
    return <ErrorMessage error={error} refetch={refetch} />
  }

  if (!userId || !departmentId) {
    return (
      <div className="flex justify-center items-center h-64 text-xl text-red-500">User or department not found.</div>
    )
  }

  // Render course card based on type
  const renderCourseCard = (course, type) => {
    if (type === "continue") {
      return (
        <div
          key={course.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <LazyImage
              src={course.thumbnail || Thumbnail}
              className="w-full h-48 object-cover rounded-lg mb-3"
              alt={course.title}
            />
            <h3 className="font-semibold mb-2">{course.title}</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {course.departments.map((dept) => (
                <Badge key={dept} variant="secondary" className="text-xs">
                  {dept}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
              </div>
              <Progress value={course.progress} />
            </div>
          </div>
          <Link to={`/lms/course-view/${course.id}`}>
            <Button className="w-full">Continue Learning</Button>
          </Link>
        </div>
      )
    }

    if (type === "available") {
      return (
        <div
          key={course.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <LazyImage
              src={course.thumbnail || Thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{course.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {course.departments.map((dept) => (
                <Badge key={dept} variant="secondary" className="text-xs">
                  {dept}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.modules} modules</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            disabled={isEnrolling}
            onClick={async () => {
              try {
                const firstModuleId =
                  Array.isArray(course.modules) &&
                  course.modules.length > 0 &&
                  (course.modules[0]._id || course.modules[0].id)
                await trackProgress({
                  userId,
                  courseId: course.id,
                  currentModuleId: firstModuleId,
                }).unwrap()
                toast.success("Enrolled!", "You have enrolled successfully.")
                refetch()
                setActiveTab("continue")
              } catch {
                toast.error("Failed", "Failed to enroll. Please try again.")
              }
            }}
          >
            {isEnrolling ? "Enrolling..." : "Enroll Now"}
          </Button>
        </div>
      )
    }

    if (type === "completed") {
      // console.log("Courses", course)
      return (
        <div
          key={course.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <LazyImage
              src={course.thumbnail || Thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold mb-2">{course.title}</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {course.departments.map((dept) => (
                <Badge key={dept} variant="secondary" className="text-xs">
                  {dept}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Completed</span>
            </div>
          </div>
          <div>
            <Link to={`/lms/course-view/${course.id}`}>
              <Button variant="outline" className="w-full bg-transparent">
                Review Course
              </Button>
            </Link>
            <div className="mt-2">
              {course?.approvedCertificate ? (<Button onClick={() => handlePreview(course)} className="mt-2 w-full">
                Preview Certificate
              </Button>)
                : (
                  <button
                    disabled
                    className="mt-2 w-full bg-gray-200 rounded-full py-2 text-gray-600  font-semibold cursor-not-allowed"
                  >
                    Certificate Pending for Approval
                  </button>
                )

              }
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              My Learning Dashboard
            </h1>
            <div className="ml-2 pt-2 mb-2 cursor-pointer">
              <Tooltips
                text="Track your enrolled modules and learning progress.Continue unfinished courses or start new ones anytime.See your completion stats and available modules to join.Download certificates and share your achievements easily."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"/>
              </Tooltips>
            </div>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Track your progress and continue learning
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Modules
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedCourses.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProgress}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {availableCourses.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap gap-1 border-b">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text- font-semibold transition-colors relative ${
                    activeTab === tab.id
                      ? `text-${userPrimaryColor} border-b-2 border-${userPrimaryColor}`
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {/* Tab Content */}
            {currentItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">
                  {activeTab === "continue" && "No courses in progress"}
                  {activeTab === "available" &&
                    "No available courses at the moment"}
                  {activeTab === "completed" && "No completed courses yet"}
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === "available" &&
                    "Check back later for new modules"}
                  {activeTab === "continue" &&
                    "Enroll in a course to start learning"}
                  {activeTab === "completed" &&
                    "Complete a course to see it here"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {currentItems.map((course) =>
                    renderCourseCard(course, activeTab)
                  )}
                </div>

                {/* Pagination */}
                {currentTabData.length > limit && (
                  <div className="mt-6 px-4 sm:px-0">
                    <Pagination
                      currentCount={currentItems.length}
                      totalCount={currentTabData.length}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      limit={limit}
                      setLimit={setLimit}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Certificate Preview Modal */}
        <Modal
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            setCertificateUrl("");
          }}
        >
          <div className="flex flex-col items-center gap-4 w-full h-full py-6 m-0">
            <h2 className="text-xl font-bold mb-2">Certificate Preview</h2>
            {isLoadingPreview ? (
              <div className="py-12">Loading preview...</div>
            ) : certificateUrl ? (
              <div className="w-full h-[70vh] flex-1">
                <iframe
                  src={
                    certificateUrl.endsWith(".pdf") ||
                    certificateUrl.includes(".pdf?") ||
                    certificateUrl.includes(".pdf#")
                      ? `${certificateUrl}${
                          certificateUrl.includes("#") ? "&" : "#"
                        }toolbar=0`
                      : certificateUrl
                  }
                  title="Certificate Preview"
                  className="w-full h-full border-0 rounded-lg"
                  style={{ minHeight: "63vh", minWidth: "100%" }}
                />
              </div>
            ) : (
              <div className="text-red-500">
                Unable to load certificate preview.
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <Button
                onClick={handlePrint}
                disabled={!certificateUrl}
                variant="outline"
              >
                Print
              </Button>
              <Button
                onClick={() => handleDownload(previewCourse?.id)}
                disabled={!certificateUrl}
              >
                Download
              </Button>
              <Button
                onClick={() => setShowShareModal(true)}
                disabled={!certificateUrl}
                variant="outline"
              >
                Share
              </Button>
            </div>
          </div>
        </Modal>

        {/* Share Modal */}
        <Modal open={showShareModal} onClose={() => setShowShareModal(false)}>
          <div className="flex flex-col items-center gap-4 p-6">
            <h2 className="text-lg font-bold mb-2">Share your certificate</h2>
            <div className="flex gap-6 text-2xl">
              <button
                title="Facebook"
                onClick={() => handleSocialShare("facebook")}
              >
                {" "}
                <Facebook className="text-blue-600 hover:scale-110" />{" "}
              </button>
              <button
                title="Twitter"
                onClick={() => handleSocialShare("twitter")}
              >
                {" "}
                <Twitter className="text-blue-400 hover:scale-110" />{" "}
              </button>
              <button
                title="LinkedIn"
                onClick={() => handleSocialShare("linkedin")}
              >
                {" "}
                <Linkedin className="text-blue-700 hover:scale-110" />{" "}
              </button>
              <button
                title="WhatsApp"
                onClick={() => handleSocialShare("whatsapp")}
              >
                {" "}
                <MessageCircle className="text-green-500 hover:scale-110" />{" "}
              </button>
              <button
                title="Download as PNG"
                onClick={() => handleSocialShare("download")}
              >
                {" "}
                <Download className="text-gray-700 hover:scale-110" />{" "}
              </button>
              <button
                title="Copy Link"
                onClick={() => handleSocialShare("copy")}
              >
                {" "}
                <LinkIcon className="text-gray-700 hover:scale-110" />{" "}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              * Social platforms do not support direct image upload via share
              dialog. Download the PNG and upload it manually if needed.
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
