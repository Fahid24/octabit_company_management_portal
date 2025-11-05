import ExcelJS from "exceljs"

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
}

const formatTime = (timestamp) => {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

const getDayName = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

const groupDataByWeeks = (employee) => {
  const weeks = []
  const dailyStats = employee.dailyStats || []

  for (let i = 0; i < dailyStats.length; i += 7) {
    weeks.push(dailyStats.slice(i, i + 7))
  }

  return weeks
}

export const downloadEmployeeAttendance = async ({employee, workHours}) => {
  // console.log(employee);
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Attendance Report")

  // Set column widths
  worksheet.columns = [
    { width: 12 }, // Day
    { width: 12 }, // Date
    { width: 20 }, // IN - OUT
    { width: 12 }, // PAY CODE
    { width: 10 }, // HOURS
    { width: 15 }, // DEPARTMENT
    { width: 12 }, // DAILY TOTALS
    { width: 10 }, // REGULAR
    { width: 10 }, // OVERTIME
  ]

  let currentRow = 1

  // Employee Header Section
  const headerRow = worksheet.getRow(currentRow)
  headerRow.getCell(1).value = "EMPLOYEE ATTENDANCE REPORT"
  headerRow.getCell(1).font = { bold: true, size: 16 }
  headerRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA97B50" },
  }
  headerRow.getCell(1).font = { ...headerRow.getCell(1).font, color: { argb: "FFFFFFFF" } }
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
  headerRow.height = 25
  currentRow += 2

  // Employee Information
  const infoData = [
    ["Employee Name:", employee.employeeName],
    ["Employee ID:", employee.employeeId],
    ["Email:", employee.employeeEmail],
    ["Role:", employee.employeeRole],
    ["Department:", employee.department?.name || "N/A"],
    ["Date of Birth:", formatDate(employee.employeeDob)],
  ]

  infoData.forEach(([label, value]) => {
    const row = worksheet.getRow(currentRow)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true }
    row.getCell(2).value = value
    currentRow++
  })

  currentRow += 2

  // Group data by weeks
  const weeks = groupDataByWeeks(employee)

  weeks.forEach((week, weekIndex) => {
    // Week header
    const weekHeaderRow = worksheet.getRow(currentRow)
    weekHeaderRow.getCell(1).value = `WEEK ${weekIndex + 1}`
    weekHeaderRow.getCell(1).font = { bold: true, size: 12 }
    weekHeaderRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    }
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
    currentRow++

    // Table headers
    const headers = [
      "Day",
      "Date",
      "IN - OUT",
      "PAY CODE",
      "HOURS",
      "DEPARTMENT",
      "DAILY TOTALS",
      "REGULAR",
      "OVERTIME",
    ]
    const headerRow = worksheet.getRow(currentRow)

    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = header
      cell.font = { bold: true }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F0F0" },
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    })
    currentRow++

    // Week data rows
    week.forEach((day) => {
      const row = worksheet.getRow(currentRow)

      // Apply background color for leave days
      if (day.isWeekend) {
        for (let i = 1; i <= 9; i++) {
          row.getCell(i).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ff4ade80" },
          };
        }
      } else if (day.isHoliday) {
        for (let i = 1; i <= 9; i++) {
          row.getCell(i).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "fff87171" },
          };
        }
      } else if (day.isLeaveDay) {
        for (let i = 1; i <= 9; i++) {
          row.getCell(i).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "fffacc15" },
          };
        }
      }

      // Fill data
      row.getCell(1).value = getDayName(day.date)
      row.getCell(2).value = formatDate(day.date)
      row.getCell(3).value =
        day.checkIn && day.checkOut ? `${formatTime(day.checkIn)} - ${formatTime(day.checkOut)}` : "-"
      row.getCell(4).value = day.isLeaveDay ? "LEAVE" : day.workedHours > 0 ? "WORK" : ""
      row.getCell(5).value = day.workedHours > 0 ? day.workedHours.toFixed(2) : "0.00"
      row.getCell(6).value = employee.department?.name || "-"
      row.getCell(7).value = day.workedHours > 0 ? day.workedHours.toFixed(2) : "0.00"
      row.getCell(8).value =
        day.workedHours > 0
          ? day.workedHours > workHours
            ? workHours.toFixed(2)
            : day.workedHours.toFixed(2)
          : "0.00";
      row.getCell(9).value =
        day.workedHours > workHours
          ? (day.workedHours - workHours).toFixed(2)
          : "0.00";

      // Add borders
      for (let i = 1; i <= 9; i++) {
        row.getCell(i).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        }
      }

      currentRow++
    })

    // Weekly totals row
    const weekTotalRow = worksheet.getRow(currentRow)
    const weekTotalHours = week.reduce((total, day) => total + day.workedHours, 0)
    const weekRegularHours = week.reduce(
      (total, day) =>
        total + (day.workedHours > workHours ? workHours : day.workedHours),
      0
    );
    const weekOvertimeHours = week.reduce((total, day) => total + (day.workedHours > workHours ? day.workedHours - workHours : 0), 0)

    weekTotalRow.getCell(4).value = `WEEK ${weekIndex + 1} TOTALS`
    weekTotalRow.getCell(5).value = weekTotalHours.toFixed(2)
    weekTotalRow.getCell(7).value = weekTotalHours.toFixed(2)
    weekTotalRow.getCell(8).value = weekRegularHours.toFixed(2)
    weekTotalRow.getCell(9).value = weekOvertimeHours.toFixed(2)

    // Style weekly totals row
    for (let i = 1; i <= 9; i++) {
      const cell = weekTotalRow.getCell(i)
      cell.font = { bold: true }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD0D0D0" },
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    }

    currentRow += 2
  })

  // Monthly Summary
  const monthlyTotalHours = employee.dailyStats?.reduce((total, day) => total + day.workedHours, 0) || 0
  const monthlyRegularHours =
    employee.dailyStats?.reduce(
      (total, day) =>
        total + (day.workedHours < workHours ? day.workedHours : workHours),
      0
    ) || 0;
  const monthlyOvertimeHours =
    employee.dailyStats?.reduce((total, day) => total + (day.workedHours > workHours ? day.workedHours - workHours : 0), 0) || 0
  const leaveDays = employee.dailyStats?.filter((day) => day.isLeaveDay).length || 0

  const summaryRow = worksheet.getRow(currentRow)
  summaryRow.getCell(1).value = "MONTHLY SUMMARY"
  summaryRow.getCell(1).font = { bold: true, size: 14 }
  summaryRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA97B50" },
  }
  summaryRow.getCell(1).font = { ...summaryRow.getCell(1).font, color: { argb: "FFFFFFFF" } }
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
  currentRow += 2

  const summaryData = [
    ["Total Hours:", `${monthlyTotalHours.toFixed(2)} Hrs`],
    ["Regular Hours:", `${monthlyRegularHours.toFixed(2)} Hrs`],
    ["Overtime Hours:", `${monthlyOvertimeHours.toFixed(2)} Hrs`],
    ["Leave Days:", `${leaveDays} Days`],
  ]

  summaryData.forEach(([label, value]) => {
    const row = worksheet.getRow(currentRow)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true }
    row.getCell(2).value = value
    currentRow++
  })

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${employee.employeeName.replace(/\s+/g, "_")}_Attendance_Report.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
