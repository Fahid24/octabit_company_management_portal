import { useNavigate, useParams } from "react-router-dom";
import EmployeeProfile from "./component/EmployeeProfile";
import { useGetEmployeeByIdQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import { ChevronLeftIcon } from "lucide-react";
import Loader from "@/component/Loader";

export default function EmployeePage() {
  const { employeeId } = useParams();
  const {
    data: employee,
    isLoading,
    error,
  } = useGetEmployeeByIdQuery(employeeId);

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className=" p-4 md:pl-24 pb-20 md:pb-4">
      <EmployeeProfile employee={employee} />
    </div>
  );
}
