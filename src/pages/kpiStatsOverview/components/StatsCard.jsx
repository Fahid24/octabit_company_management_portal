import PropTypes from "prop-types";
import { 
  Users, 
  Building2, 
  Briefcase, 
  User,
  FileText,
  CalendarDays,
  CheckCircle2,
  BarChart3
} from "lucide-react";

const StatsCard = ({ title, value, icon, color = "blue" }) => {
  // Define color styles based on the color prop
  const colorStyles = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  // Choose icon based on the icon prop
  const renderIcon = () => {
    switch (icon) {
      case "users":
        return <Users size={24} />;
      case "building":
        return <Building2 size={24} />;
      case "briefcase":
        return <Briefcase size={24} />;
      case "user":
        return <User size={24} />;
      case "file":
        return <FileText size={24} />;
      case "calendar":
        return <CalendarDays size={24} />;
      case "check":
        return <CheckCircle2 size={24} />;
      default:
        return <BarChart3 size={24} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className={`rounded-full p-3 mr-4 ${colorStyles[color]}`}>
        {renderIcon()}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  color: PropTypes.oneOf(["blue", "green", "purple", "orange", "red"]),
};

export default StatsCard;
