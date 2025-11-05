import EmployeeAddEdit from "./component/EmployeeAddEdit";

const EmployeeAddPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <EmployeeAddEdit mode="add" />
    </div>
  );
};

export default EmployeeAddPage;