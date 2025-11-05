"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Eye,
  MoreVertical,
  Filter,
  Bolt,
  Wrench,
  BookOpenText,
  ChevronDown,
  Edit,
  Trash2,
  CircleAlert,
  X,
} from "lucide-react";
import { Badge } from "@/component/badge";
import {
  useGetAllQuery,
  useUpdateEquipmentRequestMutation,
  useUpdateMaintenanceRequestMutation,
  // added delete hooks
  useDeleteEquipmentRequestMutation,
  useDeleteMaintenanceRequestMutation,
} from "@/redux/features/application/applicationApiSlice";
import {
  useUpdateLearningStatusRequestMutation,
  // added learning delete hook
  useDeleteLearningRequestMutation,
} from "@/redux/features/learning/learningApiSlice";
import { formatDate } from "@/utils/dateFormatFunction";
import ApplicationTablePage from "./component/ApplicationTablePage";
import FilterPanel from "@/component/FilterPanel";
import ActiveFilters from "@/component/ActiveFilters";
import Tooltip from "@/component/Tooltip";
import { FloatingInput } from "@/component/FloatiingInput";
import { Tabs, TabsList, TabsTrigger } from "@/component/tabs";
import Pagination from "@/component/Pagination";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import { toast } from "@/component/Toast"; // added
import LearningRequestUpdateModal from "@/pages/learning/component/LearningRequestUpdateModal";

// Filter constants
const REQUEST_TYPES = ["all", "equipment", "maintenance", "educational"];
const REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "in-review",
  "in-progress",
  "completed",
  "cancelled",
];
const REQUEST_PRIORITIES = ["low", "medium", "urgent"];

// Status Component
const StatusComponent = ({
  status,
  type,
  rowId,
  onStatusChange,
  isUpdating,
  updatingId,
  isUpdatingEquipment,
  isUpdatingMaintenance,
  isUpdatingLearnings,
  getAllowedNextStatuses,
  statusLabel,
  getStatusColor,
  openStatusMenuId,
  setOpenStatusMenuId,
  statusMenuRef,
}) => {
  const allowedNextStatuses = getAllowedNextStatuses(status, type);
  return (
    <div className="flex items-center gap-2 relative">
      <Badge variant="outline" className={getStatusColor(status, type)}>
        {updatingId === rowId &&
        (isUpdatingEquipment || isUpdatingMaintenance || isUpdatingLearnings)
          ? "Updating..."
          : statusLabel(status, type)}
      </Badge>

      {allowedNextStatuses.length > 0 && (
        <button
          type="button"
          className="ml-1 p-1 rounded hover:bg-gray-100 relative"
          onClick={(e) => {
            e.stopPropagation();
            setOpenStatusMenuId(openStatusMenuId === rowId ? null : rowId);
          }}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
          {openStatusMenuId === rowId && (
            <div
              ref={statusMenuRef}
              className="absolute left-0 top-0 z-10 mt-6 bg-white border rounded shadow-lg min-w-[140px]"
            >
              {allowedNextStatuses.map((opt) => (
                <button
                  key={opt.value}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  disabled={
                    updatingId === rowId ||
                    isUpdatingEquipment ||
                    isUpdatingMaintenance ||
                    isUpdatingLearnings
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenStatusMenuId(null);
                    onStatusChange(rowId, opt.value, type); // pass type
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default function AllApplication() {
  const isMobile = useIsMobile(); // Check if the device is mobile
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;

  // Filter state
  const [filter, setFilter] = useState({
    type: [],
    status: [],
    priority: [],
    dateRange: { from: "", to: "" },
  });
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("maintenance");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [addApplicationDropdownOpen, setAddApplicationDropdownOpen] =
    useState(false);
  const addApplicationDropdownRef = useRef(null);

  // Modal state for custom modal
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

  // Transform filters for API
  const apiFilters = {
    ...(filter.type.length > 0 && { type: filter.type.join(",") }),
    ...(filter.status.length > 0 && { status: filter.status.join(",") }),
    ...(filter.priority.length > 0 && { priority: filter.priority.join(",") }),
    ...(search && { search }),
    page: currentPage,
    limit: limit,
    type: selectedTab, // Use selected tab as type filter
    ...(filter.dateRange.from && { startDate: filter.dateRange.from }),
    ...(filter.dateRange.to && { endDate: filter.dateRange.to }),
  };

  const { data, isLoading, refetch } = useGetAllQuery(apiFilters);
  const [updateEquipmentRequest, { isLoading: isUpdatingEquipment }] =
    useUpdateEquipmentRequestMutation();
  const [updateMaintenanceRequest, { isLoading: isUpdatingMaintenance }] =
    useUpdateMaintenanceRequestMutation();
  const [updateLearningStatusRequest, { isLoading: isUpdatingLearnings }] =
    useUpdateLearningStatusRequestMutation();
  // added delete mutations + loading states
  const [deleteEquipmentRequest, { isLoading: isDeletingEquipment }] =
    useDeleteEquipmentRequestMutation();
  const [deleteMaintenanceRequest, { isLoading: isDeletingMaintenance }] =
    useDeleteMaintenanceRequestMutation();
  const [deleteLearningRequest, { isLoading: isDeletingLearning }] =
    useDeleteLearningRequestMutation();

  const [updatingId, setUpdatingId] = useState(null);
  const [statusState, setStatusState] = useState({});
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);
  // NEW confirmation modal state
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [statusConfirmInput, setStatusConfirmInput] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState({
    id: null,
    newStatus: null,
    type: null,
  });
  const statusMenuRef = useRef(null);
  // console.log(data);

  // Status options (backend values)
  const statusOptions = {
    Equipment: [
      { value: "pending", label: "Pending" },
      { value: "in-review", label: "In Review" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
    Maintenance: [
      { value: "pending", label: "Pending" },
      { value: "in-progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
    Educational: [
      { value: "pending", label: "Pending" },
      { value: "in-progress", label: "In Progress" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  };

  // Filter change handlers
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Helper to map backend value to label
  const statusLabel = (status, type) => {
    const options = statusOptions[type] || [];
    const found = options.find((opt) => opt.value === status);
    return found ? found.label : status;
  };

  // Helper to get allowed next statuses
  const getAllowedNextStatuses = (currentStatus, type) => {
    if (type === "Equipment") {
      switch (currentStatus) {
        case "pending":
          return [
            statusOptions.Equipment.find((opt) => opt.value === "in-review"),
          ];
        case "in-review":
          return [
            statusOptions.Equipment.find((opt) => opt.value === "approved"),
            statusOptions.Equipment.find((opt) => opt.value === "rejected"),
          ];
        case "approved":
        case "rejected":
          // Allow going back to "in-review" from approved/rejected
          return [
            statusOptions.Equipment.find((opt) => opt.value === "in-review"),
          ];
        default:
          return [];
      }
    } else if (type === "Maintenance") {
      switch (currentStatus) {
        case "pending":
          return [
            statusOptions.Maintenance.find(
              (opt) => opt.value === "in-progress"
            ),
          ];
        case "in-progress":
          return [
            statusOptions.Maintenance.find((opt) => opt.value === "completed"),
            statusOptions.Maintenance.find((opt) => opt.value === "cancelled"),
          ];
        case "completed":
        case "cancelled":
          // Allow going back to "in-progress" from completed/cancelled
          return [
            statusOptions.Maintenance.find(
              (opt) => opt.value === "in-progress"
            ),
          ];
        default:
          return [];
      }
    } else if (type === "Educational") {
      switch (currentStatus) {
        case "pending":
          return [
            statusOptions.Educational.find(
              (opt) => opt.value === "in-progress"
            ),
          ];
        case "in-progress":
          return [
            statusOptions.Educational.find((opt) => opt.value === "approved"),
            statusOptions.Educational.find((opt) => opt.value === "rejected"),
          ];
        case "approved":
        case "rejected":
          // Allow going back to "in-progress" from approved/rejected
          return [
            statusOptions.Educational.find(
              (opt) => opt.value === "in-progress"
            ),
          ];
        default:
          return [];
      }
    }
    return [];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-200 text-red-800";
      case "High":
        return "bg-orange-200 text-orange-800";
      case "Medium":
        return "bg-yellow-200 text-yellow-800";
      case "Low":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusColor = (status, type) => {
    if (type === "Equipment") {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "approved":
          return "bg-green-100 text-green-800";
        case "rejected":
          return "bg-red-100 text-red-800";
        case "in-review":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else if (type === "Maintenance") {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "in-progress":
          return "bg-blue-100 text-blue-800";
        case "completed":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else if (type === "Educational") {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "in-progress":
          return "bg-blue-100 text-blue-800";
        case "approved":
          return "bg-green-100 text-green-800";
        case "rejected":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
    return "bg-gray-100 text-gray-800";
  };

  // Helper function to get edit route based on type
  const getEditRoute = (row) => {
    const typeText =
      typeof row.type === "object"
        ? row.type.props.children[1].props.children
        : row.type;

    switch (typeText) {
      case "Equipment":
        return `/equipment/edit/${row.id}`;
      case "Maintenance":
        return `/maintenance/edit/${row.id}`;
      case "Educational":
        return `/learning-requests/edit/${row.id}`;
      default:
        return `/edit/${row.id}`;
    }
  };

  // Helper to decide if a status change needs confirmation
  const requiresConfirmation = (type, newStatus) => {
    if (type === "Maintenance")
      return ["completed", "cancelled"].includes(newStatus);
    if (type === "Equipment" || type === "Educational")
      return ["approved", "rejected"].includes(newStatus);
    return false;
  };

  // Perform actual mutation (refactored from previous handleStatusChange)
  const performStatusChange = async (rowId, newStatus) => {
    setUpdatingId(rowId);
    setStatusState((prev) => ({ ...prev, [rowId]: newStatus }));
    try {
      const equipment = data?.data?.equipmentRequests?.find(
        (r) => r._id === rowId
      );
      const maintenance = data?.data?.maintenanceRequests?.find(
        (r) => r._id === rowId
      );
      const educational = data?.data?.educationalRequests?.find(
        (r) => r._id === rowId
      );

      if (equipment) {
        await updateEquipmentRequest({
          id: rowId,
          updatedData: { status: newStatus },
        }).unwrap();
      } else if (educational) {
        await updateLearningStatusRequest({
          id: rowId,
          updatedData: { status: newStatus },
        }).unwrap();
      } else if (maintenance) {
        await updateMaintenanceRequest({
          id: rowId,
          updatedData: { status: newStatus },
        }).unwrap();
      }
      refetch();
    } finally {
      setUpdatingId(null);
      setShowStatusConfirmModal(false);
      setStatusConfirmInput("");
      setPendingStatusChange({ id: null, newStatus: null, type: null });
    }
  };

  // Entry point when user selects a new status
  const initiateStatusChange = (rowId, newStatus, type) => {
    if (requiresConfirmation(type, newStatus)) {
      setPendingStatusChange({ id: rowId, newStatus, type });
      setStatusConfirmInput("");
      setShowStatusConfirmModal(true);
      return;
    }
    performStatusChange(rowId, newStatus);
  };

  // Merge and normalize data
  const tableData = useMemo(() => {
    if (!data?.data) return [];

    const equipment = (data.data.equipmentRequests || []).map((req) => ({
      ...req,
      type: (
        <div className="flex items-center gap-2 pl-2 py-1 rounded">
          <Bolt className="text-amber-600" size={18} />
          <p>Equipment</p>
        </div>
      ),
      id: req._id,
      employee: req.employeeId?.firstName + " " + req.employeeId?.lastName,
      employeeEmail: req.employeeId?.email,
      priority: req.priority
        ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1)
        : "Medium",
      status: (
        <StatusComponent
          status={req.status || "pending"}
          type="Equipment"
          rowId={req._id}
          onStatusChange={initiateStatusChange}
          updatingId={updatingId}
          isUpdatingEquipment={isUpdatingEquipment}
          isUpdatingMaintenance={isUpdatingMaintenance}
          isUpdatingLearnings={isUpdatingLearnings}
          getAllowedNextStatuses={getAllowedNextStatuses}
          statusLabel={statusLabel}
          getStatusColor={getStatusColor}
          openStatusMenuId={openStatusMenuId}
          setOpenStatusMenuId={setOpenStatusMenuId}
          statusMenuRef={statusMenuRef}
        />
      ),
      rawStatus: req.status || "pending",
      needBy: req.expectedDate,
      equipmentName: req.equipmentName,
      purpose: req.purpose,
      quantity: req.quantity,
      image: req.image,
    }));

    const maintenance = (data.data.maintenanceRequests || []).map((req) => ({
      ...req,
      type: (
        <div className="flex items-center gap-2 pl-2 py-1 rounded">
          <Wrench className="text-orange-600" size={18} />
          <p>Maintenance</p>
        </div>
      ),
      id: req._id,
      employee: req.employeeId?.firstName + " " + req.employeeId?.lastName,
      employeeEmail: req.employeeId?.email,
      priority: req.priority
        ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1)
        : "Medium",
      status: (
        <StatusComponent
          status={req.status || "pending"}
          type="Maintenance"
          rowId={req._id}
          onStatusChange={initiateStatusChange}
          updatingId={updatingId}
          isUpdatingEquipment={isUpdatingEquipment}
          isUpdatingMaintenance={isUpdatingMaintenance}
          isUpdatingLearnings={isUpdatingLearnings}
          getAllowedNextStatuses={getAllowedNextStatuses}
          statusLabel={statusLabel}
          getStatusColor={getStatusColor}
          openStatusMenuId={openStatusMenuId}
          setOpenStatusMenuId={setOpenStatusMenuId}
          statusMenuRef={statusMenuRef}
        />
      ),
      rawStatus: req.status || "pending",
      needBy: req.expectedDate,
      equipmentName: req.equipmentName,
      problemDescription: req.problemDescription,
      damageDate: req.damageDate,
      image: req.image,
    }));

    const educational = (data.data.educationalRequests || []).map((req) => ({
      ...req,
      type: (
        <div className="flex items-center gap-2 pl-2 py-1 rounded">
          <BookOpenText className="text-indigo-500" size={18} />
          <p>Educational</p>
        </div>
      ),
      id: req._id,
      employee: req.employeeId?.firstName + " " + req.employeeId?.lastName,
      employeeEmail: req.employeeId?.email,
      priority: req.priority
        ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1)
        : "Medium",
      status: (
        <StatusComponent
          status={req.status || "pending"}
          type="Educational"
          rowId={req._id}
          onStatusChange={initiateStatusChange}
          updatingId={updatingId}
          isUpdatingEquipment={isUpdatingEquipment}
          isUpdatingMaintenance={isUpdatingMaintenance}
          isUpdatingLearnings={isUpdatingLearnings}
          getAllowedNextStatuses={getAllowedNextStatuses}
          statusLabel={statusLabel}
          getStatusColor={getStatusColor}
          openStatusMenuId={openStatusMenuId}
          setOpenStatusMenuId={setOpenStatusMenuId}
          statusMenuRef={statusMenuRef}
        />
      ),
      rawStatus: req.status || "pending",
      needBy: req.expectedCompletionDate,
      equipmentName: req.topicTitle,
      purpose: req.topicDescription,
      preferredLearningFormat: req.preferredLearningFormat,
      justification: req.justification,
    }));

    return [...equipment, ...maintenance, ...educational];
  }, [
    data,
    updatingId,
    isUpdatingEquipment,
    isUpdatingMaintenance,
    isUpdatingLearnings,
    openStatusMenuId,
  ]);

  const columns = [
    "type",
    "equipmentName",
    "employee",
    "priority",
    "status",
    "needBy",
    "Action",
  ];

  // Click-away listener for status menu
  useEffect(() => {
    if (openStatusMenuId !== null) {
      const handleClick = (e) => {
        if (
          statusMenuRef.current &&
          !statusMenuRef.current.contains(e.target)
        ) {
          setOpenStatusMenuId(null);
        }
      };

      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openStatusMenuId]);

  // Click-away listener for add application dropdown
  useEffect(() => {
    if (addApplicationDropdownOpen) {
      const handleClick = (e) => {
        if (
          addApplicationDropdownRef.current &&
          !addApplicationDropdownRef.current.contains(e.target)
        ) {
          setAddApplicationDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [addApplicationDropdownOpen]);

  // Helper: safely extract type text (for confirm dialog etc.)
  const getTypeTextSafe = (row) => {
    if (!row) return "application";
    const raw = row.type;
    if (raw && typeof raw === "object") {
      // defensive optional chaining
      return (
        raw?.props?.children?.[1]?.props?.children ||
        raw?.props?.children?.[1] ||
        "application"
      );
    }
    if (typeof raw === "string") return raw || "application";
    return "application";
  };

  // Remove edit and delete actions
  const renderCell = (col, value, row, helpers) => {
    const { getPriorityColor, getStatusColor, openModal, openConfirm } =
      helpers;
    if (col === "priority") {
      return (
        <Badge variant="outline" className={getPriorityColor(value)}>
          {value}
        </Badge>
      );
    }
    if (col === "status") {
      return value;
    }
    if (col === "needBy") {
      return formatDate(value);
    }
    if (col === "Action") {
      // Only show Edit/Delete if status is "pending"
      const isPending =
        row.rawStatus === "pending" ||
        (typeof row.status === "string" &&
          row.status.toLowerCase() === "pending");
      return (
        <div className="flex items-center gap-1">
          <Tooltip text="View Details" position="left">
            <button
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setModalRow(row);
                setModalOpen(true);
              }}
            >
              <Eye size={18} />
            </button>
          </Tooltip>
          {isPending && (
            <>
              <Tooltip text="Edit" position="left">
                <button
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-yellow-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                >
                  <Edit size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Delete" position="left">
                <button
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    helpers.openConfirm(row);
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      );
    }
    return value;
  };

  // Patch modalContent to remove inner scroll, use modalRef
  const modalContent = (row, { close, getPriorityColor, getStatusColor }) => {
    const typeText =
      typeof row.type === "object"
        ? row.type.props.children[1].props.children
        : row.type;

    const allowedNextStatuses = getAllowedNextStatuses(row.rawStatus, typeText);
    const isFinalStatus =
      (typeText === "Equipment" &&
        (row.rawStatus === "approved" || row.rawStatus === "rejected")) ||
      (typeText === "Maintenance" &&
        (row.rawStatus === "completed" || row.rawStatus === "cancelled")) ||
      (typeText === "Educational" &&
        (row.rawStatus === "approved" || row.rawStatus === "rejected"));

    const getTypeIcon = () => {
      switch (typeText) {
        case "Equipment":
          return <Bolt className="w-5 h-5 text-primary" />;
        case "Maintenance":
          return <Wrench className="w-5 h-5 text-primary" />;
        case "Educational":
          return <BookOpenText className="w-5 h-5 text-primary" />;
        default:
          return <Eye className="w-5 h-5 text-primary" />;
      }
    };

    return (
      <>
        <div className="w-[650px] max-w-full" ref={modalRef}>
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">{getTypeIcon()}</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {typeText} Request Details
                </h2>
                <p className="text-sm text-gray-500">
                  View {typeText.toLowerCase()} request information
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
                  <span className="text-gray-500">
                    {typeText === "Educational" ? "Topic Title:" : "Name:"}
                  </span>
                  <p className="font-medium text-gray-900 break-words">
                    {row.equipmentName}
                  </p>
                </div>

                {typeText === "Equipment" && (
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium text-gray-900">{row.quantity}</p>
                  </div>
                )}

                <div>
                  <span className="text-gray-500">Priority:</span>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={getPriorityColor(row.priority)}
                    >
                      {row.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1 flex flex-col gap-2">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        row.rawStatus,
                        typeText
                      )} px-3 w-fit min-w-[90px]`}
                    >
                      {updatingId === row.id &&
                      (isUpdatingEquipment ||
                        isUpdatingMaintenance ||
                        isUpdatingLearnings)
                        ? "Updating..."
                        : statusLabel(row.rawStatus, typeText)}
                    </Badge>
                    {/* Removed status change dropdown/select here */}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Need By:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(row.needBy)}
                  </p>
                </div>

                {typeText === "Maintenance" && (
                  <div>
                    <span className="text-gray-500">Damage Date:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(row.damageDate)}
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <span className="text-gray-500">Employee:</span>
                  <p className="font-medium text-gray-900">
                    {row.employee} ({row.employeeEmail})
                  </p>
                </div>
              </div>
            </div>

            {/* Purpose / Description */}
            {typeText !== "Educational" && (
              <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-lg p-4 border border-primary/20">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {typeText === "Maintenance" ? "Problem / Purpose" : "Purpose"}
                </h3>
                <div className="space-y-4">
                  {typeText === "Maintenance" && (
                    <div className="bg-white/80 rounded-lg p-4 border border-white/50 text-sm leading-relaxed text-gray-800">
                      <p className="font-semibold mb-1 text-gray-700">
                        Problem Description:
                      </p>
                      <p>
                        {row.problemDescription || "No problem description."}
                      </p>
                    </div>
                  )}
                  <div className="bg-white/80 rounded-lg p-4 border border-white/50 text-sm leading-relaxed text-gray-800">
                    <p className="font-semibold mb-1 text-gray-700">Purpose:</p>
                    <p>{row.purpose || "No purpose provided."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Educational Specific */}
            {typeText === "Educational" && (
              <div className="bg-gradient-to-br from-primary/5 to-indigo-50 rounded-lg p-4 border border-primary/20 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Educational Details
                </h3>
                <div className="bg-white/80 rounded-lg p-4 border border-white/50 text-sm leading-relaxed text-gray-800 space-y-3">
                  <div>
                    <p className="font-semibold mb-1 text-gray-700">
                      Description:
                    </p>
                    <p>{row.purpose || "No description provided."}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-gray-700">
                      Preferred Format:
                    </p>
                    <p>{row.preferredLearningFormat || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-gray-700">
                      Justification:
                    </p>
                    <p>{row.justification || "No justification provided."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            {row.image && row.image.length > 0 && (
              <div className="bg-gradient-to-br from-primary/5 to-amber-50 rounded-lg p-4 border border-primary/20">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Attached Images
                </h3>
                <div className="bg-white/80 rounded-lg p-4 border border-white/50">
                  <div className="flex flex-wrap gap-3">
                    {row.image.map((img, idx) =>
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

  const [learningEditModalOpen, setLearningEditModalOpen] = useState(false);
  const [learningEditRequest, setLearningEditRequest] = useState(null);

  // inside component
  const handleEdit = (row) => {
    // Find the raw backend request object by ID and type
    let requestData = null;
    const typeText =
      typeof row.type === "object"
        ? row.type.props.children[1].props.children
        : row.type;

    if (typeText === "Equipment") {
      requestData = data?.data?.equipmentRequests?.find(
        (req) => req._id === row.id
      );
      navigate(getEditRoute(row), { state: { requestData } });
    } else if (typeText === "Maintenance") {
      requestData = data?.data?.maintenanceRequests?.find(
        (req) => req._id === row.id
      );
      navigate(getEditRoute(row), { state: { requestData } });
    } else if (typeText === "Educational") {
      requestData = data?.data?.educationalRequests?.find(
        (req) => req._id === row.id
      );
      setLearningEditRequest(requestData);
      setLearningEditModalOpen(true);
    }
  };

  // added delete handler
  const handleDelete = async (row) => {
    const typeText =
      typeof row.type === "object"
        ? row.type.props.children[1].props.children
        : row.type;
    try {
      if (typeText === "Equipment") {
        await deleteEquipmentRequest(row.id).unwrap();
      } else if (typeText === "Maintenance") {
        await deleteMaintenanceRequest(row.id).unwrap();
      } else if (typeText === "Educational") {
        await deleteLearningRequest(row.id).unwrap();
      }
      toast.success("Deleted", "Request deleted successfully.");
      refetch();
    } catch (e) {
      toast.error("Delete Failed", "Unable to delete request.");
    }
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-">
      {/* Header with Search and Filter */}
      <div className="mb-5">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-900">All Applications</h2>

          <div className="ml-2 pt-2 cursor-pointer">
            <Tooltips
              text="View and manage all equipment, maintenance, and educational requests.
Track request status, priority, and expected completion dates.
Easily filter, search, and review application details.
Update statuses and keep your organization's requests organized."
              position={isMobile ? "bottom" : "right"}
            >
              <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </Tooltips>
          </div>
        </div>
        <p className="text-gray-600 mt-1">
          View all equipment, maintenance, and educational requests
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3">
        <div>
          <Tabs
            defaultValue={selectedTab}
            className=""
            onValueChange={(value) => {
              setSelectedTab(value);
            }}
            value={selectedTab}
          >
            <TabsList className="flex px-2">
              <TabsTrigger
                value="maintenance"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold rounded-none h-14 px-4 flex-shrink-0 transition-all duration-200"
              >
                Maintenance
              </TabsTrigger>
              <TabsTrigger
                value="equipment"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold rounded-none h-14 px-4 flex-shrink-0 transition-all duration-200"
              >
                Equipment
              </TabsTrigger>
              <TabsTrigger
                value="educational"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 px-4 flex-shrink-0"
              >
                Education
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <FloatingInput
            className="min-w-64"
            label="Search applications..."
            type="text"
            value={search}
            onChange={handleSearchChange}
          />
          <div className="flex items-center gap-2">
            <button
              className="border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={() => setFilterPanelOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {/* Add Application Button with Dropdown */}
            <div className="relative">
              <button
                className="text-nowrap bg-primary text-white rounded-md px-3 py-2 flex items-center gap-2 hover:bg-primary-dark transition-colors"
                onClick={() =>
                  setAddApplicationDropdownOpen(!addApplicationDropdownOpen)
                }
              >
                Add Application
                <ChevronDown className="h-4 w-4" />
              </button>

              {addApplicationDropdownOpen && (
                <div
                  ref={addApplicationDropdownRef}
                  className="absolute right-0 top-full mt-2 bg-white border rounded-md shadow-lg min-w-[180px] z-10"
                >
                  <button
                    className="text-nowrap w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      setAddApplicationDropdownOpen(false);
                      navigate("/equipment/new");
                    }}
                  >
                    <Bolt className="h-4 w-4 text-amber-600" />
                    Equipment Request
                  </button>
                  <button
                    className="text-nowrap w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      setAddApplicationDropdownOpen(false);
                      navigate("/maintenance/new");
                    }}
                  >
                    <Wrench className="h-4 w-4 text-orange-600" />
                    Maintenance Request
                  </button>
                  <button
                    className="text-nowrap w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      setAddApplicationDropdownOpen(false);
                      navigate("/learning-requests/new");
                    }}
                  >
                    <BookOpenText className="h-4 w-4 text-indigo-500" />
                    Educational Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {filterPanelOpen && (
        <FilterPanel
          filter={filter}
          setFilter={handleFilterChange}
          setFilterPanelOpen={setFilterPanelOpen}
          filterOptions={{
            type: REQUEST_TYPES,
            status: REQUEST_STATUSES,
            priority: REQUEST_PRIORITIES,
            dateRange: {
              type: "dateRange",
              label: "Date Range",
            },
          }}
          optionLabels={{
            type: {
              all: "All Types",
              equipment: "Equipment",
              maintenance: "Maintenance",
              educational: "Educational",
            },
            status: {
              pending: "Pending",
              approved: "Approved",
              rejected: "Rejected",
              "in-review": "In Review",
              "in-progress": "In Progress",
              completed: "Completed",
              cancelled: "Cancelled",
            },
            priority: {
              low: "Low",
              medium: "Medium",
              urgent: "Urgent",
            },
          }}
        />
      )}

      {/* Active Filters */}
      <ActiveFilters
        filter={{ ...filter, search }}
        onRemove={(key, val) => {
          if (key === "dateRange") {
            const updated = { ...filter };
            updated[key] = { from: "", to: "" };
            handleFilterChange(updated);
          } else if (key === "search") {
            setSearch("");
          } else {
            const updated = { ...filter };
            updated[key] = updated[key].filter((v) => v !== val);
            handleFilterChange(updated);
          }
        }}
        optionLabels={{
          type: {
            all: "All Types",
            equipment: "Equipment",
            maintenance: "Maintenance",
            educational: "Educational",
          },
          status: {
            pending: "Pending",
            approved: "Approved",
            rejected: "Rejected",
            "in-review": "In Review",
            "in-progress": "In Progress",
            completed: "Completed",
            cancelled: "Cancelled",
          },
          priority: {
            low: "Low",
            medium: "Medium",
            urgent: "Urgent",
          },
        }}
      />

      {/* Table */}
      <ApplicationTablePage
        title=""
        subtitle=""
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        renderCell={renderCell}
        modalContent={(row, helpers) => null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        confirmDialogTitle="Delete Request"
        confirmDialogMessage={(row) => {
          const typeText = getTypeTextSafe(row);
          return `Are you sure you want to delete this ${typeText.toLowerCase()} request? This action cannot be undone.`;
        }}
        isDeleting={
          isDeletingEquipment || isDeletingMaintenance || isDeletingLearning
        }
        employeeId={employeeId || true}
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
                getPriorityColor,
                getStatusColor,
              })}
          </div>
        </div>
      )}
      {learningEditModalOpen && (
        <LearningRequestUpdateModal
          open={learningEditModalOpen}
          onClose={() => setLearningEditModalOpen(false)}
          request={learningEditRequest}
          onSuccess={() => {
            setLearningEditModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Pagination */}
      {(() => {
        const totalFetched =
          (data?.data?.pagination?.totalEquipment || 0) +
          (data?.data?.pagination?.totalMaintenance || 0) +
          (data?.data?.pagination?.totalEducational || 0);
        return (
          totalFetched > 0 && (
            <Pagination
              currentCount={tableData.length}
              totalCount={totalFetched}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              limit={limit}
              setLimit={setLimit}
            />
          )
        );
      })()}

      {/* Confirmation Modal for Status Change */}
      {showStatusConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-red-600">
                Confirm Status Change
              </h3>
              <button
                onClick={() => {
                  setShowStatusConfirmModal(false);
                  setStatusConfirmInput("");
                  setPendingStatusChange({
                    id: null,
                    newStatus: null,
                    type: null,
                  });
                }}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
            <p className="mb-3 text-sm">
              Are you sure you want to change this request&apos;s status to{" "}
              <span className="font-semibold capitalize text-red-600">
                {pendingStatusChange.newStatus}
              </span>
              ?
            </p>
            <p className="mb-4 text-sm">
              Type <span className="font-bold">Confirm</span> below to proceed:
            </p>
            <input
              value={statusConfirmInput}
              onChange={(e) => setStatusConfirmInput(e.target.value)}
              placeholder='Type "Confirm"'
              className="w-full border-b border-gray-300 focus:border-primary outline-none pb-1 text-sm mb-5"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowStatusConfirmModal(false);
                  setStatusConfirmInput("");
                  setPendingStatusChange({
                    id: null,
                    newStatus: null,
                    type: null,
                  });
                }}
                className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              {statusConfirmInput.trim().toLowerCase() === "confirm" && (
                <button
                  disabled={updatingId === pendingStatusChange.id}
                  onClick={() =>
                    performStatusChange(
                      pendingStatusChange.id,
                      pendingStatusChange.newStatus
                    )
                  }
                  className="px-4 py-2 rounded-md text-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-60"
                >
                  {updatingId === pendingStatusChange.id
                    ? "Updating..."
                    : "Confirm Change"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
