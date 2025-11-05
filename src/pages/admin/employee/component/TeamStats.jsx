import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Users, Clock, CalendarDays, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";

const TeamStats = ({ employees = [] }) => {
  const stats = useMemo(() => {
    let totalWorkedHours = 0;
    let totalWorkDays = 0;
    let totalLeaveDays = 0;
    let activeDaysCount = 0;

    employees.forEach(emp => {
      totalWorkedHours += emp.dailyStats.reduce((sum, d) => sum + (d.workedHours || 0), 0);
      totalLeaveDays += emp.dailyStats.filter(d => d.isLeaveDay).length;
      totalWorkDays += emp.dailyStats.filter(d => d.workedHours > 0).length;
      
      // Count days where at least one employee worked
      const activeDays = new Set();
      emp.dailyStats.forEach(d => {
        if (d.workedHours > 0) {
          activeDays.add(new Date(d.date).toISOString().split('T')[0]);
        }
      });
      activeDaysCount = Math.max(activeDaysCount, activeDays.size);
    });

    const avgHoursPerEmployee = employees.length ? totalWorkedHours / employees.length : 0;
    const avgDailyHours = activeDaysCount ? totalWorkedHours / activeDaysCount : 0;

    return {
      totalEmployees: employees.length,
      totalWorkedHours,
      totalWorkDays,
      totalLeaveDays,
      avgHoursPerEmployee,
      avgDailyHours
    };
  }, [employees]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-500" />
            Team Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          <p className="text-xs text-muted-foreground">Active employees</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" />
            Total Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkedHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.avgHoursPerEmployee.toFixed(1)} hrs/employee
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Briefcase className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-500" />
            Work Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkDays}</div>
          <p className="text-xs text-muted-foreground">
            {stats.avgDailyHours.toFixed(1)} hrs/day avg
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <CalendarDays className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-500" />
            Leave Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeaveDays}</div>
          <p className="text-xs text-muted-foreground">
            {employees.length ? (stats.totalLeaveDays / employees.length).toFixed(1) : 0} days/employee
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

TeamStats.propTypes = {
  employees: PropTypes.array.isRequired
};

export default TeamStats;