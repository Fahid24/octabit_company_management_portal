import { useState, useCallback, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameDay,
  addDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Plus,
  Building,
  UserCheck,
  Crown,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  FileText,
  Bell,
  Edit,
  X,
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { useSelector } from "react-redux";
import SelectInput from "@/component/select/SelectInput";
import { FloatingInput } from "@/component/FloatiingInput";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import {
  useCreateEventMutation,
  useGetAllEventsQuery,
} from "@/redux/features/event/eventApiSlice";
import { errorAlert, successAlert } from "@/utils/allertFunction";
import { useNavigate } from "react-router-dom";
import Loader from "@/component/Loader";
import { toast } from "@/component/Toast";
import {
  useExistsWorkingDaysQuery,
  useRequestToCompleteWorkingDaysMutation,
} from "@/redux/features/admin/adminControl/adminControlApiSlice";
import Button from "@/component/Button";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    "en-US": enUS,
  },
});

const roles = [
  //   { value: "all", label: "All Roles" },
  { value: "Admin", label: "Admin" },
  { value: "DepartmentHead", label: "Department Head" },
  { value: "Manager", label: "Manager" },
  { value: "Employee", label: "Employee" },
];

// Enhanced sample events with privacy and role-based data
const sampleEvents = [
  {
    id: "1",
    title: "Company All-Hands Meeting",
    start: new Date(2024, 11, 15, 14, 0),
    end: new Date(2024, 11, 15, 18, 0),
    type: "meeting",
    description: "Quarterly company update",
    location: "Main Auditorium",
    attendees: ["all@company.com"],
    priority: "high",
    status: "confirmed",
    targetType: "all",
    targetValue: "all",
    createdBy: "admin.user",
    createdByRole: "admin",
    isPrivate: false,
    createdAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    title: "HR Department Meeting",
    start: new Date(2024, 11, 18, 10, 0),
    end: new Date(2024, 11, 18, 12, 0),
    type: "meeting",
    description: "Monthly HR team sync",
    location: "HR Conference Room",
    attendees: ["hr@company.com"],
    priority: "medium",
    status: "scheduled",
    targetType: "department",
    targetValue: "hr",
    createdBy: "hr.head",
    createdByRole: "departmentHead",
    isPrivate: false,
    createdAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "3",
    title: "Personal Doctor Appointment",
    start: new Date(2024, 11, 20, 14, 0),
    end: new Date(2024, 11, 20, 15, 0),
    type: "leave",
    description: "Annual checkup",
    location: "Medical Center",
    attendees: [],
    priority: "medium",
    status: "confirmed",
    targetType: "user",
    targetValue: "eng.emp1",
    createdBy: "eng.emp1",
    createdByRole: "employee",
    isPrivate: true,
    createdAt: "2024-12-01T08:00:00Z",
  },
];

const eventTypes = [
  {
    value: "party",
    label: "Party",
    color: "#a855f7",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
  {
    value: "meeting",
    label: "Meeting",
    color: "#3b82f6",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    value: "training",
    label: "Training",
    color: "#22c55e",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
  },
  {
    value: "discussion",
    label: "Group Discussion",
    color: "#eab308",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  {
    value: "holiday",
    label: "Holiday",
    color: "#f97316",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
  },
  {
    value: "weekend",
    label: "Weekend",
    color: "#0ea5e9",
    bgColor: "bg-sky-100",
    textColor: "text-sky-800",
  },
  {
    value: "conference",
    label: "Conference",
    color: "#6366f1",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-800",
  },
  {
    value: "workshop",
    label: "Workshop",
    color: "#ec4899",
    bgColor: "bg-pink-100",
    textColor: "text-pink-800",
  },
  {
    value: "webinar",
    label: "Webinar",
    color: "#f59e0b",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
  },
  {
    value: "birthday",
    label: "Birthday",
    color: "#10b981",
    bgColor: "bg-teal-100",
    textColor: "text-teal-800",
  },
  {
    value: "make-up-day",
    label: "Make-Up Day",
    color: "#8b5cf6",
    bgColor: "bg-violet-100",
    textColor: "text-violet-800",
  },
  {
    value: "on-call",
    label: "On-Call",
    color: "#06b6d4",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-800",
  },
  {
    value: "other",
    label: "Other",
    color: "#6b7280",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
];

const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

// Role configurations with UI customization
const roleConfigs = {
  Admin: {
    title: "System Administrator",
    icon: Crown,
    color: "bg-primary",
    gradientFrom: "from-primary",
    gradientTo: "to-primary",
    permissions: [
      "Create all events",
      "View all events",
      "Manage all users",
      "System settings",
    ],
    canTarget: ["all", "department", "role", "user"],
    dashboardCards: [
      {
        title: "Total Events",
        value: "156",
        icon: CalendarDays,
        color: "text-purple-600",
      },
      {
        title: "All Users",
        value: "1,234",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Departments",
        value: "8",
        icon: Building,
        color: "text-green-600",
      },
      {
        title: "System Health",
        value: "98%",
        icon: BarChart3,
        color: "text-orange-600",
      },
    ],
    quickActions: [
      { label: "System Settings", icon: Settings },
      { label: "User Management", icon: Users },
      { label: "Reports", icon: FileText },
      { label: "Notifications", icon: Bell },
    ],
  },
  DepartmentHead: {
    title: "Department Head",
    icon: Building,
    color: "bg-primary",
    gradientFrom: "from-primary",
    gradientTo: "to-primary",
    permissions: [
      "Manage department",
      "Create department events",
      "Approve department requests",
    ],
    canTarget: ["department", "role", "user"],
    dashboardCards: [
      {
        title: "Dept Events",
        value: "24",
        icon: CalendarDays,
        color: "text-blue-600",
      },
      {
        title: "Team Members",
        value: "45",
        icon: Users,
        color: "text-green-600",
      },
      {
        title: "Pending Approvals",
        value: "7",
        icon: FileText,
        color: "text-orange-600",
      },
      {
        title: "This Month",
        value: "12",
        icon: BarChart3,
        color: "text-purple-600",
      },
    ],
    quickActions: [
      { label: "Approve Requests", icon: FileText },
      { label: "Team Overview", icon: Users },
      { label: "Department Reports", icon: BarChart3 },
      { label: "Settings", icon: Settings },
    ],
  },
  Manager: {
    title: "Manager",
    icon: UserCheck,
    color: "bg-primary",
    gradientFrom: "from-primary",
    gradientTo: "to-primary",
    permissions: ["Manage team", "Create team events", "Approve team requests"],
    canTarget: ["role", "user"],
    dashboardCards: [
      {
        title: "Team Events",
        value: "18",
        icon: CalendarDays,
        color: "text-green-600",
      },
      {
        title: "Direct Reports",
        value: "12",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Approvals",
        value: "3",
        icon: FileText,
        color: "text-orange-600",
      },
      {
        title: "Completed",
        value: "89%",
        icon: BarChart3,
        color: "text-purple-600",
      },
    ],
    quickActions: [
      { label: "Team Calendar", icon: CalendarDays },
      { label: "Approve Leave", icon: FileText },
      { label: "Team Reports", icon: BarChart3 },
      { label: "1-on-1s", icon: Users },
    ],
  },
  Employee: {
    title: "Employee",
    icon: Users,
    color: "bg-primary",
    gradientFrom: "from-primary",
    gradientTo: "to-primary",
    permissions: [
      "Create personal events",
      "View relevant events",
      "Request time off",
    ],
    canTarget: ["user"],
    dashboardCards: [
      {
        title: "My Events",
        value: "8",
        icon: CalendarDays,
        color: "text-gray-600",
      },
      {
        title: "Leave Balance",
        value: "15",
        icon: Clock,
        color: "text-green-600",
      },
      { title: "Upcoming", value: "4", icon: Bell, color: "text-blue-600" },
      {
        title: "This Week",
        value: "2",
        icon: BarChart3,
        color: "text-purple-600",
      },
    ],
    quickActions: [
      { label: "Request Leave", icon: CalendarDays },
      { label: "My Schedule", icon: Clock },
      { label: "Team Events", icon: Users },
      { label: "Profile", icon: Settings },
    ],
  },
};

export default function EventCalendarPage() {
  const loginUser = useSelector((state) => state.userSlice.user);
  const isAdmin = loginUser?.user?.role === "Admin";
  const [events, setEvents] = useState(sampleEvents);
  const [formattedEvents, setFormattedEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const currentUserRole = loginUser?.user?.role;
  const currentUserId = loginUser?.user?._id;
  const currentUserDepartment = loginUser?.user?.department?._id;

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    attendees: "",
    priority: "medium",
    status: "scheduled",
    allDay: false,
    targetType: "user",
    targetValue: "user",
    isPrivate: false,
    isRecurring: false,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showViewModal, setShowViewModal] = useState(false);
  const [showingEvent, setShowingEvent] = useState(null);

  const createModalRef = useRef(null);
  const viewModalRef = useRef(null);

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (ref) => (e) => {
    if (!ref.current) return;
    e.preventDefault();
    ref.current.scrollTop += e.deltaY;
  };

  const currentMonthYear = format(new Date(), "yyyy-MM");
  const [requestCompleteWorkingDays, { isLoading: isRequestLoading }] =
    useRequestToCompleteWorkingDaysMutation();

  // Handle click outside
  // const handleClickOutside = (event) => {
  //   if (modalRef.current && !modalRef.current.contains(event.target)) {
  //     setShowViewModal(false);
  //     setShowingEvent(null);
  //   }
  // };

  // useEffect(() => {
  //   const handleClickCreateModalOutside = (event) => {
  //     if (
  //       isModalOpen &&
  //       createModalRef.current &&
  //       !createModalRef.current.contains(event.target)
  //     ) {
  //       setIsModalOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickCreateModalOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickCreateModalOutside);
  //   };
  // }, [isModalOpen]);

  // Add event listener when component mounts
  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // console.log(showingEvent);

  const navigate = useNavigate();

  const { data: departmentsData, isLoading: deptLoading } =
    useGetDepartmentsQuery({
      isPopulate: true,
      page: 1,
      limit: 9000000,
    });
  const departments = [
    // { label: "All Departments", value: "all" },
    ...(departmentsData?.data?.map((d) => ({
      label: d?.name,
      value: d?._id,
    })) || []),
  ];

  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetAllEmployeesQuery({
      page: 1,
      limit: 9000000,
    });

  const { data: workingDaysData, refetch: refetchWorkingDays } =
    useExistsWorkingDaysQuery(currentMonthYear, {
      skip: !isAdmin,
    });

  // console.log(workingDaysData);

  const users = [
    // { value: "all", label: "All Users" },
    ...(employeeData?.data?.map((emp) => ({
      value: emp?._id,
      label: `${emp?.firstName} ${emp?.lastName}`,
      role: emp?.role,
      department: emp?.department?.name,
      departmentId: emp?.department?._id || "all",
    })) || []),
  ];

  const { data, error, isLoading } = useGetAllEventsQuery({
    userId: loginUser?.user?._id,
    includePrivate: true,
    page: 1,
    limit: 100000000,
  });

  const formatEvents = (apiEvents) => {
    return apiEvents?.map((event) => ({
      id: event._id,
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      allDay: event.allDay,
      type: event.type,
      description: event.description,
      location: event.location,
      priority: event.priority,
      status: event.status,
      isPrivate: event.isPrivate,
      isRecurring: event.isRecurring,
      targetType: event.targetType,
      targetValues: event.targetValues,
      attendees: event.attendees || [],
      createdBy: event.createdBy,
      createdByRole: event.createdByRole,
      startTime: event.startTime,
      endTime: event.endTime,

      // Include any other properties you need for your event handling
    }));
  };

  useEffect(() => {
    if (data?.events) {
      const formatted = formatEvents(data?.events);
      setFormattedEvents(formatted);
    }
  }, [data]);

  const [createEvent, { isLoading: isCreateEventLoading }] =
    useCreateEventMutation();

  // FIXED: Handle slot selection with proper date calculation (no extra day)
  const handleSelectSlot = useCallback(({ start, end }) => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isSameDay(startDate, endDate)) {
      // Single day selection
      setSelectedDates([startDate]);
      setEventForm((prev) => ({
        ...prev,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(startDate, "yyyy-MM-dd"),
        startTime: format(startDate, "HH:mm"),
        endTime: format(endDate, "HH:mm"),
        allDay: startDate.getHours() === 0 && endDate.getHours() === 0,
      }));
    } else {
      // FIXED: Multiple consecutive days - subtract 1 day from end to prevent extra day
      const dates = [];
      let currentDate = new Date(startDate);
      const actualEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day

      while (currentDate <= actualEndDate) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }

      setSelectedDates(dates);
      setEventForm((prev) => ({
        ...prev,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(actualEndDate, "yyyy-MM-dd"), // Use actual end date
        startTime: "09:00",
        endTime: "17:00",
        allDay: true,
      }));
    }

    setIsModalOpen(true);
  }, []);

  const handleSelectStart = useCallback(({ start }) => {
    setIsDragging(true);
    setDragStart(start);
    setDragEnd(start);
  }, []);

  const handleSelecting = useCallback(
    ({ start, end }) => {
      if (isDragging) {
        setDragEnd(end);
        return true;
      }
      return false;
    },
    [isDragging]
  );

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.type) return;

    const startDateTime = eventForm.allDay
      ? startOfDay(new Date(eventForm.startDate))
      : new Date(`${eventForm.startDate}T${eventForm.startTime}`);

    const endDateTime = eventForm.allDay
      ? endOfDay(new Date(eventForm.endDate))
      : new Date(`${eventForm.endDate}T${eventForm.endTime}`);

    try {
      const newEvent = {
        id: Date.now().toString(),
        title: eventForm.title,
        startDate: startDateTime,
        startTime: eventForm?.startTime,
        endTime: eventForm?.endTime,
        endDate: endDateTime,
        type: eventForm.type?.value,
        description: eventForm.description,
        location: eventForm.location,
        attendees: eventForm?.attendees
          ?.split(",")
          ?.map((email) => email.trim())
          ?.filter(Boolean),
        priority: eventForm?.priority?.value,
        status: eventForm?.status?.value,
        allDay: eventForm.allDay,
        targetType: eventForm.targetType.value || "all",
        targetValues: Array.isArray(eventForm?.targetValue)
          ? eventForm.targetValue.map((item) => item?.value)
          : [eventForm?.targetValue?.value].filter(Boolean),

        createdBy: currentUserId,
        createdByRole: currentUserRole,
        isPrivate: eventForm.isPrivate,
        isRecurring: eventForm.isRecurring,
        createdAt: new Date().toISOString(),
      };
      // console.log(newEvent);

      await createEvent(newEvent);
      // successAlert({
      //   title: "Success",
      //   text: "Department created successfully!",
      // });

      toast.success("Success", "New event created successfully!");

      navigate("/events");

      setEvents((prev) => [...prev, newEvent]);
      setIsModalOpen(false);
      setEventForm({
        title: "",
        description: "",
        type: "",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        location: "",
        attendees: "",
        priority: "medium",
        status: "scheduled",
        allDay: false,
        targetType: "user",
        targetValue: "user",
        isPrivate: false,
        isRecurring: false,
      });
      setSelectedDates([]);
    } catch (error) {
      // console.log(error);
      // errorAlert({
      //   title: "Error",
      //   text: "Failed to create event!",
      // });
      toast.error("Error", "Failed to create event!");
    }
  };

  const handleViewEvent = (event) => {
    // console.log(event);
    setShowingEvent(event);
    setShowViewModal(true);
  };

  // const handleUpdateEvent = () => {
  //   if (!editingEvent.title || !editingEvent.type) return;

  //   const startDateTime = editingEvent.allDay
  //     ? startOfDay(new Date(editingEvent.startDate))
  //     : new Date(`${editingEvent.startDate}T${editingEvent.startTime}`);

  //   const endDateTime = editingEvent.allDay
  //     ? endOfDay(new Date(editingEvent.endDate))
  //     : new Date(`${editingEvent.endDate}T${editingEvent.endTime}`);

  //   const updatedEvent = {
  //     ...editingEvent,
  //     start: startDateTime,
  //     end: endDateTime,
  //     attendees: editingEvent.attendees || [],
  //     updatedAt: new Date().toISOString(),
  //     metadata: {
  //       ...editingEvent.metadata,
  //       budget: editingEvent.budget,
  //       notes: editingEvent.notes,
  //       organizer: editingEvent.organizer,
  //       organizerEmail: editingEvent.organizerEmail,
  //       organizerPhone: editingEvent.organizerPhone,
  //       recurringPattern: editingEvent.recurrence,
  //     },
  //   };

  //   setEvents((prev) =>
  //     prev.map((event) => (event.id === editingEvent.id ? updatedEvent : event))
  //   );
  //   setShowEditModal(false);
  //   setEditingEvent(null);
  // };

  // Event styling with privacy indicator
  const eventStyleGetter = (event) => {
    const eventType = eventTypes.find((type) => type.value === event.type);
    const baseColor = eventType?.color || "#3b82f6";

    return {
      style: {
        backgroundColor: event.isPrivate ? "#6b7280" : baseColor,
        borderRadius: "6px",
        opacity: event.isPrivate ? 0.7 : 0.9,
        color: "white",
        border: event.isPrivate ? "2px dashed #374151" : "none",
        fontSize: "12px",
        fontWeight: "500",
        padding: "2px 6px",
      },
    };
  };

  const dayPropGetter = useCallback(
    (date) => {
      if (isDragging && dragStart && dragEnd) {
        const start = dragStart < dragEnd ? dragStart : dragEnd;
        const end = dragStart < dragEnd ? dragEnd : dragStart;
        const dayStart = startOfDay(date);

        if (dayStart >= startOfDay(start) && dayStart < startOfDay(end)) {
          return {
            className: "drag-selecting",
            style: {
              backgroundColor: "#dbeafe",
              border: "2px solid #3b82f6",
              borderRadius: "4px",
            },
          };
        }
      }
      return {};
    },
    [isDragging, dragStart, dragEnd]
  );

  // Filter events based on role and privacy
  const getFilteredEvents = () => {
    return formattedEvents.filter((event) => {
      // Private events check remains the same
      // if (event.isPrivate && event.createdBy !== currentUserId) {
      //   return false;
      // }

      // Convert targetValue to array if it's not already
      const eventTargetValues = Array.isArray(event.targetValue)
        ? event.targetValue
        : [event.targetValue];

      // Role-based filtering with array support
      switch (currentUserRole) {
        case "Admin":
          return true;

        case "DepartmentHead":
          return true;

        case "Manager":
          return true;

        case "Employee":
          return true;

        default:
          return false;
      }
    });
  };

  // Get target options based on role and target type
  const getTargetOptions = () => {
    const roleConfig = roleConfigs[currentUserRole];

    switch (eventForm.targetType.value) {
      case "department":
        if (currentUserRole === "Admin") return departments;
        if (currentUserRole === "DepartmentHead")
          return departments.filter(
            (d) => d.value === currentUserDepartment || d.value === "all"
          );
        return [];

      case "role":
        if (currentUserRole === "Admin") return roles;
        if (currentUserRole === "DepartmentHead")
          return roles.filter(
            (r) =>
              ["Manager", "Employee"].includes(r.value) || r.value === "all"
          );
        if (currentUserRole === "Manager")
          return roles.filter(
            (r) => r.value === "Employee" || r.value === "all"
          );
        return [];

      case "user":
        return users.filter((u) => {
          if (currentUserRole === "Admin") return true;
          if (currentUserRole === "DepartmentHead")
            return (
              u.departmentId === currentUserDepartment || u.value === "all"
            );
          if (currentUserRole === "Manager")
            return (
              u.departmentId === currentUserDepartment &&
              ["Manager", "Employee"].includes(u.role)
            );
          return u.value === currentUserId || u.value === "all";
        });

      default:
        return [{ value: "all", label: "All" }];
    }
  };

  const currentRoleConfig = roleConfigs[currentUserRole];
  const RoleIcon = currentRoleConfig.icon;

  // Month/Year Picker Component
  const MonthYearPicker = ({ currentDate, onDateChange, onClose }) => {
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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    const handleApply = () => {
      const newDate = new Date(selectedYear, selectedMonth, 1);
      onDateChange(newDate);
      onClose();
    };

    return (
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 min-w-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Select Month & Year</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Month
            </label>
            <select
              value={selectedMonth.toString()}
              onChange={(e) =>
                setSelectedMonth(Number.parseInt(e.target.value))
              }
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index.toString()}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Year
            </label>
            <select
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/75 text-white rounded transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  // Close month/year picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMonthYearPicker && !event.target.closest(".relative")) {
        setShowMonthYearPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMonthYearPicker]);

  const targetOptions = [];

  if (currentRoleConfig.canTarget.includes("all")) {
    targetOptions.push({ label: "All Employees", value: "all" });
  }
  if (currentRoleConfig.canTarget.includes("department")) {
    targetOptions.push({ label: "Specific Department", value: "department" });
  }
  if (currentRoleConfig.canTarget.includes("role")) {
    targetOptions.push({ label: "Specific Role", value: "role" });
  }
  if (currentRoleConfig.canTarget.includes("user")) {
    targetOptions.push({ label: "Specific User", value: "user" });
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-700 border border-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 border border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700 border border-green-300";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "approved":
        return "bg-emerald-100 text-emerald-700 border border-emerald-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-300";
      case "draft":
        return "bg-gray-100 text-gray-700 border border-gray-300";
      case "completed":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "meeting":
        return "bg-blue-200"; // Professional and neutral
      case "party":
        return "bg-pink-200"; // Fun and vibrant
      case "training":
        return "bg-teal-200"; // Growth/learning vibe
      case "leave":
        return "bg-primary/30";
      case "holiday":
        return "bg-amber-200"; // Warm, cheerful
      default:
        return "bg-gray-200"; // Neutral fallback
    }
  };

  const handleRequestCompleteWorkingDays = async () => {
    try {
      const response = await requestCompleteWorkingDays({
        monthKey: currentMonthYear,
        completedBy: loginUser?.user?._id,
      });
      if (response?.error) {
        toast.error(
          "Error",
          response?.error?.data?.message ||
            "Failed to send request for complete working days."
        );
      } else {
        toast.success("Success", "Request to complete working days sent!");
        refetchWorkingDays();
      }
    } catch (error) {
      // console.log("Error requesting complete working days:", error);
      toast.error("Error", "Failed to send request for complete working days.");
    }
  };

  useEffect(() => {
    // Prevent background scroll when any modal is open
    if (isModalOpen || showViewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, showViewModal]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 min-h-screen">
      <div className="">
        {/* Calendar */}
        <div className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden">
          <div
            className={`bg-gradient-to-r from-primary/10 to-white text-gray-800 p-6`}
          >
            <div className="flex items-center gap-2">
              <RoleIcon className="h-5 w-5" />
              Event Calendar - {currentRoleConfig.title}
            </div>
            <p className="text-gray-800 mt-2">
              Showing {getFilteredEvents()?.events?.length} events (including
              private events). Private events shown with dashed border.
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[70vh]">
              <Loader />
            </div>
          ) : (
            <div className="p-0">
              <div className="h-[700px] p-4">
                <Calendar
                  localizer={localizer}
                  events={getFilteredEvents()}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  onSelectSlot={handleSelectSlot}
                  onSelectStart={handleSelectStart}
                  onSelecting={handleSelecting}
                  selectable={true}
                  eventPropGetter={eventStyleGetter}
                  dayPropGetter={dayPropGetter}
                  views={["month", "week", "day"]}
                  view={currentView}
                  onView={setCurrentView}
                  popup
                  step={30}
                  timeslots={2}
                  longPressThreshold={10}
                  dragThroughEvents={false}
                  resizable={false}
                  // onSelectEvent={handleEditEvent}
                  onSelectEvent={handleViewEvent}
                  components={{
                    toolbar: ({ label, onNavigate, onView, view, date }) => (
                      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg relative">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onNavigate("PREV")}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-primary/75 hover:text-white hover:scale-105 transition-colors"
                          >
                            ← Previous
                          </button>
                          <button
                            onClick={() => onNavigate("TODAY")}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-primary/75 hover:text-white hover:scale-105 transition-colors"
                          >
                            Today
                          </button>
                          <button
                            onClick={() => onNavigate("NEXT")}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-primary/75 hover:text-white hover:scale-105 transition-colors"
                          >
                            Next →
                          </button>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => {
                              setSelectedMonth(date.getMonth());
                              setSelectedYear(date.getFullYear());
                              setShowMonthYearPicker(!showMonthYearPicker);
                            }}
                            className="group text-xl font-semibold text-gray-800 hover:bg-primary/75 hover:text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            {label}
                            <span className="ml-2 text-sm opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                              📅
                            </span>
                          </button>

                          {showMonthYearPicker && (
                            <MonthYearPicker
                              currentDate={date}
                              onDateChange={(newDate) => {
                                onNavigate("DATE", newDate);
                              }}
                              onClose={() => setShowMonthYearPicker(false)}
                            />
                          )}
                        </div>

                        <div className="flex gap-1">
                          {!isAdmin && (
                            <button
                              onClick={() => onView("month")}
                              className={`px-3 py-1 rounded transition-colors ${
                                view === "month"
                                  ? "bg-primary/75 text-white scale-105"
                                  : "border border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              Month
                            </button>
                          )}

                          {isAdmin && (
                            <Button
                              disabled={!isAdmin || workingDaysData?.exists}
                              isLoading={isRequestLoading}
                              onClick={handleRequestCompleteWorkingDays}
                              className={`px-3 text-sm rounded transition-colors  ${
                                view === "month"
                                  ? "bg-primary/75 text-white scale-105"
                                  : "border border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              Monthly Event Entry Done
                            </Button>
                          )}

                          {/* <button
                            onClick={() => onView("week")}
                            className={`px-3 py-1 rounded transition-colors ${
                              view === "week"
                                ? "bg-primary/75 text-white scale-105"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            Week
                          </button> */}
                          {/* <button
                            onClick={() => onView("day")}
                            className={`px-3 py-1 rounded transition-colors ${
                              view === "day"
                                ? "bg-primary/75 text-white scale-105"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            Day
                          </button> */}
                        </div>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Event Creation Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onWheel={handleOverlayScroll(createModalRef)}
            style={{ overflowY: "auto" }}
          >
            <div
              ref={createModalRef}
              className="bg-white/95 backdrop-blur-sm rounded-lg max-w-4xl w-full"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              <div className="p-6 border-b">
                <div className="flex items-center gap-2 text-xl font-semibold">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create New Event
                </div>
                <p className="text-gray-600 mt-1">
                  {selectedDates.length === 1
                    ? `Creating event for ${format(
                        selectedDates[0],
                        "MMMM dd, yyyy"
                      )}`
                    : `Creating event spanning ${selectedDates.length} days`}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Selected Dates Display */}
                <div className="p-4 bg-primary/20  rounded-lg">
                  <label className="text-sm font-medium text-primary  mb-2 block">
                    Selected Dates:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map((date, index) => (
                      <span
                        key={index}
                        className="bg-primary text-white px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <CalendarDays className="h-3 w-3" />
                        {format(date, "MMM dd, yyyy")}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Event Title */}
                    <FloatingInput
                      label="Event Title *"
                      type="text"
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, title: e.target.value })
                      }
                      // error={errors?.title}
                    />

                    {/* Event Type */}
                    <SelectInput
                      className={"z-30"}
                      label="Event Type *"
                      isMulti={false}
                      value={eventForm.type}
                      onChange={(e) => {
                        setEventForm({ ...eventForm, type: e });
                        // setErrors((prev) => ({
                        //     ...prev,
                        //     type: "",
                        // }));
                      }}
                      options={eventTypes}
                      // error={errors?.timeUnit}
                    />

                    {/* Privacy Toggle */}
                    <CustomCheckbox
                      checked={eventForm.isPrivate}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          isPrivate: e.target.checked,
                        })
                      }
                      label={`Private Event (Only you can see)`}
                      className="w-full"
                    />

                    {/* Recurrence Toggle */}
                    <CustomCheckbox
                      checked={eventForm.isRecurring}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          isRecurring: e.target.checked,
                        })
                      }
                      label={`Recurring Event`}
                      className="w-full"
                    />

                    {/* All Day Toggle */}
                    <CustomCheckbox
                      checked={eventForm.allDay}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, allDay: e.target.checked })
                      }
                      label={`All Day Event`}
                      className="w-full"
                    />

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput
                        label="Start Date"
                        type="date"
                        value={eventForm.startDate}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            startDate: e.target.value,
                          })
                        }
                        // error={errors?.title}
                      />
                      <FloatingInput
                        label="End Date"
                        type="date"
                        value={eventForm.endDate}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            endDate: e.target.value,
                          })
                        }
                        // error={errors?.title}
                      />
                    </div>

                    {/* Time Range - Only show if not all day */}
                    {!eventForm.allDay && (
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput
                          label="Start Time"
                          type="time"
                          value={eventForm.startTime}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              startTime: e.target.value,
                            })
                          }
                          // error={errors?.title}
                        />
                        <FloatingInput
                          label="End Time"
                          type="time"
                          value={eventForm.endTime}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              endTime: e.target.value,
                            })
                          }
                          // error={errors?.title}
                        />
                      </div>
                    )}
                  </div>

                  {/* Middle Column */}
                  <div className="space-y-4">
                    {/* Target Type - Only show if not private */}
                    {!eventForm.isPrivate && (
                      <>
                        <SelectInput
                          className={"z-30"}
                          label="Target Audience *"
                          isMulti={false}
                          value={eventForm.targetType}
                          onChange={(e) => {
                            setEventForm({
                              ...eventForm,
                              targetType: e,
                              targetValue: "all",
                            });
                            // setErrors((prev) => ({
                            //     ...prev,
                            //     type: "",
                            // }));
                          }}
                          options={targetOptions}
                          // error={errors?.timeUnit}
                        />

                        {/* Target Value */}
                        {eventForm.targetType !== "all" && (
                          <SelectInput
                            className={"z-20"}
                            label={`Select ${
                              eventForm.targetType.label
                                ? eventForm.targetType.label
                                : ""
                            }`}
                            isMulti={true}
                            value={eventForm.targetValue}
                            onChange={(e) => {
                              setEventForm({ ...eventForm, targetValue: e });
                              // setErrors((prev) => ({
                              //     ...prev,
                              //     type: "",
                              // }));
                            }}
                            options={getTargetOptions()}
                            // error={errors?.timeUnit}
                          />
                        )}
                      </>
                    )}

                    {/* Location */}
                    <FloatingInput
                      label="Location"
                      type="text"
                      value={eventForm.location}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, location: e.target.value })
                      }
                      // error={errors?.title}
                    />

                    {/* Attendees - Only show if not private */}
                    {!eventForm.isPrivate && (
                      <FloatingInput
                        label="Additional Attendees"
                        type="text"
                        value={eventForm.attendees}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            attendees: e.target.value,
                          })
                        }
                        // error={errors?.title}
                      />
                    )}

                    {/* Priority and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <SelectInput
                        className={"z-10"}
                        label="Priority"
                        isMulti={false}
                        value={eventForm.priority}
                        onChange={(e) => {
                          setEventForm({ ...eventForm, priority: e });
                          // setErrors((prev) => ({
                          //     ...prev,
                          //     type: "",
                          // }));
                        }}
                        options={priorityLevels}
                        // error={errors?.timeUnit}
                      />
                      <SelectInput
                        className={"z-10"}
                        label="Status"
                        isMulti={false}
                        value={eventForm.status}
                        onChange={(e) => {
                          setEventForm({ ...eventForm, status: e });
                          // setErrors((prev) => ({
                          //     ...prev,
                          //     type: "",
                          // }));
                        }}
                        options={statusOptions}
                        // error={errors?.timeUnit}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Description */}
                    <FloatingTextarea
                      id="description"
                      label="Description"
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                    />

                    {/* Event Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Event Preview:
                      </label>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Privacy:</strong>{" "}
                          {eventForm.isPrivate
                            ? "Private (Only you)"
                            : "Public"}
                        </p>
                        <p>
                          <strong>Recurrence:</strong>{" "}
                          {eventForm.isRecurring
                            ? "Recurring next year"
                            : "One-time"}
                        </p>

                        <p>
                          <strong>Duration:</strong> {selectedDates.length} day
                          {selectedDates.length > 1 ? "s" : ""}
                        </p>
                        <p>
                          <strong>Type:</strong>{" "}
                          {eventTypes.find(
                            (type) => type.value === eventForm.type
                          )?.label || "Not selected"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    disabled={!eventForm.title || !eventForm.type}
                    className={`px-6 py-2 rounded text-white transition-colors ${
                      !eventForm.title || !eventForm.type
                        ? "bg-gray-400 cursor-not-allowed"
                        : `bg-gradient-to-r ${currentRoleConfig.gradientFrom} ${currentRoleConfig.gradientTo} hover:opacity-90`
                    }`}
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Event Modal */}
        {showViewModal && showingEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onWheel={handleOverlayScroll(viewModalRef)}
            style={{ overflowY: "auto" }}
          >
            <div
              ref={viewModalRef}
              className="bg-white rounded-lg max-w-4xl w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-white text-gray-800 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Event Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setShowingEvent(null);
                  }}
                  className="text-black hover:text-gray-400 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {showingEvent?.title}
                      </h3>
                      <p className="text-gray-600">
                        {showingEvent?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                            showingEvent?.type
                          )}`}
                        >
                          {showingEvent?.type}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            showingEvent?.priority
                          )}`}
                        >
                          {showingEvent?.priority}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            showingEvent?.status
                          )}`}
                        >
                          {showingEvent?.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recurrence
                        </label>
                        <span
                        // className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        //   showingEvent?.isRecurring
                        // )}`}
                        >
                          {showingEvent?.isRecurring ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <p className="text-gray-900">
                        {showingEvent?.location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date & Time
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Start:</strong>{" "}
                          {formatDate(showingEvent?.start)}{" "}
                          {showingEvent?.startTime &&
                            !showingEvent?.allDay &&
                            `at ${showingEvent?.startTime}`}
                        </p>
                        <p className="text-sm">
                          <strong>End:</strong> {formatDate(showingEvent?.end)}{" "}
                          {showingEvent?.endTime &&
                            !showingEvent?.allDay &&
                            `at ${showingEvent?.endTime}`}
                        </p>
                        <p className="text-sm">
                          <strong>All Day:</strong>{" "}
                          {showingEvent?.allDay ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Audience
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm mb-2">
                          <strong>Target Type:</strong>{" "}
                          {showingEvent?.targetType}
                        </p>
                        <div>
                          {showingEvent?.targetType === "all" && (
                            <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs">
                              All Users
                            </span>
                          )}
                          {showingEvent?.targetType === "role" && (
                            <div className="flex flex-wrap gap-1">
                              {showingEvent?.targetValuesPopulated?.map(
                                (role, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs"
                                  >
                                    {typeof role === "string"
                                      ? role
                                      : role.name}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          {showingEvent?.targetType === "department" && (
                            <div className="space-y-2">
                              {showingEvent?.targetValuesPopulated?.map(
                                (dept, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-2 rounded border"
                                  >
                                    <p className="font-medium text-sm">
                                      {dept?.name}
                                    </p>
                                    {dept?.description && (
                                      <p className="text-xs text-gray-600">
                                        {dept?.description}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          {showingEvent?.targetType === "user" && (
                            <div className="space-y-2">
                              {showingEvent?.targetValuesPopulated?.map(
                                (user, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-2 rounded border"
                                  >
                                    <p className="font-medium text-sm">
                                      {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {user?.email}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {showingEvent?.attendees?.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Attendees
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          {showingEvent?.attendees?.map((attendee, index) => (
                            <span
                              key={index}
                              className="inline-block bg-white px-2 py-1 rounded text-xs mr-2 mb-1"
                            >
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created By
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium">
                          {showingEvent?.createdBy?.firstName}{" "}
                          {showingEvent?.createdBy?.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {showingEvent?.createdBy?.email}
                        </p>
                        <p className="text-xs text-gray-600">
                          Role: {showingEvent?.createdByRole}
                        </p>
                      </div>
                    </div>
                    {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timestamps
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Created: {new Date(event?.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    Updated: {new Date(event?.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`rounded-full w-16 h-16 bg-gradient-to-r ${currentRoleConfig.gradientFrom} ${currentRoleConfig.gradientTo} hover:opacity-90 shadow-2xl hover:shadow-3xl transition-all duration-300 text-white`}
          >
            <Plus className="h-6 w-6 mx-auto" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .drag-selecting {
          background-color: #dbeafe !important;
          border: 2px solid #3b82f6 !important;
          border-radius: 4px !important;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .rbc-selected {
          background-color: #3b82f6 !important;
          color: white !important;
          border-radius: 4px !important;
        }

        .rbc-selecting {
          background-color: #dbeafe !important;
          border: 2px dashed #3b82f6 !important;
          border-radius: 4px !important;
        }

        .rbc-calendar {
          user-select: none;
          overflow: visible !important;
        }

        .rbc-month-view {
          overflow: visible !important;
        }

        .rbc-date-cell {
          position: relative;
          transition: all 0.2s ease;
        }

        .rbc-date-cell:hover {
          background-color: #f3f4f6;
          border-radius: 4px;
        }

        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-event {
          border-radius: 6px !important;
          font-weight: 500;
        }
        .rbc-selected {
          background-color: #3b82f6 !important;
        }
        .rbc-today {
          background-color: #fef3c7;
        }
        .rbc-date-cell {
          padding: 5px;
          position: relative;
        }
        .rbc-time-slot {
          position: relative;
        }
        .rbc-month-view .rbc-date-cell {
          min-height: 40px;
        }

        .rbc-calendar .rbc-selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .rbc-calendar {
          user-select: none;
        }
      `}</style>
    </div>
  );
}
