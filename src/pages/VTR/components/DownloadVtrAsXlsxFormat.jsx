import { useState } from "react";
import ExcelJS from "exceljs";
import Button from "@/component/Button";

export default function DownloadVtrAsXlsxFormat({ data }) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample data (replace with your actual data)
  const workOrderData = [
    {
      _id: "68667aaefe8061e25f64da6a",
      workOrder: "NT504",
      customerName: "Jhon Meo",
      dateOfProject: "2025-07-01",
      estimatedTime: "34 hrs",
      actualTime: "30 hrs",
      completedBy: "Rafi Tom",
      crewMembers: [
        {
          _id: "68627b15eaab005c83ac4a7f",
          firstName: "shanto",
          lastName: "khan",
        },
        {
          _id: "685e227c70b822ba963ca04c",
          firstName: "Raymond",
          lastName: "Jenkins",
        },
      ],
      crewTeam: "",
      feedback: "All was nice ",
      salesRep: "Chris Ruvalcaba",
      timeSlots: {
        "8 - 8:30am": "LAND",
        "11 - 11:30am": "TREE",
        "4:30 - 5pm": "TREE",
        "5:30 - 6pm": "TREE",
      },
      timeToComplete: "Right amount of time",
      __v: 0,
    },
    {
      _id: "6867489b37d8c7860f7d0041",
      workOrder: "BL023",
      customerName: "Jhon Akkas",
      dateOfProject: "2025-07-01",
      estimatedTime: "1 days",
      actualTime: "2 days",
      completedBy: "Tom Rafi",
      crewMembers: [
        {
          _id: "68626b5544206e992724f61f",
          firstName: "Ryan",
          lastName: "Ayers",
        },
        {
          _id: "685e21c570b822ba963ca03b",
          firstName: "Dominic",
          lastName: "Malcom",
        },
        {
          _id: "68554a06a6f50b417f9544d8",
          firstName: "John",
          lastName: "Doe",
        },
        {
          _id: "685e227c70b822ba963ca04c",
          firstName: "Raymond",
          lastName: "Jenkins",
        },
      ],
      crewTeam: "",
      feedback: "all was good and supportive",
      salesRep: "Patrick Todd",
      timeSlots: {
        "6 - 6:30am": "TREE",
        "9:30 - 10am": "LAND",
        "1 - 1:30pm": "TREE",
        "3 - 3:30pm": "LAND",
        "6:30 - 7pm": "LAND",
      },
      timeToComplete: "Not enough time",
      __v: 0,
    },
    {
      _id: "686776418d19ae8a2c62a899",
      workOrder: "MT 06",
      customerName: "Skyler",
      dateOfProject: "2025-07-01",
      estimatedTime: "10 hrs",
      actualTime: "12 hrs",
      completedBy: "Tomas Yang",
      crewMembers: [
        {
          _id: "68626b5544206e992724f61f",
          firstName: "Ryan",
          lastName: "Ayers",
        },
        {
          _id: "6849225fa0805614fbe2240b",
          firstName: "Fuad",
          lastName: "Ahmad",
        },
      ],
      crewTeam: "Team 04",
      feedback:
        "The tree cutting job was handled with great care and professionalism. The workers were punctual, used the right tools, and followed all necessary safety protocols during the process. They efficiently removed the tree without causing any damage to the surrounding property. The cleanup afterward was thorough, leaving the area neat and tidy. Overall, I'm very satisfied with the quality of work and would gladly recommend their service to others.",
      salesRep: "Tomas",
      timeSlots: {
        "7 - 7:30am": "LAND",
        "8 - 8:30am": "TREE",
        "11 - 11:30am": "TREE",
        "12 - 12:30pm": "LAND",
        "5 - 5:30pm": "TREE",
        "5:30 - 6pm": "TREE",
        "6:30 - 7pm": "LAND",
      },
      timeToComplete: "Not enough time",
      createdBy: {
        _id: "686233ec86ca9e9f37eabe36",
        firstName: "Tomas",
        lastName: "Yang",
      },
      __v: 0,
    },
  ];

  const downloadExcel = async () => {
    setIsDownloading(true);

    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Work Orders", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
      });

      // Define the headers
      const headers = [
        "Work Order",
        "Customer Name",
        "Date of Project",
        "Estimated Time",
        "Actual Time",
        "Completed By",
        "Crew Members",
        "Crew Team",
        "Sales Rep",
        "Time to Complete",
        "Feedback",
        "Time Slots",
      ];

      // Add headers to the worksheet
      worksheet.addRow(headers);

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF8A6642" }, // Primary color
        };
        cell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
          size: 12,
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      });

      // Add data rows
      data?.forEach((item, index) => {
        // Format crew members
        const crewMembersText = item.crewMembers
          .map((member) => `${member.firstName} ${member.lastName}`)
          .join(", ");

        // Format time slots in a more beautiful way
        const formatTimeSlots = (timeSlots) => {
          if (!timeSlots || Object.keys(timeSlots).length === 0) {
            return "No time slots assigned";
          }

          // Group time slots by type
          const treeSlots = [];
          const landSlots = [];

          Object.entries(timeSlots).forEach(([time, type]) => {
            if (type === "TREE") {
              treeSlots.push(time);
            } else if (type === "LAND") {
              landSlots.push(time);
            }
          });

          let formattedSlots = "";

          if (treeSlots.length > 0) {
            formattedSlots += "🌳 TREE WORK:\n" + treeSlots.join("\n") + "\n\n";
          }

          if (landSlots.length > 0) {
            formattedSlots += "🏞️ LANDSCAPING:\n" + landSlots.join("\n");
          }

          return formattedSlots.trim();
        };

        // In the data row creation section, replace the timeSlotsText line with:
        const timeSlotsText = formatTimeSlots(item.timeSlots);

        const row = [
          item.workOrder,
          item.customerName,
          item.dateOfProject,
          item.estimatedTime,
          item.actualTime,
          item.completedBy,
          crewMembersText,
          item.crewTeam,
          item.salesRep,
          item.timeToComplete,
          item.feedback,
          timeSlotsText,
        ];

        const addedRow = worksheet.addRow(row);

        // Style data rows with alternating colors
        const isEvenRow = (index + 2) % 2 === 0;
        addedRow.height = 20;

        addedRow.eachCell((cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isEvenRow ? "FFF5F5F5" : "FFFFFFFF" },
          };
          cell.font = {
            size: 10,
            color: { argb: "FF000000" },
          };

          // Special formatting for time slots column (column 12)
          if (colNumber === 12) {
            cell.alignment = {
              vertical: "top",
              horizontal: "left",
              wrapText: true,
            };
            cell.font = {
              size: 9,
              color: { argb: "FF000000" },
              name: "Consolas", // Monospace font for better alignment
            };
          } else {
            cell.alignment = {
              vertical: "top",
              horizontal: "left",
              wrapText: true,
            };
          }

          cell.border = {
            top: { style: "thin", color: { argb: "FFD3D3D3" } },
            left: { style: "thin", color: { argb: "FFD3D3D3" } },
            bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
            right: { style: "thin", color: { argb: "FFD3D3D3" } },
          };
        });

        // Increase row height for better readability of time slots
        addedRow.height = Math.max(
          20,
          Math.ceil(timeSlotsText.split("\n").length * 12)
        );
      });

      // Auto-fit columns
      worksheet.columns.forEach((column, index) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });

        // Set column width with some padding
        column.width = Math.min(Math.max(maxLength + 2, 12), 50);

        // Special handling for feedback and time slots columns
        if (index === 10) {
          // Feedback column
          column.width = 40;
        }
        if (index === 11) {
          // Time slots column - make it wider and set specific formatting
          column.width = 25;
          column.alignment = { wrapText: true, vertical: "top" };
        }
      });

      // Add a title row at the top
      worksheet.spliceRows(1, 0, ["Work Orders Report"]);
      const titleRow = worksheet.getRow(1);
      titleRow.height = 35;
      worksheet.mergeCells("A1:L1");

      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Work Orders Report";
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6B4E3D" }, // Darker shade of primary color
      };
      titleCell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
        size: 16,
      };
      titleCell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Add some spacing
      worksheet.spliceRows(2, 0, [""]);

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `work-orders-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Excel file:", error);
      alert("Error generating Excel file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={downloadExcel}
      size="sm"
      disabled={data?.length === 0 || isDownloading}
      className="transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-lg py-2 sm:py-3"
    >
      {isDownloading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Generating Excel...
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download
        </>
      )}
    </Button>
  );
}
