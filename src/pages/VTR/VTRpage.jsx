import { useMemo, useState } from "react";
import {
  useGetAllVtrQuery,
  useDeleteVtrMutation,
} from "@/redux/features/vtr/vtrApiSlice";
import Table from "@/component/Table";
import Button from "@/component/Button";
import Pagination from "@/component/Pagination";
import { Plus, Eye, Trash2, Edit, CircleAlert, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/component/Toast";
import { useSelector } from "react-redux";

import Tooltip from "@/component/Tooltip";
import ConfirmDialog from "@/component/ConfirmDialog";
import Loader from "@/component/Loader";
import VTRViewModal from "./components/VTRViewModal";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import DownloadVtrAsXlsxFormat from "./components/DownloadVtrAsXlsxFormat";
import { FloatingInput } from "@/component/FloatiingInput";

const VTRpage = () => {
  const isMobile = useIsMobile(); // Check if the device is mobile
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const [selectedVtr, setSelectedVtr] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const user = useSelector((state) => state.userSlice.user.user);

  const { data, error, isLoading, isFetching } = useGetAllVtrQuery({
    page: currentPage,
    limit: limit,
    userId: user?._id,
    search: searchText,
  });

  const [deleteVtr] = useDeleteVtrMutation();

  const columns = [
    "Work Order",
    "Completed By",
    "Date of Project",
    "Crew Members",
    "Actions",
  ];

  const handleDeleteClick = (item) => {
    setItemToDelete(item); // store the item to delete
    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteVtr(itemToDelete).unwrap();
      toast.success("Success", "Verifiable time record deleted successfully!");

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

  const handleView = (vtr) => {
    setSelectedVtr(vtr);
    setIsViewModalOpen(true);
  };

  // console.log("VTR Data:", data);

  const tableData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((vtr) => ({
      "Work Order": vtr?.workOrder || "",
      "Completed By": vtr?.completedBy || "",
      "Date of Project": vtr?.dateOfProject
        ? new Date(vtr.dateOfProject).toLocaleDateString()
        : "",
      "Crew Members": Array.isArray(vtr?.crewMembers)
        ? vtr.crewMembers.length > 3
          ? vtr.crewMembers
              .slice(0, 3)
              .map((member) => member.firstName + " " + member.lastName)
              .join(", ") + ", ..."
          : vtr.crewMembers
              .map((member) => member.firstName + " " + member.lastName)
              .join(", ")
        : "",
      Actions: (
        <div className="flex items-center gap-2">
          <Tooltip text="View Details" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={() => handleView(vtr)}
            >
              <Eye size={18} />
            </button>
          </Tooltip>
          {/* <Tooltip text="Edit" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={() => navigate(`/vtr-update/${vtr._id}`)}
            >
              <Edit size={18} />
            </button>
          </Tooltip> */}

          {user?.role === "Admin" && (
            <Tooltip text="Delete" position="left">
              <button
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                onClick={() => handleDeleteClick(vtr._id)}
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    }));
  }, [data]);

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
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-5">
        <div className="">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-gray-900">
              Verifiable Time Record (VTR)
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="View and manage all verifiable time records for your team.
Track work orders, project dates, and assigned crew members.
Easily review, create, or delete VTR entries as needed.
Keep accurate records of project completion and team activity."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage Your VTR&apos;s and Details
          </p>
        </div>

        <div>
          <FloatingInput
            className="min-w-64"
            label="Search VTR By Order Number..."
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Tooltip text={"Download VTR Data as Xlsx Format."} position="top">
            <DownloadVtrAsXlsxFormat data={data?.data || []} />
          </Tooltip>

          <Button
            onClick={() => navigate("/vtr-form")}
            variant="primary"
            className="rounded-lg py-2 sm:py-3"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <span> Create VTR</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="">
        <Table
          isLoading={isLoading || isFetching}
          data={tableData}
          columns={columns}
        />
      </div>
      {/* {console.log("Table Data:", tableData)} */}
      {tableData.length !== 0 && (
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
      {selectedVtr && (
        <VTRViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedVtr(null);
          }}
          vtr={selectedVtr}
        />
      )}

      {/* Delete Confirmation dialog */}
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this verifiable time record?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default VTRpage;
