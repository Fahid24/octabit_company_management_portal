// src/router/AppRouter.jsx
import { useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Error from "@/component/Error";
import LoginPage from "@/pages/auth/login/LoginPage";
import RegisterPage from "@/pages/auth/Registration/RegistrationPage";
import ForgotPassword from "@/pages/auth/forgotPassword/ForgotPassword";
import ResetPassword from "@/pages/auth/resetPassword/ResetPassword";
import HomePage from "@/pages/home/HomePage";

import { generateRoutesFromNav } from "@/utils/generateRoutesFromNavLinks";
import UserRoutes from "./routeGuards/UserRoutes";
import { navLinks } from "@/constant/navLinks";
import Main from "@/layout/Main";
import UnauthorizedPage from "@/layout/Error/UnauthorizedPage";

// General Pages
import ComingPage from "@/pages/coming-soon/ComingSoonPage";

// Employee
import EmployeeProfilePage from "@/pages/admin/employee/EmployeeProfilePage";
import SingleEmployeePage from "@/pages/admin/workingDetails/SingleEmployeePage";
import EmployeeAddPage from "@/pages/admin/employee/EmployeeAddPage";
import EmployeeEditPage from "@/pages/admin/employee/EmployeeEditPage";

// Project
import UpdateProjectPage from "@/pages/admin/project/UpdateProjectPage";
import ProjectFormPage from "@/pages/admin/project/ProjectFormPage";
import ProjectViewPage from "@/pages/admin/project/ProjectViewPage";

// Tasks and Assignments
import TaskManagementPage from "@/pages/task/TaskManagementPage";
import CreateTaskPage from "@/pages/task/CreateTaskPage";

// Applications / Forms
import MaintenanceFormPage from "@/pages/application/MaintenanceFormPage";
import EquipmentFormPage from "@/pages/application/EquipmentFormPage";

// Learning Modules
import EditCourse from "@/pages/lms/courseEditPage";
import CourseViewPage from "@/pages/lms/courseViewPage";

// Incident
import IncidentCreateForm from "@/pages/incident/component/IncidentCreateForm";

// Job Safety
import JobSafetyAnalysis from "@/pages/jobSafetyAnalysis/components/JobSafetyAnalysisForm";
import EmployeeKpi from "@/pages/employeeKpi/EmployeeKpi";
import DepartmentKpi from "@/pages/departmentKpi/DepartmentKpi";
import ManagerKpi from "@/pages/managerKpi/ManagerKpi";
import DeptHeadKpi from "@/pages/deptHeadKpi/DeptHeadKpi";
import MyAttendanceListPage from "@/pages/attendance/myAttendanceListPage";
import LearningRequestPage from "@/pages/learning/LearningRequest";
import UpdateLearningRequestForm from "@/pages/learning/component/LearningRequestForm";
import VTRpage from "@/pages/VTR/VTRpage";

import VTRform from "@/pages/VTR/components/VTRform";
import VTRUpdateForm from "@/pages/VTR/VTRUpdateForm";
import MoralSurveyForm from "@/pages/moral/component/MoralSurveyForm";
import CompleteProfilePage from "@/pages/completeProfile/CompleteProfilePage";
import UpdateProfilePage from "@/pages/auth/updateProfile/UpdateProfilePage";
import AttendanceListPage from "@/pages/attendance/attendanceListPage";
import SystemConfigPage from "@/pages/systemConfig/SystemConfigPage";
import ChangePassword from "@/pages/auth/changePassword/ChangePassword";
import FoodManagement from "@/pages/food/FoodManagement";
import CreateFoodForm from "@/pages/food/components/CreateFoodForm";
import UpdateFoodRecord from "@/pages/food/components/UpdateFoodForm";

// Password Management
import PasswordManager from "@/pages/passwordManager/PasswordManager";

// Email Management
import ComposePage from "@/pages/emailManage/ComposePage";
import TrashEmailsPage from "@/pages/emailManage/TrashEmailsPage";
import Template from "@/pages/emailManage/Template";
import DropboxPage from "@/pages/dropbox/DropboxPage";
import ClientForm from "@/pages/revenue/ClientForm";
import ClientIncomeForm from "@/pages/revenue/ClientIncomeForm";
import ClientManagement from "@/pages/clientManagement/ClientManagement";
import UpdateClient from "@/pages/clientManagement/UpdateClient";
import IncomeManagement from "@/pages/incomeManagement/IncomeManagement";
import UpdateIncomeForm from "@/pages/incomeManagement/UpdateIncomeForm";
import VendorManagementPage from "@/pages/vendor/VendorManagementPage";

const AppRouter = () => {
  const user = useSelector((state) => state.userSlice.user);

  const router = createBrowserRouter([
    { path: "/login", element: <LoginPage />, errorElement: <Error /> },
    // { path: "/register", element: <RegisterPage />, errorElement: <Error /> },
    {
      path: "/moral-survey-form",
      element: <MoralSurveyForm />,
      errorElement: <Error />,
    },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/unauthorized", element: <UnauthorizedPage /> },
    { path: "/complete-profile", element: <CompleteProfilePage /> },
    { path: "/update-profile", element: <UpdateProfilePage /> },

    {
      path: "/",
      element: <Main />,
      errorElement: <Error />,
      children: [
        {
          path: "/",
          element: (
            <UserRoutes>
              <HomePage />
            </UserRoutes>
          ),
        },

        // ✅ Static routes
        ...generateRoutesFromNav(navLinks(user)),

        // ✅ Dynamic routes
        {
          path: "/profile/:employeeId",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <EmployeeProfilePage />
            </UserRoutes>
          ),
        },
        {
          path: "/working-details/:employeeId",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <SingleEmployeePage />
            </UserRoutes>
          ),
        },
        {
          path: "/update-project/:projectId",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <UpdateProjectPage />
            </UserRoutes>
          ),
        },
        // { path: "/project-list/edit/:id", element: <UserRoutes><ProjectFormPage /></UserRoutes> },
        {
          path: "/single-project/:id",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <ProjectViewPage />
            </UserRoutes>
          ),
        },
        // { path: "/create-task/:projectId", element: <UserRoutes><CreateTaskPage /></UserRoutes> },
        {
          path: "/lms/course-edit/:id",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <EditCourse />
            </UserRoutes>
          ),
        },
        {
          path: "/lms/course-view/:id",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <CourseViewPage />
            </UserRoutes>
          ),
        },
        {
          path: "/attendance/employee/:id",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <MyAttendanceListPage />
            </UserRoutes>
          ),
        },
        {
          path: "/kpi-employee/:employeeId",
          element: (
            <UserRoutes allowedRoles={["Admin", "Employee"]}>
              <EmployeeKpi />
            </UserRoutes>
          ),
        },
        {
          path: "/kpi-department/:departmentId",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <DepartmentKpi />
            </UserRoutes>
          ),
        },
        {
          path: "/kpi-manager/:managerId",
          element: (
            <UserRoutes allowedRoles={["Admin", "Manager"]}>
              <ManagerKpi />
            </UserRoutes>
          ),
        },
        {
          path: "/kpi-deptHead/:deptHeadId",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <DeptHeadKpi />
            </UserRoutes>
          ),
        },
        {
          path: "equipment/edit/:id",
          element: (
            <UserRoutes
              allowedRoles={["Manager", "Admin", "DepartmentHead", "Employee"]}
            >
              <EquipmentFormPage />
            </UserRoutes>
          ),
        },
        {
          path: "maintenance/edit/:id",
          element: (
            <UserRoutes
              allowedRoles={["Manager", "Admin", "DepartmentHead", "Employee"]}
            >
              <MaintenanceFormPage />
            </UserRoutes>
          ),
        },

        {
          path: "vtr-update/:id",
          element: (
            <UserRoutes
              allowedRoles={["Manager", "Admin", "DepartmentHead", "Employee"]}
            >
              <VTRUpdateForm />
            </UserRoutes>
          ),
        },

        {
          path: "food-update/:id",
          element: (
            <UserRoutes
              allowedRoles={["Admin"]}
            >
              <UpdateFoodRecord />
            </UserRoutes>
          ),
        },

        //static but on in sidebar
        {
          path: "/employee-add",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <EmployeeAddPage />
            </UserRoutes>
          ),
        },
        {
          path: "/employee-edit",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead", "Manager", "Employee"]}
            >
              <EmployeeEditPage />
            </UserRoutes>
          ),
        },
        {
          path: "/change-password",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead", "Manager", "Employee"]}
            >
              <ChangePassword />
            </UserRoutes>
          ),
        },
        {
          path: "/coming-soon",
          element: (
            <UserRoutes>
              <ComingPage />
            </UserRoutes>
          ),
        },
        {
          path: "/password-manager",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <PasswordManager />
            </UserRoutes>
          ),
        },
        {
          path: "/project-list/create",
          element: (
            <UserRoutes allowedRoles={["Admin", "DepartmentHead"]}>
              <ProjectFormPage />
            </UserRoutes>
          ),
        },
        // { path: "/task-management", element: <UserRoutes><TaskManagementPage /></UserRoutes> },
        {
          path: "/maintenance/new",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <MaintenanceFormPage />
            </UserRoutes>
          ),
        },
        {
          path: "/attendance/list",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <AttendanceListPage />
            </UserRoutes>
          ),
        },
        {
          path: "/system-config",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <SystemConfigPage />
            </UserRoutes>
          ),
        },
        {
          path: "/equipment/new",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <EquipmentFormPage />
            </UserRoutes>
          ),
        },
        {
          path: "/learning-requests/new",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <UpdateLearningRequestForm />
            </UserRoutes>
          ),
        },
        {
          path: "/incident-form",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <IncidentCreateForm />
            </UserRoutes>
          ),
        },
        // { path: "/job-safety-form", element: <UserRoutes allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}><JobSafetyAnalysis /></UserRoutes> },
        {
          path: "/vtr-form",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <VTRform />
            </UserRoutes>
          ),
        },
        {
          path: "/vtr",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <VTRpage />
            </UserRoutes>
          ),
        },
        {
          path: "/food-management",
          element: (
            <UserRoutes
              allowedRoles={["Admin"]}
            >
              <FoodManagement />
            </UserRoutes>
          ),
        },
        {
          path: "/food-create",
          element: (
            <UserRoutes
              allowedRoles={["Admin"]}
            >
              <CreateFoodForm />
            </UserRoutes>
          ),
        },
        {
          path: "/dropbox",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead", "Employee"]}
            >
              <DropboxPage />
            </UserRoutes>
          ),
        },
        {
          path: "/client-form",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead"]}
            >
              <ClientForm />
            </UserRoutes>
          ),
        },
        {
          path: "/client-income-form",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead"]}
            >
              <ClientIncomeForm />
            </UserRoutes>
          ),
        },
        {
          path: "/client-management",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead"]}
            >
              <ClientManagement />
            </UserRoutes>
          ),
        },
        {
          path: "/income-management",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead"]}
            >
              <IncomeManagement />
            </UserRoutes>
          ),
        },
        {
          path: "/client-update/:clientId",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "DepartmentHead"]}
            >
              <UpdateClient />
            </UserRoutes>
          ),
        },
        {
          path: "/update-income-form/:incomeId",
          element: (
            <UserRoutes
              allowedRoles={["Admin","DepartmentHead"]}
            >
              <UpdateIncomeForm />
            </UserRoutes>
          ),
        },
        {
          path: "/vendors",
          element: (
            <UserRoutes
              allowedRoles={["Admin", "Manager", "DepartmentHead"]}
            >
              <VendorManagementPage />
            </UserRoutes>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
