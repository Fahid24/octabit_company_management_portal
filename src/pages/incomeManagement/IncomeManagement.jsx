import Button from "@/component/Button";
import ConfirmDialog from "@/component/ConfirmDialog";
import DatePicker from "@/component/CustomCalander";
import Pagination from "@/component/Pagination";
import SelectInput from "@/component/select/SelectInput";
import Table from "@/component/Table";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import useIsMobile from "@/hook/useIsMobile";
import {
  useDeleteIncomeMutation,
  useGetIncomesQuery,
} from "@/redux/features/revenue/revenueSlice";
import Loading from "@/utils/CLoading/Loading";
import { format } from "date-fns";
import { CircleAlert, Edit, Eye, Plus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IncomeDetailsModal from "./incomeDetailsModal";
import Loader from "@/component/Loader";

const IncomeManagement = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteIncome] = useDeleteIncomeMutation();
  const [name, setName] = useState(null); // {label, value}
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: incomeData, isLoading: isLoadingincomeData } =
    useGetIncomesQuery({
      page: currentPage,
      limit: limit,
      searchTerm: name ? name.label : "",
      selectedDate: selectedDate ? selectedDate : "",
    });

  const clientColumns = [
    "Company",
    "Client Name",
    "Email",
    "Phone",
    "Services",
    "Actions",
  ];

  // console.log(incomeData)

  const handleConfirmDelete = async () => {
    // console.log(deleteId);
    if (!deleteId) return;
    try {
      await deleteIncome(deleteId).unwrap();
      toast.success("Income deleted successfully");
      setDeleteId(null);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income");
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirmOpen(false);
  };
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleClearFilter = () => {
    setName(null);
    setSelectedDate("");
  };

  // console.log(selectedDate)

  if (isLoadingincomeData)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl p-4 md:pl-24 pb-20 md:pb-4 text-gray-900">
      {/* Header */}
      <div className="flex gap-4 items-center justify-between mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900">
            Income Management
          </h1>
          <div className="ml-2 pt-2 cursor-pointer">
            <Tooltip
              as="span"
              text="View and manage Income. Perform actions like add, edit, delete, and filter for efficient income management."
              position={isMobile ? "bottom" : "right"}
            >
              <CircleAlert />
            </Tooltip>
          </div>
        </div>
        <Button
          onClick={() => navigate("/client-income-form")}
          variant="primary"
          className="bg-primary hover:bg-primary/90 min-w-40 h-12"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Income</span>
          </div>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-end mt-4 items-end">
        <div className="w-full md:w-1/4">
          <SelectInput
            label="Select Client Name"
            value={name}
            isMulti={false}
            onChange={(selected) => setName(selected)}
            options={
              incomeData?.data?.map((client) => ({
                label: client.clientId?.name || "N/A",
                value: client.clientId?._id || "",
              })) || []
            }
          />
        </div>
        <div className="w-full md:w-1/3">
          <DatePicker
            value={selectedDate ? new Date(selectedDate) : null}
            onChange={(date) => {
              const formatted = format(date, "yyyy-MM-dd");
              setSelectedDate(formatted);
            }}
            primaryColor="#3a41e2"
            startWeekOnMonday
            placeholder="Select date"
            className="w-full"
          />
        </div>
        <div>
          <button
            onClick={handleClearFilter}
            className="flex items-center gap-2 bg-gray-200 px-3 py-2 hover:bg-gray-300 rounded transition duration-200 ease-in-out"
          >
            <XCircle size={20} />
            <span>Clear Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
        <Table
          isLoading={isLoadingincomeData}
          columns={clientColumns}
          data={incomeData?.data || []}
          renderCell={(col, value, row) => {
            const cellClass = "py-3";
            switch (col) {
              case "Company":
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 sm:w-15 sm:h-15 rounded-full overflow-hidden ring-1 sm:ring-1 ring-primary/70 shadow-md flex items-center justify-center bg-gray-50">
                      {row.clientId?.companyLogo ? (
                        <img
                          src={row.clientId.companyLogo}
                          alt={row.clientId.companyName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl sm:text-xl font-bold text-primary">
                          {/* {row.clientId?.companyName?.split(' ')[0][0].toUpperCase()} */}
                          {row.clientId?.companyName
                            ? row.clientId.companyName
                                .split(" ")[0][0]
                                .toUpperCase() +
                              (row.clientId.companyName
                                .split(" ")[1]?.[0]
                                ?.toUpperCase() || "")
                            : "?"}
                        </span>
                      )}
                    </div>
                    <span>{row.clientId?.companyName || "N/A"}</span>
                  </div>
                );
              case "Client Name":
                return (
                  <span className={cellClass}>
                    {row.clientId?.name || "N/A"}
                  </span>
                );
              case "Email":
                return (
                  <span className={cellClass}>
                    {row.clientId?.email || "N/A"}
                  </span>
                );
              case "Phone":
                return (
                  <span className={cellClass}>
                    {row.clientId?.phone || "N/A"}
                  </span>
                );
              case "Services":
                return (
                  <span className={cellClass}>
                    {row.services
                      ? row.services
                          .slice(0, 2)
                          .map((s) => s.label)
                          .join(", ") + (row.services.length > 2 ? ", ..." : "")
                      : "N/A"}
                  </span>
                );
              case "Actions":
                return (
                  <div className={`flex gap-3 items-center ${cellClass}`}>
                    <Tooltip as="span" text="View Details" position="left">
                      <button
                        className="hover:text-blue-500"
                        onClick={() => {
                          setSelectedClient(row);
                          setModalOpen(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </Tooltip>
                    <Tooltip as="span" text="Edit Client" position="left">
                      <button
                        type="button"
                        className="hover:text-orange-500"
                        onClick={() =>
                          navigate(`/update-income-form/${row._id}`)
                        }
                      >
                        <Edit size={16} />
                      </button>
                    </Tooltip>
                    <Tooltip as="span" text="Delete Client" position="left">
                      <button
                        onClick={() => handleDeleteClick(row._id)}
                        className="hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Tooltip>
                  </div>
                );
              default:
                return <span className={cellClass}>{value || ""}</span>;
            }
          }}
        />
      </div>

      {/* Pagination */}
      {incomeData?.pagination?.totalDocs > 0 && (
        <div className="mt-6 px-4 sm:px-0">
          <Pagination
            currentCount={incomeData?.data.length}
            totalCount={incomeData.pagination.totalDocs}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Client"
        message="Are you sure you want to delete this Client? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {selectedClient && (
        <IncomeDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          data={selectedClient}
        />
      )}
    </div>
  );
};

export default IncomeManagement;
