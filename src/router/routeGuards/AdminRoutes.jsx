import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoutes = ({children}) => {

    const user = useSelector((state) => state.userSlice.user);
    const location = useLocation();

    if(user && user?.role === 'Admin'){
        return children
    }

    return <Navigate to="/login" state={{from:location}} replace></Navigate>;
};


export default AdminRoutes;