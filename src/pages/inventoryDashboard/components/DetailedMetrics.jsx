import { Package } from "lucide-react";

const DetailedMetrics = ({ data }) => {
  const activeItems = data.filter((item) => item.totalSpent > 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-50";
      case "B":
        return "text-blue-600 bg-blue-50";
      case "C":
        return "text-yellow-600 bg-yellow-50";
      case "D":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeItems.map((item) => (
        <div
          key={item.typeId}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {item.typeName}
                </h4>
                <p className="text-xs text-gray-500">
                  {item.categoryName || "Uncategorized"}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRiskColor(
                  item.riskLevel
                )}`}
              >
                {item.riskLevel}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${getGradeColor(
                  item.performanceGrade
                )}`}
              >
                {item.performanceGrade}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Spent</span>
                <span className="font-semibold">
                  {formatCurrency(item.totalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Qty</span>
                <span className="font-semibold">
                  {formatNumber(item.totalQuantityPurchased)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Cost</span>
                <span className="font-semibold">
                  {formatCurrency(item.averageUnitCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purchases</span>
                <span className="font-semibold">{item.purchaseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock</span>
                <span className="font-semibold">
                  {item.totalCurrentQuantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Used</span>
                <span className="font-semibold">
                  {item.totalCurrentUsedQuantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available</span>
                <span className="font-semibold">
                  {item.totalCurrentAvailableQuantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatility</span>
                <span className="font-semibold">
                  {item.priceVolatility.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Cost</span>
                <span className="font-semibold">
                  {formatCurrency(item.minUnitCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Cost</span>
                <span className="font-semibold">
                  {formatCurrency(item.maxUnitCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Turnover</span>
                <span className="font-semibold">{item.inventoryTurnover}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Purchase</span>
                <span className="font-semibold">
                  {item.daysSinceLastPurchase}d ago
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div
                  className={`text-sm font-bold ${
                    item.roi >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.roi}%
                </div>
                <div className="text-xs text-gray-500">ROI</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {item.utilizationRate}%
                </div>
                <div className="text-xs text-gray-500">Utilization</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {item.wastageRate}%
                </div>
                <div className="text-xs text-gray-500">Wastage</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailedMetrics;
