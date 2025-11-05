import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ManagerRoutes = ({children}) => {

    const user = useSelector((state) => state.userSlice.user);
    const location = useLocation();

    if( user && user?.role === 'Manager' ){
        return children
    }

    return <Navigate to="/login" state={{from:location}} replace></Navigate>;
};


export default ManagerRoutes;