// Central navLinks config for Sidebar, Bottombar, and ResponsiveNavigation
import {
  Home,
  User,
  Group,
  Handshake,
  BotOff,
  Projector,
  Ambulance,
  DockIcon,
  Stethoscope,
  Wrench,
  Shapes,
  TableProperties,
  ShieldPlus,
  FileText,
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  ListTodo,
  LayoutList,
  NotebookText,
  Grid2x2Check,
  ChartSpline,
  ChartColumnDecreasing,
  BookOpenText,
  Briefcase,
  ClipboardList,
  AlarmClockPlus,
  List,
  Mails,
  Settings,
  Fingerprint,
  Hand,
  KeyRound,
  Upload,
  Box,
  FileClock,
  Landmark,
  UserRoundPlus,
  HandshakeIcon,
  UserCog,
  BadgeDollarSign,
  Building2,
  UserCheck,
  Utensils,
  SendHorizontal,
  Edit,
  Trash2,
  Store,
  ChartBarStacked,
  FileType2,
  Warehouse,
  PackageSearch,
  UserPlus,
  ShoppingBasket,
} from "lucide-react";

// General Pages
import HomePage from "@/pages/home/HomePage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ComingPage from "@/pages/coming-soon/ComingSoonPage";

// Department
import DepartmentPage from "@/pages/department/DepartmentPage";

// Employee
import EmployeePage from "@/pages/admin/employee/EmployeePage";
import EmployeeWorkStatsPage from "@/pages/admin/employee/EmployeeWorkStatsPage";

// Attendance
import { AttendanceSystem } from "@/pages/attendance/attendancePage";
import AttendanceListPage from "@/pages/attendance/attendanceListPage";
import DeptAttendanceListPage from "@/pages/attendance/deptAttendanceListPage";
import MyAttendanceListPage from "@/pages/attendance/myAttendanceListPage";

// Leaves
import ManageLeaves from "@/pages/manageLeaves/ManageLeavesAdminPage";
import UserLeaveRequestsPage from "@/pages/manageLeaves/UserLeaveRequestsPage";
import ManageLeaveForDepartmenthead from "@/pages/manageLeaves/ManageLeaveDptPage";

// Project
import ProjectListPage from "@/pages/admin/project/ProjectListpage";
import CreateProjectPage from "@/pages/admin/project/CreateProjectPage";

// Tasks and Assignments
import AssignmentPage from "@/pages/assignments/AssignmentPage";
import DailyTaskPage from "@/pages/dailyTask/DailyTaskPage";

// Applications / Forms
import MaintenancePage from "@/pages/application/MaintenancePage";
import EquipmentPage from "@/pages/application/EquipmentPage";
import AllApplication from "@/pages/application/allApplication";

// Learning Modules
import CourseList from "@/pages/lms/courseList";
import CourseCreatePage from "@/pages/lms/courseCreatePage";
import MyCoursePage from "@/pages/lms/myCoursePage";

// Incident
import IncidentPage from "@/pages/incident/IncidentPage";

// Job Safety
import JobSafetyPage from "@/pages/jobSafetyAnalysis/JobSafetyPage";

// Handbook / Docs
import EmployeeHandbook from "@/pages/employeeHandBook/EmployeeHandBook";
import ToolsKit from "@/pages/toolsKit/ToolsKit";

// Surveys
import MoralPage from "@/pages/moral/MoralPage";
import MoralSurveyForm from "@/pages/moral/component/MoralSurveyForm";

// KPI
import KpiStats from "@/pages/kpiStats/KpiStats";
import KpiStatsOverviewPage from "@/pages/kpiStatsOverview/kpiStatsOverviewPage";
import DeptHeadKpi from "@/pages/deptHeadKpi/DeptHeadKpi";
import ManagerKpi from "@/pages/managerKpi/ManagerKpi";
import EventCalendarPage from "@/pages/event/EventCalendarPage";
import EventManagementPage from "@/pages/event/EventManagementPage";
import LearningRequestPage from "@/pages/learning/LearningRequest";
import EmployeeKpi from "@/pages/employeeKpi/EmployeeKpi";
// import JobSafetyAnalysis from "@/pages/jobSafetyAnalysis/components/JobSafetyAnalysisForm";
import DashboardPage2 from "@/pages/dashboard/DashboardPage2";
// import VTRpage from "@/pages/VTR/VTRpage";
// import VTRform from "@/pages/VTR/components/VTRform";
// import EmailPage from "@/pages/email/emailPage";
import SystemConfigPage from "@/pages/systemConfig/SystemConfigPage";
import AttendanceSummaryPage from "@/pages/attendance/AttendanceSummaryPage";
import DropboxPage from "@/pages/dropbox/DropboxPage";
import LeaveAdminStatsPage from "@/pages/manageLeaves/LeaveAdminStatsPage";
import CompletedProgressPage from "@/pages/lms/CompleteCourses";
import ShortLeavePage from "@/pages/shortLeave/ShortLeavePage";
import EmailPage from "@/pages/emailManage/EmailPage";

import ClientIncomeForm from "@/pages/revenue/ClientIncomeForm";
import ClientManagement from "@/pages/clientManagement/ClientManagement";
import IncomeManagement from "@/pages/incomeManagement/IncomeManagement";
import FoodManagement from "@/pages/food/FoodManagement";
import ComposePage from "@/pages/emailManage/ComposePage";
import Template from "@/pages/emailManage/Template";
import TrashEmailsPage from "@/pages/emailManage/TrashEmailsPage";
import VendorManagementPage from "@/pages/vendor/VendorManagementPage";
import CategoryManagementPage from "@/pages/category/CategoryManagementPage";
import TypeManagementPage from "@/pages/type/TypeManagementPage";
import RequisitionManagementPage from "@/pages/requisition/RequisitionManagementPage";
import ProductManagementPage from "@/pages/product/ProductManagementPage";
import InventoryDashboardPage from "@/pages/inventoryDashboard/InventoryDashboardPage";
import ConsumableItems from "@/pages/consumableProducts/ConsumableItemsPage";
import ExpenseManagementPage from "@/pages/expense/ExpenseManagementPage";
import ExpenseDashboardPage from "@/pages/expense/dashboard/ExpenseDashboardPage";

export const navLinks = (loginUser) => [
  {
    label: "Home",
    href: "/",
    icon: Home,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    component: HomePage,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "DepartmentHead"],
    description: "View overview and key metrics of your organization",
    component: DashboardPage2,
  },
  {
    label: "Attendance",
    icon: Hand,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    description: "Track and manage employee attendance and working hours.",
    submenu: [
      {
        label: "Attendance Summary",
        href: "/attendance-summary",
        icon: ClipboardList,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "View attendance summary and statistics.",
        component: AttendanceSummaryPage,
      },
      {
        label: "Check In/Out",
        href: "/attendance",
        icon: Fingerprint,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "Mark your attendance for the day.",
        component: AttendanceSystem,
      },
      {
        label: "Attendance Records",
        href: "/attendance/list",
        icon: TableProperties,
        roles: ["Admin"],
        description: "View attendance records and time sheets.",
        component: AttendanceListPage,
      },
      {
        label: "Department Attendance",
        href: "/attendance/dept",
        icon: Building2, // changed from TableProperties
        roles: ["Admin", "DepartmentHead"],
        description: "View department attendance records and time sheets.",
        component: DeptAttendanceListPage,
      },
      {
        label: "My Attendance",
        href: loginUser?.user?._id
          ? `/attendance/employee/${loginUser.user._id}`
          : "/attendance/employee/me",
        icon: UserCheck, // changed from TableProperties
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "View your own attendance records.",
        component: MyAttendanceListPage,
      },
    ],
  },
  {
    label: "KPI Stats",
    icon: ChartColumnDecreasing,
    roles: ["Manager", "Employee", "DepartmentHead", "Admin"],
    description: "View key performance indicators for your organization",
    submenu: [
      {
        label: "KPI Dashboard",
        href: "/kpi-stats",
        icon: ChartColumnDecreasing,
        roles: ["Admin"],
        description: "View KPI summary dashboard",
        component: KpiStats,
      },
      {
        label: "KPI Stats Overview",
        href: "/kpi-stats-overview",
        icon: ChartSpline,
        roles: ["Admin"],
        description: "View detailed KPI statistics overview",
        component: KpiStatsOverviewPage,
      },
      {
        label: "My KPI",
        href: "/kpi-manager",
        icon: ChartSpline,
        roles: ["Manager"],
        description: "View KPI stats for managers",
        component: ManagerKpi,
      },
      {
        label: "My KPI",
        href: "/kpi-deptHead",
        icon: ChartSpline,
        roles: ["DepartmentHead"],
        description: "View KPI stats for managers",
        component: DeptHeadKpi,
      },
      {
        label: "My KPI",
        href: "/kpi-employee",
        icon: ChartSpline,
        roles: ["Employee"],
        description: "View KPI stats for managers",
        component: EmployeeKpi,
      },
    ],
  },
  {
    label: "Client",
    href: "/client-management",
    icon: UserCog,
    roles: ["DepartmentHead", "Admin"],
    description: "Manage client profiles, information and records.",
    component: ClientManagement,
  },

  {
    label: "Finance",
    icon: HandshakeIcon,
    roles: ["DepartmentHead", "Admin"],
    description: "Manage financial transactions and budgets.",
    submenu: [
      {
        label: "Finance Dashboard",
        href: "/finance-dashboard",
        icon: LayoutDashboard,
        roles: ["Admin"],
        description: "View financial dashboard.",
        component: ExpenseDashboardPage,
      },
      {
        label: "Income",
        href: "/income-management",
        icon: BadgeDollarSign,
        roles: ["DepartmentHead", "Admin"],
        description: "Manage Income",
        component: IncomeManagement,
      },
      {
        label: "Expenses",
        href: "/expense-management",
        icon: BadgeDollarSign,
        roles: ["Admin"],
        description: "Manage Expenses",
        component: ExpenseManagementPage,
      },
    ],
  },

  {
    label: "Departments",
    href: "/departments",
    icon: Group,
    roles: ["Admin"],
    description: "Manage organizational departments and team structures.",
    component: DepartmentPage,
  },

  {
    label: "Inventory",
    icon: Warehouse,
    roles: ["Admin"],
    description: "Manage inventory items, stock levels, and supplies.",
    submenu: [
      {
        label: "Dashboard",
        href: "/inventory-dashboard",
        icon: LayoutDashboard,
        roles: ["Admin"],
        description: "Manage product inventory and assignments.",
        component: InventoryDashboardPage,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: ChartBarStacked,
        roles: ["Admin"],
        description: "Manage categories.",
        component: CategoryManagementPage,
      },
      {
        label: "Items",
        href: "/items",
        icon: Box,
        roles: ["Admin"],
        description: "Manage items.",
        component: TypeManagementPage,
      },
      {
        label: "Vendors",
        href: "/vendors",
        icon: Store,
        roles: ["Admin", "Manager", "DepartmentHead"],
        description: "Manage vendor profiles, information and records.",
        component: VendorManagementPage,
      },
      {
        label: "Requisitions",
        href: "/requisitions",
        icon: FileType2,
        roles: ["Admin"],
        description: "Manage requisition files and documents.",
        component: RequisitionManagementPage,
      },
      {
        label: "Products",
        href: "/products",
        icon: PackageSearch,
        roles: ["Admin"],
        description: "Manage products.",
        component: ProductManagementPage,
      },
      {
        label: "Consumable Items",
        href: "/consumable-items",
        icon: ShoppingBasket,
        roles: ["Admin"],
        description: "Manage consumable items.",
        component: ConsumableItems,
      },
    ],
  },

  {
    label: "Employee",
    icon: User,
    roles: ["Admin", "DepartmentHead"],
    description: "Manage employee profiles, information and records",
    submenu: [
      {
        label: "Employee Management",
        href: "/employee",
        icon: User,
        roles: ["Admin", "DepartmentHead"],
        description: "Manage employee profiles, information and records",
        component: EmployeePage,
      },
      {
        label: "Work Hour Stats",
        href: "/employee-work-stats",
        icon: TableProperties,
        roles: ["Admin", "DepartmentHead"],
        description: "View all employees' work hour statistics.",
        component: EmployeeWorkStatsPage,
      },
    ],
  },
  {
    label: "Assignments",
    icon: BriefcaseBusiness,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    description: "Manage assignments profiles, information and records",
    submenu: [
      {
        label: "Task Board",
        href: "/daily-task",
        icon: ListTodo,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "Manage employee profiles, information and records",
        component: DailyTaskPage,
      },
      {
        label: "Project Board",
        href: "/assignments",
        icon: NotebookText,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "Manage and track assignments and tasks.",
        component: AssignmentPage,
      },
    ],
  },
  {
    label: "Time Off Requests",
    icon: BotOff,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    submenu: [
      {
        label: "Leave Statistics",
        href: "/admin-leaves-stats",
        icon: ChartSpline,
        roles: ["Admin", "DepartmentHead"],
        description: "View leave statistics.",
        component: LeaveAdminStatsPage,
      },
      {
        label: "Manage All Requests",
        href: "/leaves-stats",
        icon: BotOff,
        roles: ["Admin"],
        description: "View leave statistics and approvals.",
        component: ManageLeaves,
      },
      {
        label: "Manage Requests",
        href: "/manage-leaves-dept-head",
        icon: BotOff,
        roles: ["DepartmentHead"],
        description: "Manage leave requests for your department.",
        component: ManageLeaveForDepartmenthead,
      },
      {
        label: "My Time Off Requests",
        href: "/my-leave-requests",
        icon: FileText,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "View all your leave requests.",
        component: UserLeaveRequestsPage,
      },
      {
        label: "Short Leave Requests",
        href: "/short-leave-requests",
        icon: FileClock,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "View and manage short leave requests.",
        component: ShortLeavePage,
      },
    ],
  },
  {
    label: "Project",
    icon: Projector,
    roles: ["Admin", "DepartmentHead"],
    submenu: [
      {
        label: "All Projects",
        href: "/project-list",
        icon: Projector,
        roles: ["Admin", "DepartmentHead"],
        description: "View and manage all ongoing and completed projects.",
        component: ProjectListPage,
      },

      {
        label: "Create Project",
        href: "/create-project",
        icon: Projector,
        roles: ["Admin", "DepartmentHead"],
        description: "Start a new project with team assignments and timelines.",
        component: CreateProjectPage,
      },
    ],
  },

  {
    label: "Forms",
    icon: ListTodo,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    submenu: [
      {
        label: "All Forms",
        href: "/applications",
        icon: LayoutList,
        roles: ["Admin"],
        description: "Browse and submit various organizational forms.",
        component: AllApplication,
      },
      {
        label: "Maintenance",
        href: "/maintenance",
        icon: Stethoscope,
        roles: ["Manager", "DepartmentHead", "Employee"],
        description: "Report and track facility maintenance requests",
        component: MaintenancePage,
      },
      {
        label: "Equipment",
        href: "/equipment",
        icon: Wrench,
        roles: ["Manager", "DepartmentHead", "Employee"],
        description: "Manage equipment inventory and maintenance schedules",
        component: EquipmentPage,
      },
      {
        label: "Education",
        href: "/learning-requests",
        icon: BookOpenText,
        roles: ["Manager", "DepartmentHead", "Employee"],
        description: "Manage equipment inventory and maintenance schedules",
        component: LearningRequestPage, // Placeholder for educational requests component
      },
    ],
  },
  {
    label: "Event",
    icon: CalendarDays, // Updated to a more relevant event icon
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    submenu: [
      {
        label: "Event Calendar",
        href: "/event-calendar",
        icon: CalendarCheck, // Suggesting scheduled event view
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description:
          "Browse scheduled events by date and view personal or team activities.",
        component: EventCalendarPage, // Placeholder for event calendar component
      },
      {
        label:
          loginUser?.user?.role === "Admin" ? "Manage Events" : "All Events",
        href: "/events",
        icon: FileText, // More suitable for event listing/editing
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description:
          "Create, edit, or cancel events with role-based access control.",
        component: EventManagementPage, // Placeholder for event management component
      },
    ],
  },
  {
    label: "Learning Module",
    icon: Shapes,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    submenu: [
      {
        label: "Module List",
        href: "/lms/course-list",
        icon: Shapes,
        roles: ["Admin"],
        description: "Browse available training modules and courses",
        component: CourseList,
      },
      {
        label: "Create Module",
        href: "/lms/course-create",
        icon: Shapes,
        roles: ["Admin", "DepartmentHead"],
        description: "Create new training modules and learning content",
        component: CourseCreatePage,
      },
      {
        label: "My Module",
        href: "/lms/my-courses",
        icon: Shapes,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "View your enrolled courses and learning progress",
        component: MyCoursePage,
      },
      {
        label: "Complete Courses",
        href: "/lms/completed",
        icon: Shapes,
        roles: ["Admin", "Manager", "DepartmentHead"],
        description: "View your enrolled courses and learning progress",
        component: CompletedProgressPage,
      },
    ],
  },
  {
    label: "Incidents",
    href: "/incidents",
    icon: Ambulance,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    description: "Report and track workplace incidents and safety issues",
    component: IncidentPage,
  },
  {
    label: "Manage Food",
    href: "/food-management",
    icon: Utensils,
    roles: ["Admin"],
    description: "Manage food items, employees, and food statistics",
    component: FoodManagement,
  },
  {
    label: "Emails",
    icon: Mails,
    roles: ["Admin"],
    description: "Manage email communications and templates",
    submenu: [
      {
        label: "Sent Emails",
        href: "/emails",
        icon: SendHorizontal,
        roles: ["Admin"],
        description: "View all emails sent from the portal",
        component: EmailPage,
      },
      {
        label: "Compose Email",
        href: "/emails/compose",
        icon: Edit,
        roles: ["Admin"],
        description: "Create and send new emails",
        component: ComposePage,
      },
      {
        label: "Templates",
        href: "/emails/templates",
        icon: FileText,
        roles: ["Admin"],
        description: "Manage email templates",
        component: Template,
      },
      {
        label: "Trash",
        href: "/emails/trash",
        icon: Trash2,
        roles: ["Admin"],
        description: "View deleted emails",
        component: TrashEmailsPage,
      },
    ],
  },
  {
    label: "System Configuration",
    href: "/system-config",
    icon: Settings,
    roles: ["Admin"],
    description: "View the system configuration and settings",
    component: SystemConfigPage,
  },
  // {
  //   label: "Job Safety",
  //   href: "/job-safety",
  //   icon: ShieldPlus,
  //   roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  //   description: "Access safety protocols and workplace safety guidelines",
  //   component: JobSafetyPage,
  // },

  // {
  //   label: "Verifiable Time Record",
  //   icon: AlarmClockPlus,
  //   roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  //   submenu: [
  //     {
  //       label: "VTR List",
  //       href: "/vtr",
  //       icon: List,
  //       roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  //       description: "Browse available training modules and courses",
  //       component: VTRpage,
  //     },
  //     {
  //       label: "Create VTR",
  //       href: "/vtr-form",
  //       icon: Briefcase,
  //       roles: ["Admin", "DepartmentHead", "Employee", "Manager"],
  //       description: "Create new training modules and learning content",
  //       component: VTRform,
  //     },
  //   ],
  // },
  // {
  //   label: "Job Safety",
  //   icon: ShieldPlus,
  //   roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  //   submenu: [
  //     {
  //       label: "Job Safety List",
  //       href: "/job-safety-list",
  //       icon: ClipboardList,
  //       roles: ["Admin"],
  //       description: "Browse available training modules and courses",
  //       component: JobSafetyPage,
  //     },
  //     {
  //       label: "Create JSA",
  //       href: "/create-job-safety",
  //       icon: Briefcase,
  //       roles: ["Admin", "DepartmentHead", "Employee", "Manager"],
  //       description: "Create new training modules and learning content",
  //       component: JobSafetyAnalysis,
  //     },
  //   ],
  // },
  {
    label: "Survey",
    icon: Grid2x2Check,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    description: "Track and manage employee attendance and working hours.",
    submenu: [
      {
        label: "Survey Stats",
        href: "/survey-report",
        icon: ChartSpline,
        roles: ["Admin"],
        description: "Mark your attendance for the day.",
        component: MoralPage,
      },
      {
        label: "Moral Survey",
        href: "/moral-survey",
        icon: TableProperties,
        roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
        description: "View attendance records and time sheets.",
        component: MoralSurveyForm,
      },
    ],
  },
  {
    label: "Password Manager",
    href: "/password-manager",
    icon: KeyRound, // Lucide icon
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  },

  {
    label: "Dropbox",
    href: "/dropbox",
    icon: Box,
    roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    description: "Upload, manage, and share files securely in the cloud",
    component: DropboxPage,
  },
  // {
  //   label: "Handbook",
  //   href: "/employee-handbook",
  //   icon: DockIcon,
  //   roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  //   description: "View company policies and employee handbook",
  //   component: EmployeeHandbook,
  // },
  // {
  //   label: "Documents",
  //   href: "/tools-kit",
  //   icon: FileText,
  //   roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
  //   description: "Access important documents and company resources",
  //   component: ToolsKit,
  // },
];
