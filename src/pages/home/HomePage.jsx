import { useEffect, useState } from "react";
import SearchBar from "./component/SearchBar";
import {
  Cake,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Gift,
  GraduationCap,
  Hammer,
  HelpCircle,
  MessageCircle,
  Mic,
  MonitorSmartphone,
  PhoneCall,
  Sun,
  Users,
} from "lucide-react";
import LeaveIcon from "@/assets/Leave.png";
import DailyTasks from "./component/DailyTasks";
import { useSelector } from "react-redux";
import { useGetMonthlyEventsByIdQuery } from "@/redux/features/event/eventApiSlice";
import { EventsSkeleton } from "./component/EventSkeleton";
import {
  useAdminConfigSetupMutation,
  useExistsWorkingDaysQuery,
  useGetAdminConfigStatusQuery,
} from "@/redux/features/admin/adminControl/adminControlApiSlice";
import { format } from "date-fns";
import RequestWorkingDaysModal from "./component/RequestWorkingDaysModal";
import AdminConfigSetupModal from "./component/AdminConfigSetupModal";
import { toast } from "@/component/Toast";

const HomePage = () => {
  const loggedInUser = useSelector((state) => state.userSlice.user);
  const isAdmin = loggedInUser?.user?.role === "Admin";
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // getMonth() returns 0-based index
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentTime, setCurrentTime] = useState({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
  });
  const [isConfigSetupModalOpen, setIsConfigSetupModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentMonthYear = format(new Date(), "yyyy-MM");

  const isCurrentMonth =
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth() + 1;

  const isPastMonth =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() &&
      currentMonth < today.getMonth() + 1);

  const isFutureMonth =
    currentYear > today.getFullYear() ||
    (currentYear === today.getFullYear() &&
      currentMonth > today.getMonth() + 1);

  const formatMonthForAPI = (year, month) => {
    const monthStr = month.toString().padStart(2, "0");
    return `${year}-${monthStr}`;
  };

  const apiMonth = formatMonthForAPI(currentYear, currentMonth);

  const { data: eventsData, isLoading: eventsLoading } =
    useGetMonthlyEventsByIdQuery({
      employeeId: loggedInUser?.user?._id,
      month: apiMonth,
    });

  const [configureSetup, { isLoading: isConfigSetupLoading }] =
    useAdminConfigSetupMutation();

  // console.log(eventsData);

  const { data: adminConfigStatus, refetch: refetchAdminConfigStatus } =
    useGetAdminConfigStatusQuery({
      skip: !isAdmin, // only run query if user is Admin
    });
  // console.log(adminConfigStatus);

  const { data } = useExistsWorkingDaysQuery(currentMonthYear, {
    skip: !isAdmin || !adminConfigStatus?.setupComplete,
  });

  useEffect(() => {
    if (isAdmin && adminConfigStatus?.setupComplete !== undefined) {
      setIsConfigSetupModalOpen(!adminConfigStatus.setupComplete);
    }
  }, [adminConfigStatus, isAdmin]);

  useEffect(() => {
    if (isAdmin && data?.exists !== undefined) {
      setIsModalOpen(!data.exists);
    }
  }, [data, isAdmin]);

  const handleConfigModalClose = () => {
    setIsConfigSetupModalOpen(false);
  };

  // const handleConfigModalOpen = () => {
  //   setIsConfigSetupModalOpen(true);
  // };

  const handleConfigSave = async (data) => {
    // console.log("Saved KPI Settings:", data)

    try {
      const response = await configureSetup({
        ...data,
        leavePeriodUnit: "yearly",
      }).unwrap();
      // console.log(response);
      refetchAdminConfigStatus();
      toast.success("Success", "KPI Settings saved successfully!");
      setIsConfigSetupModalOpen(false);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to save KPI Settings. Please try again."
      );
    }
    // Here you would typically send the data to your API
    // setIsModalOpen(false)
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  const getCurrentDateString = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const monthName = getMonthName(today.getMonth());
    return `${dayName} - ${monthName} ${today.getDate()}, ${today.getFullYear()}`;
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const endFormatted = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // If start and end dates are the same, show only the start date
    if (startFormatted === endFormatted) {
      return startFormatted;
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  const getEventIcon = (type) => {
    switch (type.toLowerCase()) {
      case "party":
        return Gift;
      case "meeting":
        return Users;
      case "training":
        return GraduationCap;
      case "discussion":
        return MessageCircle;
      case "holiday":
        return Sun;
      case "weekend":
        return () => <img src={LeaveIcon} alt="Weekend" className="w-5 h-5" />;
      case "conference":
        return Mic;
      case "workshop":
        return Hammer;
      case "webinar":
        return MonitorSmartphone;
      case "birthday":
        return Cake;
      case "make-up-day":
        return CalendarCheck;
      case "on-call":
        return PhoneCall;
      case "other":
        return HelpCircle;
      default:
        return CalendarCheck;
    }
  };

  const getEventTypeStyles = (type) => {
    switch (type.toLowerCase()) {
      case "leave":
        return "bg-primary/20 text-primary";
      case "party":
        return "bg-purple-100 text-purple-500";
      case "meeting":
        return "bg-primary/20 text-primary";
      case "training":
        return "bg-emerald-100 text-emerald-500";
      case "discussion":
        return "bg-blue-100 text-blue-500";
      case "holiday":
        return "bg-yellow-100 text-yellow-500";
      case "weekend":
        return "bg-sky-100 text-sky-500";
      case "conference":
        return "bg-indigo-100 text-indigo-500";
      case "workshop":
        return "bg-pink-100 text-pink-500";
      case "webinar":
        return "bg-amber-100 text-amber-500";
      case "birthday":
        return "bg-teal-100 text-teal-500";
      case "make-up-day":
        return "bg-violet-100 text-violet-500";
      case "on-call":
        return "bg-cyan-100 text-cyan-500";
      case "other":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const renderEventSection = (title, events, emptyMessage) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4">{title}</h3>
      {events.length === 0 && emptyMessage ? (
        <div className="px-4 py-6 text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="px-4">
          {events.map((event) => {
            const EventIcon = getEventIcon(event.type);
            return (
              <div
                key={event._id}
                className="py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <div className="w-1 h-12 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeStyles(
                          event.type
                        )}`}
                      >
                        <EventIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDateRange(event.startDate, event.endDate)}
                        </p>
                        <p className="text-sm text-gray-600">{event.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 min-h-screen">
      <div className="absolute top-0 left-0 w-full h-64 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-primary/5"></div>
        <div className="absolute top-20 left-40 w-32 h-32 rounded-full bg-primary/5"></div>
        <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-primary/5"></div>
      </div>

      <div className="max-w-5xl mx-auto pt-10">
        <div className="text-center mb-5">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-bold text-primary/70 animate-pulse">
              Hi, {loggedInUser?.user?.firstName}!
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-gray-700">
              <span></span> Welcome back! Ready to get started? 🚀
            </p>
            <p className="text-sm sm:text-lg text-gray-500 max-w-xl mx-auto">
              Let&apos;s find what you need! ✨
            </p>
          </div>
        </div>
        <div className="px-5 md:px-0">
          <SearchBar />
        </div>
      </div>

      {/* Main Content: Todo and Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-screen-md lg:max-w-screen-xl mx-auto mt-10 px-5 md:px-0 ">
        {/* Todo Section */}
        <DailyTasks />

        {/* Calendar Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-fit">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Events</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Current Date */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-6 py-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="flex items-center justify-between relative z-10 py-1">
                <div className="flex items-center">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                      {getCurrentDateString()}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className=" px-4 py-0 rounded-lg ">
                    <div className="relative overflow-hidden h-9">
                      {/* Hours */}
                      <div className="flex ">
                        <div className="w-8 overflow-hidden relative">
                          <div
                            className="flex flex-col items-center transition-transform duration-500"
                            style={{
                              transform: `translateY(-${
                                currentTime.hours * 40
                              }px)`,
                            }}
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <div
                                key={i}
                                className="h-10 flex items-center justify-center"
                              >
                                <span className="text-primary font-mono font-bold text-xl">
                                  {i.toString().padStart(2, "0")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <span className="text-primary font-mono font-bold text-xl mx-0.5 pt-1">
                          :
                        </span>
                        {/* Minutes */}
                        <div className="w-8 overflow-hidden relative">
                          <div
                            className="flex flex-col items-center transition-transform duration-500"
                            style={{
                              transform: `translateY(-${
                                currentTime.minutes * 40
                              }px)`,
                            }}
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <div
                                key={i}
                                className="h-10 flex items-center justify-center"
                              >
                                <span className="text-primary font-mono font-bold text-xl">
                                  {i.toString().padStart(2, "0")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <span className="text-primary font-mono font-bold text-xl mx-0.5 pt-1">
                          :
                        </span>
                        {/* Seconds */}
                        <div className="w-8 overflow-hidden relative">
                          <div
                            className="flex flex-col items-center transition-transform duration-500"
                            style={{
                              transform: `translateY(-${
                                currentTime.seconds * 40
                              }px)`,
                            }}
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <div
                                key={i}
                                className="h-10 flex items-center justify-center"
                              >
                                <span className="text-primary font-mono font-bold text-xl">
                                  {i.toString().padStart(2, "0")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Highlight current time */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="h-full flex items-center">
                          <div className="h-7 w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h4 className="text-base font-medium text-gray-800">
                {getMonthName(currentMonth - 1)} {currentYear}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Events Content */}
            <div className="max-h-96 overflow-y-auto">
              {eventsLoading ? (
                <EventsSkeleton
                  isCurrentMonth={isCurrentMonth}
                  isFutureMonth={isFutureMonth}
                  isPastMonth={isPastMonth}
                />
              ) : (
                <div className="py-4">
                  {/* Show Today's Events only in current month */}
                  {isCurrentMonth &&
                    renderEventSection(
                      "Today's Events",
                      eventsData?.todayEvents || [],
                      "No events for today"
                    )}

                  {/* Show Upcoming Events in current or future months */}
                  {(isCurrentMonth || isFutureMonth) &&
                    renderEventSection(
                      "Upcoming Events",
                      eventsData?.upcomingEvents || [],
                      "No upcoming events"
                    )}

                  {/* Show Past Events in current or past months */}
                  {(isCurrentMonth || isPastMonth) &&
                    renderEventSection(
                      "Past Events",
                      eventsData?.pastEvents || [],
                      "No past events"
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AdminConfigSetupModal
        isOpen={isConfigSetupModalOpen}
        onClose={handleConfigModalClose}
        onSave={handleConfigSave}
      />
      <RequestWorkingDaysModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default HomePage;
