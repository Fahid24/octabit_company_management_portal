import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)


export default function EmployeePerformanceChart({ departments }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef?.current) return

    if (chartInstance?.current) {
      chartInstance?.current.destroy()
    }

    const ctx = chartRef?.current?.getContext("2d")
    if (!ctx) return

    // Collect all employees from all departments
    const allEmployees = []
    departments?.forEach((dept) => {
      if (dept?.stats?.employeeStats && dept?.stats?.employeeStats?.length > 0) {
        dept?.stats?.employeeStats?.forEach((emp) => {
          allEmployees.push({
            name: emp?.name,
            completionRate: emp?.completionRate,
            department: dept?.departmentName,
          })
        })
      }
    })

    // Sort by completion rate and take top 10
    const topEmployees = allEmployees?.sort((a, b) => b?.completionRate - a?.completionRate).slice(0, 10)

    const labels = topEmployees?.map((emp) => emp?.name?.split(" ")[0]) // First name only
    const completionRates = topEmployees?.map((emp) => emp?.completionRate)

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Completion Rate (%)",
            data: completionRates,
            backgroundColor: "rgba(215,217,249,130)",
            borderColor: "rgba(215,217,249,130)",

            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [departments])

  return <canvas ref={chartRef} />
}
