import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useGetLearningRequestsByEmployeeQuery,
  useDeleteLearningRequestMutation,
} from "@/redux/features/learning/learningApiSlice";
import { formatDate } from "@/utils/dateFormatFunction";
import { toast } from "@/component/Toast";
import ApplicationTablePage from "../application/component/ApplicationTablePage";
import { Badge } from "@/component/badge";
import LearningRequestCreateModal from "./component/LearningRequestCreateModal";
import LearningRequestUpdateModal from "./component/LearningRequestUpdateModal";
import Button from "@/component/Button";

export default function LearningRequestPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;

  const {
    data: requestsData,
    isLoading,
    refetch,
  } = useGetLearningRequestsByEmployeeQuery(employeeId, { skip: !employeeId });
  const requests = requestsData?.data || [];

  const [deleteLearningRequest, { isLoading: isDeleting }] =
    useDeleteLearningRequestMutation();

  const columns = ["topicTitle", "priority", "status", "Need By", "Action"];

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
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
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

  const handleOpenCreate = () => setCreateModalOpen(true);
  const handleCloseCreate = () => setCreateModalOpen(false);
  const handleOpenUpdate = (row) => {
    setSelectedRequest(row);
    setUpdateModalOpen(true);
  };
  const handleCloseUpdate = () => {
    setSelectedRequest(null);
    setUpdateModalOpen(false);
  };

  const handleEdit = (row) => {
    navigate(`/learning-requests/edit/${row._id}`, { state: { request: row } });
  };

  const handleDelete = async (row) => {
    try {
      await deleteLearningRequest(row._id).unwrap();
      refetch();
      toast.success("Deleted", "Request deleted successfully.");
    } catch (err) {
      toast.error("Delete Failed", "Failed to delete request.");
    }
  };

  const renderCell = (col, value, row, helpers) => {
    const { getPriorityColor, getStatusColor, openModal, openConfirm } =
      helpers;
    const displayValue = value
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : "";

    if (col === "priority")
      return (
        <Badge variant="outline" className={getPriorityColor(displayValue)}>
          {displayValue}
        </Badge>
      );
    if (col === "status")
      return (
        <Badge variant="outline" className={getStatusColor(displayValue)}>
          {displayValue}
        </Badge>
      );
    if (col === "Need By") return formatDate(value);
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
            <Eye className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
          </button>
          {row.status?.toLowerCase() === "pending" && (
            <>
              <button
                type="button"
                title="Edit"
                className="group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUpdate(row);
                }}
              >
                <Pencil className="w-5 h-5 group-hover:text-blue-600" />
              </button>
              <button
                type="button"
                title="Delete"
                className="group"
                onClick={(e) => {
                  e.stopPropagation();
                  helpers.openConfirm(row);
                }}
              >
                <Trash2 className="w-5 h-5 group-hover:text-red-600" />
              </button>
            </>
          )}
        </div>
      );
    }
    return value;
  };

  const tableData = requests?.map((req) => ({
    ...req,
    "Need By": formatDate(req.expectedCompletionDate),
    id: req?._id,
    status: req?.status || "Pending",
  }));

  const modalContent = (selectedRequest, helpers) => {
    const displayPriority = selectedRequest.priority
      ? selectedRequest.priority.charAt(0).toUpperCase() +
        selectedRequest.priority.slice(1)
      : "";
    const displayStatus = selectedRequest.status
      ? selectedRequest.status.charAt(0).toUpperCase() +
        selectedRequest.status.slice(1)
      : "";
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
                  Learning Request Details
                </h2>
                <p className="text-sm text-gray-500">
                  View learning request information
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
                  <span className="text-gray-500">Topic Title:</span>
                  <p className="font-medium text-gray-900 break-words">
                    {selectedRequest.topicTitle}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={helpers.getPriorityColor(displayPriority)}
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
                      className={helpers.getStatusColor(displayStatus)}
                    >
                      {displayStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Need By:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedRequest.expectedCompletionDate)}
                  </p>
                </div>
              </div>
            </div>
            {/* Description/Justification/Format */}
            <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Details
              </h3>
              <div className="bg-white/80 rounded-lg p-4 border border-white/50 text-sm leading-relaxed text-gray-800 space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">
                    Description:
                  </span>
                  <div className="whitespace-pre-wrap">
                    {selectedRequest.topicDescription ||
                      "No description provided."}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Justification:
                  </span>
                  <div className="whitespace-pre-wrap">
                    {selectedRequest.justification ||
                      "No justification provided."}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Preferred Format:
                  </span>
                  <div>{selectedRequest.preferredLearningFormat || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-full mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      <ApplicationTablePage
        title="My Learning Requests"
        subtitle="Request and track new learning opportunities"
        newRequestPath="/learning-requests/new"
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        renderCell={renderCell}
        modalContent={(row, helpers) => null}
        onEdit={handleOpenUpdate}
        onDelete={handleDelete}
        confirmDialogTitle="Delete Learning Request"
        confirmDialogMessage={(row) =>
          `Are you sure you want to delete the request for '${row?.topicTitle}'?`
        }
        isDeleting={isDeleting}
        employeeId={employeeId}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        navigate={navigate}
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
              {/* You can use Lucide's X icon if imported */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {modalRow &&
              modalContent(modalRow, {
                close: () => setModalOpen(false),
                onEdit: () => {
                  setModalOpen(false);
                  handleOpenUpdate(modalRow);
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
      <LearningRequestCreateModal
        open={createModalOpen}
        onClose={handleCloseCreate}
        onSuccess={() => {
          handleCloseCreate();
          refetch();
        }}
      />
      <LearningRequestUpdateModal
        open={updateModalOpen}
        onClose={handleCloseUpdate}
        request={selectedRequest}
        onSuccess={() => {
          handleCloseUpdate();
          refetch();
        }}
      />
    </div>
  );
}
