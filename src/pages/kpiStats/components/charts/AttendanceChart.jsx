import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)


export default function AttendanceChart({ departments }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef?.current) return

    if (chartInstance?.current) {
      chartInstance?.current.destroy()
    }

    const ctx = chartRef?.current.getContext("2d")
    if (!ctx) return

    // Calculate attendance data
    const departmentsWithAttendance = departments?.filter((dept) => dept.stats.attendanceRate > 0)?.map((dept) => ({
        name: dept.departmentName,
        attendanceRate: dept.stats.attendanceRate,
      }))

    const labels = departmentsWithAttendance?.map((dept) => dept.name)
    const attendanceRates = departmentsWithAttendance?.map((dept) => dept.attendanceRate)

    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Attendance Rate (%)",
            data: attendanceRates,
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(34, 197, 94, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(34, 197, 94, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            angleLines: {
              color: "rgba(0, 0, 0, 0.1)",
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
  }, [departments])

  return <canvas ref={chartRef} />
}
