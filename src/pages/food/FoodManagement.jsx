import {
  useGetAllFoodItemsQuery,
  useDeleteFoodItemMutation,
  useGetAllFoodItemStatsQuery,
} from "@/redux/features/food/foodApiSlice";
import ExcelJS from "exceljs";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import BulkActions from "./components/BulkActions";

import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";
import {
  BanknoteArrowDown,
  Plus,
  Trash,
  TrendingUp,
  Utensils,
  Edit,
  ChevronUp,
  ChevronDown,
  BanknoteX,
  Download,
} from "lucide-react";
import Tooltip from "@/component/Tooltip";
import Button from "@/component/Button";
import DateRangeSelector from "@/component/DateRangeSelector";
import ConfirmDialog from "@/component/ConfirmDialog";
import { toast } from "@/component/Toast";
import Pagination from "@/component/Pagination";
import Loader from "@/component/Loader";
import { Tabs, TabsList, TabsTrigger } from "@/component/tabs";

function getPrevMonthLastDay() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .slice(0, 10);
}

function getCurrentMonthFirstLastDay() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setDate(lastDay.getDate());
  return lastDay.toISOString().slice(0, 10);
}

const FoodManagement = () => {
  const [startDate, setStartDate] = useState(getPrevMonthLastDay());
  const [endDate, setEndDate] = useState(getCurrentMonthFirstLastDay());
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAllWasters, setShowAllWasters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [mealType, setMealType] = useState("all");
  const navigate = useNavigate();

  const {
    data,
    isLoading: isFoodItemLoading,
    isError,
    refetch: refetchFoodItems,
  } = useGetAllFoodItemsQuery(
    { startDate, endDate, page: currentPage, limit, mealType },
    { refetchOnMountOrArgChange: true },
    { refetchOnFocus: true }
  );

  const foodItems = data?.data || [];

  // console.log("Food Items:", foodItems);

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteFoodItem] = useDeleteFoodItemMutation();
  const {
    data: foodStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetAllFoodItemStatsQuery(
    { startDate, endDate, mealType },
    { refetchOnMountOrArgChange: true },
    { refetchOnFocus: true } // forces network fetch each mount
  );

  // State for sorting

  const location = useLocation();
  useEffect(() => {
    refetchStats(); // automatically runs every time this page becomes active
  }, [location.key]);

  // Sort food items
  const sortedFoodItems = React.useMemo(() => {
    if (!foodItems) return [];

    let sortableItems = [...foodItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [foodItems, sortConfig]);

  // Sort wasted employees by count (descending)
  const sortedWastedEmployees = React.useMemo(() => {
    if (!foodStats?.wastedByEmployee) return [];
    return [...foodStats.wastedByEmployee].sort(
      (a, b) => b.wastedCount - a.wastedCount
    );
  }, [foodStats]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const handleEdit = (foodItem) => {
    navigate(`/food-update/${foodItem._id}`);
    refetchStats();
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFoodItem(itemToDelete).unwrap();
      toast.success("Success", "Food record deleted successfully!");
      await refetchFoodItems();
      await refetchStats();
      setIsDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to delete food record."
      );
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const exportToXLSX = async () => {
    try {
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
      [statsRow1, statsRow2].forEach((row) => {
        row.eachCell((cell, colNumber) => {
          if (colNumber % 2 === 1) {
            // Label columns (1, 3, 5, etc.)
            cell.font = { bold: true };
            cell.alignment = { horizontal: "left" };
          } else {
            // Value columns (2, 4, 6, etc.)
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
        if ([3, 4, 5, 6, 7].includes(colNumber)) {
          // Number columns
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          // Text columns
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
          if ([3, 4, 5, 6, 7].includes(colNumber)) {
            // Number columns
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            // Text columns
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }

          // Highlight wasted numbers in red
          if (colNumber === 5 && cell.value > 0) {
            // Wasted Number column
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

          if (colNumber === 1) {
            // Employee Name
            cell.alignment = { vertical: "middle", horizontal: "left" };
          } else {
            // Wasted Count
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

            if (colNumber === 1) {
              // Employee Name
              cell.alignment = { vertical: "middle", horizontal: "left" };
            } else {
              // Wasted Count
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

      // Use file-saver to save the file
      saveAs(
        blob,
        `food_report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      console.error("Error exporting XLSX:", err);
      toast.error("Error", "Failed to export XLSX file");
    }
  };

  const stats = [
    {
      title: "Total Meals",
      value: foodStats?.totalFood || 0,
      icon: <Utensils className="h-5 w-5" />,
      color: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      textColor: "text-blue-700",
      description: "Total meals served",
    },
    {
      title: "Total Cost",
      value: foodStats?.totalCost ? `৳${foodStats.totalCost.toFixed(2)}` : "৳0",
      icon: <BanknoteArrowDown className="h-5 w-5" />,
      color: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconBg: "bg-green-500",
      iconColor: "text-white",
      textColor: "text-green-700",
      description: "Total food cost",
    },
    {
      title: "Wasted Meals",
      value: foodStats?.wastedCount || 0,
      icon: <Trash className="h-5 w-5" />,
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-500",
      iconColor: "text-white",
      textColor: "text-yellow-700",
      description: "Total wasted meals",
    },
    {
      title: "Wasted Amount",
      value: foodStats?.wastedCost ? `${foodStats.wastedCost.toFixed(2)}` : "0",
      icon: <BanknoteX className="h-5 w-5" />,
      color: "bg-gradient-to-br from-red-50 to-red-100",
      borderColor: "border-red-200",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      textColor: "text-red-700",
      description: "Cost of wasted meals",
    },
  ];

  if (isFoodItemLoading && isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="space-y-8">
        <Card className="">
          <CardHeader className="">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="flex items-center space-x-2">
                <span>Food Management</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate("/food-create")}>
                  <Plus /> ADD FOOD RECORD
                </Button>
                <Tooltip text="Download Report" position="left">
                  <Button
                    size="sm"
                    type="button"
                    variant=""
                    onClick={exportToXLSX}
                    className="rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                  >
                    <Download />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 z-50 lg:col-span-4 mt-1">
                <DateRangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={({
                    startDate: newStart,
                    endDate: newEnd,
                  }) => {
                    setStartDate(newStart);
                    setEndDate(newEnd);
                  }}
                />
              </div>
              <div>
                <Tabs
                  defaultValue={mealType}
                  className=""
                  onValueChange={(value) => {
                    setMealType(value);
                  }}
                  value={mealType}
                >
                  <TabsList className="flex">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold rounded-none h-14 flex-shrink-0 transition-all duration-200"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="lunch"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold rounded-none h-14 flex-shrink-0 transition-all duration-200"
                    >
                      Lunch
                    </TabsTrigger>
                    <TabsTrigger
                      value="evening_snacks"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 flex-shrink-0"
                    >
                      Snacks
                    </TabsTrigger>
                    <TabsTrigger
                      value="dinner"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14  flex-shrink-0"
                    >
                      Dinner
                    </TabsTrigger>
                    <TabsTrigger
                      value="midnight_snacks"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 flex-shrink-0"
                    >
                      Midnight Snacks
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} ${stat.borderColor} border-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-4 -translate-x-4 group-hover:scale-110 transition-transform duration-300"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${stat.iconBg} shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className={stat.iconColor}>{stat.icon}</div>
                  </div>
                  <TrendingUp
                    className={`h-4 w-4 ${stat.textColor} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </h3>
                  <p className={`text-xs font-bold ${stat.textColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-xs ${stat.textColor} opacity-70`}>
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wasted Employees Section */}
        {sortedWastedEmployees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Top Food Wasters</span>
                <button
                  onClick={() => toggleSection("wastedEmployees")}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 text-[18px] rounded-md hover:bg-indigo-200 transition-colors"
                >
                  {expandedSection === "wastedEmployees" ? "Hide" : "Show"}
                </button>
              </CardTitle>
            </CardHeader>
            {expandedSection === "wastedEmployees" && (
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wasted Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wasted Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedWastedEmployees
                        .slice(
                          0,
                          showAllWasters ? sortedWastedEmployees.length : 10
                        )
                        .map((employee) => (
                          <tr
                            key={employee.employeeId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  {employee.photoUrl ? (
                                    <img
                                      className="w-8 h-8 rounded-full object-cover"
                                      src={employee.photoUrl}
                                      alt=""
                                    />
                                  ) : (
                                    <span className="text-orange-600 font-medium text-sm">
                                      {employee.firstName?.charAt(0)}
                                      {employee.lastName?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {employee.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {employee.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {employee.wastedCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {employee.wastedAmount}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {sortedWastedEmployees.length > 10 && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => setShowAllWasters(!showAllWasters)}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                      >
                        {showAllWasters ? "Show Less" : "Show More"}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Food Records Table */}

        <CardHeader>
          <CardTitle>Food Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("date")}
                  >
                    Date {getSortIcon("date")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Meals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Rate (BDT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost (BDT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wasted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Meal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFoodItemLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-red-500"
                    >
                      Error loading food records
                    </td>
                  </tr>
                ) : sortedFoodItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No food records found for selected date range
                    </td>
                  </tr>
                ) : (
                  sortedFoodItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {item.mealType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.totalFood}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.mealRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {item.wastedCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.guests || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Tooltip text="Edit" position="top">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip text="Delete" position="top">
                            <button
                              onClick={() => handleDeleteClick(item._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {sortedFoodItems.length ? (
            <div className="flex justify-center mt-4">
              <Pagination
                currentCount={sortedFoodItems.length}
                totalCount={data.pagination.total}
                limit={limit}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setLimit={setLimit}
                className="w-full justify-center"
              />
            </div>
          ) : (
            ""
          )}
        </CardContent>
      </div>
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this food record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onBackdropClick={handleBackdropClick}
      />
    </div>
  );
};

export default FoodManagement;
