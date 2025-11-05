import { Activity, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";

const DailyBreakdownCharts = ({ last30Days, lastMonth }) => {
  const [activeTab, setActiveTab] = useState("spending");

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const maxSpending30 = Math.max(
    ...last30Days.dailyBreakdown.map((d) => d.totalSpent)
  );
  const maxQuantity30 = Math.max(
    ...last30Days.dailyBreakdown.map((d) => d.totalQuantity)
  );
  const maxPurchases30 = Math.max(
    ...last30Days.dailyBreakdown.map((d) => d.purchaseCount)
  );

  const activeDays30 = last30Days.dailyBreakdown.filter(
    (d) => d.totalSpent > 0 || d.totalQuantity > 0 || d.purchaseCount > 0
  );
  const activeDaysLastMonth = lastMonth.dailyBreakdown.filter(
    (d) => d.totalSpent > 0 || d.totalQuantity > 0 || d.purchaseCount > 0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Daily Activity Analysis
        </h3>
        <Activity className="h-4 w-4 text-primary" />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        {[
          { id: "spending", label: "Spending", icon: DollarSign },
          { id: "quantity", label: "Item Quantity", icon: Package },
          { id: "purchases", label: "Item Purchases", icon: ShoppingCart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-3 w-3" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Last 30 Days Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Items Purchased in the Last 30 Days
            </h4>
            <div className="text-xs text-gray-500">
              {activeDays30.length} active days
            </div>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {last30Days.dailyBreakdown.map((day, index) => {
              const isActive =
                day.totalSpent > 0 ||
                day.totalQuantity > 0 ||
                day.purchaseCount > 0;
              if (!isActive && activeTab === "spending") return null;

              let value, maxValue, formatValue;
              if (activeTab === "spending") {
                value = day.totalSpent;
                maxValue = maxSpending30;
                formatValue = (v) => formatCurrency(v);
              } else if (activeTab === "quantity") {
                value = day.totalQuantity;
                maxValue = maxQuantity30;
                formatValue = (v) => formatNumber(v);
              } else {
                value = day.purchaseCount;
                maxValue = maxPurchases30;
                formatValue = (v) => v.toString();
              }

              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 py-1 ${
                    isActive ? "bg-gray-50 rounded px-2" : ""
                  }`}
                >
                  <div className="w-12 text-xs text-gray-600 font-medium">
                    {formatDate(day.date)}
                  </div>
                  <div className="w-8 text-xs text-gray-500">
                    {day.dayName.slice(0, 3)}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-24 text-xs font-semibold text-gray-900 text-left">
                    {formatValue(value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Month Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Last Month (July)
            </h4>
            <div className="text-xs text-gray-500">
              {activeDaysLastMonth.length} active days
            </div>
          </div>

          {activeDaysLastMonth.length === 0 ? (
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No activity in July</p>
                <p className="text-xs text-gray-400">
                  All metrics show zero values
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lastMonth.dailyBreakdown.map((day, index) => {
                const isActive =
                  day.totalSpent > 0 ||
                  day.totalQuantity > 0 ||
                  day.purchaseCount > 0;
                if (!isActive) return null;

                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 py-1 bg-gray-50 rounded px-2"
                  >
                    <div className="w-12 text-xs text-gray-600 font-medium">
                      {formatDate(day.date)}
                    </div>
                    <div className="w-8 text-xs text-gray-500">
                      {day.dayName.slice(0, 3)}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-primary h-full rounded-full w-0" />
                    </div>
                    <div className="w-16 text-xs font-semibold text-gray-900 text-right">
                      {activeTab === "spending"
                        ? formatCurrency(day.totalSpent)
                        : activeTab === "quantity"
                        ? formatNumber(day.totalQuantity)
                        : day.purchaseCount.toString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">
              Last 30 Days Summary
            </h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-primary">
                  {formatCurrency(last30Days.totalSpent)}
                </div>
                <div className="text-gray-500">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">
                  {formatNumber(last30Days.totalQuantity)}
                </div>
                <div className="text-gray-500">Items</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">
                  {last30Days.purchaseCount}
                </div>
                <div className="text-gray-500">Purchases</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">
              Last Month Summary
            </h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-gray-400">
                  {formatCurrency(lastMonth.totalSpent)}
                </div>
                <div className="text-gray-500">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-400">
                  {formatNumber(lastMonth.totalQuantity)}
                </div>
                <div className="text-gray-500">Items</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-400">
                  {lastMonth.purchaseCount}
                </div>
                <div className="text-gray-500">Purchases</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBreakdownCharts;
