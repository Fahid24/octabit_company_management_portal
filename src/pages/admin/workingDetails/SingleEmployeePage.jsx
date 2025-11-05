import { useParams } from "react-router-dom";
import SingleEmployeeWorkingDetails from "./component/SingleEmployeeWorkingDetails";
import { useGetEmployeeWorkStatsQuery } from "@/redux/features/admin/workingDetails/workingDetailsApiSlice";
import Loader from "@/component/Loader";

export default function EmployeePage() {
  const { employeeId } = useParams();
  const {
    data: employee,
    isLoading,
    error,
  } = useGetEmployeeWorkStatsQuery(employeeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <SingleEmployeeWorkingDetails data={employee} />
    </div>
  );
}
