import { useState, useMemo, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Calendar,
  Download,
  Clock,
  MapPin,
  Mail,
  User,
  UserIcon,
  ChevronLeftIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Legend,
  BarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/card";
import Button from "@/component/Button";
import { Badge } from "@/component/badge";
import { FloatingInput } from "@/component/FloatiingInput";
import { useNavigate } from "react-router-dom";

export default function SingleEmployeeWorkingDetails({ data }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const navigate = useNavigate();

  const defaultStart = data?.dailyStats?.[0]?.date?.slice(0, 10) || "";
  const defaultEnd =
    data?.dailyStats?.[data?.dailyStats?.length - 1]?.date?.slice(0, 10) || "";
  const _startDate = startDate || defaultStart;
  const _endDate = endDate || defaultEnd;

  useEffect(() => {
    if (_startDate && _endDate && _startDate > _endDate) {
      setDateError("Start date cannot be after end date.");
    } else {
      setDateError("");
    }
  }, [_startDate, _endDate]);

  const { filteredData, stats, calendarData } = useMemo(() => {
    const filtered = (data?.dailyStats || [])
      .filter((stat) => {
        const date = new Date(stat?.date);
        const start = new Date(_startDate);
        const end = new Date(_endDate);
        return date >= start && date <= end;
      })
      .map((stat) => {
        // console.log("Date:", stat.date, "isLeaveDay:", stat.isLeaveDay); // Debug log
        return {
          ...stat,
          isLeaveDay: !!stat.isLeaveDay,
          workedHours: stat.workedHours ?? 0,
          formattedDate: new Date(stat.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          dayName: new Date(stat.date).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          monthDay: new Date(stat.date).getDate(),
        };
      });

    const totalHours = filtered.reduce(
      (sum, day) => sum + (day?.workedHours || 0),
      0
    );
    const workingDays = filtered.filter(
      (day) => !day.isLeaveDay && day.workedHours > 0
    ).length;
    const leaveDays = filtered.filter((day) => day.isLeaveDay).length;

    const calendar = [];
    const start = new Date(_startDate);
    const end = new Date(_endDate);
    const calendarStart = new Date(start);
    calendarStart.setDate(start.getDate() - start.getDay());
    const calendarEnd = new Date(end);
    calendarEnd.setDate(end.getDate() + (6 - end.getDay()));

    for (
      let d = new Date(calendarStart);
      d <= calendarEnd;
      d.setDate(d.getDate() + 1)
    ) {
      const dayData = filtered.find(
        (day) => new Date(day.date).toDateString() === d.toDateString()
      );
      calendar.push({
        date: new Date(d),
        day: d.getDate(),
        workedHours: dayData ? dayData.workedHours : 0,
        isLeaveDay: dayData ? !!dayData.isLeaveDay : false,
        isInRange: d >= start && d <= end && !!dayData,
      });
    }

    return {
      filteredData: filtered,
      stats: { totalHours, workingDays, leaveDays },
      calendarData: calendar,
    };
  }, [_startDate, _endDate, data?.dailyStats]);

  const downloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Employee Timeline Report");

      const metaRow1 = [
        "Employee",
        data?.employeeName || "",
        "",
        "Role",
        data?.employeeRole || "",
      ];
      const row1 = sheet.addRow(metaRow1);
      [1, 4].forEach((col) => {
        if (row1.getCell(col)) row1.getCell(col).font = { bold: true };
        row1.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });
      row1.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });

      const metaRow2 = [
        "Email",
        data?.employeeEmail || "",
        "",
        "Working Days",
        stats?.workingDays || 0,
      ];
      const row2 = sheet.addRow(metaRow2);
      [1, 4].forEach((col) => {
        if (row2.getCell(col)) row2.getCell(col).font = { bold: true };
        row2.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });
      row2.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });

      const metaRow3 = [
        "Department",
        data?.department?.name || "",
        "",
        "Leave Days",
        stats?.leaveDays || 0,
      ];
      const row3 = sheet.addRow(metaRow3);
      [1, 4].forEach((col) => {
        if (row3.getCell(col)) row3.getCell(col).font = { bold: true };
        row3.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });
      row3.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });

      const metaRow4 = [
        "Report Period",
        `${_startDate} to ${_endDate}`,
        "",
        "Total Hours",
        stats?.totalHours?.toFixed(2) || "0.00",
      ];
      const row4 = sheet.addRow(metaRow4);
      [1, 4].forEach((col) => {
        if (row4.getCell(col)) row4.getCell(col).font = { bold: true };
        row4.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });
      row4.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });

      sheet.addRow([]);

      const headerRow = sheet.addRow([
        "Date",
        "Day",
        "Hours Worked",
        "Status",
        "Notes",
      ]);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });

      filteredData.forEach((day, idx) => {
        const row = sheet.addRow([
          new Date(day.date).toLocaleDateString(),
          day.dayName,
          day.workedHours.toFixed(2),
          day.isLeaveDay
            ? "Leave"
            : day.workedHours >= 8
            ? "Full Day"
            : day.workedHours > 0
            ? "Partial Day"
            : "No Work",
          day.isLeaveDay
            ? "Employee on leave"
            : day.workedHours === 0
            ? "No work recorded"
            : "Regular work day",
        ]);
        row.height = 24;
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: idx % 2 === 0 ? "FFFFFFFF" : "FFF9FAFB" }, // white / very light gray
          };
        });
      });

      sheet.columns.forEach((col) => {
        let maxLen = 10;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          maxLen = Math.max(maxLen, String(cell.value || "").length);
        });
        col.width = maxLen + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `${data.employeeName}_timeline_${_startDate}_${_endDate}.xlsx`
      );
    } catch (err) {
      console.error("Error downloading Excel:", err);
      alert("Failed to download Excel file");
    }
  };

  const getHourColor = (hours, isLeave) => {
    if (isLeave) return "bg-red-100 text-red-800 border-red-200";
    if (hours === 0) return "bg-gray-100 text-gray-500 border-gray-200";
    if (hours >= 8) return "bg-green-100 text-green-800 border-green-200";
    if (hours >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  if (!data) return <div className="p-6">No employee data provided.</div>;

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden p-0">
        <div className="bg-form-header-gradient p-3 md:p-4 text-gray-800">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-gray-200 bg-gray-200 flex items-center justify-center overflow-hidden">
              {data.employeeImage ? (
                <img
                  src={data.employeeImage}
                  alt={data.employeeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 md:w-10 md:h-10 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                {data.employeeName}
              </h1>
              <div className="flex items-center space-x-2 md:space-x-4 mt-1 md:mt-2 text-gray-800 text-xs md:text-sm">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{data.employeeEmail}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{data.department?.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{data.employeeRole}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-3 md:p-4 text-black">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 md:gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <FloatingInput
                type="date"
                value={_startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto text-xs md:text-sm"
              />
              <span className="text-gray-500 mt-2 md:mt-4 text-xs md:text-sm">
                to
              </span>
              <FloatingInput
                type="date"
                value={_endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto text-xs md:text-sm"
              />
              <Button
                type="button"
                variant="reset"
                className="mt-6 text-xs md:text-sm px-2 py-[5px]"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                disabled={
                  _startDate === defaultStart && _endDate === defaultEnd
                }
              >
                Reset
              </Button>
            </div>
            <Button
              onClick={downloadExcel}
              iconPosition="left"
              icon={<Download size={14} className="mr-1" />}
              disabled={!!dateError}
              className="text-xs md:text-sm px-2 py-1 w-full md:w-40"
            >
              Export Timeline
            </Button>
          </div>
          {dateError && (
            <div className="text-red-600 mt-1 text-xs md:text-sm">
              {dateError}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex md:grid md:grid-cols-5 gap-2 md:gap-4 overflow-x-auto pb-2 hide-scrollbar">
        <Card className="text-center min-w-[120px] p-0">
          <CardContent className="p-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900">
              {stats.totalHours.toFixed(1)}h
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">
              Total Hours
            </div>
          </CardContent>
        </Card>
        <Card className="text-center min-w-[120px] p-0">
          <CardContent className="p-1">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900">
              {stats.workingDays}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">
              Working Days
            </div>
          </CardContent>
        </Card>
        <Card className="text-center min-w-[120px] p-0">
          <CardContent className="p-1">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <User className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900">
              {stats.leaveDays}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">
              Leave Days
            </div>
          </CardContent>
        </Card>
        <Card className="text-center min-w-[120px] p-0">
          <CardContent className="p-1">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900">
              {stats.workingDays > 0
                ? (stats.totalHours / stats.workingDays).toFixed(2)
                : "0.00"}
              h
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">Avg/Day</div>
          </CardContent>
        </Card>
        <Card className="text-center min-w-[120px] p-0">
          <CardContent className="p-1">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <UserIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900">
              {stats.workingDays + stats.leaveDays > 0
                ? (
                    (stats.workingDays /
                      (stats.workingDays + stats.leaveDays)) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">
              Attendance
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-[#000] text-base md:text-lg">
              Calendar Timeline
            </CardTitle>
            <CardDescription className="text-[#000] text-xs md:text-sm">
              Daily working hours
            </CardDescription>
          </CardHeader>
          <CardContent className="pt1 md:pt-1">
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm font-medium text-gray-500 p-1"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`
                     border-2 rounded-lg py-1 text-center transition-all hover:scale-105
                    ${getHourColor(day.workedHours, day.isLeaveDay)}
                    ${!day.isInRange ? "opacity-30" : ""}
                  `}
                >
                  <div className="text-xs md:text-sm font-medium">
                    {day.day}
                  </div>
                  {day.isInRange && (
                    <div className="text-[10px] md:text-xs mt-0.5 md:mt-1">
                      {day.isLeaveDay
                        ? "Leave"
                        : `${day.workedHours.toFixed(1)}h`}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center space-x-2 md:space-x-6 mt-2 md:mt-6 text-xs md:text-sm text-black">
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 border-2 border-green-200 rounded"></div>
                <span>Full (8h+)</span>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-100 border-2 border-yellow-200 rounded"></div>
                <span>Partial (6-8h)</span>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-100 border-2 border-orange-200 rounded"></div>
                <span>Short (&lt;6h)</span>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 border-2 border-red-200 rounded"></div>
                <span>Leave</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-[#000] text-base md:text-lg">
              Activity Timeline
            </CardTitle>
            <CardDescription className="text-[#000] text-xs md:text-sm">
              Chronological work
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 md:pt-4">
            <div className="space-y-2 md:space-y-4 max-h-[200px] md:max-h-[370px] overflow-y-auto">
              {filteredData.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 md:space-x-4 p-2 md:p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                        day.isLeaveDay
                          ? "bg-red-500"
                          : day.workedHours >= 8
                          ? "bg-green-500"
                          : day.workedHours > 0
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <Badge
                        variant={
                          day.isLeaveDay
                            ? "destructive"
                            : day.workedHours >= 8
                            ? "default"
                            : "secondary"
                        }
                        className={`$${
                          day.isLeaveDay ? "" : "text-white"
                        } text-[10px] md:text-xs px-1 md:px-2`}
                      >
                        {day.isLeaveDay
                          ? "Leave"
                          : `${day.workedHours.toFixed(1)}h`}
                      </Badge>
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 truncate">
                      {day.isLeaveDay
                        ? "Employee was on leave"
                        : day.workedHours === 0
                        ? "No work recorded"
                        : day.workedHours >= 8
                        ? "Full day"
                        : "Partial day"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-[#000] text-base md:text-lg">
              Hours Trend
            </CardTitle>
            <CardDescription className="text-[#000] text-xs md:text-sm">
              Daily hours
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1 md:pt-1">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={filteredData}
                margin={{ top: 1, right: 1, left: -30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => [`${value}h`, "Hours Worked"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="workedHours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 md:pb-4">
            <CardTitle className="text-[#000] text-base md:text-lg">
              Weekly Summary
            </CardTitle>
            <CardDescription className="text-[#000] text-xs md:text-sm">
              Work vs Leave
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1 md:pt-1">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(() => {
                  const weeks = {};
                  filteredData.forEach((day) => {
                    const d = new Date(day.date);
                    const week =
                      d.getFullYear() +
                      "-W" +
                      String(
                        Math.ceil(
                          ((d - new Date(d.getFullYear(), 0, 1)) / 86400000 +
                            new Date(d.getFullYear(), 0, 1).getDay() +
                            1) /
                            7
                        )
                      ).padStart(2, "0");
                    if (!weeks[week]) {
                      weeks[week] = { week, working: 0, leave: 0 };
                    }
                    if (day.isLeaveDay) weeks[week].leave += 1;
                    else if (day.workedHours > 0) weeks[week].working += 1;
                  });
                  return Object.values(weeks);
                })()}
                margin={{ top: 1, right: 1, left: -30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="working"
                  stackId="a"
                  fill="#22c55e"
                  name="Working"
                />
                <Bar dataKey="leave" stackId="a" fill="#ef4444" name="Leave" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
