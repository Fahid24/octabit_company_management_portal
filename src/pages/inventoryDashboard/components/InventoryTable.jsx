import { Package, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const InventoryTable = ({ data }) => {
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();
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

  const activeItems = data?.filter((item) => item.totalSpent > 0);

  // Filter items based on active tab
  const filteredItems = activeItems?.filter((item) => {
    if (activeTab === "products") {
      return item.trackingMode === "ASSET";
    } else if (activeTab === "consumables") {
      return item.trackingMode === "CONSUMABLE";
    }
    return true;
  });

  const handleViewMore = () => {
    if (activeTab === "products") {
      navigate("/products");
    } else if (activeTab === "consumables") {
      navigate("/consumable-items");
    }
  };

  const tabs = [
    {
      key: "products",
      label: "Products",
      count:
        activeItems?.filter((item) => item.trackingMode === "ASSET").length ||
        0,
    },
    {
      key: "consumables",
      label: "Consumable Items",
      count:
        activeItems?.filter((item) => item.trackingMode === "CONSUMABLE")
          .length || 0,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Inventory Items
          </h3>
          <Package className="h-4 w-4 text-primary" />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {/* <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span> */}
              </button>
            ))}
          </div>

          {/* View More Button */}
          <button
            onClick={handleViewMore}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:text-primary transition-colors border border-primary/30 rounded-md hover:border-primary/50"
          >
            View More
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cat
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spent
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>

              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Purchased
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems?.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item?.typeId} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center">
                        <Package className="h-3 w-3 text-primary" />
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium text-gray-900">
                          {item?.typeName}
                        </div>
                        {item.trackingMode && (
                          <div className="text-xs text-gray-500">
                            {item.trackingMode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {item.categoryName || "None"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                    {formatCurrency(item.totalSpent)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {formatNumber(item.totalQuantityPurchased)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {formatCurrency(item.averageUnitCost)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-900">
                      <div className="font-medium">
                        {item.totalCurrentQuantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        U:{item.totalCurrentUsedQuantity} A:
                        {item.totalCurrentAvailableQuantity}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {item.daysSinceLastPurchase} day(s) ago
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-3 py-8 text-center text-sm text-gray-500"
                >
                  No{" "}
                  {activeTab === "products" ? "products" : "consumable items"}{" "}
                  found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
