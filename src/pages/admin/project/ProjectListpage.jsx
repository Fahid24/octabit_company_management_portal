"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BuildingIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  MoreVertical,
  CircleAlert,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/component/badge";
import Button from "@/component/Button";
import { Card } from "@/component/card";
import {
  useGetProjectsQuery,
  useSoftDeleteProjectMutation,
  useUpdateProjectMutation,
} from "@/redux/features/admin/project/projectApiSlice";
import Pagination from "@/component/Pagination";
import ConfirmDialog from "@/component/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import Table from "@/component/Table";
import FilterPanel from "@/component/FilterPanel";
import ActiveFilters from "@/component/ActiveFilters";
import Loader from "@/component/Loader";
import { FloatingInput } from "@/component/FloatiingInput";
import Tooltip from "@/component/Tooltip";
import { successAlert } from "@/utils/allertFunction";
import { useSelector } from "react-redux";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook
import { toast } from "@/component/Toast";

export default function ProjectListPage() {
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const [expandedCards, setExpandedCards] = useState({});
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuType, setMenuType] = useState(null);
  const [openMenu, setOpenMenu] = useState({ id: null, type: null });

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Keep your original filter structure for UI
  const [filter, setFilter] = useState({
    status: [], // Multiple status selection as before
    startDate: { from: "", to: "" },
    dueDate: { from: "", to: "" },
    endDate: { from: "", to: "" },
  });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const loginUser = useSelector((state) => state.userSlice.user);

  // Transform filter for API call
  const apiFilters = {
    page: currentPage,
    limit: limit,
    search: search,
    status: filter.status.join(","), // Send first status to API or empty
    employeeId: "",
    startDate: filter.startDate,
    dueDate: filter.dueDate,
    endDate: filter.endDate,
    departmentHead:
      loginUser?.user?.role === "DepartmentHead" ? loginUser?.user?._id : null,
  };

  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectsQuery(apiFilters);

  const [softDeleteProject] = useSoftDeleteProjectMutation();

  const [updateProject] = useUpdateProjectMutation();

  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [filter, search, currentPage, limit]); // Refetch when any filter changes

  const toggleMenu = (id, type) => {
    // console.log("Id:", id, "Type:", type);

    if (openMenuId === id && menuType === type) {
      setOpenMenuId(null);
      setMenuType(null);
    } else {
      setOpenMenuId(id);
      setMenuType(type);
    }
  };

  const handleUpdate = async (projectId, status) => {
    // console.log(projectId, status);
    try {
      await updateProject({
        id: projectId,
        data: { status: status },
      }).unwrap();
      setOpenMenuId(null);

      // successAlert({
      //   title: "Project Status Updated",
      //   message: `Project status updated to ${status}`,
      // });
      toast.success("Success", `Project status updated to ${status}`);
      refetch();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-menu")) {
        setOpenMenuId(null);
        setMenuType(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredStatusOptions = (currentStatus) => {
    const allStatuses = [
      "NotStarted",
      "InProgress",
      "Completed",
      "Reviewed",
      "OnHold",
      "Cancelled",
    ];
    return allStatuses.filter((status) => status !== currentStatus);
  };

  // Safety checks for data with comprehensive fallbacks
  const projects = Array.isArray(apiData?.projects) ? apiData?.projects : [];
  const pagination = apiData?.pagination || {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Client-side filtering to support multiple status selection
  const activeProjects = projects?.filter((p) => {
    if (!p || p?.isDeleted) return false;

    // Multiple status filter (client-side)
    if (filter.status.length > 0 && !filter.status.includes(p.status)) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "NotStarted":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "InProgress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Reviewed":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "OnHold":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const onSoftDelete = async (id) => {
    setLoading(true);
    try {
      await softDeleteProject(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Soft delete failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onSoftDelete(deleteId);
      setDeleteId(null);
      setConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirmOpen(false);
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 ">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900 text-center md:text-left">
              Manage Project
            </h2>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="View and manage all organization projects in one place.
Track project status, start, due, and end dates easily.
Quickly update, view details, or delete any project.
Use filters and search to find specific projects fast."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            Manage your organization&apos;s projects
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search Field */}
          <FloatingInput
            className="min-w-64"
            label="Search Projects..."
            type="text"
            value={search}
            onChange={handleSearchChange}
          />
          <div className="flex items-center gap-4">
            <button
              className="border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={() => setFilterPanelOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <Button
              onClick={() => navigate("/create-project")}
              className="flex items-center gap-2 min-w-40"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {filterPanelOpen && (
        <FilterPanel
          filter={filter}
          setFilter={handleFilterChange}
          setFilterPanelOpen={setFilterPanelOpen}
          filterOptions={{
            status: [
              "NotStarted",
              "InProgress",
              "Completed",
              "Reviewed",
              "OnHold",
              "Cancelled",
            ],
            startDate: {
              type: "dateRange",
              label: "Start Date Range",
            },
            dueDate: {
              type: "dateRange",
              label: "Due Date Range",
            },
            endDate: {
              type: "dateRange",
              label: "End Date Range",
            },
          }}
          optionLabels={{
            status: {
              NotStarted: "Not Started",
              InProgress: "In Progress",
              OnHold: "On Hold",
            },
          }}
        />
      )}

      <ActiveFilters
        filter={{ ...filter, search }}
        onRemove={(key, val) => {
          if (["startDate", "dueDate", "endDate"].includes(key)) {
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
          status: {
            NotStarted: "Not Started",
            InProgress: "In Progress",
            OnHold: "On Hold",
          },
        }}
      />

      {isLoading || isFetching ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader />
        </div>
      ) : activeProjects?.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <BuildingIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-sm">
              Get started by creating your first project.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="bg-white shadow mt-5  overflow-x-auto sm:rounded-lg">
            <Table
              isLoading={isLoading || isFetching}
              columns={[
                "Name",
                "Status",
                "Start Date",
                "Due Date",
                "End Date",
                "Actions",
              ]}
              data={activeProjects.map((project) => ({
                Name: project?.name || "Untitled Project",
                Status: project?.status,
                "Start Date": project?.startDate,
                "Due Date": project?.dueDate,
                "End Date": project?.endDate,
                Actions: project,
                _raw: project,
              }))}
              renderCell={(col, value, row) => {
                // console.log("Row: ", row?.Actions?._id);

                if (col === "Status") {
                  return (
                    <div className="flex items-center">
                      <Badge className={getStatusColor(value)}>
                        {value === "NotStarted"
                          ? "Not Started"
                          : value || "Unknown"}
                      </Badge>
                      <div className="relative ml-2 dropdown-menu">
                        <Tooltip
                          text={`Change status (current: ${value})`}
                          position="left"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(row?.Actions?._id, "status");
                            }}
                            className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <MoreVertical size={14} className="mt-1" />
                          </button>
                        </Tooltip>
                        {openMenuId === row?.Actions?._id &&
                          menuType === "status" && (
                            <div
                              className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                {getFilteredStatusOptions(value).map(
                                  (option) => (
                                    <button
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleUpdate(row?.Actions?._id, option);
                                        setOpenMenu({ id: null, type: null }); // Close menu
                                      }}
                                      className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 capitalize"
                                    >
                                      {option === "NotStarted"
                                        ? "Not Started"
                                        : option}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
                if (["Start Date", "Due Date", "End Date"].includes(col)) {
                  return value
                    ? format(new Date(value), "MMM dd, yyyy")
                    : "N/A";
                }
                if (col === "Actions") {
                  const project = value;
                  return (
                    <div className="flex gap-3 items-center">
                      <Tooltip text="View Details" position="top">
                        <button
                          className="hover:text-blue-500"
                          onClick={() =>
                            navigate(`/single-project/${project?._id}`)
                          }
                        >
                          <Eye size={16} />
                        </button>
                      </Tooltip>

                      <Tooltip text="Update Project Details" position="top">
                        <button
                          type="button"
                          className="hover:text-orange-500"
                          onClick={() =>
                            navigate(`/update-project/${project?._id}`)
                          }
                        >
                          {" "}
                          <Edit size={16} />
                        </button>
                      </Tooltip>

                      <Tooltip text="Delete Project" position="top">
                        <button
                          className="hover:text-red-500"
                          onClick={() => handleDeleteClick(project?._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  );
                }
                return value;
              }}
            />
          </div>
          {pagination && (
            <div className="mt-6 px-4 sm:px-0">
              <Pagination
                currentCount={activeProjects?.length}
                totalCount={pagination?.totalDocs}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
