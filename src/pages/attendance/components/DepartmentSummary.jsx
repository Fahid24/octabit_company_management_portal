import { Building2, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import LeaveIcon from "@/assets/Leave.png"

const DepartmentSummary = ({ departmentSummary }) => {
    const [expandedDepartments, setExpandedDepartments] = useState(new Set())
    const [isComponentCollapsed, setIsComponentCollapsed] = useState(false)

    const toggleDepartment = (department) => {
        setExpandedDepartments((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(department)) {
                newSet.delete(department)
            } else {
                newSet.add(department)
            }
            return newSet
        })
    }

    const toggleComponent = () => {
        setIsComponentCollapsed(!isComponentCollapsed)
    }
    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div
                className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleComponent}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Department Summary</h3>
                    {isComponentCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                </div>
            </div>

            {!isComponentCollapsed && (
                <div className="p-2 sm:p-3 md:p-4">
                    {departmentSummary.length > 0 ? (
                        departmentSummary.map((item) => (
                            <div
                                key={item.department}
                                className="border border-gray-100 rounded-lg mb-2 sm:mb-3 last:mb-0 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                            >
                                <div
                                    className="py-2 sm:py-3 px-2 sm:px-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleDepartment(item.department)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1 min-w-0">
                                            {expandedDepartments.has(item.department) ? (
                                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1 sm:mr-2 flex-shrink-0" />
                                            ) : (
                                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1 sm:mr-2 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.department}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <span className="block sm:inline">{item.attending} of {item.total} attending</span>
                                                    <span className="hidden sm:inline"> • </span>
                                                    <span className="block sm:inline">{item.percentage}% rate</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-1 sm:ml-2 flex-shrink-0">
                                            <div className="text-sm sm:text-lg font-bold text-gray-900">{item.percentage}%</div>
                                        </div>
                                    </div>

                                    <div className="mt-2 sm:mt-3">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#00904B] to-[#00904B]/80 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {expandedDepartments.has(item.department) && (
                                    <div className="px-3 pb-3">
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                            <div className="flex items-center justify-between text-xs bg-[#00904B]/5 rounded px-2 py-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#00904B] rounded-full mr-1"></div>
                                                    <span className="text-gray-700 font-medium">Present</span>
                                                </div>
                                                <span className="font-semibold text-[#00904B]">{item.present}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs bg-[#28A745]/5 rounded px-2 py-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#28A745] rounded-full mr-1"></div>
                                                    <span className="text-gray-700 font-medium">Grace</span>
                                                </div>
                                                <span className="font-semibold text-[#28A745]">{item.grace}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs bg-[#FFC107]/5 rounded px-2 py-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-1"></div>
                                                    <span className="text-gray-700 font-medium">Late</span>
                                                </div>
                                                <span className="font-semibold text-[#FFC107]">{item.late}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs bg-[#F44336]/5 rounded px-2 py-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#F44336] rounded-full mr-1"></div>
                                                    <span className="text-gray-700 font-medium">Absent</span>
                                                </div>
                                                <span className="font-semibold text-[#F44336]">{item.absent}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs bg-[#059669]/5 rounded px-2 py-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#059669]/10 rounded-full mr-1 flex items-center justify-center">
                                                        <img src={LeaveIcon} alt="Paid Leave" className="w-1.5 h-1.5" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium">Paid Leave</span>
                                                </div>
                                                <span className="font-semibold text-[#059669]">{item.paidLeave || 0}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs bg-[#DC2626]/5 rounded px-2 py-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#DC2626]/10 rounded-full mr-1 flex items-center justify-center">
                                                        <img src={LeaveIcon} alt="Unpaid Leave" className="w-1.5 h-1.5 opacity-70" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium">Unpaid Leave</span>
                                                </div>
                                                <span className="font-semibold text-[#DC2626]">{item.unpaidLeave || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-500">No department data available</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DepartmentSummary