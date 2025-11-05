/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  Crown,
  UserCheck,
  Users,
  Building,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  FileText,
  Bell,
  Edit,
  X,
  User,
  Flag,
  Trash2,
  Target,
  Plus,
} from "lucide-react";
import {
  useDeleteEventMutation,
  useGetAllEventsQuery,
} from "@/redux/features/event/eventApiSlice";
import EventFilter from "./components/EventFilter";
import { useSelector } from "react-redux";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { errorAlert, successAlert, warningAlert } from "@/utils/allertFunction";
import Loader from "@/component/Loader";
import Pagination from "@/component/Pagination";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import ConfirmDialog from "@/component/ConfirmDialog";

// Enhanced sample events data for different user perspectives
// const userEventData = {
//   admin: {
//     title: "Admin Dashboard",
//     subtitle: "Full access to all event management features",
//     color: "bg-primary",
//     gradientFrom: "from-primary",
//     gradientTo: "to-primary",
//     icon: Crown,
//     permissions: [
//       { text: "Create all events", granted: true },
//       { text: "View all events", granted: true },
//       { text: "Manage users", granted: true },
//       { text: "Approve events", granted: true },
//       { text: "System settings", granted: true },
//       { text: "Delete any event", granted: true },
//       { text: "View analytics", granted: true },
//       { text: "Manage departments", granted: true },
//     ],
//     recentEvents: [
//       {
//         id: "1",
//         title: "Company All-Hands Meeting",
//         date: "Dec 20, 2024",
//         time: "10:00 AM - 11:30 AM",
//         type: "meeting",
//         status: "confirmed",
//         targetType: "all",
//         targetValue: "all",
//         location: "Main Auditorium",
//         attendees: 250,
//         createdBy: "admin.user",
//         priority: "high",
//         isPrivate: false,
//         description:
//           "Quarterly company update covering financial results, new product launches, and strategic initiatives for Q1 2025.",
//         attendeesList: ["all@company.com", "board@company.com"],
//         organizer: "John Smith (CEO)",
//         organizerEmail: "john.smith@company.com",
//         organizerPhone: "+1 (555) 123-4567",
//         budget: "$5,000",
//         resources: ["Projector", "Microphone", "Catering"],
//         tags: ["quarterly", "company-wide", "strategic"],
//         recurrence: "Quarterly",
//         reminders: ["1 week before", "1 day before", "1 hour before"],
//         notes:
//           "Please ensure all department heads prepare their quarterly reports.",
//       },
//       {
//         id: "2",
//         title: "Engineering Sprint Planning",
//         date: "Dec 18, 2024",
//         time: "2:00 PM - 4:00 PM",
//         type: "meeting",
//         status: "scheduled",
//         targetType: "department",
//         targetValue: "engineering",
//         location: "Engineering Conference Room",
//         attendees: 25,
//         createdBy: "eng.manager1",
//         priority: "medium",
//         isPrivate: false,
//         description:
//           "Planning session for the next development sprint, including task assignment and timeline review.",
//         attendeesList: ["engineering@company.com"],
//         organizer: "Sarah Johnson (Engineering Manager)",
//         organizerEmail: "sarah.johnson@company.com",
//         organizerPhone: "+1 (555) 234-5678",
//         budget: "$500",
//         resources: ["Whiteboard", "Laptops", "Coffee"],
//         tags: ["sprint", "planning", "development"],
//         recurrence: "Bi-weekly",
//         reminders: ["1 day before", "2 hours before"],
//         notes: "Review previous sprint retrospective before the meeting.",
//       },
//       {
//         id: "3",
//         title: "John Doe - Annual Leave",
//         date: "Dec 23-30, 2024",
//         time: "All Day",
//         type: "leave",
//         status: "approved",
//         targetType: "user",
//         targetValue: "john.doe",
//         location: "N/A",
//         attendees: 1,
//         createdBy: "john.doe",
//         priority: "medium",
//         isPrivate: false,
//         description: "Annual vacation leave for the holiday season.",
//         attendeesList: ["john.doe@company.com"],
//         organizer: "John Doe (Software Engineer)",
//         organizerEmail: "john.doe@company.com",
//         organizerPhone: "+1 (555) 345-6789",
//         budget: "N/A",
//         resources: [],
//         tags: ["vacation", "annual-leave", "holiday"],
//         recurrence: "None",
//         reminders: ["1 week before"],
//         notes: "Handover tasks to team members before departure.",
//       },
//       {
//         id: "4",
//         title: "HR Policy Update Training",
//         date: "Dec 22, 2024",
//         time: "9:00 AM - 12:00 PM",
//         type: "training",
//         status: "confirmed",
//         targetType: "all",
//         targetValue: "all",
//         location: "Training Center",
//         attendees: 180,
//         createdBy: "hr.head",
//         priority: "high",
//         isPrivate: false,
//         description:
//           "Mandatory training session covering updated HR policies, compliance requirements, and new procedures.",
//         attendeesList: ["all@company.com"],
//         organizer: "Lisa Chen (HR Director)",
//         organizerEmail: "lisa.chen@company.com",
//         organizerPhone: "+1 (555) 456-7890",
//         budget: "$2,000",
//         resources: ["Training Materials", "Certificates", "Refreshments"],
//         tags: ["training", "hr-policy", "compliance", "mandatory"],
//         recurrence: "Annually",
//         reminders: ["1 week before", "3 days before", "1 day before"],
//         notes:
//           "Attendance is mandatory for all employees. Certificates will be issued upon completion.",
//       },
//     ],
//     stats: [
//       {
//         label: "Total Events",
//         value: "156",
//         icon: Calendar,
//         color: "text-purple-600",
//       },
//       {
//         label: "Active Users",
//         value: "1,234",
//         icon: Users,
//         color: "text-blue-600",
//       },
//       {
//         label: "Departments",
//         value: "8",
//         icon: Building,
//         color: "text-green-600",
//       },
//       {
//         label: "Pending Approvals",
//         value: "12",
//         icon: AlertCircle,
//         color: "text-orange-600",
//       },
//     ],
//   },
//   departmentHead: {
//     title: "Department Head Dashboard",
//     subtitle: "Manage and oversee your department's events and team",
//     color: "bg-primary",
//     gradientFrom: "from-primary",
//     gradientTo: "to-primary",
//     icon: Building,
//     permissions: [
//       { text: "Create department events", granted: true },
//       { text: "View department events", granted: true },
//       { text: "Manage department team", granted: true },
//       { text: "Approve department requests", granted: true },
//       { text: "View department analytics", granted: true },
//       { text: "Create all events", granted: false },
//       { text: "Manage other departments", granted: false },
//       { text: "System settings", granted: false },
//     ],
//     recentEvents: [
//       {
//         id: "1",
//         title: "HR Department Strategy Meeting",
//         date: "Dec 19, 2024",
//         time: "2:00 PM - 4:00 PM",
//         type: "meeting",
//         status: "confirmed",
//         targetType: "department",
//         targetValue: "hr",
//         location: "HR Conference Room",
//         attendees: 15,
//         createdBy: "hr.head",
//         priority: "high",
//         isPrivate: false,
//         description:
//           "Strategic planning meeting for HR department initiatives and goals for 2025.",
//         attendeesList: ["hr@company.com"],
//         organizer: "Lisa Chen (HR Director)",
//         organizerEmail: "lisa.chen@company.com",
//         organizerPhone: "+1 (555) 456-7890",
//         budget: "$300",
//         resources: ["Presentation Screen", "Meeting Materials"],
//         tags: ["strategy", "planning", "2025-goals"],
//         recurrence: "Monthly",
//         reminders: ["2 days before", "1 hour before"],
//         notes: "Please bring your department reports and budget proposals.",
//       },
//       {
//         id: "2",
//         title: "New Employee Onboarding",
//         date: "Dec 21, 2024",
//         time: "9:00 AM - 5:00 PM",
//         type: "training",
//         status: "scheduled",
//         targetType: "department",
//         targetValue: "hr",
//         location: "Training Room A",
//         attendees: 8,
//         createdBy: "hr.manager1",
//         priority: "medium",
//         isPrivate: false,
//         description:
//           "Comprehensive onboarding program for new hires joining in December.",
//         attendeesList: ["new-hires@company.com", "hr@company.com"],
//         organizer: "Mike Wilson (HR Manager)",
//         organizerEmail: "mike.wilson@company.com",
//         organizerPhone: "+1 (555) 567-8901",
//         budget: "$800",
//         resources: ["Welcome Kits", "Training Materials", "Lunch"],
//         tags: ["onboarding", "new-hires", "orientation"],
//         recurrence: "Monthly",
//         reminders: ["1 week before", "1 day before"],
//         notes: "Prepare welcome kits and ensure all documentation is ready.",
//       },
//       {
//         id: "3",
//         title: "HR Team Holiday Party",
//         date: "Dec 24, 2024",
//         time: "6:00 PM - 10:00 PM",
//         type: "party",
//         status: "confirmed",
//         targetType: "department",
//         targetValue: "hr",
//         location: "Rooftop Lounge",
//         attendees: 25,
//         createdBy: "hr.head",
//         priority: "medium",
//         isPrivate: false,
//         description:
//           "Annual HR department holiday celebration with dinner and entertainment.",
//         attendeesList: ["hr@company.com", "hr-families@company.com"],
//         organizer: "Lisa Chen (HR Director)",
//         organizerEmail: "lisa.chen@company.com",
//         organizerPhone: "+1 (555) 456-7890",
//         budget: "$3,000",
//         resources: ["Catering", "DJ", "Decorations", "Gifts"],
//         tags: ["holiday", "celebration", "team-building"],
//         recurrence: "Annually",
//         reminders: ["1 week before", "2 days before"],
//         notes: "RSVP required. Family members are welcome to join.",
//       },
//     ],
//     stats: [
//       {
//         label: "Dept Events",
//         value: "24",
//         icon: Calendar,
//         color: "text-blue-600",
//       },
//       {
//         label: "Team Members",
//         value: "45",
//         icon: Users,
//         color: "text-green-600",
//       },
//       {
//         label: "Pending Approvals",
//         value: "7",
//         icon: FileText,
//         color: "text-orange-600",
//       },
//       {
//         label: "This Month",
//         value: "12",
//         icon: BarChart3,
//         color: "text-purple-600",
//       },
//     ],
//   },
//   manager: {
//     title: "Manager Dashboard",
//     subtitle: "Lead your team and manage team events effectively",
//     color: "bg-primary",
//     gradientFrom: "from-primary",
//     gradientTo: "to-primary",
//     icon: UserCheck,
//     permissions: [
//       { text: "Create team events", granted: true },
//       { text: "View team events", granted: true },
//       { text: "Manage direct reports", granted: true },
//       { text: "Approve team requests", granted: true },
//       { text: "View team analytics", granted: true },
//       { text: "Create department events", granted: false },
//       { text: "Manage other teams", granted: false },
//       { text: "System administration", granted: false },
//     ],
//     recentEvents: [
//       {
//         id: "1",
//         title: "Team Sprint Planning",
//         date: "Dec 19, 2024",
//         time: "9:00 AM - 11:00 AM",
//         type: "meeting",
//         status: "confirmed",
//         targetType: "role",
//         targetValue: "employee",
//         location: "Conference Room B",
//         attendees: 12,
//         createdBy: "eng.manager1",
//         priority: "high",
//         isPrivate: false,
//         description:
//           "Bi-weekly sprint planning session for the development team.",
//         attendeesList: ["dev-team@company.com"],
//         organizer: "Sarah Johnson (Engineering Manager)",
//         organizerEmail: "sarah.johnson@company.com",
//         organizerPhone: "+1 (555) 234-5678",
//         budget: "$200",
//         resources: ["Scrum Board", "Sticky Notes", "Markers"],
//         tags: ["sprint", "agile", "planning"],
//         recurrence: "Bi-weekly",
//         reminders: ["1 day before", "1 hour before"],
//         notes: "Review backlog items and estimate story points.",
//       },
//       {
//         id: "2",
//         title: "Code Review Session",
//         date: "Dec 20, 2024",
//         time: "2:00 PM - 4:00 PM",
//         type: "training",
//         status: "scheduled",
//         targetType: "role",
//         targetValue: "employee",
//         location: "Development Lab",
//         attendees: 8,
//         createdBy: "eng.manager1",
//         priority: "medium",
//         isPrivate: false,
//         description:
//           "Weekly code review session to maintain code quality and share best practices.",
//         attendeesList: ["senior-devs@company.com", "junior-devs@company.com"],
//         organizer: "Sarah Johnson (Engineering Manager)",
//         organizerEmail: "sarah.johnson@company.com",
//         organizerPhone: "+1 (555) 234-5678",
//         budget: "$100",
//         resources: ["Code Repository Access", "Review Checklist"],
//         tags: ["code-review", "quality", "best-practices"],
//         recurrence: "Weekly",
//         reminders: ["2 hours before"],
//         notes: "Prepare code samples for review and discussion.",
//       },
//       {
//         id: "3",
//         title: "Team Building Activity",
//         date: "Dec 23, 2024",
//         time: "3:00 PM - 6:00 PM",
//         type: "party",
//         status: "confirmed",
//         targetType: "role",
//         targetValue: "employee",
//         location: "Recreation Center",
//         attendees: 15,
//         createdBy: "eng.manager1",
//         priority: "medium",
//         isPrivate: false,
//         description:
//           "End-of-year team building activity with games and refreshments.",
//         attendeesList: ["dev-team@company.com"],
//         organizer: "Sarah Johnson (Engineering Manager)",
//         organizerEmail: "sarah.johnson@company.com",
//         organizerPhone: "+1 (555) 234-5678",
//         budget: "$600",
//         resources: ["Games", "Snacks", "Prizes"],
//         tags: ["team-building", "recreation", "year-end"],
//         recurrence: "Quarterly",
//         reminders: ["1 week before", "1 day before"],
//         notes: "Casual dress code. Participation is voluntary but encouraged.",
//       },
//     ],
//     stats: [
//       {
//         label: "Team Events",
//         value: "18",
//         icon: Calendar,
//         color: "text-green-600",
//       },
//       {
//         label: "Direct Reports",
//         value: "12",
//         icon: Users,
//         color: "text-blue-600",
//       },
//       {
//         label: "Approvals",
//         value: "3",
//         icon: FileText,
//         color: "text-orange-600",
//       },
//       {
//         label: "Completed",
//         value: "89%",
//         icon: CheckCircle,
//         color: "text-purple-600",
//       },
//     ],
//   },
//   employee: {
//     title: "Employee Dashboard",
//     subtitle: "Manage your personal events and view team activities",
//     color: "bg-primary",
//     gradientFrom: "from-primary",
//     gradientTo: "to-primary",
//     icon: Users,
//     permissions: [
//       { text: "Create personal events", granted: true },
//       { text: "View relevant events", granted: true },
//       { text: "Request time off", granted: true },
//       { text: "View team calendar", granted: true },
//       { text: "Update profile", granted: true },
//       { text: "Create team events", granted: false },
//       { text: "Approve requests", granted: false },
//       { text: "Manage other users", granted: false },
//     ],
//     recentEvents: [
//       {
//         id: "1",
//         title: "My Vacation Request",
//         date: "Dec 28-30, 2024",
//         time: "All Day",
//         type: "leave",
//         status: "pending",
//         targetType: "user",
//         targetValue: "current_user",
//         location: "N/A",
//         attendees: 1,
//         createdBy: "emp.user1",
//         priority: "medium",
//         isPrivate: true,
//         description: "Personal vacation days for end-of-year break.",
//         attendeesList: ["emp.user1@company.com"],
//         organizer: "Alex Thompson (Software Developer)",
//         organizerEmail: "alex.thompson@company.com",
//         organizerPhone: "+1 (555) 678-9012",
//         budget: "N/A",
//         resources: [],
//         tags: ["vacation", "personal", "year-end"],
//         recurrence: "None",
//         reminders: ["1 week before"],
//         notes: "Will complete all pending tasks before departure.",
//       },
//       {
//         id: "2",
//         title: "Company Holiday Party",
//         date: "Dec 24, 2024",
//         time: "7:00 PM - 11:00 PM",
//         type: "party",
//         status: "confirmed",
//         targetType: "all",
//         targetValue: "all",
//         location: "Grand Ballroom",
//         attendees: 200,
//         createdBy: "admin.user",
//         priority: "high",
//         isPrivate: false,
//         description:
//           "Annual company-wide holiday celebration with dinner, entertainment, and awards ceremony.",
//         attendeesList: ["all@company.com"],
//         organizer: "Event Planning Committee",
//         organizerEmail: "events@company.com",
//         organizerPhone: "+1 (555) 789-0123",
//         budget: "$15,000",
//         resources: ["Live Band", "Catering", "Awards", "Photography"],
//         tags: ["holiday", "company-wide", "celebration", "awards"],
//         recurrence: "Annually",
//         reminders: ["2 weeks before", "1 week before", "1 day before"],
//         notes: "Formal attire required. Plus-ones welcome with RSVP.",
//       },
//       {
//         id: "3",
//         title: "Skills Development Workshop",
//         date: "Dec 21, 2024",
//         time: "1:00 PM - 5:00 PM",
//         type: "training",
//         status: "scheduled",
//         targetType: "department",
//         targetValue: "engineering",
//         location: "Training Center",
//         attendees: 30,
//         createdBy: "hr.head",
//         priority: "medium",
//         isPrivate: false,
//         description:
//           "Professional development workshop focusing on emerging technologies and industry best practices.",
//         attendeesList: ["engineering@company.com"],
//         organizer: "Professional Development Team",
//         organizerEmail: "training@company.com",
//         organizerPhone: "+1 (555) 890-1234",
//         budget: "$1,200",
//         resources: ["Workshop Materials", "Certificates", "Refreshments"],
//         tags: ["training", "skills", "professional-development", "technology"],
//         recurrence: "Quarterly",
//         reminders: ["1 week before", "1 day before"],
//         notes:
//           "Bring laptop for hands-on exercises. Certificates provided upon completion.",
//       },
//     ],
//     stats: [
//       {
//         label: "My Events",
//         value: "8",
//         icon: Calendar,
//         color: "text-gray-600",
//       },
//       {
//         label: "Leave Balance",
//         value: "15",
//         icon: Clock,
//         color: "text-green-600",
//       },
//       { label: "Upcoming", value: "4", icon: Bell, color: "text-blue-600" },
//       {
//         label: "This Week",
//         value: "2",
//         icon: BarChart3,
//         color: "text-purple-600",
//       },
//     ],
//   },
// };

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

const getTargetIcon = (targetType) => {
  switch (targetType) {
    case "all":
      return <Users className="h-3 w-3" />;
    case "department":
      return <Building className="h-3 w-3" />;
    case "role":
      return <UserCheck className="h-3 w-3" />;
    case "user":
      return <User className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    case "medium":
      return <Clock className="h-3 w-3 text-yellow-500" />;
    case "low":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "urgent":
      return <Flag className="h-3 w-3 text-red-600" />;
    default:
      return <Clock className="h-3 w-3 text-gray-500" />;
  }
};

export default function EventManagementPage() {
  const loginUser = useSelector((state) => state.userSlice.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUserType, setSelectedUserType] = useState(
    loginUser?.user?.role || "employee"
  );
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  ); // Start of current month
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  ); // End of current month
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Safe filter toggle function
  const handleToggleFilters = (value) => {
    try {
      setShowFilters(value);
    } catch (error) {
      console.error("Error setting showFilters:", error);
    }
  };

  // const currentUserData = userEventData[selectedUserType];

  const {
    data: eventsData,
    refetch,
    isLoading: isEventsDataLoading,
  } = useGetAllEventsQuery({
    page: currentPage,
    limit: limit,
    userId: loginUser?.user?._id,
    includePrivate: true,
    startDate: startDate,
    endDate: endDate,
    type: selectedType?.value || "",
    status: selectedStatus?.value || "",
  });

  // console.log(isEventsDataLoading);

  const [deleteEvent, { isLoading: isDeleteEventLoading }] =
    useDeleteEventMutation();

  // const Icon = currentUserData.icon;

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(false);
    setShowEditModal(true);
  };

  // const handleDeleteEvent = async (id) => {
  //   try {
  //     const result = await warningAlert({
  //       title: "Are you sure you want to delete this event?",
  //       text: "This action cannot be undone.",
  //       preConfirm: async () => {
  //         await deleteEvent({
  //           eventId: id,
  //           userId: loginUser?.user?._id,
  //           userRole: loginUser?.user?.role,
  //         }).unwrap();
  //         return true;
  //       },
  //     });

  //     if (result.isConfirmed) {
  //       successAlert({
  //         title: "Success",
  //         text: "Event deleted successfully!",
  //       });
  //       await refetch();

  //       // setShowEventDetails(false);
  //       setSelectedEvent(null);
  //     }
  //   } catch (err) {
  //     errorAlert({
  //       title: "Error",
  //       text: err?.data?.message || "Failed to delete event.",
  //     });
  //   }
  // };

  // Handle date range change
  const handleDateRangeChange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    // setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd")); // Start of current month
    // setEndDate(format(endOfMonth(new Date()), "yyyy-MM-dd")); // End of current month
    setSelectedType(null);
    setSelectedStatus(null);
    setCurrentPage(1); // Reset to first page
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id); // store the item to delete
    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent({
        eventId: itemToDelete,
        userId: loginUser?.user?._id,
        userRole: loginUser?.user?.role,
      }).unwrap();
      toast.success("Success", "Event deleted successfully!");

      await refetch();

      // cleanup
      setIsDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Error", error?.data?.message || "Failed to delete event.");
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  // const handleSaveEditedEvent = (editedEvent) => {
  //   // Update the event in the current user data
  //   const updatedEvents = currentUserData.recentEvents.map((event) =>
  //     event.id === editedEvent.id ? { ...event, ...editedEvent } : event
  //   );
  //   currentUserData.recentEvents = updatedEvents;
  //   setShowEditModal(false);
  //   setSelectedEvent(null);
  // };

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

  // Event Details Modal Component
  const EventDetailsModal = ({ event, onClose, onEdit, onDelete }) => {
    const modalRef = useRef(null);

    // Handle click outside
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener when component mounts
    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          ref={modalRef}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-white text-gray-800 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Event Details</h2>
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event?.title}
                  </h3>
                  <p className="text-gray-600">{event?.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                        event?.type
                      )}`}
                    >
                      {event?.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        event?.priority
                      )}`}
                    >
                      {event?.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      event?.status
                    )}`}
                  >
                    {event?.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900">
                    {event?.location || "Not specified"}
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
                      <strong>Start:</strong> {formatDate(event?.startDate)}{" "}
                      {!event?.allDay &&
                        event?.startTime &&
                        `at ${event.startTime}`}
                    </p>
                    <p className="text-sm">
                      <strong>Start:</strong> {formatDate(event?.endDate)}{" "}
                      {!event?.allDay &&
                        event?.endTime &&
                        `at ${event.endTime}`}
                    </p>
                    <p className="text-sm">
                      <strong>All Day:</strong> {event?.allDay ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm mb-2">
                      <strong>Target Type:</strong> {event?.targetType}
                    </p>
                    <div>
                      {event?.targetType === "all" && (
                        <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs">
                          All Users
                        </span>
                      )}
                      {event?.targetType === "role" && (
                        <div className="flex flex-wrap gap-1">
                          {event?.targetValuesPopulated.map((role, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs"
                            >
                              {typeof role === "string" ? role : role.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {event?.targetType === "department" && (
                        <div className="space-y-2">
                          {event?.targetValuesPopulated?.map((dept, index) => (
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
                          ))}
                        </div>
                      )}
                      {event?.targetType === "user" && (
                        <div className="space-y-2">
                          {event?.targetValuesPopulated?.map((user, index) => (
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
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {event?.attendees?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendees
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {event?.attendees?.map((attendee, index) => (
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
                      {event?.createdBy?.firstName} {event?.createdBy?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {event?.createdBy?.email}
                    </p>
                    <p className="text-xs text-gray-600">
                      Role: {event?.createdByRole}
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
    );
  };

  // Edit Event Modal Component
  const EditEventModal = ({ event, onClose, onSave }) => {
    const currentUserRole = loginUser?.user?.role;
    const currentUserDepartment = loginUser?.user?.department?._id;
    const currentUserId = loginUser?.user?._id;
    const targetOptions = [];
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
    });

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

    const eventTypes = [
      {
        value: "leave",
        label: "Leave",
        color: "#ef4444",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      },
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
        bgColor: "bg-green-100",
        textColor: "text-green-800",
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
    ];

    const roles = [
      //   { value: "all", label: "All Roles" },
      { value: "Admin", label: "Admin" },
      { value: "DepartmentHead", label: "Department Head" },
      { value: "Manager", label: "Manager" },
      { value: "Employee", label: "Employee" },
    ];

    const [editingEvent, setEditingEvent] = useState({
      ...event,
      budget: event.budget || "",
      attendeeCount: event.attendees || 0,
      recurrence: event.recurrence || "none",
      notes: event.notes || "",
      organizer: event.organizer || "",
      organizerEmail: event.organizerEmail || "",
      organizerPhone: event.organizerPhone || "",
    });

    const getTargetOptions = () => {
      // const roleConfig = roleConfigs[currentUserRole];

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

    // const handleSave = () => {
    //   onSave(editingEvent);
    //   onClose();
    // };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Plus className="h-5 w-5 text-blue-600" />
              Update Event
            </div>
            {/* <p className="text-gray-600 mt-1">
                  {selectedDates.length === 1
                    ? `Creating event for ${format(
                        selectedDates[0],
                        "MMMM dd, yyyy"
                      )}`
                    : `Creating event spanning ${selectedDates.length} days`}
                </p> */}
          </div>

          <div className="p-6 space-y-6">
            {/* Selected Dates Display */}
            {/* <div className="p-4 bg-primary/20  rounded-lg">
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
                </div> */}

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
                      {eventForm.isPrivate ? "Private (Only you)" : "Public"}
                    </p>

                    {/* <p>
                          <strong>Duration:</strong> {selectedDates.length} day
                          {selectedDates.length > 1 ? "s" : ""}
                        </p>
                        <p>
                          <strong>Type:</strong>{" "}
                          {eventTypes.find(
                            (type) => type.value === eventForm.type
                          )?.label || "Not selected"}
                        </p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                // onClick={() => setIsUpdateModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                // onClick={handleCreateEvent}
                disabled={!eventForm.title || !eventForm.type}
                // className={`px-6 py-2 rounded text-white transition-colors ${
                //   !eventForm.title || !eventForm.type
                //     ? "bg-gray-400 cursor-not-allowed"
                //     : `bg-gradient-to-r ${currentRoleConfig.gradientFrom} ${currentRoleConfig.gradientTo} hover:opacity-90`
                // }`}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Prevent background scroll when any modal is open
    if (showEventDetails || showEditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showEventDetails, showEditModal]);

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 min-h-screen">
      <div className="">
        {/* Main Dashboard Interface */}
        <div className=" border-0  backdrop-blur-md rounded-lg">
          <div className="p-0">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Recent Events Column */}
              <div
                className={`space-y-4 ${
                  showPermissions ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    All Events
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {eventsData?.events?.length} Events
                  </span>
                </div>

                {/* Event Filter Component */}
                <EventFilter
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={handleDateRangeChange}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  showFilters={showFilters}
                  setShowFilters={handleToggleFilters}
                  clearFilters={clearFilters}
                />

                {isEventsDataLoading ? (
                  <div className="flex justify-center items-center min-h-[80vh]">
                    <Loader />
                  </div>
                ) : eventsData?.events?.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                      <Calendar size={28} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No events found
                    </h3>
                    <p className="text-gray-500 max-w-lg mx-auto mb-6">
                      {startDate || endDate || selectedType || selectedStatus
                        ? "No events match your current filters. Try adjusting your search criteria."
                        : "There are no events to display. Create your first event to get started."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventsData?.events?.map((event) => (
                      <div
                        key={event?._id}
                        className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50 cursor-pointer bg-white rounded-lg"
                        style={{
                          borderLeftColor: getTypeColor(event?.type)
                            .replace("bg-", "#")
                            .replace("500", ""),
                        }}
                        // onClick={() => handleViewEvent(event)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  {event?.title}
                                </h4>
                                {event?.isPrivate && (
                                  <div className="flex items-center gap-1">
                                    <EyeOff className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs text-gray-500">
                                      Private
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <strong>From:</strong>{" "}
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(event?.startDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event?.allDay
                                    ? "Full Day"
                                    : event?.startTime}
                                </span>
                                {event?.location !== "" && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event?.location}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <strong>To:</strong>{" "}
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(event?.endDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event?.allDay ? "Full Day" : event?.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  {getTargetIcon(event?.targetType)}
                                  {event?.targetType}: {event?.targetValue}
                                </span>
                                {event?.attendees?.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event?.attendees?.map((person, index) => (
                                      <span key={person}>
                                        {person}
                                        {index < event?.attendees?.length - 1 &&
                                          ","}
                                      </span>
                                    ))}{" "}
                                    attendees
                                  </span>
                                )}

                                <span className="flex items-center capitalize gap-1">
                                  {getPriorityIcon(event?.priority)}
                                  {event?.priority}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-2 py-1 rounded text-xs capitalize  border ${getStatusColor(
                                  event?.status
                                )}`}
                              >
                                {event?.status}
                              </span>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs capitalize ">
                                {event?.type}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              Created by: {event?.createdBy?.firstName}{" "}
                              {event?.createdBy?.lastName}
                            </span>
                            <div className="flex gap-1">
                              <button
                                className="h-6 px-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewEvent(event);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </button>
                              {/* {(selectedUserType === "Admin" ||
                              event?.createdBy?._id ===
                                loginUser?.user?._id) && (
                              <button
                                className="h-6 px-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                            )} */}

                              {(event?.createdBy?._id ===
                                loginUser?.user?._id ||
                                loginUser?.user?.role === "Admin") && (
                                <button
                                  className="h-6 px-2 text-xs border border-gray-300 rounded bg-red-400 text-white hover:bg-red-500 transition-colors flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    handleDeleteClick(event?._id);
                                    // console.log(event);
                                    setShowEventDetails(false);
                                    setSelectedEvent(null);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {eventsData?.total > 0 && (
              <div className="mt-6 px-4 sm:px-0">
                <Pagination
                  currentCount={eventsData?.events?.length || 0}
                  totalCount={eventsData?.total || 0}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  limit={limit}
                  setLimit={setLimit}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && showEventDetails && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowEventDetails(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEditEvent}
          // onDelete={handleDeleteEvent}
        />
      )}

      {/* Edit Event Modal */}
      {selectedEvent && showEditModal && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          // onSave={handleSaveEditedEvent}
        />
      )}

      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this department? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
