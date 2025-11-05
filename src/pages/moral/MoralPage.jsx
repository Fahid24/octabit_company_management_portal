"use client"

import { useMemo, useState } from "react"

import { useGetAllMoralSurveysQuery } from "@/redux/features/morale/moraleApiSlice"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/component/card"

import Loader from "@/component/Loader"

import ErrorMessage from "@/component/isError"

import { EmptyState } from "@/component/NoData"

import { BarChartIcon, ClipboardList, MessageSquare, Plus } from "lucide-react"

import Button from "@/component/Button"

import { useNavigate } from "react-router-dom"

import { FloatingInput } from "@/component/FloatiingInput"

const MoralPage = () => {
  const { data: surveysData, isLoading, isError, error, refetch } = useGetAllMoralSurveysQuery()
  const surveys = surveysData?.data || []
  const navigate = useNavigate()
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)
  // const [showAllFollowUp, setShowAllFollowUp] = useState(false)
  const [showAllFollowUp, setShowAllFollowUp] = useState(false)

  // Date filter state - initially empty
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Filter surveys by date range - show all if no dates selected
  const filteredSurveys = useMemo(() => {
    // If no dates are selected, return all surveys
    if (!startDate && !endDate) {
      return surveys
    }

    return surveys.filter((survey) => {
      const created = new Date(survey.createdAt)

      // If only start date is selected
      if (startDate && !endDate) {
        const start = new Date(startDate)
        return created >= start
      }

      // If only end date is selected
      if (!startDate && endDate) {
        const end = new Date(endDate)
        return created <= end
      }

      // If both dates are selected
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        return created >= start && created <= end
      }

      return true
    })
  }, [surveys, startDate, endDate])

  // Function to aggregate survey data for charts
  const aggregateSurveyData = (data) => {
    const aggregation = {}
    // Initialize all question keys with empty objects
    const questionKeys = ["morale", "support", "expectations", "skillsUsage", "recognition", "safety"]
    questionKeys.forEach((key) => {
      aggregation[key] = {}
    })

    data.forEach((survey) => {
      // Aggregate for each question
      Object.keys(survey).forEach((key) => {
        // Only aggregate for expected survey questions
        if (questionKeys.includes(key)) {
          const value = survey[key]
          if (value) {
            // Only count non-empty values
            if (!aggregation[key]) {
              aggregation[key] = {}
            }
            aggregation[key][value] = (aggregation[key][value] || 0) + 1
          }
        }
      })
    })

    // Convert aggregation object into array format suitable for recharts
    const chartData = {}
    questionKeys.forEach((questionKey) => {
      chartData[questionKey] = Object.keys(aggregation[questionKey]).map((option) => ({
        name: option,
        count: aggregation[questionKey][option],
      }))
    })

    
    return chartData
  }

  const chartData = useMemo(() => {
    return aggregateSurveyData(filteredSurveys)
  }, [filteredSurveys])

  // Reset filters function
  const resetFilters = () => {
    setStartDate("")
    setEndDate("")
  }

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

  // if (surveys.length === 0) {
  //   return (
  //     <EmptyState
  //       message="No survey data available yet."
  //       refetch={refetch}
  //       icon={<BarChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
  //     />
  //   )
  // }

  // Render individual charts for each question
  const renderChart = (questionKey, title, description) => {
    const data = chartData[questionKey]
   

    // Only render chart if there is data for the question
    if (!data || data.length === 0) {
      
      return (
        <Card key={questionKey}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-gray-500">No data available</div>
          </CardContent>
        </Card>
      )
    }

    // Define chart types for each question
    const chartTypes = {
      morale: "pie",
      support: "line",
      expectations: "area",
      skillsUsage: "radar",
      recognition: "composed",
      safety: "bar",
    }

    const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0", "#00BCD4"] // Green, Blue, Amber, Deep Orange, Purple, Cyan

    const renderChartByType = () => {
      switch (chartTypes[questionKey]) {
        case "pie":
          return (
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )
        case "line":
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "Responses"]} />
              <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={2} />
            </LineChart>
          )
        case "area":
          return (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "Responses"]} />
              <Area type="monotone" dataKey="count" fill="#4CAF50" stroke="#2196F3" />
            </AreaChart>
          )
        case "radar":
          return (
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis />
              <Radar name="Responses" dataKey="count" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          )
        case "composed":
          return (
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "Responses"]} />
              <Bar dataKey="count" fill="#2196F3" />
              <Line type="monotone" dataKey="count" stroke="#4CAF50" />
            </ComposedChart>
          )
        default: // bar chart
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "Responses"]} />
              <Bar dataKey="count" fill="#4CAF50" />
            </BarChart>
          )
      }
    }

    return (
      <Card key={questionKey}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            {renderChartByType()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  // Render improvement suggestions section
  const renderImprovementSuggestions = () => {
    const allSuggestions = filteredSurveys
      .filter((survey) => survey.improvementSuggestions)
      .map((survey) => ({
        suggestion: survey.improvementSuggestions,
        date: new Date(survey.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by latest

    if (!allSuggestions.length) return null

    const suggestionsToDisplay = showAllSuggestions ? allSuggestions : allSuggestions.slice(0, 5)
    const hasMoreSuggestions = allSuggestions.length > 5 && !showAllSuggestions

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Improvement Suggestions
          </CardTitle>
          <CardDescription>Feedback from employees on how to improve their experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {suggestionsToDisplay.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-2">{item.suggestion}</p>
                <span className="text-sm text-gray-500">Submitted on {item.date}</span>
              </div>
            ))}
          </div>
          {hasMoreSuggestions && (
            <div className="flex justify-center mt-4">
              <Button type="button" onClick={() => setShowAllSuggestions(true)} size="sm" variant="outline">
                Show More
              </Button>
            </div>
          )}
          {!hasMoreSuggestions && allSuggestions.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button type="button" onClick={() => setShowAllSuggestions(false)} size="sm" variant="outline">
                View Less
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Render follow-up requests section
  const renderFollowUpRequests = () => {
    // const followUps = filteredSurveys.filter((survey) => survey.followUp === "Yes")
  
    const followUps = filteredSurveys
      .filter((survey) => survey.followUp === "Yes" )
      .map((survey) => ({
        followUp: survey.followUp,
        name: `${survey?.employeeId?.firstName ||"Anonymous"} ${survey?.employeeId?.lastName || ""}`,
        date: new Date(survey.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by latest

    if (!followUps.length) return null
    const followUpsToDisplay = showAllFollowUp ? followUps : followUps.slice(0, 5)
    const hasMoreFollowUps = followUps.length > 5 && !showAllFollowUp

    

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Follow-up Requests</CardTitle>
          <CardDescription>Employees who requested private follow-up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {followUpsToDisplay.map((survey, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{survey.name|| "Anonymous"}</p>
                    <p className="text-sm text-gray-500">
                      Submitted on {survey.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMoreFollowUps && (
            <div className="flex justify-center mt-4">
              <Button type="button" onClick={() => setShowAllFollowUp(true)} size="sm" variant="outline">
                Show More
              </Button>
            </div>
          )}
          {!hasMoreFollowUps && followUps.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button type="button" onClick={() => setShowAllFollowUp(false)} size="sm" variant="outline">
                View Less
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 md:pl-24 pb-24 md:pb-4 text-gray-900 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Morale Survey Statistics</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">
              Total Surveys: <span className="text-primary font-semibold">{filteredSurveys.length}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <FloatingInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
          />
          <FloatingInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>

        <div>
          {/* Reset button to clear filters */}
          <Button onClick={resetFilters} variant="secondary" className="bg-gray-200 font-semibold hover:bg-gray-300">
            Reset Filters
          </Button>
        </div>

        <Button onClick={() => navigate("/moral-survey")} variant="primary" className="bg-primary hover:bg-primary/90">
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create Survey</span>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderChart("morale", "Overall Morale", "Distribution of overall morale ratings")}
        {renderChart("support", "Support from Leaders & Teammates", "How supported employees feel")}
        {renderChart("expectations", "Daily Job Expectations Clarity", "How clear job expectations are")}
        {renderChart("skillsUsage", "Skills Usage", "How well skills are being used")}
        {renderChart("recognition", "Recognition", "Feeling recognized for contributions")}
        {renderChart("safety", "Safety on Job Sites", "Feeling safe with equipment and protocols")}
      </div>

      {renderImprovementSuggestions()}
      {renderFollowUpRequests()}
    </div>
  )
}

export default MoralPage
