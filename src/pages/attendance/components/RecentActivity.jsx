import { useMemo, useState } from "react";
import { parseISO, format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";

const RecentActivity = ({ filteredData }) => {
  const [isComponentCollapsed, setIsComponentCollapsed] = useState(false);

  const toggleComponent = () => {
    setIsComponentCollapsed(!isComponentCollapsed);
  };

  const recentActivity = useMemo(() => {
    const activities = [];

    filteredData.forEach((day) => {
      if (!day.isHoliday && !day.isWeekend) {
        day.employees.forEach((employee) => {
          let activityText = "";
          let activityTime = null;

          if (employee.status === "present" && employee.checkIn) {
            activityText = `Checked in at ${employee.checkIn}`;
            activityTime = employee.checkIn;
          } else if (employee.status === "graced" && employee.checkIn) {
            activityText = `Grace arrival at ${employee.checkIn}`;
            activityTime = employee.checkIn;
          } else if (employee.status === "late" && employee.checkIn) {
            activityText = `Late arrival at ${employee.checkIn}`;
            activityTime = employee.checkIn;
          } else if (employee.status === "absent") {
            activityText = "Marked absent";
            activityTime = "08:00"; // Default time for sorting
          } else if (employee.status === "on leave") {
            activityText = "On leave";
            activityTime = "08:00"; // Default time for sorting
          } else if (employee.status === "paid leave") {
            activityText = "On paid leave";
            activityTime = "08:00"; // Default time for sorting
          } else if (employee.status === "unpaid leave") {
            activityText = "On unpaid leave";
            activityTime = "08:00"; // Default time for sorting
          }

          if (activityText) {
            // Create a full datetime for proper sorting
            const fullDateTime = `${day.date}T${activityTime || "08:00"}:00`;

            activities.push({
              ...employee,
              date: day.date,
              activityText,
              fullDateTime,
            });
          }
        });
      }
    });

    // Sort by full datetime to get most recent first
    return activities
      .sort(
        (a, b) =>
          new Date(b.fullDateTime).getTime() -
          new Date(a.fullDateTime).getTime()
      )
      .slice(0, 10);
  }, [filteredData]);

  const formatDateShort = (dateString) => {
    return format(parseISO(dateString), "EEE, MMM d");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div
        className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleComponent}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          {isComponentCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </div>
      {!isComponentCollapsed && (
        <div className="p-2 sm:p-3 md:p-4">
          {recentActivity.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 sm:space-x-3"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-primary/10">
                    {activity.photoUrl && activity.photoUrl.trim() ? (
                      <img
                        src={activity.photoUrl}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback =
                            e.target.parentNode.querySelector(
                              ".fallback-initials"
                            );
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <span
                      className={`fallback-initials text-xs font-medium text-primary items-center justify-center w-full h-full ${
                        activity.photoUrl && activity.photoUrl.trim()
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      {activity.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {activity.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      <span className="block sm:inline">
                        {activity.activityText}
                      </span>
                      <span className="hidden sm:inline"> • </span>
                      <span className="block sm:inline text-xs">
                        {formatDateShort(activity.date)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                      activity.status === "present"
                        ? "bg-[#00904B]"
                        : activity.status === "graced"
                        ? "bg-[#28A745]"
                        : activity.status === "late"
                        ? "bg-[#FFC107]"
                        : activity.status === "absent"
                        ? "bg-[#F44336]"
                        : activity.status === "paid leave"
                        ? "bg-[#059669]"
                        : activity.status === "unpaid leave"
                        ? "bg-[#DC2626]"
                        : "bg-primary"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
              No recent activity
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
