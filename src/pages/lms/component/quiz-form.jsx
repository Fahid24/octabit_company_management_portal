"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { FloatingInput } from "@/component/FloatiingInput"
import Button from "@/component/Button"

export function QuizForm({ data, updateData }) {
  const [expandedQuizzes, setExpandedQuizzes] = useState([])

  const addQuiz = (moduleId) => {
    const newQuiz = {
      id: Date.now().toString(),
      moduleId: moduleId,
      questions: [],
    }
    updateData({ ...data, quizzes: [...data.quizzes, newQuiz] })
    setExpandedQuizzes([...expandedQuizzes, newQuiz.id])
  }

  const deleteQuiz = (quizId) => {
    updateData({ ...data, quizzes: data.quizzes.filter((q) => q.id !== quizId) })
    setExpandedQuizzes(expandedQuizzes.filter((id) => id !== quizId))
  }

  const addQuestion = (quizId) => {
    const newQuestion = {
      id: Date.now().toString(),
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: 1,
    }
    const updatedQuizzes = data.quizzes.map((quiz) =>
      quiz.id === quizId ? { ...quiz, questions: [...quiz.questions, newQuestion] } : quiz
    )
    updateData({ ...data, quizzes: updatedQuizzes })
  }

  const updateQuestion = (quizId, questionId, updates) => {
    const updatedQuizzes = data.quizzes.map((quiz) =>
      quiz.id === quizId
        ? {
            ...quiz,
            questions: quiz.questions.map((question) =>
              question.id === questionId ? { ...question, ...updates } : question
            ),
          }
        : quiz
    )
    updateData({ ...data, quizzes: updatedQuizzes })
  }

  const deleteQuestion = (quizId, questionId) => {
    const updatedQuizzes = data.quizzes.map((quiz) =>
      quiz.id === quizId ? { ...quiz, questions: quiz.questions.filter((q) => q.id !== questionId) } : quiz
    )
    updateData({ ...data, quizzes: updatedQuizzes })
  }

  const toggleQuiz = (quizId) => {
    setExpandedQuizzes((prev) => (prev.includes(quizId) ? prev.filter((id) => id !== quizId) : [...prev, quizId]))
  }

  const getModuleName = (moduleId) => {
    const module = data.modules.find((m) => m.id === moduleId)
    return module?.title || `Module ${data.modules.findIndex((m) => m.id === moduleId) + 1}`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Module Quizzes</h3>
        <p className="text-sm text-gray-600">Add quizzes to test understanding for each module.</p>

        {data.modules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Please add modules first before creating quizzes.</div>
        ) : (
          <div className="space-y-4">
            {data.modules.map((module) => {
              const moduleQuiz = data.quizzes.find((q) => q.moduleId === module.id)

              return (
                <Card key={module.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {module.title || `Module ${data.modules.findIndex((m) => m.id === module.id) + 1}`}
                      </CardTitle>
                      {!moduleQuiz ? (
                        <Button variant="outline" size="sm" onClick={() => addQuiz(module.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Quiz
                        </Button>
                      ) : moduleQuiz ? (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleQuiz(moduleQuiz.id)}>
                            {expandedQuizzes.includes(moduleQuiz.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQuiz(moduleQuiz.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </CardHeader>

                  {moduleQuiz && expandedQuizzes.includes(moduleQuiz.id) && (
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm" onClick={() => addQuestion(moduleQuiz.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>

                        {moduleQuiz.questions.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">No questions added yet.</div>
                        ) : (
                          <div className="space-y-6">
                            {moduleQuiz.questions.map((question, questionIndex) => (
                              <div key={question.id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 space-y-2">
                                    <FloatingInput
                                      value={question.question}
                                      onChange={(e) =>
                                        updateQuestion(moduleQuiz.id, question.id, { question: e.target.value })
                                      }
                                      label={`Question ${questionIndex + 1}`}
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteQuestion(moduleQuiz.id, question.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                  <FloatingInput
                                    value={question.option1}
                                    onChange={(e) =>
                                      updateQuestion(moduleQuiz.id, question.id, { option1: e.target.value })
                                    }
                                    label="Option 1"
                                  />
                                  <FloatingInput
                                    value={question.option2}
                                    onChange={(e) =>
                                      updateQuestion(moduleQuiz.id, question.id, { option2: e.target.value })
                                    }
                                    label="Option 2"
                                  />
                                  <FloatingInput
                                    value={question.option3}
                                    onChange={(e) =>
                                      updateQuestion(moduleQuiz.id, question.id, { option3: e.target.value })
                                    }
                                    label="Option 3"
                                  />
                                  <FloatingInput
                                    value={question.option4}
                                    onChange={(e) =>
                                      updateQuestion(moduleQuiz.id, question.id, { option4: e.target.value })
                                    }
                                    label="Option 4"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <FloatingInput
                                    type="select"
                                    label="Correct Answer"
                                    value={question.answer.toString()}
                                    onChange={(e) =>
                                      updateQuestion(moduleQuiz.id, question.id, { answer: Number(e.target.value) })
                                    }
                                    options={[
                                      { value: "1", label: "Option 1" },
                                      { value: "2", label: "Option 2" },
                                      { value: "3", label: "Option 3" },
                                      { value: "4", label: "Option 4" },
                                    ]}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}