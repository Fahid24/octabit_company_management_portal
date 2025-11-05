// excelExporter.js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Export food data to Excel file
 * @param {Object} params - Export parameters
 * @param {Array} params.foodItems - Array of food items
 * @param {Object} params.foodStats - Statistics object
 * @param {string} params.startDate - Start date for the report
 * @param {string} params.endDate - End date for the report
 * @param {Function} params.onError - Error callback function (optional)
 * @param {string} params.fileName - Custom filename (optional)
 */
export const exportFoodDataToXLSX = async ({
  foodItems,
  foodStats,
  startDate,
  endDate,
  onError,
  fileName
}) => {
  try {
    // Validate required parameters
    if (!foodItems || !Array.isArray(foodItems)) {
      throw new Error('foodItems must be a valid array');
    }
    
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Food Data Report");

    // ===== Meta Info Section =====
    sheet.addRow([
      "Generated Date",
      new Date().toLocaleDateString(),
      "",
      "Generated Time",
      new Date().toLocaleTimeString(),
    ]);
    sheet.addRow([]); // spacer

    // Style meta rows
    const metaRow = sheet.getRow(1);
    metaRow.eachCell((cell, idx) => {
      if (idx % 2 === 1) {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "left" };
      } else {
        cell.font = { color: { argb: "FF22223B" } };
        cell.alignment = { horizontal: "left" };
      }
    });

    // ===== Title Section =====
    const titleRowIdx = sheet.lastRow.number + 1;
    sheet.addRow(["Food Consumption & Waste Report"]);
    sheet.addRow([""]); // for merge
    sheet.mergeCells(titleRowIdx, 1, titleRowIdx + 1, 8);

    const mergedCell = sheet.getCell(titleRowIdx, 1);
    mergedCell.value = "Food Consumption & Waste Report";
    mergedCell.alignment = { vertical: "middle", horizontal: "center" };
    mergedCell.font = { bold: true, size: 14 };
    mergedCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB6D7A8" }, // light green
    };

    // ===== Date Range Info =====
    const dateRangeRow = sheet.addRow([
      "Date Range:",
      `${new Date(startDate).toLocaleDateString()} to ${new Date(
        endDate
      ).toLocaleDateString()}`,
    ]);
    dateRangeRow.getCell(1).font = { bold: true };
    dateRangeRow.eachCell((cell) => {
      cell.alignment = { horizontal: "left" };
    });
    
    sheet.addRow([]); // spacer

    // ===== Stats Summary =====
    const summaryTitleRow = sheet.addRow(["Summary Statistics"]);
    summaryTitleRow.getCell(1).font = { bold: true, size: 12 };
    summaryTitleRow.getCell(1).alignment = { horizontal: "left" };

    // Create summary statistics with consistent left alignment
    const statsRow1 = sheet.addRow([
      "Total Meals:",
      foodStats?.totalFood || 0,
      "Total Cost:",
      foodStats?.totalCost ? `৳${foodStats.totalCost.toFixed(2)}` : "৳0",
    ]);
    
    const statsRow2 = sheet.addRow([
      "Wasted Meals:",
      foodStats?.wastedCount || 0,
      "Wasted Amount:",
      foodStats?.wastedCost ? `৳${foodStats.wastedCost.toFixed(2)}` : "৳0",
    ]);

    // Style stats rows
    [statsRow1, statsRow2].forEach(row => {
      row.eachCell((cell, colNumber) => {
        if (colNumber % 2 === 1) { // Label columns (1, 3, 5, etc.)
          cell.font = { bold: true };
          cell.alignment = { horizontal: "left" };
        } else { // Value columns (2, 4, 6, etc.)
          cell.alignment = { horizontal: "left" };
          cell.font = { color: { argb: "FF22223B" } };
        }
      });
    });

    sheet.addRow([]); // spacer

    // ===== Header Row =====
    const headerRow = sheet.addRow([
      "Date",
      "Meal Type",
      "Ordered Number",
      "Consumed Number",
      "Wasted Number",
      "Meal Rate (BDT)",
      "Total Cost (BDT)",
      "Wasted By (Names)",
    ]);

    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCE5FF" }, // light blue
      };
      
      // Align headers appropriately
      if ([3, 4, 5, 6, 7].includes(colNumber)) { // Number columns
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else { // Text columns
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });

    // ===== Data Rows =====
    foodItems.forEach((item, idx) => {
      const wastedNames = item.wastedEntries
        ? item.wastedEntries
            .map((entry) => `${entry.firstName} ${entry.lastName}`)
            .join(", ")
        : "None";

      const row = sheet.addRow([
        new Date(item.date).toLocaleDateString(),
        item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1),
        item.totalFood,
        item.totalFood - (item.wastedCount || 0),
        item.wastedCount || 0,
        item.mealRate,
        item.cost,
        wastedNames,
      ]);

      row.height = 24;
      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: idx % 2 === 0 ? "FFF6F8FC" : "FFFFFFFF" }, // striped rows
        };

        // Set alignment based on column type
        if ([3, 4, 5, 6, 7].includes(colNumber)) { // Number columns
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else { // Text columns
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }

        // Highlight wasted numbers in red
        if (colNumber === 5 && cell.value > 0) { // Wasted Number column
          cell.font = { color: { argb: "FFFF0000" }, bold: true };
        }
      });
    });

    // ===== Top Wasters Section =====
    if (foodStats?.wastedByEmployee?.length > 0) {
      sheet.addRow([]); // spacer
      
      const wastersTitle = sheet.addRow(["Top Food Wasters"]);
      wastersTitle.getCell(1).font = { bold: true, size: 12 };
      wastersTitle.getCell(1).alignment = { horizontal: "left" };

      const wastersHeader = sheet.addRow(["Employee Name", "Wasted Count"]);
      wastersHeader.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCE5CD" }, // light orange
        };
        
        if (colNumber === 1) { // Employee Name
          cell.alignment = { vertical: "middle", horizontal: "left" };
        } else { // Wasted Count
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      foodStats.wastedByEmployee.forEach((employee, idx) => {
        const row = sheet.addRow([employee.name, employee.wastedCount]);

        row.eachCell((cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: idx % 2 === 0 ? "FFFEF4E8" : "FFFFFFFF" },
          };
          
          if (colNumber === 1) { // Employee Name
            cell.alignment = { vertical: "middle", horizontal: "left" };
          } else { // Wasted Count
            cell.alignment = { vertical: "middle", horizontal: "center" };
          }
        });
      });
    }

    // ===== Auto column widths =====
    sheet.columns.forEach((col, idx) => {
      let maxLen = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = String(cell.value || "").length;
        // For names column, don't let it get too wide
        maxLen = Math.min(
          Math.max(maxLen, cellLength),
          idx === 7 ? 50 : 20 // Column 8 is index 7 (0-based)
        );
      });
      col.width = maxLen + 2;
    });

    // ===== Save File =====
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Generate filename
    const defaultFileName = `food_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    const finalFileName = fileName || defaultFileName;

    // Use file-saver to save the file
    saveAs(blob, finalFileName);
    
    return { success: true, fileName: finalFileName };
    
  } catch (err) {
    console.error("Error exporting XLSX:", err);
    
    // Call error callback if provided
    if (onError && typeof onError === 'function') {
      onError(err);
    }
    
    return { success: false, error: err.message };
  }
};