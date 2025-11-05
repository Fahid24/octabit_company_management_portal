import { useState, useEffect } from 'react';
import Button from '@/component/Button';
import { useGetMonthlyAttendanceSummaryQuery } from '@/redux/features/attendance/attendanceApiSlice';
import { toast } from '@/component/Toast';
import ExcelJS from 'exceljs';
import { format, parseISO } from 'date-fns';

const DownloadMonthlyAttendanceSummary = ({ date, setModal }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [querySkip, setQuerySkip] = useState(true);

  // Handle date string from FloatingInput (yyyy-MM-dd)
  const formattedDate = date;

  // Extract month and year from the date string for monthly report
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  // Enable the query once we have a valid date
  useEffect(() => {
    if (formattedDate) {
      setQuerySkip(false);
    }
  }, [formattedDate]);

  // API query - send the date directly
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error
  } = useGetMonthlyAttendanceSummaryQuery({
    employeeIds: [],
    date: formattedDate, // Pass full date (yyyy-MM-dd)
    departmentIds: []
  }, {
    skip: querySkip,
    selectFromResult: ({ data, ...rest }) => ({
      data: data ? data : { monthlyReport: [], dailySummary: {} },
      ...rest
    }),
    refetchOnMountOrArgChange: true
  });

  // Handle loading and error states
  useEffect(() => {
    if (isError && error) {
      console.error('API Error:', error);
      toast.error(`Error loading attendance data: ${error.message || 'Unknown error'}`);
      setButtonDisabled(true);
    } else if (isLoading || isFetching) {
      setButtonDisabled(true);
    } else if (data) {
      setButtonDisabled(false);
    }
  }, [isLoading, isFetching, isError, error]);

  const symbols = [
    { description: 'Government Holiday', symbol: 'GH' },
    { description: 'Regular Present', symbol: 'P' },
    { description: 'Late Present', symbol: 'LP' },
    { description: 'Early Leave', symbol: 'EL' },
    { description: 'Paid Leave', symbol: 'PL' },
    { description: 'Unpaid Leave', symbol: 'UL' },
    { description: 'Short Leave', symbol: 'SL' },
    { description: 'Weekly Holiday', symbol: 'WH' },
    { description: 'Absent', symbol: 'A' },
    { description: 'Half Day Leave', symbol: 'HL' },
  ];

  // Updated getDaysInMonth function to avoid date spillover from previous month
  const getDaysInMonth = (year, month) => {
    const startDate = new Date(year, month - 1, 1); // Start of the month
    const endDate = new Date(year, month, 0); // Last day of the month

    // Generate an array of all dates in the current month (excluding overflow from the previous month)
    const days = [];
    while (startDate <= endDate) {
      // Create a date object and format it as YYYY-MM-DD (local timezone)
      const localDate = new Date(startDate);
      const formattedDate = localDate.getFullYear() + "-" +
        String(localDate.getMonth() + 1).padStart(2, '0') + "-" +
        String(localDate.getDate()).padStart(2, '0'); // YYYY-MM-DD
      days.push(formattedDate);
      startDate.setDate(startDate.getDate() + 1); // Move to next day
    }

    return days;
  };

  const generateExcel = async () => {
    // Don't proceed if data is not ready
    if (isLoading || isFetching || !data) {
      toast.warning("Please wait for data to load");
      return;
    }

    // Check for valid data structure
    if (!data.monthlyReport || !Array.isArray(data.monthlyReport)) {
      toast.error("Invalid data format for monthly report");
      return;
    }

    setIsGenerating(true);

    try {
      let ExcelJSModule;
      try {
        ExcelJSModule = (await import("exceljs")).default;
      } catch (e) {
        ExcelJSModule = await import("exceljs");
      }

      if (!ExcelJSModule || !ExcelJSModule.Workbook) {
        throw new Error("ExcelJS.Workbook not found after import.");
      }

      const workbook = new ExcelJSModule.Workbook();
      const worksheet = workbook.addWorksheet("Monthly Attendance");

      // Always add the daily attendance sheet
      // Add daily summary sheet for the selected date
      generateDailySheet(workbook, data.dailySummary || {}, formattedDate);

      // --- Add "Use the following Symbol" table ---
      const symbolHeaderRow = worksheet.addRow([]);
      symbolHeaderRow.getCell(1).value = "Use the following Symbol:";
      symbolHeaderRow.getCell(1).font = { bold: true };
      symbolHeaderRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.mergeCells(
        symbolHeaderRow.getCell(1).address,
        symbolHeaderRow.getCell(2).address
      );
      symbolHeaderRow.height = 20;

      // Apply yellow background and borders to merged header cell
      symbolHeaderRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" }, // Yellow background
      };
      symbolHeaderRow.getCell(1).border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };

      symbols.forEach((item) => {
        const row = worksheet.addRow([item.description, item.symbol]);
        row.height = 20;
        // Style description cell (light blue background)
        row.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9E1F2" }, // Light blue
        };
        row.getCell(1).border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
        row.getCell(1).font = { size: 9 };
        row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

        // Style symbol cell (white background)
        row.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" }, // White
        };
        row.getCell(2).border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
        row.getCell(2).font = { size: 9 };
        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
      });

      // Add a blank row for spacing before the main table
      worksheet.addRow([]);
      worksheet.addRow([]);

      // --- Generate all dates for the month (August 2025) ---
      const allDates = getDaysInMonth(year, month);

      // console.log("All Dates for the month:", allDates);

      // Format dates for header (e.g., "Thu, Jul 17")
      const formattedDates = allDates.map((dateString) => {
        const dateObj = new Date(dateString); // Assuming dateString is in ISO format (YYYY-MM-DD)

        // Format options
        const options = {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "Asia/Dhaka" // Explicitly setting timezone to Asia/Dhaka
        };

        // Convert to local time string in Asia/Dhaka timezone
        return dateObj.toLocaleDateString("en-US", options);
      });

      // Define headers for the main table
      const fixedHeaders = [
        "Sl.",
        "Name",
        "Designation",
        "Total Days",
        "Extra Days",
        "Total Present",
        "Late Present",
        "Half Day/Early Leave", // Corrected header name
        "Weekly Holiday",
        "Govt. Holiday",
        "Paid Leave",
        "Unpaid Leave",
        "Absent",
      ];

      const allHeaders = [...fixedHeaders, ...formattedDates];

      // Add main header row
      const headerRow = worksheet.addRow(allHeaders);
      headerRow.height = 40;

      // Apply yellow background and styling to all main header cells
      allHeaders.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" }, // Yellow background
        };
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
        cell.font = {
          bold: true,
          size: 10,
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });

      // Define columns that should have the light green background
      const greenColumns = [
        "Total Days",
        "Extra Days",
        "Total Present",
        "Late Present",
        "Half Day/Early Leave",
        "Weekly Holiday",
        "Govt. Holiday",
        "Paid Leave",
        "Unpaid Leave",
        "Absent",
      ];
      const greenColumnIndices = greenColumns.map(
        (colName) => allHeaders.indexOf(colName) + 1
      ); // +1 for 1-based indexing

      // Add data rows
      (data.monthlyReport || []).forEach((employee, rowIndex) => {
        const rowData = [
          employee.sl,
          employee.name,
          employee.designation,
          employee.totalDays,
          employee.extraDays,
          employee.totalPresent,
          employee.latePresent,
          employee.halfOrEarlyLeave,
          employee.weeklyHoliday,
          employee.govtHoliday,
          employee.paidLeave,
          employee.unpaidLeave,
          employee.absent,
        ];

        // Add status for each date, or blank if no data
        allDates.forEach((date) => {
          const dayData = employee.summary.find((day) => day.date === date);
          rowData.push(dayData ? dayData.status : "");
        });

        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 18;

        // Determine base background color for the row (alternating)
        const baseBgColor = rowIndex % 2 === 0 ? "FFFFFFFF" : "FFD9E1F2"; // White or Light Blue

        // Style data cells
        rowData.forEach((cellValue, cellIndex) => {
          const cell = dataRow.getCell(cellIndex + 1);
          cell.border = {
            top: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
          };
          cell.font = {
            size: 9,
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          // Apply specific green background for certain columns, otherwise use alternating
          if (greenColumnIndices.includes(cellIndex + 1)) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFA9D08E" }, // Light green
            };
          } else {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: baseBgColor },
            };
          }

          // Special styling for name and designation columns (left align)
          if (cellIndex === 1 || cellIndex === 2) {
            cell.alignment = {
              horizontal: "left",
              vertical: "middle",
            };
          }
        });
      });

      // Set column widths for main table
      const columnWidths = [
        5, // Sl.
        25, // Name (increased for better visibility)
        15, // Designation
        8, // Total Days
        8, // Extra Days
        8, // Total Present
        8, // Late Present
        10, // Half Day/Early Leave
        8, // Weekly Holiday
        8, // Govt. Holiday
        8, // Paid Leave
        8, // Unpaid Leave
        8, // Absent
      ];

      // Set widths for fixed columns
      columnWidths.forEach((width, index) => {
        worksheet.getColumn(index + 1).width = width;
      });

      // Set width for date columns
      for (let i = fixedHeaders.length + 1; i <= allHeaders.length; i++) {
        worksheet.getColumn(i).width = 12;
      }

      // Set column widths for symbol table (adjusting for the first two columns)
      worksheet.getColumn(1).width = 17; // Description column
      worksheet.getColumn(2).width = 20; // Symbol column

      // Freeze panes to keep fixed columns visible while scrolling
      worksheet.views = [
        {
          state: "frozen",
          xSplit: fixedHeaders.length, // Freeze the fixed data columns
          ySplit: 1 + symbols.length + 2 + 1, // Symbol header + symbols + 2 blank rows + main header
        },
      ];

      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Set the filename for the combined report
      const fileName = `attendance-report-${formattedDate}.xlsx`;

      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);

      setModal(false);

      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error stack:', error.stack);
      toast.error(`Error generating Excel: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine button text based on various states
  const getButtonText = () => {
    if (isGenerating) return "Generating...";
    if (isLoading || isFetching) return "Loading data...";
    if (isError) return "Error loading data";
    return "Download Attendance Report";
  };

  return (
    <Button
      disabled={buttonDisabled || isGenerating}
      className="rounded-md"
      onClick={generateExcel}
    >
      {getButtonText()}
    </Button>
  );
};

// Function to generate daily attendance sheet
const generateDailySheet = (workbook, dailySummary, formattedDate) => {
  const sheet = workbook.addWorksheet("Daily Attendance");

  // Instead of using spliceColumns, we'll just adjust our column references
  // No need to insert an empty column, just start from column B instead of A

  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    }
  };
  const cellBorder = {
    top: { style: "thin" }, left: { style: "thin" },
    bottom: { style: "thin" }, right: { style: "thin" },
  };

  // === TITLE ===
  // Parse date safely
  const reportDate = dailySummary.date
    ? parseISO(dailySummary.date) // e.g. "2025-08-24"
    : new Date(formattedDate);

  // Format using date-fns
  const title = format(reportDate, "EEEE, MMMM d, yyyy");
  // → "Sunday, August 24, 2025"

  // Apply to merged cell
  sheet.mergeCells("B1:G1");
  const titleCell = sheet.getCell("B1");
  titleCell.value = title;
  titleCell.style = headerStyle;

  // === SUMMARY TABLE (B3:C10) ===
  sheet.mergeCells("B3:C3");
  sheet.getCell("B3").value = "Daily Summary";
  sheet.getCell("B3").style = headerStyle;

  const summaryData = [
    ["Total", dailySummary.summary?.totalEmployees || 0],
    ["Present", dailySummary.summary?.presentCount || 0],
    ["Day Off", 0],
    ["Resigned", dailySummary.summary?.resignedTodayCount || 0],
    ["Absent", dailySummary.summary?.absentCount || 0],
    ["Late Present", dailySummary.summary?.lateCount || 0],
    ["Leave", dailySummary.summary?.onLeaveCount || 0],
  ];

  summaryData.forEach((row, i) => {
    const r = 4 + i;
    sheet.getCell(`B${r}`).value = row[0];
    sheet.getCell(`C${r}`).value = row[1];

    sheet.getCell(`B${r}`).style = { font: { bold: true }, border: cellBorder };
    sheet.getCell(`C${r}`).style = { alignment: { horizontal: "center" }, border: cellBorder };

    if (row[1] === 0) {
      sheet.getCell(`C${r}`).font = { color: { argb: "FFFF0000" }, bold: true };
    }
  });

  // === LATE PRESENT TABLE (E3:G10) ===
  sheet.mergeCells("E3:G3");
  sheet.getCell("E3").value = "Late Present";
  sheet.getCell("E3").style = headerStyle;

  ["Name", "Time", "Reason"].forEach((h, i) => {
    const col = String.fromCharCode(69 + i); // E, F, G
    sheet.getCell(`${col}4`).value = h;
    sheet.getCell(`${col}4`).style = headerStyle;
  });

  const lateEmployees = dailySummary.lateEmployees || [];
  const lateRows = Math.max(lateEmployees.length, 5);

  for (let i = 0; i < lateRows; i++) {
    const emp = lateEmployees[i];
    sheet.getCell(`E${5 + i}`).value = emp?.name || "";
    sheet.getCell(`F${5 + i}`).value = emp?.lateTime || "";
    sheet.getCell(`G${5 + i}`).value = emp?.reason || "";

    ["E", "F", "G"].forEach(col => {
      sheet.getCell(`${col}${5 + i}`).style = { border: cellBorder, alignment: { horizontal: "center" } };
    });
  }

  // === LEAVE STATUS TABLE (B12:C20) ===
  sheet.mergeCells("B12:C12");
  sheet.getCell("B12").value = "Leave Status";
  sheet.getCell("B12").style = headerStyle;

  ["Name", "Leave Reason"].forEach((h, i) => {
    const col = String.fromCharCode(66 + i); // B, C
    sheet.getCell(`${col}13`).value = h;
    sheet.getCell(`${col}13`).style = headerStyle;
  });

  const leaveDetails = dailySummary.leaveDetails || [];
  const leaveRows = Math.max(leaveDetails.length, 5);

  for (let i = 0; i < leaveRows; i++) {
    const leave = leaveDetails[i];
    sheet.getCell(`B${14 + i}`).value = leave?.name || "";
    sheet.getCell(`C${14 + i}`).value = leave?.reason || "";

    ["B", "C"].forEach(col => {
      sheet.getCell(`${col}${14 + i}`).style = { border: cellBorder, alignment: { horizontal: "center" } };
    });
  }

  // === Column widths ===
  sheet.getColumn(2).width = 18; // B
  sheet.getColumn(3).width = 25; // C
  sheet.getColumn(5).width = 20; // E
  sheet.getColumn(6).width = 12; // F
  sheet.getColumn(7).width = 25; // G

  return sheet;
};


export default DownloadMonthlyAttendanceSummary;
