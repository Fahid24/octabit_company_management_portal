import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)


export default function TaskCompletionChart({ completedTasks, totalTasks }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const pendingTasks = totalTasks - completedTasks

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending"],
        datasets: [
          {
            data: [completedTasks, pendingTasks],
            backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(185, 28, 28, 0.8)"],
            borderColor: ["rgba(34, 197, 94, 1)", "rgba(185, 28, 28, 1)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const percentage = ((context.parsed / totalTasks) * 100).toFixed(1)
                return `${context.label}: ${context.parsed} (${percentage}%)`
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [completedTasks, totalTasks])

  return <canvas ref={chartRef} />
}
