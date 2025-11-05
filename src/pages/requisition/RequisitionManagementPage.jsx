import Button from "@/component/Button";
import ConfirmDialog from "@/component/ConfirmDialog";
import { FileUpload } from "@/component/FileUpload";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import Loader from "@/component/Loader";
import Modal from "@/component/Modal";
import Pagination from "@/component/Pagination";
import SelectInput from "@/component/select/SelectInput";
import Table from "@/component/Table";
import {
  useDeleteRequisitionMutation,
  useGetRequisitionsQuery,
  useStatusUpdateActionMutation,
} from "@/redux/features/requisition/requisitionApiSlice";
import { useGetTypesQuery } from "@/redux/features/type/typeApiSlice";
import { useGetVendorsQuery } from "@/redux/features/vendor/vendorApiSlice";
import { Edit, Eye, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import RequisitionDetailsModal from "./components/RequisitionDetailsModal";
import RequisitionCreateAndUpdateModal from "./components/RequisitionCreateAndUpdateModal";
import Tooltip from "@/component/Tooltip";
import processDocuments from "@/utils/processDocuments";
import normalizeDocuments from "@/utils/normalizeDocument";

const statusOptions = [
  { value: "Requested", label: "Requested" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const RequisitionManagementPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewRequisition, setViewRequisition] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [deleteRequisitionId, setDeleteRequisitionId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Status dropdown states
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState("");
  const [statusRequisition, setStatusRequisition] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    comments: "",
    documents: [],
    items: [],
  });

  const [formData, setFormData] = useState({
    requisitionTitle: "",
    description: "",
    documents: [],
    items: [],
  });

  const loginUser = useSelector((state) => state.userSlice.user);
  const isAdmin = loginUser?.user?.role === "Admin";

  const {
    data: requisitionsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetRequisitionsQuery({
    page: page,
    limit: limit,
    search: searchTerm,
    status: selectedStatus?.label || "",
  });

  // console.log(requisitionsData);

  const [deleteRequisition, { isLoading: isDeleting }] =
    useDeleteRequisitionMutation();

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useStatusUpdateActionMutation();

  // Get vendors and types for approval modal
  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });

  const { data: typesData } = useGetTypesQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });

  // Memoized options for dropdowns
  const vendorOptions = useMemo(() => {
    return (
      vendorsData?.data?.map((vendor) => ({
        value: vendor._id,
        label: vendor.name,
      })) || []
    );
  }, [vendorsData]);

  const typeOptions = useMemo(() => {
    return (
      typesData?.data?.map((type) => ({
        value: type._id,
        label: type.name,
      })) || []
    );
  }, [typesData]);

  // Table columns
  const columns = [
    "Requisition ID",
    "Requisition Title",
    "Items Count",
    "Status",
    "Created At",
    "Actions",
  ];

  // Handle view details
  const handleViewClick = (requisition) => {
    // console.log(requisition);
    setViewRequisition(requisition);
    setIsViewModalOpen(true);
  };

  const handleEditClick = useCallback((requisition) => {
    setIsEditMode(true);
    setSelectedRequisition(requisition);

    console.log(requisition);
    setFormData({
      requisitionTitle: requisition.requisitionTitle || "",
      description: requisition.description || "",
      documents: normalizeDocuments(requisition.documents),
      items:
        requisition.items && requisition.items.length > 0
          ? requisition.items.map((item) => ({
              // title: item.title || "",
              quantityRequested: item.quantityRequested || "",
              estimatedCost: item.estimatedCost || "",
              vendor: { value: item.vendor?._id, label: item.vendor?.name },
              //   category: item.category
              //     ? categoryOptions.find((c) => c.value === item.category)
              //     : null,
              type: { value: item.type?._id, label: item.type?.name },
              documents: normalizeDocuments(item.documents),
              approvedVendor: {
                value: item.approvedVendor?._id,
                label: item.approvedVendor?.name,
              },
              approvedCost: Number(item.approvedCost) || 0,
              quantityApproved: Number(item.quantityApproved) || 0,
            }))
          : [getEmptyItem()],
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete
  const handleDeleteClick = useCallback((requisitionId) => {
    setDeleteRequisitionId(requisitionId);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle status menu toggle
  const toggleStatusMenu = useCallback(
    (requisitionId) => {
      setOpenMenuId(openMenuId === requisitionId ? null : requisitionId);
    },
    [openMenuId]
  );

  // Handle status change
  const handleStatusChange = useCallback((requisition, newStatus) => {
    setStatusRequisition(requisition);
    setStatusAction(newStatus);
    setOpenMenuId(null);

    // Reset form data
    setStatusFormData({
      comments: "",
      documents: [],
      items:
        newStatus === "Approved"
          ? requisition.items?.map((item) => ({
              type: item.type?.name,
              vendor: item.vendor?._id || item.vendor,
              quantityRequested: item.quantityRequested || 0,
              estimatedCost: item.estimatedCost || 0,
              documents: normalizeDocuments(item.documents),
            }))
          : [],
    });

    setIsStatusModalOpen(true);
  }, []);

  // Get filtered status options
  const getFilteredStatusOptions = useCallback((currentStatus) => {
    const allStatuses = ["Requested", "Approved", "Rejected"];
    return allStatuses.filter((status) => status !== currentStatus);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest(".status-dropdown")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // Handle status form changes
  const handleStatusFormChange = (field, value, itemIndex = null) => {
    setStatusFormData((prev) => {
      if (itemIndex !== null) {
        const newItems = [...prev.items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
        return { ...prev, items: newItems };
      }
      return { ...prev, [field]: value };
    });
  };

  // Handle status form submission
  const handleStatusSubmit = async () => {
    try {
      const actionBy = loginUser?.user?._id;

      let submitData = {
        actionBy,
        comments: statusFormData.comments,
        action: statusAction,
        documents:
          statusFormData.documents
            ?.map((doc) =>
              typeof doc === "string" ? doc : doc.fileUrl || doc.link
            )
            .filter(Boolean) || [],
      };

      if (statusAction === "Approved") {
        submitData.items = statusFormData.items.map((item) => ({
          vendor:
            typeof item.vendor === "object" ? item.vendor.value : item.vendor,
          quantityRequested: Number(item.quantityRequested),
          estimatedCost: Number(item.estimatedCost),
          documents:
            item.documents
              ?.map((doc) =>
                typeof doc === "string" ? doc : doc.fileUrl || doc.link
              )
              .filter(Boolean) || [],
        }));
      }
      console.log(statusRequisition._id);

      await updateStatus({
        id: statusRequisition._id,
        body: submitData,
      }).unwrap();

      setIsStatusModalOpen(false);
      setStatusRequisition(null);
      setStatusAction("");
      setStatusFormData({ comments: "", documents: [], items: [] });
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Transform data for table
  const tableData = useMemo(() => {
    return (
      requisitionsData?.data?.map((requisition) => ({
        "Requisition ID": requisition?.requisitionID || "N/A",
        "Requisition Title": requisition.requisitionTitle || "N/A",

        "Items Count": requisition.items ? requisition.items.length : 0,
        Status: (
          <div className="flex items-center">
            {isAdmin &&
              requisition?.status !== "Approved" &&
              requisition?.status !== "Rejected" && (
                <div className="relative status-dropdown">
                  <Tooltip
                    text={`Change status (current: ${requisition?.status})`}
                    position="left"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatusMenu(requisition._id);
                      }}
                      className=""
                    >
                      <MoreVertical size={14} className="text-gray-500" />
                    </button>
                  </Tooltip>

                  {openMenuId === requisition._id && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-32">
                      {["Approved", "Rejected"].map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(requisition, status);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                requisition.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : requisition.status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {requisition.status || "pending"}
            </span>
          </div>
        ),
        "Created At": requisition.createdAt
          ? new Date(requisition.createdAt).toLocaleDateString()
          : "N/A",
        Actions: (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick(requisition);
              }}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(requisition);
              }}
              className="p-1 text-primary hover:text-primary transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(requisition._id);
              }}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
        _id: requisition._id, // Keep original data for edit functionality
        items: requisition.items,
        documents: requisition.documents,
      })) || []
    );
  }, [
    requisitionsData,
    handleEditClick,
    handleDeleteClick,
    isAdmin,
    openMenuId,
    toggleStatusMenu,
    handleStatusChange,
  ]);

  // Initialize empty item
  const getEmptyItem = () => ({
    // title: "",
    quantityRequested: "",
    approvedVendor: null,
    approvedCost: "",
    quantityApproved: "",
    estimatedCost: "",
    vendor: null,
    // category: null,
    type: null,
    documents: [],
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      requisitionTitle: "",
      description: "",
      documents: [],
      items: [getEmptyItem()],
    });
    setFormErrors({});
  };

  // Handle create/edit modal
  const handleCreateClick = () => {
    setIsEditMode(false);
    setSelectedRequisition(null);
    resetForm();
    setFormData((prev) => ({ ...prev, items: [getEmptyItem()] }));
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRequisition(deleteRequisitionId).unwrap();
      setIsDeleteDialogOpen(false);
      setDeleteRequisitionId(null);
      refetch();
    } catch (error) {
      console.error("Error deleting requisition:", error);
    }
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Requisition Management
        </h1>
        <p className="text-gray-600">
          Manage your organization&apos;s requisitions
        </p>
      </div>

      {/* Search and Create Section */}
      <div className="px-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <FloatingInput
            label="Search requisitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-72"
          />

          <SelectInput
            label="Status"
            options={statusOptions || []}
            value={selectedStatus}
            onChange={(selectedOption) => setSelectedStatus(selectedOption)}
            className="min-w-72"
          />
        </div>

        <div className="">
          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Create Requisition
          </Button>
        </div>
      </div>

      {/* Table Section */}

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      ) : (
        <>
          <div className="">
            <Table columns={columns} data={tableData} isLoading={isLoading} />
          </div>

          {tableData && (
            <div className="mt-6 px-4 sm:px-0">
              <Pagination
                currentCount={tableData.length}
                totalCount={requisitionsData?.pagination?.totalRequisitions}
                currentPage={page}
                setCurrentPage={setPage}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <RequisitionCreateAndUpdateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditMode={isEditMode}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        setIsModalOpen={setIsModalOpen}
        selectedRequisition={selectedRequisition}
        refetch={refetch}
        resetForm={resetForm}
        getEmptyItem={getEmptyItem}
      />

      {/* View Details Modal */}
      <RequisitionDetailsModal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        setIsViewModalOpen={setIsViewModalOpen}
        viewRequisition={viewRequisition}
      />

      {/* Status Update Modal */}
      <Modal
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        className="max-w-4xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {statusAction === "Rejected"
              ? "Reject Requisition"
              : "Approve Requisition"}
          </h2>

          <div className="space-y-6">
            {/* Items Section for Approval */}
            {statusAction === "Approved" &&
              statusFormData.items &&
              statusFormData.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Review Items
                  </h3>
                  <div className="space-y-4">
                    {statusFormData.items.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 space-y-4"
                      >
                        <h4 className="font-medium text-gray-900">
                          Item {index + 1}
                        </h4>

                        <div className="flex flex-col md:flex-row items-start gap-6">
                          <div className="grid grid-cols-1 gap-4 w-full">
                            <SelectInput
                              label="Type"
                              // options={{ label: item?.type?.name, value: item?.type?._id }}
                              value={{ label: item?.type, value: item?.type }}
                              disabled={true}
                              className="cursor-not-allowed"
                            />

                            <SelectInput
                              label="Vendor"
                              options={vendorOptions}
                              value={
                                vendorOptions.find(
                                  (v) => v.value === item.vendor
                                ) || null
                              }
                              onChange={(selectedOption) =>
                                handleStatusFormChange(
                                  "vendor",
                                  selectedOption?.value,
                                  index
                                )
                              }
                              required
                            />

                            <FloatingInput
                              label="Quantity Requested"
                              type="number"
                              value={item.quantityRequested}
                              onChange={(e) =>
                                handleStatusFormChange(
                                  "quantityRequested",
                                  e.target.value,
                                  index
                                )
                              }
                              required
                            />

                            <FloatingInput
                              label="Estimated Cost"
                              type="number"
                              step="0.01"
                              value={item.estimatedCost}
                              onChange={(e) =>
                                handleStatusFormChange(
                                  "estimatedCost",
                                  e.target.value,
                                  index
                                )
                              }
                              required
                            />
                          </div>

                          <div className="max-w-sm w-full max-h-[385px] overflow-y-auto">
                            <FileUpload
                              label="Item Documents"
                              value={item.documents || []}
                              onChange={(files) =>
                                handleStatusFormChange(
                                  "documents",
                                  files,
                                  index
                                )
                              }
                              isMultiFile={true}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onFileClick={(file) => {
                                if (file?.fileUrl) {
                                  window.open(file.fileUrl, "_blank");
                                } else {
                                  console.warn("No file URL available.");
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {statusAction === "Approved" && (
              <div className="pt-10 pb-3 text-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  Additional Information
                </h1>
                <p className="text-gray-600 text-sm">
                  You can provide any additional information or context that may
                  be helpful for the review process.
                </p>
              </div>
            )}

            {/* Comments */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full">
                <FloatingTextarea
                  // label="Add approval comments..."
                  value={statusFormData.comments}
                  onChange={(e) =>
                    handleStatusFormChange("comments", e.target.value)
                  }
                  rows={11}
                  required
                  placeholder={
                    statusAction === "Rejected"
                      ? "Please provide reason for rejection..."
                      : "Add approval comments..."
                  }
                />
              </div>

              {/* Documents */}
              <div className="w-full">
                <FileUpload
                  label="Supporting Documents"
                  value={statusFormData.documents}
                  onChange={(files) =>
                    handleStatusFormChange("documents", files)
                  }
                  isMultiFile={true}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onFileClick={(file) => {
                    if (file?.fileUrl) {
                      window.open(file.fileUrl, "_blank");
                    } else {
                      console.warn("No file URL available.");
                    }
                  }}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleStatusSubmit}
                disabled={
                  (!statusFormData.comments.trim() &&
                    statusAction === "Rejected") ||
                  isUpdatingStatus
                }
                className={
                  statusAction === "Rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
              >
                {isUpdatingStatus
                  ? "Processing..."
                  : statusAction === "Rejected"
                  ? "Reject"
                  : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Requisition"
        message="Are you sure you want to delete this requisition? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeleteRequisitionId(null);
        }}
      />
    </div>
  );
};

export default RequisitionManagementPage;
