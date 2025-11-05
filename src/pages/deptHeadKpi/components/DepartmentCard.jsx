import React from "react";

const DepartmentCard = ({ dept, activeDept, onClick, getScoreColor, getProgressColor }) => (
  <div
    key={dept.departmentId}
    className={`rounded-lg shadow p-4 border-b-4 cursor-pointer transition-all hover:shadow-md
      ${activeDept === dept.departmentId ? "border-primary shadow-md bg-soft-primary-gradient " : "border-gray-200 bg-white "}
    `}
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <h3 className="font-semibold truncate" title={dept.departmentName}>
        {dept.departmentName}
      </h3>
      <div className={`font-bold text-lg ${getScoreColor(dept.finalKpiScore)}`}>
        {typeof dept.finalKpiScore === "number" ? dept.finalKpiScore.toFixed(1) : 0}
      </div>
    </div>
    <div className="mt-3 h-1 bg-gray-200 rounded-full">
      <div
        className={`h-1 rounded-full ${getProgressColor(dept.finalKpiScore)}`}
        style={{
          width: `${Math.min(100, Math.max(0, dept.finalKpiScore || 0))}%`,
        }}
      ></div>
    </div>
    <div className="mt-2 flex justify-between items-center text-xs ">
      <span>Employees: {dept.stats?.totalEmployees || 0}</span>
      <span>Tasks: {dept.stats?.totalTasks || 0}</span>
    </div>
  </div>
);

export default DepartmentCard;
