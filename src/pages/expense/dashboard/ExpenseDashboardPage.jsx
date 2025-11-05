
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  AlertTriangle,
  CalendarDays,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
} from "lucide-react";
import { useFinanceDashboardQuery } from "../../../redux/features/expense/expenseApiSlice";
import Loader from "../../../component/Loader";

const ExpenseDashboardPage = () => {
  const { data: dashboardData, isLoading, error } = useFinanceDashboardQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 text-lg font-semibold">Error Loading Financial Data</p>
          <p className="text-red-600 text-sm mt-2">{error?.message || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  const { summary, trends, breakdown, metrics } = dashboardData?.data || {};

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format number with K, M notation
  const formatCompactNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString();
  };

  // Format percentage
  const formatPercentage = (value) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value?.toFixed(1)}%`;
  };

  // Color schemes for business dashboard - Using system colors
  const COLORS = {
    primary: "#3a41e2",        // System primary color
    secondary: "#8a6642",      // Darker shade of primary
    success: "#059669",        // Green-600
    danger: "#DC2626",         // Red-600
    warning: "#F59E0B",        // Amber-500
    income: "#10B981",         // Green-500 for income
    expense: "#EF4444",        // Red-500 for expenses
    profit: "#059669",         // Green-600 for profit
    loss: "#DC2626",           // Red-600 for loss
    neutral: "#6B7280",        // Gray-500
    info: "#3B82F6",           // Blue-500
    purple: "#8B5CF6",         // Purple-500
    teal: "#14B8A6",           // Teal-500
  };

  const CATEGORY_COLORS = [
    COLORS.primary,     // System primary
    COLORS.success,     // Green
    COLORS.warning,     // Amber
    COLORS.purple,      // Purple
    COLORS.info,        // Blue
    COLORS.teal,        // Teal
    COLORS.secondary,   // System secondary
    "#EC4899",          // Pink
    "#F97316"           // Orange
  ];

  // Prepare data for charts
  const monthlyTrends = trends?.monthlyComparison?.slice(-6) || [];
  const weeklyTrends = trends?.last7Days || [];
  const lastMonthDayByDay = trends?.lastMonthDayByDay || [];

  // Performance indicators
  const profitMargin = summary?.currentMonth?.income > 0 
    ? ((summary?.currentMonth?.profit / summary?.currentMonth?.income) * 100) 
    : 0;

  const expenseGrowth = summary?.changes?.expenseChange || 0;
  const revenueGrowth = summary?.changes?.incomeChange || 0;

  // Custom tooltip for business charts
  const BusinessTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-semibold" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-4 md:pl-24 pb-20 md:pb-4">
      {/* Executive Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              Financial Dashboard
            </h1>
            <p className="text-xs md:text-base text-gray-600 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Period: {summary?.currentMonth?.month} | Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercentage(revenueGrowth)}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.currentMonth?.income)}</p>
            <p className="text-xs text-gray-500 mt-1">vs last month: {formatCurrency(summary?.lastMonth?.income)}</p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm ${expenseGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {expenseGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercentage(Math.abs(expenseGrowth))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.currentMonth?.expenses)}</p>
            <p className="text-xs text-gray-500 mt-1">vs last month: {formatCurrency(summary?.lastMonth?.expenses)}</p>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${summary?.currentMonth?.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Target className={`w-6 h-6 ${summary?.currentMonth?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm ${summary?.changes?.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary?.changes?.profitChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercentage(summary?.changes?.profitChange)}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Net Profit/Loss</h3>
            <p className={`text-2xl font-bold ${summary?.currentMonth?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary?.currentMonth?.profit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">vs last month: {formatCurrency(summary?.lastMonth?.profit)}</p>
          </div>
        </div>

        {/* Profit Margin Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3" style={{ backgroundColor: "#3a41e220" }}>
              <Activity className="w-6 h-6" style={{ color: COLORS.primary }} />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                Benchmark: 15-25%
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Profit Margin</h3>
            <p className={`text-2xl font-bold ${profitMargin >= 15 ? 'text-green-600' : profitMargin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Target: 20% | Industry Avg: 18%</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Financial Trend Analysis - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Financial Performance Trend
              </h3>
              <p className="text-sm text-gray-600 mt-1">6-month revenue vs expenses analysis</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.income }}></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.expense }}></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.profit }}></div>
                <span>Profit</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                stroke="#64748b"
                tickFormatter={(value) => value?.split('-')[1] + '/' + value?.split('-')[0]?.slice(-2)}
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip content={<BusinessTooltip />} />
              <Bar dataKey="income" fill={COLORS.income} name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={COLORS.expense} name="Expenses" radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={COLORS.profit} 
                strokeWidth={3}
                name="Profit"
                dot={{ fill: COLORS.profit, strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-orange-600" />
            Expense Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={breakdown?.currentMonthExpensesByCategory?.map((item) => ({
                  name: item._id,
                  value: item.total,
                  count: item.count
                }))}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                dataKey="value"
              >
                {breakdown?.currentMonthExpensesByCategory?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  formatCurrency(value),
                  `${name} (${props.payload.count} transactions)`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Detailed Expense Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakdown?.currentMonthExpensesByCategory?.map((item, index) => (
            <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                ></div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{item._id}</span>
                  <div className="text-xs text-gray-500">{item.count} transactions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</div>
                <div className="text-xs text-gray-500">
                  {((item.total / summary?.currentMonth?.expenses) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Month Day-by-Day Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-purple-600" />
          Last Month Daily Analysis ({summary?.lastMonth?.month})
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={lastMonthDayByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }} 
              stroke="#64748b"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip content={<BusinessTooltip />} />
            <Bar dataKey="income" fill={COLORS.income} name="Daily Income" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" fill={COLORS.expense} name="Daily Expenses" radius={[2, 2, 0, 0]} />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke={COLORS.profit} 
              strokeWidth={2}
              name="Daily Profit"
              dot={{ fill: COLORS.profit, strokeWidth: 1, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Business Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Cash Flow */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            7-Day Cash Flow
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="dayName" 
                tick={{ fontSize: 12 }} 
                stroke="#64748b"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip content={<BusinessTooltip />} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke={COLORS.income} 
                strokeWidth={3}
                name="Daily Income"
                dot={{ fill: COLORS.income, strokeWidth: 2, r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke={COLORS.expense} 
                strokeWidth={3}
                name="Daily Expenses"
                dot={{ fill: COLORS.expense, strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics & Ratios */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Ratios & KPIs</h3>
          <div className="space-y-6">
            {/* Expense Ratios */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Expense Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">General Expenses</span>
                    <span className="text-sm font-semibold text-gray-900">{metrics?.expenseRatio?.general?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics?.expenseRatio?.general}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Food & Beverages</span>
                    <span className="text-sm font-semibold text-gray-900">{metrics?.expenseRatio?.food?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics?.expenseRatio?.food}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Indicators</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{formatCompactNumber(metrics?.averageDailyIncome)}</div>
                  <div className="text-xs text-gray-600">Avg Daily Income</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{formatCompactNumber(metrics?.averageDailyExpenses)}</div>
                  <div className="text-xs text-gray-600">Avg Daily Expenses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Executive Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Period Summary */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">{summary?.currentMonth?.month}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(summary?.currentMonth?.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses:</span>
                <span className="font-semibold text-amber-600">{formatCurrency(summary?.currentMonth?.expenses)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-gray-600">Net Result:</span>
                <span className={`font-bold ${summary?.currentMonth?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary?.currentMonth?.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Period Comparison */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">{summary?.lastMonth?.month}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(summary?.lastMonth?.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses:</span>
                <span className="font-semibold text-amber-600">{formatCurrency(summary?.lastMonth?.expenses)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-gray-600">Net Result:</span>
                <span className={`font-bold ${summary?.lastMonth?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary?.lastMonth?.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Performance */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Overall Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(summary?.overall?.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-semibold text-amber-600">{formatCurrency(summary?.overall?.expenses)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-gray-600">Net Position:</span>
                <span className={`font-bold ${summary?.overall?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary?.overall?.profit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboardPage;