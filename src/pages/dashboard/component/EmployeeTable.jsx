import { User } from "lucide-react";
import { Badge } from "@/component/badge";

/**
 * Reusable Employee Table Component
 * @param {Object[]} employees - Array of employee stats objects
 * @param {Object[]} columns - Array of column definitions: { key, label, render? }
 * @param {number} limit - Max number of rows to show (optional)
 * @param {string} emptyMessage - Message to show if no employees
 */
export default function EmployeeTable({ employees = [], columns = [], limit, emptyMessage = "No data available." }) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }
  const shown = limit ? employees.slice(0, limit) : employees;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="text-left p-3 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((emp) => (
            <tr key={emp.employeeId} className="border-b hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {col.render ? col.render(emp) : emp[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {limit && employees.length > limit && (
        <div className="text-sm text-gray-500 mt-2 text-right">
          Showing top {limit} employees only.
        </div>
      )}
    </div>
  );
}
