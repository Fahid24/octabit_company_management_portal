import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";


const UserRoutes = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const location = useLocation();

  const currentRole = user?.role || user?.user?.role;
  const isLoggedIn = user?.email || user?.user?.email;
  const isUpdated = user?.isUpdated ?? user?.user?.isUpdated;

  // ✅ Basic auth check
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentRole !== "Admin" && isUpdated === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  // ✅ Role-based protection if `allowedRoles` is passed
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

UserRoutes.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.array, // now optional
};

export default UserRoutes;
