import DateRangeSelector from "@/component/DateRangeSelector";
import Loader from "@/component/Loader";
import {
  useGetInventoryPriceStatsQuery,
  useGetInventoryStatsQuery,
} from "@/redux/features/inventory/inventoryApiSlice";
import {
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  Settings,
  User,
  Phone,
  Mail,
  Box,
  Layers,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  Activity,
  TrendingUp,
  Calendar,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useState } from "react";
import StatCard from "./components/StatCard";
import TimelineChart from "./components/TimelineChart";
import CategoryBreakdown from "./components/CategoryBreakdown";
import DailyBreakdownCharts from "./components/DailyBreakdownCharts";
import InventoryTable from "./components/InventoryTable";
import DetailedMetrics from "./components/DetailedMetrics";

function getPrevMonthLastDay() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .slice(0, 10);
}

function getCurrentMonthFirstLastDay() {
  const now = new Date();
  // 0th day of next month is last day of current month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Subtract 1 day for second last day
  lastDay.setDate(lastDay.getDate());
  return lastDay.toISOString().slice(0, 10);
}

const InventoryDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("vendors");
  const [startDate, setStartDate] = useState(getPrevMonthLastDay());
  const [endDate, setEndDate] = useState(getCurrentMonthFirstLastDay());
  const [expandedSections, setExpandedSections] = useState({
    alerts: true,
    recent: true,
    financial: true,
  });

  const {
    data: dashboardData,
    isLoadingStats,
    isFetchingStats,
  } = useGetInventoryStatsQuery();

  const {
    data: data,
    isLoading: isLoadingPriceStats,
    isFetching: isFetchingPriceStats,
  } = useGetInventoryPriceStatsQuery({ startDate, endDate });

  const inventoryData = data?.data;

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isLoading = isLoadingStats || isLoadingPriceStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <header className="bg-white shadow-sm border-b border-gray-200 mb-5">
        <div className="max-w-full mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-5 py-3">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#28282B" }}
              >
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Inventory Dashboard
                </h1>
                <p className="text-xs text-gray-600">
                  Overview of inventory status and statistics
                </p>
              </div>
            </div>

            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={({ startDate: newStart, endDate: newEnd }) => {
                setStartDate(newStart);
                setEndDate(newEnd);
              }}
              className="max-w-80"
            />
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Investment"
          value={formatCurrency(inventoryData?.summary?.totalSpent)}
          icon={DollarSign}
          subtitle={`Across ${inventoryData?.summary?.totalTypes} item types`}
        />
        <StatCard
          title="Active Categories"
          value={inventoryData?.summary?.totalCategories}
          icon={Layers}
          subtitle={`${inventoryData?.summary?.totalTypes} total item types`}
        />
        <StatCard
          title="Utilization Rate"
          value={`${inventoryData?.summary?.overallUtilizationRate}%`}
          icon={Target}
          subtitle="Overall efficiency"
        />
        <StatCard
          title="Wastage Rate"
          value={`${inventoryData?.summary?.overallWastageRate}%`}
          icon={AlertTriangle}
          subtitle="Loss prevention metric"
        />
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="30-Day Spending"
          value={formatCurrency(
            inventoryData?.staticPeriodStats?.last30Days?.totalSpent
          )}
          icon={Calendar}
          subtitle={`${inventoryData?.staticPeriodStats?.last30Days?.purchaseCount} purchases`}
        />
        <StatCard
          title="Items Purchased"
          value={formatNumber(
            inventoryData?.staticPeriodStats?.last30Days?.totalQuantity
          )}
          icon={ShoppingCart}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Daily Average"
          value={formatCurrency(
            inventoryData?.staticPeriodStats?.last30Days?.averageSpendingPerDay
          )}
          icon={Activity}
          subtitle="Spending per day"
        />
        <StatCard
          title="Purchase Frequency"
          value={inventoryData?.staticPeriodStats?.last30Days?.purchaseCount}
          icon={Clock}
          subtitle="Transactions this month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Inventory Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Assets</h3>
                <Target className="h-4 w-4" style={{ color: "#3a41e2" }} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">
                    {dashboardData?.inventorySummary?.assets?.totalQuantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium text-red-600">
                    {dashboardData?.inventorySummary?.assets?.usedQuantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-green-600">
                    {dashboardData?.inventorySummary?.assets?.availableQuantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maintenance</span>
                  <span className="font-medium text-yellow-600">
                    {
                      dashboardData?.inventorySummary?.assets
                        ?.underMaintenanceQuantity
                    }
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-900 font-medium">Utilization</span>
                  <span className="font-bold" style={{ color: "#3a41e2" }}>
                    {dashboardData?.inventorySummary?.assets?.utilizationRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Consumables
                </h3>
                <Zap className="h-4 w-4" style={{ color: "#3a41e2" }} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">
                    {
                      dashboardData?.inventorySummary?.consumables
                        ?.totalQuantity
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium text-red-600">
                    {dashboardData?.inventorySummary?.consumables?.usedQuantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-green-600">
                    {
                      dashboardData?.inventorySummary?.consumables
                        ?.availableQuantity
                    }
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-900 font-medium">Utilization</span>
                  <span className="font-bold" style={{ color: "#3a41e2" }}>
                    {
                      dashboardData?.inventorySummary?.consumables
                        ?.utilizationRate
                    }
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Asset Status</h2>
          <div className="space-y-3">
            {dashboardData?.assetStatusBreakdown &&
              Object?.entries(dashboardData?.assetStatusBreakdown)?.map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status === "ASSIGNED"
                            ? "bg-blue-500"
                            : status === "AVAILABLE"
                            ? "bg-green-500"
                            : status === "UNUSABLE"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {status}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                )
              )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              Estimated Cost
            </h3>
            <DollarSign className="h-4 w-4" style={{ color: "#3a41e2" }} />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(dashboardData?.financials?.totalEstimatedCost)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              Approved Cost
            </h3>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(dashboardData?.financials.totalApprovedCost)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              Avg Requisition
            </h3>
            <BarChart3 className="h-4 w-4" style={{ color: "#3a41e2" }} />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(dashboardData.financials.averageRequisitionCost)}
          </p>
        </div>
      </div>

      {dashboardData.alerts.summary.total > 0 && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("alerts")}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Inventory Alerts ({dashboardData.alerts.summary.total})
                </h2>
              </div>
              {expandedSections.alerts ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>

            {!expandedSections.alerts && (
              <div className="mt-3">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {dashboardData.alerts.summary.total}
                    </p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600">
                      {dashboardData.alerts.summary.critical}
                    </p>
                    <p className="text-xs text-gray-600">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-orange-600">
                      {dashboardData.alerts.summary.high}
                    </p>
                    <p className="text-xs text-gray-600">High</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-yellow-600">
                      {dashboardData.alerts.summary.medium}
                    </p>
                    <p className="text-xs text-gray-600">Medium</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {dashboardData.alerts.lowStockConsumables.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between bg-white rounded p-2"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {item.typeName}
                        </p>
                        <p className="text-xs text-gray-600">
                          Available: {item.availableQuantity}/
                          {item.totalQuantity}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.alertLevel === "critical"
                            ? "bg-red-100 text-red-800"
                            : item.alertLevel === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.alertLevel.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TimelineChart data={inventoryData?.timeline} />
        <CategoryBreakdown data={inventoryData?.categoryBreakdown} />
      </div>

      {/* Daily Breakdown Charts Section */}
      <div className="mb-6">
        <DailyBreakdownCharts
          last30Days={inventoryData?.staticPeriodStats?.last30Days}
          lastMonth={inventoryData?.staticPeriodStats?.lastMonth}
        />
      </div>

      {/* Inventory Table */}
      <div className="mb-6">
        <InventoryTable data={inventoryData?.typeBreakdown} />
      </div>

      {/* Detailed Metrics */}
      {/* <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Detailed Item Analytics
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Performance Insights</span>
          </div>
        </div>
        <DetailedMetrics data={inventoryData?.typeBreakdown} />
      </div> */}

      <div className="flex">
        <main className="flex-1 md:pr-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("recent")}
            >
              <h2 className="text-lg font-bold text-gray-900">
                Recent Activity
              </h2>
              {expandedSections.recent ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>

            {expandedSections.recent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    Recently Assigned Assets
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.recent.assignedAssetProducts.map((asset) => (
                      <div
                        key={asset._id}
                        className="border border-gray-200 rounded p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {asset.name}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {asset.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {asset.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">
                              ID: {asset.productId}
                            </p>
                            <p className="text-gray-500">
                              Type: {asset.type.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              Owner: {asset.currentOwner.firstName}{" "}
                              {asset.currentOwner.lastName}
                            </p>
                            <p className="text-gray-500">
                              Handover:{" "}
                              {formatDate(
                                asset?.history[asset?.history?.length - 1]
                                  ?.handoverDate
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    Recent Requisitions
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.recent.assetRequisitions.map((req) => (
                      <div
                        key={req.requisitionID}
                        className="border border-gray-200 rounded p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {req.requisitionID}
                          </h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            {req.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          <p>
                            By: {req.requestedBy.firstName}{" "}
                            {req.requestedBy.lastName}
                          </p>
                          <p>Date: {formatDate(req.createdAt)}</p>
                        </div>
                        <div className="space-y-1">
                          {req.items.slice(0, 2).map((item, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded p-2 text-xs"
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {item.type.name}
                                </span>
                                <span>
                                  Qty: {item.quantityApproved} |{" "}
                                  {formatCurrency(item.approvedCost)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden md:block w-80 bg-white border-l border-gray-200 p-4">
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("vendors")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "vendors"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={
                  activeTab === "vendors" ? { backgroundColor: "#28282B" } : {}
                }
              >
                Vendors
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "categories"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={
                  activeTab === "categories"
                    ? { backgroundColor: "#28282B" }
                    : {}
                }
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab("types")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "types"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={
                  activeTab === "types" ? { backgroundColor: "#28282B" } : {}
                }
              >
                Types
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeTab === "vendors" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Active Vendors ({dashboardData.activeLists.vendors.length})
                </h3>
                <div className="space-y-3">
                  {dashboardData.activeLists.vendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">
                        {vendor.name}
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {vendor.contactPerson}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {vendor.contactEmail}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {vendor.contactPhone}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    Vendor Performance
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.vendorStats.map((vendor) => (
                      <div
                        key={vendor.vendorName}
                        className="border border-gray-200 rounded p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-900">
                            {vendor.vendorName}
                          </span>
                          <span className="inline-flex items-center justify-center rounded-full text-xs bg-primary px-2 py-0.5 text-white">
                            Rank: {vendor.rank}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">
                              Assets: {vendor.assetItems}
                            </p>
                            <p className="text-gray-500">
                              Consumables: {vendor.consumableItems}
                            </p>
                            <p className="text-gray-500">
                              Requisitions: {vendor.requisitionCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              Est Cost:{" "}
                              {formatCurrency(vendor.totalEstimatedCost)}
                            </p>
                            <p className="text-gray-500">
                              Approved:{" "}
                              {formatCurrency(vendor.totalApprovedCost)}
                            </p>
                            <p className="font-medium text-gray-900">
                              Savings: {formatCurrency(vendor.totalSavings)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Categories ({dashboardData.activeLists.categories.length})
                </h3>
                <div className="space-y-3">
                  {dashboardData.activeLists.categories.map((category) => (
                    <div
                      key={category._id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        {category.description}
                      </p>
                      {dashboardData.categoryStats.find(
                        (stat) => stat.categoryName === category.name
                      ) && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <p className="text-gray-500">Assets</p>
                            <p className="font-medium">
                              {
                                dashboardData.categoryStats.find(
                                  (stat) => stat.categoryName === category.name
                                ).assetProductCount
                              }
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Consumables</p>
                            <p className="font-medium">
                              {
                                dashboardData.categoryStats.find(
                                  (stat) => stat.categoryName === category.name
                                ).consumableInventoryCount
                              }
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Total</p>
                            <p className="font-medium">
                              {
                                dashboardData.categoryStats.find(
                                  (stat) => stat.categoryName === category.name
                                ).totalItems
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "types" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Item Types ({dashboardData.activeLists.types.length})
                </h3>
                <div className="space-y-3">
                  {dashboardData.activeLists.types.map((type, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {type.name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            type.trackingMode === "ASSET"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {type.trackingMode}
                        </span>
                      </div>
                      {dashboardData.typeStats.find(
                        (stat) => stat.typeName === type.name
                      ) && (
                        <div className="text-xs">
                          <p className="text-gray-600">
                            Count:{" "}
                            <span className="font-medium">
                              {
                                dashboardData.typeStats.find(
                                  (stat) => stat.typeName === type.name
                                ).count
                              }
                            </span>{" "}
                            (
                            {
                              dashboardData.typeStats.find(
                                (stat) => stat.typeName === type.name
                              ).countType
                            }
                            )
                          </p>
                          <p className="text-gray-600">
                            Category:{" "}
                            <span className="font-medium">
                              {
                                dashboardData.typeStats.find(
                                  (stat) => stat.typeName === type.name
                                ).categoryName
                              }
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Right Panel */}

      <div className="block md:hidden bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("vendors")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === "vendors"
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              style={
                activeTab === "vendors" ? { backgroundColor: "#3a41e2" } : {}
              }
            >
              Vendors
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === "categories"
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              style={
                activeTab === "categories" ? { backgroundColor: "#3a41e2" } : {}
              }
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("types")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === "types"
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              style={
                activeTab === "types" ? { backgroundColor: "#3a41e2" } : {}
              }
            >
              Types
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {activeTab === "vendors" && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Active Vendors ({dashboardData.activeLists.vendors.length})
              </h3>
              <div className="space-y-3">
                {dashboardData.activeLists.vendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">
                      {vendor.name}
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {vendor.contactPerson}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {vendor.contactEmail}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {vendor.contactPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Vendor Performance
                </h3>
                <div className="space-y-2">
                  {dashboardData?.vendorStats?.map((vendor) => (
                    <div
                      key={vendor?.vendorName}
                      className="border border-gray-200 rounded p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {vendor.vendorName}
                        </span>
                        <span className="inline-flex items-center justify-center rounded-full text-xs bg-primary px-2 py-0.5 text-white">
                          Rank: {vendor.rank}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">
                            Assets: {vendor.assetItems}
                          </p>
                          <p className="text-gray-500">
                            Consumables: {vendor.consumableItems}
                          </p>
                          <p className="text-gray-500">
                            Requisitions: {vendor.requisitionCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            Est Cost:{" "}
                            {formatCurrency(vendor.totalEstimatedCost)}
                          </p>
                          <p className="text-gray-500">
                            Approved: {formatCurrency(vendor.totalApprovedCost)}
                          </p>
                          <p className="font-medium text-gray-900">
                            Savings: {formatCurrency(vendor.totalSavings)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Categories ({dashboardData.activeLists.categories.length})
              </h3>
              <div className="space-y-3">
                {dashboardData.activeLists.categories.map((category) => (
                  <div
                    key={category._id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {category.description}
                    </p>
                    {dashboardData.categoryStats.find(
                      (stat) => stat.categoryName === category.name
                    ) && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-500">Assets</p>
                          <p className="font-medium">
                            {
                              dashboardData.categoryStats.find(
                                (stat) => stat.categoryName === category.name
                              ).assetProductCount
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Consumables</p>
                          <p className="font-medium">
                            {
                              dashboardData.categoryStats.find(
                                (stat) => stat.categoryName === category.name
                              ).consumableInventoryCount
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Total</p>
                          <p className="font-medium">
                            {
                              dashboardData.categoryStats.find(
                                (stat) => stat.categoryName === category.name
                              ).totalItems
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Item Types ({dashboardData.activeLists.types.length})
              </h3>
              <div className="space-y-3">
                {dashboardData.activeLists.types.map((type, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {type.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          type.trackingMode === "ASSET"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {type.trackingMode}
                      </span>
                    </div>
                    {dashboardData.typeStats.find(
                      (stat) => stat.typeName === type.name
                    ) && (
                      <div className="text-xs">
                        <p className="text-gray-600">
                          Count:{" "}
                          <span className="font-medium">
                            {
                              dashboardData.typeStats.find(
                                (stat) => stat.typeName === type.name
                              ).count
                            }
                          </span>{" "}
                          (
                          {
                            dashboardData.typeStats.find(
                              (stat) => stat.typeName === type.name
                            ).countType
                          }
                          )
                        </p>
                        <p className="text-gray-600">
                          Category:{" "}
                          <span className="font-medium">
                            {
                              dashboardData.typeStats.find(
                                (stat) => stat.typeName === type.name
                              ).categoryName
                            }
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardPage;
