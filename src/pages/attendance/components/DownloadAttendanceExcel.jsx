import ExcelJS from "exceljs"; // uses the browser build automatically
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import { Download } from "lucide-react";

export default function DownloadMonthlyAttendance({data}) {
  /* ---------- helpers ---------- */
  const timeFmt = (ms) => {
    if (!ms || ms === 0) return "";
    return new Date(ms).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const dateFmt = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const allDates = () => {
    // Get all dates from employee data to determine the month
    const dataDateSet = new Set();
    data.employees?.forEach((e) =>
      e.dailyStats.forEach((d) => dataDateSet.add(d.date))
    );

    if (dataDateSet.size === 0) {
      // If no data, return current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const fullMonth = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        // Use local date format to avoid timezone issues
        const year_local = date.getFullYear();
        const month_local = String(date.getMonth() + 1).padStart(2, '0');
        const day_local = String(date.getDate()).padStart(2, '0');
        fullMonth.push(`${year_local}-${month_local}-${day_local}`);
      }
      return fullMonth;
    }

    // Find the month and year from existing data
    const firstDate = new Date(
      Math.min(...Array.from(dataDateSet).map((d) => new Date(d).getTime()))
    );
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();

    // Generate all days for that month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const fullMonth = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use local date format to avoid timezone issues
      const year_local = date.getFullYear();
      const month_local = String(date.getMonth() + 1).padStart(2, '0');
      const day_local = String(date.getDate()).padStart(2, '0');
      fullMonth.push(`${year_local}-${month_local}-${day_local}`);
    }

    return fullMonth;
  };

  /* ---------- Excel download ---------- */
  async function downloadExcel() {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Attendance");

    const dates = allDates();
    // console.log("All dates for month:", dates.length); // Debug log

    // Set column widths
    ws.getColumn(1).width = 5; // Sl.
    ws.getColumn(2).width = 22; // Name
    ws.getColumn(3).width = 18; // Designation

    let colIndex = 4;
    dates.forEach(() => {
      ws.getColumn(colIndex).width = 12; // Check In
      ws.getColumn(colIndex + 1).width = 12; // Check Out
      colIndex += 2;
    });

    // Row 1: Headers with dates (Yellow background #FFFF00)
    const row1Data = ["Sl.", "Name", "Designation"];
    dates.forEach((d) => {
      row1Data.push(dateFmt(d));
      row1Data.push(""); // Empty cell for merging
    });

    const row1 = ws.addRow(row1Data);

    // Style row 1 - all yellow
    row1.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" },
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Merge date cells in row 1
    let mergeCol = 4;
    dates.forEach(() => {
      ws.mergeCells(1, mergeCol, 1, mergeCol + 1);
      mergeCol += 2;
    });

    // Row 2: Check In/Check Out headers
    const row2Data = ["", "", ""]; // Empty for first 3 columns
    dates.forEach(() => {
      row2Data.push("Check In", "Check Out");
    });

    const row2 = ws.addRow(row2Data);

    // Style row 2
    row2.eachCell((cell, colNumber) => {
      if (colNumber <= 3) {
        // First 3 columns - continue yellow from row 1
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };
      } else {
        // Check In/Check Out columns - green background
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF548235" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // white text
      }

      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Merge first 3 columns from row 1 to row 2
    ws.mergeCells("A1:A2"); // Sl.
    ws.mergeCells("B1:B2"); // Name
    ws.mergeCells("C1:C2"); // Designation

    // Add employee data rows
    data?.employees?.forEach((emp, idx) => {
      const rowData = [idx + 1, emp.employeeName, emp.employeeRole];

      dates?.forEach((d) => {
        // Find matching attendance data for this date
        const stat = emp.dailyStats.find((s) => {
          // Convert UTC backend date to local date for comparison
          const backendDate = new Date(s.date);
          const year_local = backendDate.getFullYear();
          const month_local = String(backendDate.getMonth() + 1).padStart(2, '0');
          const day_local = String(backendDate.getDate()).padStart(2, '0');
          const statDate = `${year_local}-${month_local}-${day_local}`;
          
          return statDate === d;
        });

        if (stat) {
          // HAS DATA - show check in/out times
          rowData.push(timeFmt(stat.checkIn), timeFmt(stat.checkOut));
        } else {
          // NO DATA - empty cells
          rowData.push("", "");
        }
      });

      const dataRow = ws.addRow(rowData);

      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Light blue background for attendance data (columns after C)
        if (colNumber > 3) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9E1F2" },
          };
        }
      });

      // Left align name and designation
      dataRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
      dataRow.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
    }) || [];

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Tooltips
      text="Download Attendance Records"
      position={useIsMobile ? "left" : "left"}
    >
      <Download
        onClick={downloadExcel}
        className="h-10 w-10 p-1.5 bg-primary text-white rounded-lg cursor-pointer"
      />
    </Tooltips>
  );
}
