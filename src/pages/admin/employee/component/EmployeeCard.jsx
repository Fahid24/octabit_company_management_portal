import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@/component/badge";
import { User, Clock, Calendar } from "lucide-react";
import EmployeeWorkHourCalendar from "@/pages/admin/employee/component/EmployeeWorkHourCalendar";

const EmployeeCard = ({ employee, isCompact = false }) => {

  // Calculate statistics
  const totalWorkedHours = employee.dailyStats.reduce((sum, d) => sum + (d.workedHours || 0), 0);
  const workDays = employee.dailyStats.filter(d => d.workedHours > 0).length;
  const leaveDays = employee.dailyStats.filter(d => d.isLeaveDay).length;
  // console.log(employee);
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-100 overflow-hidden 
      ${isCompact ? 'p-3' : 'p-4'} hover:shadow-lg transition-shadow duration-300`}>
      
      {/* Header with photo and basic info */}
      <div className="flex items-center mb-3">
        {employee.employeePhoto ? (
          <img 
            src={employee.employeePhoto} 
            alt={employee.employeeName} 
            className={`${isCompact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover mr-3`} 
          />
        ) : (
          <div className={`${isCompact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-gray-200 flex items-center justify-center mr-3`}>
            <User className="text-gray-500" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
            {employee.employeeName}
          </h3>
          <p className="text-gray-500 text-xs truncate">{employee.employeeEmail}</p>
        </div>
      </div>
      
      {/* Role and department badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">
          {employee?.employeeDesignation || "N/A"}
        </Badge>
        {employee.department && (
          <Badge variant="outline" className="text-xs">
            {employee.department.name}
          </Badge>
        )}
      </div>
      
      {/* Stats counters */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex flex-col items-center border rounded py-1">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            Hours
          </div>
          <div className="font-semibold">{totalWorkedHours.toFixed(1)}</div>
        </div>
        <div className="flex flex-col items-center border rounded py-1">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            Work
          </div>
          <div className="font-semibold">{workDays}</div>
        </div>
        <div className="flex flex-col items-center border rounded py-1">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            Leave
          </div>
          <div className="font-semibold">{leaveDays}</div>
        </div>
      </div>
      
      {/* Calendar */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2">Work Calendar</h4>
        <EmployeeWorkHourCalendar dailyStats={employee.dailyStats} isCompact={isCompact} />
      </div>
    </div>
  );
};

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    employeeId: PropTypes.string.isRequired,
    employeeName: PropTypes.string.isRequired,
    employeeEmail: PropTypes.string.isRequired,
    employeeRole: PropTypes.string.isRequired,
    employeePhoto: PropTypes.string,
    department: PropTypes.shape({
      name: PropTypes.string
    }),
    dailyStats: PropTypes.array.isRequired
  }).isRequired,
  isCompact: PropTypes.bool
};

export default EmployeeCard;