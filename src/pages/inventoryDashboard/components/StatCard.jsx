import { ArrowDown, ArrowUp, Minus } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "text-primary",
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-1">
      <div className={`p-1.5 rounded-md bg-primary/10`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      {trend && (
        <div
          className={`flex items-center text-xs ${
            trend > 0
              ? "text-green-600"
              : trend < 0
              ? "text-red-600"
              : "text-gray-500"
          }`}
        >
          {trend > 0 ? (
            <ArrowUp className="h-3 w-3 mr-1" />
          ) : trend < 0 ? (
            <ArrowDown className="h-3 w-3 mr-1" />
          ) : (
            <Minus className="h-3 w-3 mr-1" />
          )}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="space-y-0.5">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

export default StatCard;
