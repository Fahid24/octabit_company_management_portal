import { Card, CardContent, CardHeader, CardTitle } from "@/component/card"
import { Badge } from "@/component/badge"
import { BookOpen, Clock, Award, Play, FileText, Video } from "lucide-react"

export function CoursePreview({ data, showActions = true, departmentsList = [] }) {
  // console.log("CoursePreview data:", data)
  const totalLessons = data.modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const totalQuizzes = data.quizzes.length

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "article":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Helper to embed YouTube/Vimeo links
  const getVideoEmbed = (url) => {
    if (typeof url !== 'string') return null;
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (ytMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="YouTube Video"
        />
      );
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="Vimeo Video"
        />
      );
    }
    // Direct video file (mp4, webm, ogg, etc.)
    if (/\.(mp4|webm|ogg)$/i.test(url)) {
      return (
        <video
          src={url}
          controls
          className="rounded border border-gray-200 w-full h-full"
          style={{ width: '100%', height: '100%', background: '#000' }}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    // Add more platforms as needed
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Module Preview</h2>
        <p className="text-gray-600">Review your module before publishing</p>
      </div>

      {/* Course Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              {data.thumbnail ? (
                <img
                  src={data.thumbnail || "/placeholder.svg"}
                  alt={data.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{data.title || "Module Title"}</h1>
              <p className="text-gray-600 mb-3">{data.summary || "Module summary"}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {data.departments.map((dept) => {
                  let deptName = "";
                  if (typeof dept === "object" && dept !== null) {
                    deptName = dept.name;
                  } else if (typeof dept === "string") {
                    deptName = departmentsList.find((d) => d._id === dept || d.id === dept)?.name || dept;
                  }
                  return (
                    <Badge key={typeof dept === 'object' && dept !== null ? dept._id || dept.id : dept} variant="secondary">
                      {deptName}
                    </Badge>
                  );
                })}
                <Badge variant="outline">{data.level}</Badge>
                <Badge variant="outline">{data.language}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{data.modules.length}</div>
            <div className="text-sm text-gray-600">Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{totalLessons}</div>
            <div className="text-sm text-gray-600">Lessons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <div className="text-sm text-gray-600">Quizzes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">~{Math.max(1, Math.ceil(totalLessons * 0.5))}h</div>
            <div className="text-sm text-gray-600">Duration</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Description */}
      <Card>
        <CardHeader>
          <CardTitle>Module Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{data.description || "No description provided"}</p>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Module Content</CardTitle>
        </CardHeader>
        <CardContent>
          {data.modules.length === 0 ? (
            <p className="text-gray-500">No modules added yet</p>
          ) : (
            <div className="space-y-4">
              {data.modules.map((module, moduleIndex) => {
                const moduleQuiz = data.quizzes.find((q) => q.moduleId === module.id)

                return (
                  <div key={module.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">
                      Module {moduleIndex + 1}: {module.title || "Untitled Module"}
                    </h3>

                    {module.lessons.length === 0 ? (
                      <p className="text-gray-500 text-sm">No lessons added</p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              {getLessonIcon(lesson.type)}
                              <span>
                                Lesson {lessonIndex + 1}: {lesson.title || "Untitled Lesson"}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type.replace("_", " ")}
                              </Badge>
                            </div>
                            {lesson.type === "video" && lesson.content && (
                              (() => {
                                // If content is an object
                                if (typeof lesson.content === "object" && (lesson.content.fileUrl || lesson.content.link)) {
                                  if (lesson.content.fileUrl) {
                                    return (
                                      <div className="mt-2">
                                        <video
                                          src={lesson.content.fileUrl}
                                          controls
                                          className="rounded border border-gray-200 w-full h-full"
                                          style={{ width: '100%', height: '100%', background: '#000' }}
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                        {lesson.content.name && (
                                          <div className="text-xs text-gray-600 mt-1">{lesson.content.name}</div>
                                        )}
                                      </div>
                                    );
                                  }
                                  if (lesson.content.link) {
                                    return (
                                      <div className="mt-2">
                                        {getVideoEmbed(lesson.content.link) ? (
                                          <div className="aspect-video w-full rounded border border-gray-200 overflow-hidden">
                                            {getVideoEmbed(lesson.content.link)}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-500">Video URL provided, preview not available.</div>
                                        )}
                                      </div>
                                    );
                                  }
                                }
                                // If content is a string (direct link or fileUrl)
                                if (typeof lesson.content === "string" && lesson.content) {
                                  // Try to embed or play as video
                                  if (/youtu\.be|youtube\.com|vimeo\.com/.test(lesson.content)) {
                                    return (
                                      <div className="mt-2">
                                        {getVideoEmbed(lesson.content) ? (
                                          <div className="aspect-video w-full rounded border border-gray-200 overflow-hidden">
                                            {getVideoEmbed(lesson.content)}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-500">Video URL provided, preview not available.</div>
                                        )}
                                      </div>
                                    );
                                  }
                                  if (/\.(mp4|webm|ogg|mov|avi|m4v|wmv|mpeg|mpg)$/i.test(lesson.content)) {
                                    return (
                                      <div className="mt-2">
                                        <video
                                          src={lesson.content}
                                          controls
                                          className="rounded border border-gray-200 w-full h-full"
                                          style={{ width: '100%', height: '100%', background: '#000' }}
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                      </div>
                                    );
                                  }
                                }
                                return null;
                              })()
                            )}
                            {/* PDF preview logic updated to handle object and string */}
                            {lesson.type === "pdf" && lesson.content && (
                              (() => {
                                // If content is an object
                                if (typeof lesson.content === "object" && (lesson.content.fileUrl || lesson.content.link)) {
                                  const pdfUrl = lesson.content.fileUrl || lesson.content.link;
                                  return (
                                    <div className="mt-2">
                                      <iframe
                                        src={pdfUrl}
                                        className="rounded border border-gray-200 w-full"
                                        style={{ width: '100%', height: '400px', background: '#fff' }}
                                        title={lesson.content.name || "PDF Preview"}
                                      />
                                      {lesson.content.name && (
                                        <div className="text-xs text-gray-600 mt-1">{lesson.content.name}</div>
                                      )}
                                    </div>
                                  );
                                }
                                // If content is a string (direct link or fileUrl)
                                if (typeof lesson.content === "string" && lesson.content) {
                                  return (
                                    <div className="mt-2">
                                      <iframe
                                        src={lesson.content}
                                        className="rounded border border-gray-200 w-full"
                                        style={{ width: '100%', height: '400px', background: '#fff' }}
                                        title="PDF Preview"
                                      />
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {moduleQuiz && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Award className="h-4 w-4" />
                          <span>Quiz: {moduleQuiz.questions.length} questions</span>
                        </div>
                        <ul className="mt-2 ml-4 list-disc text-gray-700 text-sm">
                          {moduleQuiz.questions.map((q, i) => (
                            <li key={q.id || i}>
                              <div><b>Q{i+1}:</b> {q.question}</div>
                              <div className="ml-2">A: {q[`option${q.answer}`]}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      
    </div>
  )
}