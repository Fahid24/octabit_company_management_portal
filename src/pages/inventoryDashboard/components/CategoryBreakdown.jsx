import { PieChart } from "lucide-react";

const CategoryBreakdown = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const total = data.reduce((sum, cat) => sum + cat.totalSpent, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 max-h-56 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Category Breakdown
        </h3>
        <PieChart className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-3">
        {data
          .filter((cat) => cat.categoryName)
          .map((category, index) => {
            const percentage =
              total > 0 ? (category.totalSpent / total) * 100 : 0;
            const colors = ["bg-primary", "bg-primary/70", "bg-primary/40"];

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        colors[index % colors.length]
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({category.typeCount})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${
                      colors[index % colors.length]
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
