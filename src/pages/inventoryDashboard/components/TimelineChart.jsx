import { BarChart3 } from "lucide-react";

const TimelineChart = ({ data }) => {
  const maxSpent = Math.max(...data.map((d) => d.spent));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Spending Timeline
        </h3>
        <BarChart3 className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-2">
        {data.map((week, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-16 text-xs text-gray-600 font-medium">
              {new Date(week.weekStart).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxSpent > 0 ? (week.spent / maxSpent) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="w-20 text-xs font-semibold text-gray-900 text-right">
              {formatCurrency(week.spent)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineChart;
