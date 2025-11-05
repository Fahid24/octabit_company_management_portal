import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)


export default function ProjectPerformanceChart({ departments }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Collect all projects from all departments
    const allProjects  = []

    departments?.forEach((dept) => {
      if (dept?.stats?.projectBreakdown && dept?.stats?.projectBreakdown?.length > 0) {
        dept?.stats?.projectBreakdown?.forEach((project) => {
          allProjects.push({
            name: project.projectName,
            assigned: project.assigned,
            completed: project.completed,
            completionRate: project.completionRate,
            department: dept.departmentName,
          })
        })
      }
    })

    const labels = allProjects.map((project) => project?.name)
    const assignedTasks = allProjects.map((project) => project?.assigned)
    const completedTasks = allProjects.map((project) => project?.completed)

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Assigned Tasks",
            data: assignedTasks,
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
          {
            label: "Completed Tasks",
            data: completedTasks,
            backgroundColor: "rgba(34, 197, 94, 0.6)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance?.current?.destroy()
      }
    }
  }, [departments])

  return <canvas ref={chartRef} />
}
