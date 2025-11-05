import { useMemo, useState } from "react";
import {
  useGetAllIncidentsQuery,
  useDeleteIncidentMutation,
} from "@/redux/features/incident/incidentApiSlice";
import { useGetAllEmployeesQuery } from "@/redux/features/employee/employeeApiSlice";
import Table from "@/component/Table";
import Button from "@/component/Button";
import Pagination from "@/component/Pagination";
import { Plus, Eye, FileEdit, Trash2, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/component/Toast";
import IncidentUpdateModal from "./component/IncidentUpdateModal";
import IncidentViewModal from "./component/IncidentViewModal";
import Loader from "@/component/Loader";
import Tooltip from "@/component/Tooltip";
import { useSelector } from "react-redux";
import DateRangeSelector from "@/component/DateRangeSelector";
import { format } from "date-fns";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import ConfirmDialog from "@/component/ConfirmDialog";

const IncidentPage = () => {
  const isMobile = useIsMobile(); // Check if the device is mobile
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const today = new Date();
  const [startDate, setStartDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd")
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // console.log(startDate, endDate);

  // Get logged-in user
  const user = useSelector((state) => state.userSlice.user);
  // const userId = user?.user?._id;
  const userRole = user?.user?.role;

  const handleDateRangeChange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    // Clamp endDate to today if it's in the future
    let safeEndDate =
      newEndDate && newEndDate > todayStr ? todayStr : newEndDate;
    setStartDate(newStartDate);
    setEndDate(safeEndDate);
  };

  // Pass only page and limit, no userId
  const { data, error, isLoading, isFetching } = useGetAllIncidentsQuery({
    page: currentPage,
    limit,
    from: startDate,
    to: endDate,
    userId: user?.user?._id,
  });
  const [deleteIncident] = useDeleteIncidentMutation();

  const columns = [
    "Persons Involved",
    "Emergency Contact",
    "Date & Time",
    "Injuries",
    "How Reported",
    "Actions",
  ];

  // const handleDelete = async (id) => {
  //   try {
  //     await deleteIncident(id).unwrap();
  //     toast.success("Success", "Incident deleted successfully!");
  //   } catch (error) {
  //     toast.error("Error", error?.data?.message || "Failed to delete incident");
  //   }
  // };

  const handleDeleteClick = (id) => {
    setItemToDelete(id); // store the item to delete
    setIsDialogOpen(true); // open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteIncident(itemToDelete).unwrap();
      toast.success("Success", "Incident deleted successfully!");

      // cleanup
      setIsDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to delete incident."
      );
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setItemToDelete(null);
  };

  const handleView = (incident) => {
    setSelectedIncident(incident);
    setIsViewModalOpen(true);
  };

  const handleUpdate = (e, incident) => {
    e.preventDefault();
    setSelectedIncident(incident);
    setIsUpdateModalOpen(true);
  };

  const tableData = useMemo(() => {
    if (!data?.data) return [];

    return data?.data.map((incident) => ({
      "Persons Involved": Array.isArray(incident?.personsInvolved) ? (
        incident?.personsInvolved.map((person, idx) => {
          if (person && typeof person === "object") {
            const fullName = `${person.firstName || ""} ${
              person.lastName || ""
            }`.trim();
            const email = person.email || "No email";
            return (
              <div key={idx}>
                {fullName || "Unknown Name"} ({email})
              </div>
            );
          } else if (typeof person === "string") {
            return <div key={idx}>{person}</div>;
          } else {
            return <div key={idx}>Unknown Person</div>;
          }
        })
      ) : (
        <div>No persons involved</div>
      ),

      "Emergency Contact": Array.isArray(incident?.personsInvolved) ? (
        incident?.personsInvolved.map((person, idx) => {
          if (person && typeof person === "object" && person.emergencyContact) {
            const contact = person.emergencyContact;
            const name = contact.name || "No Contact";
            const relationship = contact.relationship || "N/A";
            const phone = contact.phonePrimary || "No phone";

            return (
              <div key={idx} className="mb-2">
                {`${name} (${relationship})`}
                <br />
                {phone}
              </div>
            );
          } else if (person && typeof person === "object") {
            return <div key={idx}>No emergency contact</div>;
          } else {
            return <div key={idx}>N/A</div>;
          }
        })
      ) : (
        <div>N/A</div>
      ),

      "Date & Time": incident?.incidentDateTime
        ? new Date(incident.incidentDateTime).toLocaleString()
        : "No date specified",

      Injuries: incident?.injuries || "No injuries reported",

      "How Reported": incident?.howReported || "Not specified",

      Actions: (
        <div className="flex items-center gap-2">
          <Tooltip text="View Details" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={() => handleView(incident)}
            >
              <Eye size={18} />
            </button>
          </Tooltip>

          <Tooltip text="Edit Incident" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={(e) => handleUpdate(e, incident)}
            >
              <FileEdit size={18} />
            </button>
          </Tooltip>

          <Tooltip text="Delete Incident" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
              onClick={() => handleDeleteClick(incident._id)}
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
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
        Error loading incidents: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 ">
      <div className="flex gap-4 items-center justify-between mb-8">
        <div className="">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold leading-tight text-gray-900">
              Incident Management
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="View and manage all reported workplace incidents.
                  Track persons involved, injuries, and emergency contacts.
                Filter incidents by date and review detailed reports.
                      Edit, delete, or add new incidents for accurate records."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage Your Incidents and Details
          </p>
        </div>

        <Button
          onClick={() => navigate("/incident-form")}
          variant="primary"
          className="bg-primary hover:bg-primary/90 min-w-40"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Incident</span>
          </div>
        </Button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-5">
        <DateRangeSelector
          onDateRangeChange={handleDateRangeChange}
          label="Date Range"
          className="min-w-64"
        />
      </div>

      <div className="">
        <Table isLoading={isLoading} data={tableData} columns={columns} />
      </div>
      {tableData?.length > 0 && (
        <div className="mt-6 px-4 sm:px-0">
          <Pagination
            currentCount={tableData.length}
            totalCount={data?.pagination?.totalDocs}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      )}

      {/* Modals */}
      {selectedIncident && (
        <>
          <IncidentUpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedIncident(null);
            }}
            incident={selectedIncident}
          />

          <IncidentViewModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedIncident(null);
            }}
            incident={selectedIncident}
          />
        </>
      )}

      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this incident? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default IncidentPage;
