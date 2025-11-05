import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const EmployeeRoutes = ({children}) => {

    const user = useSelector((state) => state.userSlice.user);
    const location = useLocation();

    if(user && user?.role==='Employee'){
        return children
    }

    return <Navigate to="/login" state={{from:location}} replace></Navigate>;
};


export default EmployeeRoutes;