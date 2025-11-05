import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)


export default function DepartmentKpiChart({ departments }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef?.current) return

    // Destroy existing chart
    if (chartInstance?.current) {
      chartInstance?.current.destroy()
    }

    const ctx = chartRef?.current.getContext("2d")
    if (!ctx) return

    // Filter and sort departments
    const departmentsWithScores = departments
      ?.filter((dept) => dept?.finalKpiScore > 0)
      ?.sort((a, b) => b?.finalKpiScore - a?.finalKpiScore)

    const labels = departmentsWithScores?.map((dept) => dept?.departmentName)
    const scores = departmentsWithScores?.map((dept) => dept?.finalKpiScore)

    // 🎨 Define your fixed color palette
    const colorPalette = [
      "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
      "#8b5cf6", "#ec4899", "#0ea5e9", "#22c55e",
    ]

    // 🧠 Use the palette for each bar (cycled with modulo %)
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "KPI Score",
            data: scores,
            backgroundColor: departmentsWithScores?.map((_, i) => colorPalette[i % colorPalette.length]),
            borderColor: departmentsWithScores?.map((_, i) => colorPalette[i % colorPalette.length]),
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `KPI Score: ${context?.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0, 0, 0, 0.1)" },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [departments])


  return <canvas ref={chartRef} />
}
