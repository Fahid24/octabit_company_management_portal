import { useMemo, useState } from "react";
import {
  useGetAllJobSafetiesQuery,
  useDeleteJobSafetyMutation,
} from "@/redux/features/jobSafety/jobSafetyApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import Table from "@/component/Table";
import Button from "@/component/Button";
import Pagination from "@/component/Pagination";
import { Plus, Eye, Trash2, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/component/Toast";
import JobSafetyViewModal from "./components/JobSafetyViewModal";
import Tooltip from "@/component/Tooltip";
import ConfirmDialog from "@/component/ConfirmDialog";
import Loader from "@/component/Loader";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook

const JobSafetyPage = () => {
  const isMobile = useIsMobile(); // Check if the device is mobile
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const [selectedJobSafety, setSelectedJobSafety] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data, error, isLoading, isFetching } = useGetAllJobSafetiesQuery({
    page: currentPage,
    limit,
  });
  const { data: employeesData } = useGetAllEmployeesQuery();
  const [deleteJobSafety] = useDeleteJobSafetyMutation();

  const columns = [
    "Customer Name & Work Order",
    "Date of Project",
    "Team",
    "Persons Involved",
    "Actions",
  ];

  const employeeMap = useMemo(() => {
    const map = {};
    employeesData?.data?.forEach((emp) => {
      map[emp._id] = `${emp.firstName} ${emp.lastName}`;
    });
    return map;
  }, [employeesData]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item); // store the item to delete
    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteJobSafety(itemToDelete).unwrap();
      toast.success("Success", "Job Safety Analysis deleted successfully!");

      // cleanup
      setIsDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to delete Job Safety Analysis"
      );
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  // const handleDelete = async (id) => {};

  const handleView = (jobSafety) => {
    setSelectedJobSafety(jobSafety);
    setIsViewModalOpen(true);
  };

  const tableData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((jobSafety) => ({
      "Customer Name & Work Order": jobSafety?.customerNameWorkOrder || "",
      "Date of Project": jobSafety?.dateOfProject
        ? new Date(jobSafety.dateOfProject).toLocaleDateString()
        : "",
      Team: Array.isArray(jobSafety?.team)
        ? jobSafety.team
            .map((teamMember) => employeeMap[teamMember] || teamMember)
            .join(", ")
        : "",
      "Persons Involved": Array.isArray(jobSafety?.personsInvolved)
        ? jobSafety.personsInvolved.length > 3
          ? jobSafety.personsInvolved
              .slice(0, 3)
              .map((person) => employeeMap[person] || person)
              .join(", ") + ", ..."
          : jobSafety.personsInvolved
              .map((person) => employeeMap[person] || person)
              .join(", ")
        : "",
      Actions: (
        <div className="flex items-center gap-2">
          <Tooltip text="View Details" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={() => handleView(jobSafety)}
            >
              <Eye size={18} />
            </button>
          </Tooltip>

          <Tooltip text="Delete" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={() => handleDeleteClick(jobSafety._id)}
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    }));
  }, [data, employeeMap]);

  if (isLoading)
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader />
      </div>
    );

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading job safety records: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold leading-tight text-gray-900">
              Job Safety Analysis
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="View and manage all job safety analysis records.
Track project dates, teams, and persons involved in each job.
Review, create, or delete JSA entries for safety compliance.
Keep detailed records to ensure a safe work environment."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage Your Incidents&apos;s and Details
          </p>
        </div>
        {/* <Button
          type="button"
          className="w-1/7 uppercase rounded-xl my-3 mx-4"
          onClick={() => navigate("/job-safety-form")}
          disabled={isLoading}
          iconPosition="left"
          icon={<Plus />}
          size="sm"
        >
          Create JSA
        </Button> */}
        <Button
          onClick={() => navigate("/create-job-safety")}
          variant="primary"
          className="bg-primary hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span> Create JSA</span>
          </div>
        </Button>
      </div>

      <div className="">
        <Table
          isLoading={isLoading || isFetching}
          data={tableData}
          columns={columns}
        />
      </div>
      {tableData && (
        <div className="mt-6 px-4 sm:px-0">
          <Pagination
            currentCount={tableData.length}
            totalCount={data?.pagination.totalDocs}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      )}

      {/* View Modal */}
      {selectedJobSafety && (
        <JobSafetyViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedJobSafety(null);
          }}
          jobSafety={selectedJobSafety}
        />
      )}

      {/* Delete Confirmation dialog */}
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this job safety analysis?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default JobSafetyPage;
