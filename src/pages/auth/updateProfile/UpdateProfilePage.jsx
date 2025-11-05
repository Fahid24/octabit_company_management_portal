import Loader from "@/component/Loader";
import EmployeeAddEdit from "@/pages/admin/employee/component/EmployeeAddEdit";
import { useGetEmployeeByIdQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { useSelector } from "react-redux";

const UpdateProfilePage = () => {
  const loginUser = useSelector((state) => state.userSlice.user);
  const { data: employee, isLoading } = useGetEmployeeByIdQuery(
    loginUser?.user?._id
  );
  // console.log(employee);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmployeeAddEdit mode="edit" employee={employee} />
    </div>
  );
};

export default UpdateProfilePage;
