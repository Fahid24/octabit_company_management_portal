import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";

const YearlyLeaveStats = ({ leaveStats, configData, selectedYear }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use selected year from filter or fallback to current year
  const currentYear = selectedYear || new Date().getFullYear();

  // Helper function to calculate progress bar color based on usage percentage
  const getProgressColor = (used, total) => {
    if (total === 0) return "#10B981"; // Green if no limit set

    const percentage = (used / total) * 100;

    if (percentage <= 30) {
      return "#10B981"; // Green (low usage)
    } else if (percentage <= 60) {
      return "#F59E0B"; // Amber (medium usage)
    } else if (percentage <= 80) {
      return "#EF4444"; // Red (high usage)
    } else {
      return "#DC2626"; // Dark red (very high usage)
    }
  };

  // Helper function to calculate limit based on unit
  const calculateLimit = (limitConfig) => {
    if (!limitConfig) return 0;

    const { unit, value } = limitConfig;

    if (unit === "yearly") {
      return value;
    } else if (unit === "monthly") {
      // Calculate yearly limit from monthly (12 months)
      return value * 12;
    }

    return value; // fallback
  };

  // Get dynamic limits from config
  const casualLeaveLimit = calculateLimit(configData?.casualLeaveLimit);
  const annualLeaveLimit = calculateLimit(configData?.annualLeaveLimit);
  const medicalLeaveLimit = calculateLimit(configData?.medicalLeaveLimit);

  // Calculate total available days
  const totalAvailableDays =
    casualLeaveLimit + annualLeaveLimit + medicalLeaveLimit;

  // Calculate totals from all leave types
  const totalApproved =
    leaveStats.casualLeave.approved +
    leaveStats.medicalLeave.approved +
    leaveStats.annualLeave.approved;
  const totalPending =
    leaveStats.casualLeave.pending +
    leaveStats.medicalLeave.pending +
    leaveStats.annualLeave.pending;
  const totalRejected =
    leaveStats.casualLeave.rejected +
    leaveStats.medicalLeave.rejected +
    leaveStats.annualLeave.rejected;
  const grandTotal =
    leaveStats.casualLeave.total +
    leaveStats.medicalLeave.total +
    leaveStats.annualLeave.total;

  // Calculate remaining days
  const remainingDays = totalAvailableDays - totalApproved;

  const LeaveTypeCard = ({ title, data, color, icon }) => {
    const Icon = icon;
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="p-1.5 rounded"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
          <span className="ml-auto text-lg font-bold" style={{ color }}>
            {data.total}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-[#00904B]/10 rounded">
            <CheckCircle className="w-3 h-3 text-[#00904B] mx-auto mb-1" />
            <div className="text-xs text-[#00904B] font-medium">
              {data.approved}
            </div>
          </div>
          <div className="text-center p-2 bg-[#FFC107]/10 rounded">
            <Clock className="w-3 h-3 text-[#FFC107] mx-auto mb-1" />
            <div className="text-xs text-[#FFC107] font-medium">
              {data.pending}
            </div>
          </div>
          <div className="text-center p-2 bg-[#F44336]/10 rounded">
            <XCircle className="w-3 h-3 text-[#F44336] mx-auto mb-1" />
            <div className="text-xs text-[#F44336] font-medium">
              {data.rejected}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg shadow-sm border border-primary/30 mb-6">
      {/* Header - Always Visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/30 transition-all duration-200 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Leave Report - {currentYear}
            </h2>
            <p className="text-sm text-gray-600">
              Leave Statistics | Total: {grandTotal} days | Approved:{" "}
              {totalApproved} | Pending: {totalPending} | Rejected:{" "}
              {totalRejected}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#00904B] rounded-full"></div>
              <span className="text-gray-600">
                Available: {remainingDays} days
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-gray-600">Used: {totalApproved} days</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {totalApproved}
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              Days Used
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 border-t border-primary/20 bg-white rounded-b-lg">
          {/* Quick Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-primary">{grandTotal}</div>
              <div className="text-xs text-primary/70">
                Total Days Requested
              </div>
            </div>
            <div className="text-center p-3 bg-[#00904B]/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#00904B] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#00904B]">
                {totalApproved}
              </div>
              <div className="text-xs text-[#00904B]/70">Approved</div>
            </div>
            <div className="text-center p-3 bg-[#FFC107]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#FFC107] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#FFC107]">
                {totalPending}
              </div>
              <div className="text-xs text-[#FFC107]/70">Pending</div>
            </div>
            <div className="text-center p-3 bg-[#F44336]/10 rounded-lg">
              <XCircle className="w-5 h-5 text-[#F44336] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#F44336]">
                {totalRejected}
              </div>
              <div className="text-xs text-[#F44336]/70">Rejected</div>
            </div>
          </div>

          {/* Leave Type Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <LeaveTypeCard
              title="Annual Leave"
              data={leaveStats.annualLeave}
              color="#8A6642"
              icon={Calendar}
            />
            <LeaveTypeCard
              title="Casual Leave"
              data={leaveStats.casualLeave}
              color="#00904B"
              icon={Calendar}
            />
            <LeaveTypeCard
              title="Medical Leave"
              data={leaveStats.medicalLeave}
              color="#F44336"
              icon={AlertCircle}
            />
          </div>

          {/* Progress Summary */}
          <div className="my-4 p-4 bg-gradient-to-r from-gray-50 to-primary/10 rounded-lg border border-primary/20">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {currentYear} Leave Balance Overview ({totalAvailableDays} total
              days available)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Annual Leave</span>
                  <span className="text-primary font-medium">
                    {leaveStats.annualLeave.approved}/{annualLeaveLimit} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        annualLeaveLimit > 0
                          ? Math.min(
                              (leaveStats.annualLeave.approved /
                                annualLeaveLimit) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                      backgroundColor: getProgressColor(
                        leaveStats.annualLeave.approved,
                        annualLeaveLimit
                      ),
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Remaining:{" "}
                  {Math.max(
                    annualLeaveLimit - leaveStats.annualLeave.approved,
                    0
                  )}{" "}
                  days
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Casual Leave</span>
                  <span className="text-primary font-medium">
                    {leaveStats.casualLeave.approved}/{casualLeaveLimit} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        casualLeaveLimit > 0
                          ? Math.min(
                              (leaveStats.casualLeave.approved /
                                casualLeaveLimit) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                      backgroundColor: getProgressColor(
                        leaveStats.casualLeave.approved,
                        casualLeaveLimit
                      ),
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Remaining:{" "}
                  {Math.max(
                    casualLeaveLimit - leaveStats.casualLeave.approved,
                    0
                  )}{" "}
                  days
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Medical Leave</span>
                  <span className="text-primary font-medium">
                    {leaveStats.medicalLeave.approved}/{medicalLeaveLimit} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        medicalLeaveLimit > 0
                          ? Math.min(
                              (leaveStats.medicalLeave.approved /
                                medicalLeaveLimit) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                      backgroundColor: getProgressColor(
                        leaveStats.medicalLeave.approved,
                        medicalLeaveLimit
                      ),
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Remaining:{" "}
                  {Math.max(
                    medicalLeaveLimit - leaveStats.medicalLeave.approved,
                    0
                  )}{" "}
                  days
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-4 pt-3 border-t border-primary/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Leave Utilization
                </span>
                <span className="text-sm font-bold text-primary">
                  {totalApproved}/{totalAvailableDays} days (
                  {totalAvailableDays > 0
                    ? Math.round((totalApproved / totalAvailableDays) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      totalAvailableDays > 0
                        ? Math.min(
                            (totalApproved / totalAvailableDays) * 100,
                            100
                          )
                        : 0
                    }%`,
                    backgroundColor: getProgressColor(
                      totalApproved,
                      totalAvailableDays
                    ),
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Available balance: {Math.max(remainingDays, 0)} days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyLeaveStats;
