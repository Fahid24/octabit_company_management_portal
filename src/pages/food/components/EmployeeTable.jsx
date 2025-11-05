import React from 'react';
import Tooltip from "@/component/Tooltip";
import { MoreVertical } from "lucide-react";

const EmployeeTable = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onStatusChange,
  openMenuId,
  menuType,
  toggleMenu,
  getStatusBadge
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === employees.length}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    if (isChecked) {
                      onSelectEmployee(employees.map(emp => emp.employeeId || emp._id), true);
                    } else {
                      onSelectEmployee([], false);
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr
                key={employee.employeeId || employee._id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap w-10">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.employeeId || employee._id)}
                    onChange={(e) => {
                      const employeeId = employee.employeeId || employee._id;
                      onSelectEmployee([employeeId], e.target.checked);
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
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
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative ml-2 dropdown-menu">
                      <Tooltip
                        text={`Change status (current: ${employee.foodStatus})`}
                        position="left"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(employee.employeeId || employee._id, "status");
                          }}
                          className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
                        >
                          <MoreVertical size={14} className="mt-1" />
                        </button>
                      </Tooltip>
                      {openMenuId === (employee.employeeId || employee._id) &&
                        menuType === "status" && (
                          <div className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(
                                    employee.employeeId || employee._id,
                                    "utilized"
                                  );
                                }}
                                className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                              >
                                Utilized
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(
                                    employee.employeeId || employee._id,
                                    "wasted"
                                  );
                                }}
                                className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                              >
                                Wasted
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(
                                    employee.employeeId || employee._id,
                                    "not_need"
                                  );
                                }}
                                className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                              >
                                Not Needed
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                    {getStatusBadge(employee.foodStatus)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;