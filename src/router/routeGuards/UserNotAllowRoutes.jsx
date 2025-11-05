import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const UserNotAllowRoutes = ({children}) => {
    const user = useSelector((state) => state.userSlice.user);

      if (user?.email && user?.role) {
    switch (user.role) {
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "Manager":
        return <Navigate to="/manager/dashboard" replace />;
      case "DepartmentHead":
        return <Navigate to="/department-head/dashboard" replace />;
      case "Employee":
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default UserNotAllowRoutes