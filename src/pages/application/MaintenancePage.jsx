import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/component/badge";
import { useNavigate } from "react-router-dom";
import {
  useGetMaintenanceByEmployeeQuery,
  useDeleteMaintenanceRequestMutation,
} from "@/redux/features/application/applicationApiSlice";
import { formatDate } from "@/utils/dateFormatFunction";
import ApplicationTablePage from "./component/ApplicationTablePage";

export default function MaintenancePage() {
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;
  useEffect(() => {
    const savedId = localStorage.getItem("selectedMaintenanceId");
    if (savedId) {
      setSelectedId(savedId);
      setModalOpen(true);
    }
  }, []);
  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useGetMaintenanceByEmployeeQuery(employeeId, { skip: !employeeId });
  const [deleteMaintenanceRequest] = useDeleteMaintenanceRequestMutation();
  const safeRequests = Array.isArray(requests) ? requests : [];
  const modalRowRef = useRef(null);
  const columns = [
    "Equipment Name",
    "Priority",
    "Status",
    "Need By",
    "Damage Date",
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
    setSelectedId(null);
    localStorage.removeItem("selectedMaintenanceId");
    navigate(`/maintenance/edit/${row._id || row.id}`, {
      state: { requestData: row },
    });
  };
  const handleDelete = async (row) => {
    await deleteMaintenanceRequest(row._id);
    refetch();
  };
  const renderCell = (col, value, row, helpers) => {
    const { getPriorityColor, getStatusColor, openModal, openConfirm } =
      helpers;
    if (col === "Priority") {
      return (
        <Badge variant="outline" className={getPriorityColor(value)}>
          {value}
        </Badge>
      );
    }
    if (col === "Status") {
      return (
        <Badge variant="outline" className={getStatusColor(value)}>
          {value}
        </Badge>
      );
    }
    if (col === "Need By") {
      return formatDate(row.expectedDate);
    }
    if (col === "Damage Date") {
      return formatDate(row.damageDate);
    }
    if (col === "Equipment Name") {
      return row.equipmentName;
    }
    if (col === "Action") {
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
          {row.status && row.status.toLowerCase() === "pending" && (
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
    id: req._id || req.id,
    Priority: req.priority
      ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1)
      : "Medium",
    Status: req.status
      ? req.status.charAt(0).toUpperCase() + req.status.slice(1)
      : "Pending",
  }));
  const modalContent = (
    request,
    { close, onEdit, onDelete, getPriorityColor, getStatusColor }
  ) => {
    const canModify =
      request.status &&
      request.status.toLowerCase() === "pending" &&
      request.status.toLowerCase() !== "approved";

    const displayPriority = request.priority
      ? request.priority.charAt(0).toUpperCase() + request.priority.slice(1)
      : "Medium";
    const displayStatus = request.status
      ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
      : "Pending";

    return (
      <>
        <div className="w-[650px] max-w-full" ref={modalRef}>
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Maintenance Request Details
                </h2>
                <p className="text-sm text-gray-500">
                  View maintenance request information
                </p>
              </div>
            </div>
          </div>
          {/* Remove inner scroll: just use space-y-6, no max-h/overflow on inner content */}
          <div className="pr-1 space-y-6 custom-scrollbar">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Basic Information
              </h3>
              <div className="bg-white/80 rounded-lg p-4 border border-white/50 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Equipment Name:</span>
                  <p className="font-medium text-gray-900 break-words">
                    {request.equipmentName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={getPriorityColor(displayPriority)}
                    >
                      {displayPriority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={getStatusColor(displayStatus)}
                    >
                      {displayStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Need By:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(request.expectedDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Damage Date:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(request.damageDate)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Problem Description:</span>
                  <p className="font-medium text-gray-900">
                    {request.problemDescription || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
            {/* Problem Description */}
            <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Problem Details
              </h3>
              <div className="bg-white/80 rounded-lg p-4 border border-white/50 text-sm leading-relaxed text-gray-800">
                {request.problemDescription || "No problem description."}
              </div>
            </div>
            {/* Images */}
            {request.image && request.image.length > 0 && (
              <div className="bg-gradient-to-br from-primary/5 to-amber-50 rounded-lg p-4 border border-primary/20">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Attached Images
                </h3>
                <div className="bg-white/80 rounded-lg p-4 border border-white/50">
                  <div className="flex flex-wrap gap-3">
                    {request.image.map((img, idx) =>
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
  };

  // Prevent background scroll, allow modal scroll even when wheel is on overlay
  const handleOverlayScroll = (e) => {
    if (!modalRef.current) return;
    e.preventDefault();
    modalRef.current.scrollTop += e.deltaY;
  };

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

  return (
    <div className="w-full mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <ApplicationTablePage
        title="Maintenance Dashboard"
        subtitle="Manage and track your maintenance requests"
        newRequestPath="/maintenance/new"
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        renderCell={renderCell}
        modalContent={(row, helpers) => null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        confirmDialogTitle="Delete Maintenance Request"
        confirmDialogMessage={(row) =>
          `Are you sure you want to delete request '${
            row?.equipmentName || ""
          }'? This action cannot be undone.`
        }
        isDeleting={false}
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
