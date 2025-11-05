import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import EmployeeAddEdit from "./component/EmployeeAddEdit";
import Loader from "@/component/Loader";

const EditEmployeePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const employee = location.state?.employee;

  useEffect(() => {
    if (!employee) {
      navigate("/employee");
    }
  }, [employee, navigate]);

  if (!employee) {
    return <Loader />;
  }
  

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <EmployeeAddEdit mode="edit" employee={employee} />
    </div>
  );
};

export default EditEmployeePage;
