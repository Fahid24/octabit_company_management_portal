import Button from "@/component/Button";
import ConfirmDialog from "@/component/ConfirmDialog";
import Pagination from "@/component/Pagination";
import SelectInput from "@/component/select/SelectInput";
import Table from "@/component/Table";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import {
  useDeleteClientMutation,
  useGetClientsQuery,
  useGetServiceOptionsQuery,
} from "@/redux/features/revenue/revenueSlice";
import Loading from "@/utils/CLoading/Loading";
import { CircleAlert, Edit, Eye, Plus, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientDetailsModal from "./ClientDetailsModal";
import Loader from "@/component/Loader";

const ClientManagement = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filters
  const [name, setName] = useState(null); // {label, value}
  const [serviceOption, setServiceOption] = useState([]); // {label, value}
  const [deleteClient] = useDeleteClientMutation();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch clients
  const { data: clientData, isLoading: isLoadingClientData } =
    useGetClientsQuery({
      searchTerm: name ? name.label : "",
      page: currentPage,
      limit,
      selectOptions: serviceOption,
      userId: user?._id,
      userRole: user?.role,
    });

  // console.log(serviceOption)

  const { data: serviceOptionsData, isLoading: isLoadingServiceOptions } =
    useGetServiceOptionsQuery();

  useEffect(() => {
    loginUser();
  }, []);

  if (isLoadingClientData || isLoadingServiceOptions)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );

  const clientColumns = [
    "Company",
    "Client Name",
    "Email",
    "Phone",
    "Services",
    "Actions",
  ];

  // console.log(clientData.data)

  function loginUser() {
    const userData = localStorage.getItem("MONKEY-MAN-USER");

    if (!userData) {
      console.log("No user found in localStorage.");
      return null;
    }

    try {
      const user = JSON.parse(userData);
      // console.log(user)

      setUser(user.user);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }

  // console.log("Logged-in user:", user.role, user._id);
  // console.log("Logged-in user:", user.role, user._id);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClient(deleteId).unwrap();
      toast.success("Client deleted successfully");
      setDeleteId(null);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirmOpen(false);
  };

  const handleClearFilter = () => {
    setName(null);
    setServiceOption([]);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:pl-24 pb-20 md:pb-4 text-gray-900">
      {/* Header */}
      <div className="flex gap-4 items-center justify-between mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900">
            Client Management
          </h1>
          <div className="ml-2 pt-2 cursor-pointer">
            <Tooltips
              as="span"
              text="View and manage Clients. Perform actions like add, edit, delete, and filter for efficient client management."
              position={isMobile ? "bottom" : "right"}
            >
              <CircleAlert />
            </Tooltips>
          </div>
        </div>
        <Button
          onClick={() => navigate("/client-form")}
          variant="primary"
          className="bg-primary hover:bg-primary/90 min-w-40 h-12"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Clients</span>
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
              clientData?.data?.map((client) => ({
                label: client.name,
                value: client._id,
              })) || []
            }
          />
        </div>
        <div className="w-full md:w-1/4">
          <SelectInput
            label="Select Service"
            value={serviceOption}
            isMulti={true}
            onChange={(selected) => setServiceOption(selected)}
            options={
              serviceOptionsData?.data?.map((op) => ({
                label: op.label,
                value: op.value,
              })) || []
            }
          />
        </div>

        {/* Clear Filter Button */}
        <div>
          <button
            onClick={handleClearFilter}
            className="flex items-center gap-2 bg-gray-200 px-3 py-2  hover:bg-gray-300 rounded transition duration-200 ease-in-out"
          >
            <XCircle size={20} />
            <span>Clear Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto ">
        <Table
          isLoading={isLoadingClientData}
          columns={clientColumns}
          data={clientData?.data}
          renderCell={(col, value, row) => {
            const cellClass = "py-3"; // increases row height
            switch (col) {
              case "Company":
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 sm:w-15 sm:h-15 rounded-full overflow-hidden ring-1 sm:ring-1 ring-primary/70 shadow-md flex items-center justify-center bg-gray-50">
                      {row.companyLogo ? (
                        <div>
                          <img
                            src={row.companyLogo}
                            alt={row.companyName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xl sm:text-xl font-bold text-primary">
                          {`${row.companyName?.split(' ')[0][0].toUpperCase()}${row.companyName?.split(' ')[1]?.[0]?.toUpperCase() || ''}`}

                        </span>
                      )}
                    </div>
                    <span>{row.companyName}</span>
                  </div>
                );
              case "Client Name":
                return <span className={cellClass}>{row.name}</span>;
              case "Email":
                return (
                  <span className={cellClass}>
                    {row.email ? row.email : "N/A"}
                  </span>
                );
              case "Phone":
                return (
                  <span className={cellClass}>
                    {row.phone ? row.phone : "N/A"}
                  </span>
                );
              case "Services":
                return (
                  <span className={cellClass}>
                    {row.services
                      ? row.services
                          .slice(0, 2)
                          .map((s) => s.label || s)
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
                        onClick={() => navigate(`/client-update/${row._id}`)}
                      >
                        <Edit size={16} />
                      </button>
                    </Tooltip>
                    <Tooltip as="span" text="Delete Client" position="top">
                      <button
                        className="hover:text-red-500"
                        onClick={() => handleDeleteClick(row._id)}
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
      {clientData?.pagination && (
        <div className="mt-6 px-4 sm:px-0">
          <Pagination
            currentCount={clientData?.data.length}
            totalCount={clientData.pagination.totalDocs}
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

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={selectedClient}
        />
      )}
    </div>
  );
};

export default ClientManagement;
