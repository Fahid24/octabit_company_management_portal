import { Download } from "lucide-react";
import Tooltip from "@/component/Tooltip";
import WeeklyTimesheet from "./WeeklyTimesheet";

const EmployeeDetailView = ({
    employees,
    handleDownload,
    groupDataByWeeks,
    adminConfig
}) => {
    return (
        <div className="mt-8">
            {employees.map((employee) => (
                <div
                    key={employee.employeeId}
                    className="mb-12 bg-white rounded-lg shadow overflow-hidden"
                >
                    {/* Employee Header */}
                    <div className="bg-form-header-gradient p-4 text-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full overflow-hidden bg-white/20">
                                {employee.employeePhoto ? (
                                    <img
                                        src={employee.employeePhoto}
                                        alt={employee.employeeName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex text-gray-800 items-center justify-center h-full w-full text-lg font-bold">
                                        {employee.employeeName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="text-gray-800">
                                <h3 className="text-lg font-bold">{employee.employeeName}</h3>
                                <div className="flex gap-4 text-sm opacity-90">
                                    <span>{employee.employeeDesignation}</span>
                                    <span>•</span>
                                    <span>{employee.department?.name}</span>
                                </div>
                            </div>
                        </div>

                        <Tooltip text={"Download Attendance Sheet"} position="left">
                            <Download
                                onClick={() => handleDownload(employee)}
                                className="text-primary mr-5 border border-primary cursor-pointer p-2 h-10 w-10 rounded-full"
                            />
                        </Tooltip>
                    </div>

                    {/* Weekly Timesheet */}
                    <WeeklyTimesheet
                        employee={employee}
                        adminConfig={adminConfig}
                        groupDataByWeeks={groupDataByWeeks}
                    />
                </div>
            ))}
        </div>
    );
};

export default EmployeeDetailView;
