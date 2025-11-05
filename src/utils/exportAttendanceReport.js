import ExcelJS from "exceljs";

// Custom color palette for attendance status reporting
const reportColors = {
    primary: "#2C6ECB",      // Primary blue (headers)
    secondary: "#4CAF50",    // Success green
    warning: "#FF9800",      // Warning orange
    error: "#F44336",        // Error red
    info: "#2196F3",         // Info blue
    accent: "#9C27B0",       // Accent purple
    neutral: "#607D8B",      // Neutral gray
    background: "#FFFFFF",   // White background
    surface: "#F5F7FA",      // Light surface
    highlight: "#E3F2FD",    // Highlight blue

    // Attendance status specific colors
    present: "#00904B",      // Present (dark green)
    graced: "#28A745",       // Grace Present (green)
    late: "#FFC107",         // Late (yellow/amber)
    onLeave: "#8A6642",      // On Leave (brown)
    absent: "#F44336",       // Absent (red)
    weekend: "#6366f1",      // Weekend (indigo)
    holiday: "#3b82f6"       // Holiday (blue)
};

// Helper function to process colors with opacity
function safeColorProcess(color, fallback = "FF000000") {
    if (!color || typeof color !== "string") return fallback;
    return color.replace("#", "");
}

// Helper function to add opacity to colors for ExcelJS ARGB format
function addOpacityToColor(color, opacity = "25") {
    const cleanColor = color.replace("#", "");
    return opacity + cleanColor; // ARGB format: Alpha + RGB
}

export async function exportAttendanceReport({
    attendanceData,
    filteredData,
    overallStats,
    departmentSummary,
    dateFrom,
    dateTo,
}) {
    if (!attendanceData) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Attendance System";
    workbook.lastModifiedBy = "HR Department";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary",
        {
            properties: { tabColor: { argb: safeColorProcess(reportColors.primary) } }
        });

    // Header styling
    summarySheet.mergeCells("A1:F1");
    const titleCell = summarySheet.getCell("A1");
    titleCell.value = "EMPLOYEE ATTENDANCE REPORT";
    titleCell.font = { size: 16, bold: true, color: { argb: safeColorProcess(reportColors.primary) } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: safeColorProcess(reportColors.surface) }
    };

    // Summary metadata
    const metaStyle = {
        font: { color: { argb: safeColorProcess(reportColors.neutral) } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: safeColorProcess(reportColors.background) } }
    };

    summarySheet.getCell("A3").value = "Report Generated:";
    summarySheet.getCell("B3").value = new Date().toLocaleString();
    summarySheet.getCell("A3").font = metaStyle.font;
    summarySheet.getCell("B3").font = { ...metaStyle.font, bold: true };

    summarySheet.getCell("A4").value = "Date Range:";
    summarySheet.getCell("B4").value = `${dateFrom} to ${dateTo}`;
    summarySheet.getCell("A4").font = metaStyle.font;
    summarySheet.getCell("B4").font = { ...metaStyle.font, bold: true };

    summarySheet.getCell("A5").value = "Total Records:";
    summarySheet.getCell("B5").value = filteredData.reduce((sum, day) => sum + day.employees.length, 0);
    summarySheet.getCell("A5").font = metaStyle.font;
    summarySheet.getCell("B5").font = { ...metaStyle.font, bold: true };

    // Summary section
    const summaryHeader = summarySheet.getCell("A7");
    summaryHeader.value = "ATTENDANCE SUMMARY";
    summaryHeader.font = { size: 12, bold: true, color: { argb: safeColorProcess(reportColors.primary) } };

    // Summary table headers
    const summaryHeaders = ["Status", "Count", "Percentage"];
    summaryHeaders.forEach((header, index) => {
        const cell = summarySheet.getCell(8, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: safeColorProcess(reportColors.primary) }
        };
        cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
        cell.alignment = { horizontal: "center" };
    });

    // Summary data rows
    const summaryData = [
        { status: "Attending (Present + Grace + Late)", count: overallStats.attending, color: reportColors.present },
        { status: "Present", count: overallStats.present, color: reportColors.present },
        { status: "Grace Present", count: overallStats.grace, color: reportColors.graced },
        { status: "Late", count: overallStats.late, color: reportColors.late },
        { status: "Absent", count: overallStats.absent, color: reportColors.absent },
        { status: "On Leave", count: overallStats.onLeave, color: reportColors.onLeave },
    ];

    summaryData.forEach((item, index) => {
        const row = 9 + index;
        const percentage = overallStats.total > 0 ? ((item.count / overallStats.total) * 100).toFixed(1) : 0;

        summarySheet.getCell(row, 1).value = item.status;
        summarySheet.getCell(row, 2).value = item.count;
        summarySheet.getCell(row, 3).value = `${percentage}%`;

        for (let col = 1; col <= 3; col++) {
            const cell = summarySheet.getCell(row, col);
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: addOpacityToColor(item.color, "25") }
            };
            cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
        }
    });

    // Department Analysis Sheet
    const deptSheet = workbook.addWorksheet("Department Analysis", {
        properties: { tabColor: { argb: safeColorProcess(reportColors.secondary) } },
    });

    // Department header
    deptSheet.mergeCells("A1:D1");
    const deptTitleCell = deptSheet.getCell("A1");
    deptTitleCell.value = "DEPARTMENT ATTENDANCE ANALYSIS";
    deptTitleCell.font = { size: 16, bold: true, color: { argb: safeColorProcess(reportColors.secondary) } };
    deptTitleCell.alignment = { horizontal: "center", vertical: "middle" };
    deptTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: safeColorProcess(reportColors.surface) }
    };

    // Department table headers
    const deptHeaders = ["Department", "Attending", "Total", "Attendance Rate"];
    deptHeaders.forEach((header, index) => {
        const cell = deptSheet.getCell(3, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: safeColorProcess(reportColors.secondary) }
        };
        cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
        cell.alignment = { horizontal: "center" };
    });

    // Department data rows
    departmentSummary.forEach((dept, index) => {
        const row = 4 + index;
        deptSheet.getCell(row, 1).value = dept.department;
        deptSheet.getCell(row, 2).value = dept.attending;
        deptSheet.getCell(row, 3).value = dept.total;
        deptSheet.getCell(row, 4).value = `${dept.percentage}%`;

        const rate = Number.parseInt(dept.percentage);
        let bgColor = reportColors.present; // Default to present green

        if (rate < 60) bgColor = reportColors.absent;
        else if (rate < 80) bgColor = reportColors.late;
        else if (rate < 90) bgColor = reportColors.graced;

        for (let col = 1; col <= 4; col++) {
            const cell = deptSheet.getCell(row, col);
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: addOpacityToColor(bgColor, "25") }
            };
            cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
        }
    });

    // Detailed Records Sheet
    const detailSheet = workbook.addWorksheet("Detailed Records", {
        properties: { tabColor: { argb: safeColorProcess(reportColors.info) } },
    });

    // Detail header
    detailSheet.mergeCells("A1:I1");
    const detailTitleCell = detailSheet.getCell("A1");
    detailTitleCell.value = "DETAILED ATTENDANCE RECORDS";
    detailTitleCell.font = { size: 16, bold: true, color: { argb: safeColorProcess(reportColors.info) } };
    detailTitleCell.alignment = { horizontal: "center", vertical: "middle" };
    detailTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: safeColorProcess(reportColors.surface) }
    };

    // Detail table headers
    const detailHeaders = [
        "Date", "Employee ID", "Employee Name", "Department",
        "Status", "Check In", "Check Out", "Hours Worked", "Notes"
    ];

    detailHeaders.forEach((header, index) => {
        const cell = detailSheet.getCell(3, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: safeColorProcess(reportColors.primary) }
        };
        cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
        cell.alignment = { horizontal: "center" };
    });

    // Detail data rows
    let rowIndex = 4;
    filteredData.forEach((day) => {
        if (day.isHoliday || day.isWeekend) {
            const notes = day.isHoliday && day.isWeekend
                ? "Holiday & Weekend"
                : day.isHoliday ? "Holiday" : "Weekend";

            detailSheet.getCell(rowIndex, 1).value = day.date;
            detailSheet.getCell(rowIndex, 9).value = notes;

            // Light background for non-working days
            const bgColor = day.isHoliday
                ? reportColors.holiday
                : reportColors.weekend;

            for (let col = 1; col <= 9; col++) {
                const cell = detailSheet.getCell(rowIndex, col);
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: addOpacityToColor(bgColor, "25") }
                };
                cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
            }
            rowIndex++;
        } else {
            day.employees.forEach((employee) => {
                const notes =
                    employee.status === "late" ? "Late Arrival" :
                        employee.status === "graced" ? "Grace Present" :
                            employee.status === "absent" ? "Absent" :
                                employee.status === "on leave" ? "On Leave" : "Regular";

                detailSheet.getCell(rowIndex, 1).value = day.date;
                detailSheet.getCell(rowIndex, 2).value = employee.employeeId;
                detailSheet.getCell(rowIndex, 3).value = employee.name;
                detailSheet.getCell(rowIndex, 4).value = employee.department;
                detailSheet.getCell(rowIndex, 5).value = employee.status.toUpperCase();
                detailSheet.getCell(rowIndex, 6).value = employee.checkIn || "N/A";
                detailSheet.getCell(rowIndex, 7).value = employee.checkOut || "N/A";
                detailSheet.getCell(rowIndex, 8).value =
                    employee.hoursWorked > 0 ? `${employee.hoursWorked} hours` : "0 hours";
                detailSheet.getCell(rowIndex, 9).value = notes;

                // Status-based coloring with light backgrounds
                let statusColor = reportColors.present; // Default: present
                if (employee.status === "graced") statusColor = reportColors.graced;
                else if (employee.status === "late") statusColor = reportColors.late;
                else if (employee.status === "absent") statusColor = reportColors.absent;
                else if (employee.status === "on leave") statusColor = reportColors.onLeave;

                for (let col = 1; col <= 9; col++) {
                    const cell = detailSheet.getCell(rowIndex, col);
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: addOpacityToColor(statusColor, "25") }
                    };
                    cell.border = { top: "thin", left: "thin", bottom: "thin", right: "thin" };
                }
                rowIndex++;
            });
        }
    });

    // Auto-resize columns
    const sheets = [summarySheet, deptSheet, detailSheet];
    sheets.forEach((sheet) => {
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) maxLength = columnLength;
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50); // Constrain width
        });
    });

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const filename = `Attendance_Report_${dateFrom}_to_${dateTo}_${new Date().toISOString().split("T")[0]}.xlsx`;

    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}