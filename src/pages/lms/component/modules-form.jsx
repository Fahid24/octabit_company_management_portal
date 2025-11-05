"use client"

import { useState } from "react"
import { FloatingInput } from "@/component/FloatiingInput"
import { FloatingTextarea } from "@/component/FloatingTextarea"
import { Card, CardContent, CardHeader } from "@/component/card"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import Button from "@/component/Button"
import { FileUpload } from "@/component/FileUpload"

export function ModulesForm({ data, updateData, validationErrors = {} }) {
  const [expandedModules, setExpandedModules] = useState([])

  const addModule = () => {
    const newModule = {
      id: Date.now().toString(),
      title: "",
      lessons: [],
    }
    updateData({ modules: [...data.modules, newModule] })
    setExpandedModules([...expandedModules, newModule.id])
  }

  const updateModule = (moduleId, updates) => {
    const updatedModules = data.modules.map((module) => (module.id === moduleId ? { ...module, ...updates } : module))
    updateData({ modules: updatedModules })
  }

  const deleteModule = (moduleId) => {
    updateData({ modules: data.modules.filter((m) => m.id !== moduleId) })
    setExpandedModules(expandedModules.filter((id) => id !== moduleId))
  }

  const addLesson = (moduleId) => {
    const newLesson = {
      id: Date.now().toString(),
      title: "",
      type: "article",
      content: "",
    }
    const updatedModules = data.modules.map((module) =>
      module.id === moduleId ? { ...module, lessons: [...module.lessons, newLesson] } : module,
    )
    updateData({ modules: updatedModules })
  }

  const updateLesson = (moduleId, lessonId, updates) => {
    const updatedModules = data.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            lessons: module.lessons.map((lesson) => (lesson._id === lessonId || lesson.id === lessonId ? { ...lesson, ...updates } : lesson)),
          }
        : module,
    )
    updateData({ modules: updatedModules })
  }

  const deleteLesson = (moduleId, lessonId) => {
    const updatedModules = data.modules.map((module) =>
      module.id === moduleId ? { ...module, lessons: module.lessons.filter((l) => (l.id !== lessonId && l._id !== lessonId)) } : module,
    )
    updateData({ modules: updatedModules })
  }

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Modules</h3>
      </div>

      {data.modules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No modules added yet. Click "Add Module" to get started.
          <div className="flex justify-center mt-6">
            <Button onClick={addModule} className="w-full max-w-xs">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.modules.map((module, moduleIndex) => (
            <Card key={module.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleModule(module.id)}>
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <FloatingInput
                      value={module.title}
                      onChange={(e) => updateModule(module.id, { title: e.target.value })}
                      label={`Module ${moduleIndex + 1} Title`}
                      className="font-semibold"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteModule(module.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {expandedModules.includes(module.id) && (
                <CardContent>
                  <div className="space-y-4">
                    <span className="text-sm font-medium">Lessons</span>

                    {module.lessons.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">No lessons added yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson._id || lesson.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <FloatingInput
                                value={lesson.title}
                                onChange={(e) => updateLesson(module.id, lesson._id || lesson.id, { title: e.target.value })}
                                label={`Lesson ${lessonIndex + 1} Title`}
                                className="flex-1"
                              />
                              <FloatingInput
                                type="select"
                                value={lesson.type}
                                onChange={(e) => updateLesson(module.id, lesson._id || lesson.id, { type: e.target.value })}
                                label="Type"
                                options={[
                                  { label: "Video", value: "video" },
                                  { label: "PDF", value: "pdf" },
                                  { label: "Article", value: "article" },
                                ]}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteLesson(module.id, lesson._id || lesson.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div> 

                            <div className="pt-5">
                              {lesson.type === "pdf" ? (
                                lesson.content && (lesson.content.fileUrl || lesson.content.link) ? (
                                  <div className="mt-2">
                                    <div className="flex gap-2 mb-2">
                                      <a
                                        href={lesson.content.fileUrl || lesson.content.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 underline"
                                      >
                                        Open PDF in new tab
                                      </a>
                                      <button
                                        type="button"
                                        className="text-xs text-red-600 underline"
                                        onClick={() => updateLesson(module.id, lesson._id || lesson.id, { content: "" })}
                                      >
                                        Remove PDF
                                      </button>
                                    </div>
                                    <iframe
                                      src={lesson.content.fileUrl || lesson.content.link}
                                      title="PDF Preview"
                                      className="rounded border border-gray-200 w-full"
                                      style={{ minHeight: '400px' }}
                                    />
                                  </div>
                                ) : (
                                  <FileUpload
                                    label="Upload PDF File"
                                    accept=".pdf"
                                    value={lesson.content}
                                    onChange={(file) => updateLesson(module.id, lesson._id || lesson.id, { content: file || "" })}
                                    isMultiFile={false}
                                    required={false}
                                      onFileClick={(file) => {
                                        if (file?.fileUrl) {
                                          window.open(file.fileUrl, "_blank");
                                        } else {
                                          console.warn("No file URL available.");
                                        }
                                      }}
                                  />
                                )
                              ) : lesson.type === "video" ? (
                                lesson.content && ((typeof lesson.content === 'object' && (lesson.content.fileUrl || lesson.content.link)) || typeof lesson.content === 'string') ? (
                                  (() => {
                                    // Handle YouTube link
                                    const link = typeof lesson.content === 'object' ? lesson.content.link : lesson.content;
                                    const fileUrl = typeof lesson.content === 'object' ? lesson.content.fileUrl : undefined;
                                    if (link && /youtu\.be|youtube\.com/.test(link)) {
                                      // YouTube embed
                                      const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                                      const videoId = match ? match[1] : '';
                                      return (
                                        <div className="mt-2">
                                          <div className="flex gap-2 mb-2">
                                            <a
                                              href={link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 underline"
                                            >
                                              Open Video in new tab
                                            </a>
                                            <button
                                              type="button"
                                              className="text-xs text-red-600 underline"
                                              onClick={() => updateLesson(module.id, lesson._id || lesson.id, { content: "" })}
                                            >
                                              Remove Link
                                            </button>
                                          </div>
                                          <iframe
                                            width="100%"
                                            height="360"
                                            src={`https://www.youtube.com/embed/${videoId}`}
                                            title="YouTube video preview"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded border border-gray-200 w-full"
                                          />
                                        </div>
                                      );
                                    } else if (link && /\.(mp4|webm|ogg|mov|avi|m4v|wmv|mpeg|mpg)$/i.test(link)) {
                                      // Direct video link
                                      return (
                                        <div className="mt-2">
                                          <div className="flex gap-2 mb-2">
                                            <a
                                              href={link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 underline"
                                            >
                                              Open Video in new tab
                                            </a>
                                            <button
                                              type="button"
                                              className="text-xs text-red-600 underline"
                                              onClick={() => updateLesson(module.id, lesson._id || lesson.id, { content: "" })}
                                            >
                                              Remove Link
                                            </button>
                                          </div>
                                          <video
                                            src={link}
                                            controls
                                            className="rounded border border-gray-200 w-full"
                                            style={{ background: '#000', minHeight: '300px' }}
                                          >
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      );
                                    } else if (fileUrl) {
                                      // Uploaded file
                                      return (
                                        <div className="mt-2">
                                          <div className="flex gap-2 mb-2">
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 underline"
                                            >
                                              Open Video in new tab
                                            </a>
                                            <button
                                              type="button"
                                              className="text-xs text-red-600 underline"
                                              onClick={() => updateLesson(module.id, lesson._id || lesson.id, { content: "" })}
                                            >
                                              Remove Video
                                            </button>
                                          </div>
                                          <video
                                            src={fileUrl}
                                            controls
                                            className="rounded border border-gray-200 w-full"
                                            style={{ background: '#000', minHeight: '300px' }}
                                          >
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      );
                                    } else {
                                      return null;
                                    }
                                  })()
                                ) : (
                                  <FileUpload
                                    label="Upload Video File or Provide Link"
                                    accept=".mp4,.webm,.mov,.avi,video/*"
                                    value={lesson.content}
                                    onChange={(file) => updateLesson(module.id, lesson._id || lesson.id, { content: file })}
                                    isMultiFile={false}
                                    required={false}
                                    maxSize={2048}
                                    hideFileNameForVideo={true}
                                        onFileClick={(file) => {
                                          if (file?.fileUrl) {
                                            window.open(file.fileUrl, "_blank");
                                          } else {
                                            console.warn("No file URL available.");
                                          }
                                        }}
                                  />
                                )
                              ) : (
                                <FloatingTextarea
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(module.id, lesson._id || lesson.id, { content: e.target.value })}
                                  label="Enter article content"                                 
                                  rows={3}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={() => addLesson(module.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          <div className="flex justify-center pt-4">
            <Button onClick={addModule} className="w-full max-w-xs">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}