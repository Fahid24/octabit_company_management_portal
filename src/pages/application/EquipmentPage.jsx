import React, { useRef, useState, useEffect } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/component/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetEquipmentByEmployeeQuery,
  useDeleteEquipmentRequestMutation,
} from "@/redux/features/application/applicationApiSlice";
import { formatDate } from "@/utils/dateFormatFunction";
import { toast } from "@/component/Toast";
import ApplicationTablePage from "./component/ApplicationTablePage";

export default function EquipmentPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;
  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useGetEquipmentByEmployeeQuery(employeeId, { skip: !employeeId });
  const [deleteEquipmentRequest, { isLoading: isDeleting }] =
    useDeleteEquipmentRequestMutation();
  const safeRequests = Array.isArray(requests) ? requests : [];

  const columns = [
    "equipmentName",
    "quantity",
    "priority",
    "status",
    "Need By",
    "Action",
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const handleEdit = (row) => {
    navigate(`/equipment/edit/${row._id || row.id}`, {
      state: { requestData: row }, // FIX: use requestData as key
    });
  };
  const handleDelete = async (row) => {
    try {
      await deleteEquipmentRequest(row._id || row.id).unwrap();
      refetch();
      toast.success("Deleted", "Request deleted successfully.");
    } catch (err) {
      toast.error("Delete Failed", "Failed to delete request.");
    }
  };
  const renderCell = (col, value, row, helpers) => {
    const { getPriorityColor, getStatusColor, openModal, openConfirm } =
      helpers;
    if (col === "priority") {
      const displayPriority = value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : "";
      return (
        <Badge variant="outline" className={getPriorityColor(displayPriority)}>
          {displayPriority}
        </Badge>
      );
    }
    if (col === "status") {
      const displayStatus = value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : "";
      return (
        <Badge variant="outline" className={getStatusColor(displayStatus)}>
          {displayStatus}
        </Badge>
      );
    }
    if (col === "Need By") {
      return formatDate(value);
    }
    if (col === "Action") {
      const isApproved = row.status && row.status.toLowerCase() === "approved";
      return (
        <div className="flex gap-2">
          <button
            type="button"
            title="View Details"
            className="group"
            onClick={(e) => {
              e.stopPropagation();
              setModalRow(row);
              setModalOpen(true);
            }}
          >
            <Eye className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition duration-150" />
          </button>
          {!isApproved &&
            row.status &&
            row.status.toLowerCase() === "pending" && (
              <>
                <button
                  type="button"
                  title="Edit"
                  className="group transition duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                >
                  <Pencil className="w-5 h-5 group-hover:text-blue-600 transition duration-150" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  className="group transition duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    helpers.openConfirm(row);
                  }}
                >
                  <Trash2 className="w-5 h-5 group-hover:text-red-600 transition duration-150" />
                </button>
              </>
            )}
        </div>
      );
    }
    return value;
  };
  const tableData = safeRequests.map((req) => ({
    ...req,
    "Need By": formatDate(req.expectedDate),
    id: req._id || req.id,
    status: req.status || "Pending",
  }));
  const modalContent = (
    selectedRequest,
    { close, onEdit, onDelete, getPriorityColor, getStatusColor }
  ) => (
    <>
      {/* Redesigned modal content (wider + scrollable) */}
      <div className="w-[650px] max-w-full" ref={modalRef}>
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Equipment Request Details
              </h2>
              <p className="text-sm text-gray-500">
                View equipment request information
              </p>
            </div>
          </div>
        </div>

        {/* Remove inner scroll: just use space-y-6, no max-h/overflow on inner content */}
        <div className="pr-1 space-y-6 custom-scrollbar">
          {/* Basic Info Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Basic Information
            </h3>
            <div className="bg-white/80 rounded-lg p-4 border border-white/50 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Equipment Name:</span>
                <p className="font-medium text-gray-900 break-words">
                  {selectedRequest.equipmentName}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Quantity:</span>
                <p className="font-medium text-gray-900">
                  {selectedRequest.quantity}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={getPriorityColor(
                      selectedRequest.priority
                        ? selectedRequest.priority.charAt(0).toUpperCase() +
                            selectedRequest.priority.slice(1)
                        : ""
                    )}
                  >
                    {selectedRequest.priority
                      ? selectedRequest.priority.charAt(0).toUpperCase() +
                        selectedRequest.priority.slice(1)
                      : ""}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={getStatusColor(
                      selectedRequest.status
                        ? selectedRequest.status.charAt(0).toUpperCase() +
                            selectedRequest.status.slice(1)
                        : "Pending"
                    )}
                  >
                    {selectedRequest.status
                      ? selectedRequest.status.charAt(0).toUpperCase() +
                        selectedRequest.status.slice(1)
                      : "Pending"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Need By:</span>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedRequest.expectedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Purpose Section */}
          <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Purpose</h3>
            <div className="bg-white/80 rounded-lg p-4 border border-white/50 text-sm leading-relaxed text-gray-800">
              {selectedRequest.purpose || "No purpose provided."}
            </div>
          </div>

          {/* Images Section */}
          {selectedRequest.image && selectedRequest.image.length > 0 && (
            <div className="bg-gradient-to-br from-primary/5 to-amber-50 rounded-lg p-4 border border-primary/20">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Attached Images
              </h3>
              <div className="bg-white/80 rounded-lg p-4 border border-white/50">
                <div className="flex flex-wrap gap-3">
                  {selectedRequest.image.map((img, idx) =>
                    typeof img === "string" && img ? (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open image in new tab"
                      >
                        <img
                          src={img}
                          alt={`uploaded-${idx}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer"
                        />
                      </a>
                    ) : img?.url ? (
                      <a
                        key={idx}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open image in new tab"
                      >
                        <img
                          src={img.url}
                          alt={img.name || `image-${idx}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer"
                        />
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  const modalRef = useRef(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  // Allow scrolling the modal even when wheel happens on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    modalRef.current.scrollTop += e.deltaY;
  };

  return (
    <div className="w-full mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <ApplicationTablePage
        title="Equipment Dashboard"
        subtitle="Manage and track your equipment requests"
        newRequestPath="/equipment/new"
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        renderCell={renderCell}
        modalContent={(row, helpers) => null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        confirmDialogTitle="Delete Equipment Request"
        confirmDialogMessage={(row) =>
          `Are you sure you want to delete request '${
            row?.equipmentName || ""
          }'? This action cannot be undone.`
        }
        isDeleting={isDeleting}
        employeeId={employeeId}
        navigate={navigate}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onWheel={handleOverlayScroll}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto p-6 relative"
            ref={modalRef}
          >
            {/* Close icon */}
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            {modalRow &&
              modalContent(modalRow, {
                close: () => setModalOpen(false),
                onEdit: () => {
                  setModalOpen(false);
                  handleEdit(modalRow);
                },
                onDelete: () => {
                  setModalOpen(false);
                  handleDelete(modalRow);
                },
                getPriorityColor,
                getStatusColor,
              })}
          </div>
        </div>
      )}
    </div>
  );
}
