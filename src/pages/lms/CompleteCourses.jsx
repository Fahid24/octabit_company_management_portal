import { useState, useEffect } from "react"
import { GraduationCap, Filter, CircleAlert, MoreVertical, Check, X } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/component/badge"
import { Card } from "@/component/card"
import Pagination from "@/component/Pagination"
import Table from "@/component/Table"
import FilterPanel from "@/component/FilterPanel"
import ActiveFilters from "@/component/ActiveFilters"
import Loader from "@/component/Loader"
import { FloatingInput } from "@/component/FloatiingInput"
import { useSelector } from "react-redux"
import Tooltips from "@/component/Tooltip2"
import useIsMobile from "@/hook/useIsMobile"
import { useGetCompletedProgressQuery, useUpdateCertificateApprovalMutation } from "@/redux/features/lms/lmsApiSlice"
import { toast } from "@/component/Toast"

export default function CompletedProgressPage() {
    const isMobile = useIsMobile()
    const [openDropdown, setOpenDropdown] = useState(null)

    // Filter state - keeping similar structure to your original
    const [filter, setFilter] = useState({
        role: [], // Multiple role selection
        startDate: { from: "", to: "" },
        endDate: { from: "", to: "" },
    })
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [filterPanelOpen, setFilterPanelOpen] = useState(false)
    const loginUser = useSelector((state) => state.userSlice.user)

    // Transform filter for API call
    const apiFilters = {
        page: currentPage,
        limit: limit,
        search: search,
        role: filter.role.join(","), // Send roles as comma-separated string
        startDate: filter.startDate.from || "",
        endDate: filter.endDate.to || "",
    }

    const { data: apiData, isLoading, isFetching, refetch } = useGetCompletedProgressQuery(apiFilters)
    const [updateApproval, {
        isLoading: isUpdatingApproval, isError: isUpdateError, error: updateError
    }] = useUpdateCertificateApprovalMutation()

    const handleApprovalChange = async (progressId, approved) => {
        try {
            await updateApproval({ progressId, approvedCertificate: approved }).unwrap()
            refetch()
            toast.success(`Certificate ${approved ? "approved" : "rejected"} successfully`)
            setOpenDropdown(null)
        } catch (err) {
            toast.error(err.data?.error || "Failed to update approval status")
        }
    }

    useEffect(() => {
        refetch()
    }, [filter, search, currentPage, limit])

    // Safety checks for data with comprehensive fallbacks
    const completedProgress = Array.isArray(apiData?.data) ? apiData?.data : []
    const pagination = {
        totalDocs: apiData?.count || 0,
        totalPages: apiData?.totalPages || 1,
        page: apiData?.page || 1,
        limit: apiData?.limit || 10,
    }

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter)
        setCurrentPage(1) // Reset to first page when filtering
    }

    const handleSearchChange = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1) // Reset to first page when searching
    }

    // Client-side filtering to support multiple role selection
    const filteredProgress = completedProgress?.filter((progress) => {
        if (!progress) return false
        // Multiple role filter (client-side)
        if (filter.role.length > 0 && !filter.role.includes(progress.user?.role)) {
            return false
        }
        return true
    })

    const getRoleColor = (role) => {
        switch (role) {
            case "Admin":
                return "bg-purple-100 text-purple-700 border-purple-200"
            case "DepartmentHead":
                return "bg-blue-100 text-blue-700 border-blue-200"
            case "Employee":
                return "bg-green-100 text-green-700 border-green-200"
            case "Manager":
                return "bg-orange-100 text-orange-700 border-orange-200"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    return (
      <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 ">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900 text-center md:text-left">
                Completed Progress
              </h2>
              <div className="ml-2 pt-2 cursor-pointer">
                <Tooltips
                  text="View all completed course progress in one place. Track user completions, course details, and completion dates. Use filters and search to find specific progress records fast."
                  position={isMobile ? "bottom" : "right"}
                >
                  <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltips>
              </div>
            </div>
            <p className="text-gray-600 mt-1">
              Track completed course progress across your organization
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search Field */}
            <FloatingInput
              className="min-w-64"
              label="Search users or courses..."
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
            </div>
          </div>
        </div>

        {filterPanelOpen && (
          <FilterPanel
            filter={filter}
            setFilter={handleFilterChange}
            setFilterPanelOpen={setFilterPanelOpen}
            filterOptions={{
              role: ["Admin", "DepartmentHead", "Manager", "Employee"],
              startDate: {
                type: "dateRange",
                label: "Completion Date From",
              },
              endDate: {
                type: "dateRange",
                label: "Completion Date To",
              },
            }}
            optionLabels={{
              role: {
                DepartmentHead: "Department Head",
              },
            }}
          />
        )}

        <ActiveFilters
          filter={{ ...filter, search }}
          onRemove={(key, val) => {
            if (["startDate", "endDate"].includes(key)) {
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
            role: {
              DepartmentHead: "Department Head",
            },
          }}
        />

        {isLoading || isFetching ? (
          <div className="flex justify-center items-center min-h-[80vh]">
            <Loader />
          </div>
        ) : filteredProgress?.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                No completed progress found
              </h3>
              <p className="text-sm">
                No course completions match your current filters.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className=" mt-5  overflow-x-auto sm:rounded-lg">
              <Table
                isLoading={isLoading || isFetching}
                columns={[
                  "User Name",
                  "Email",
                  "Role",
                  "Course Title",
                  "Completed At",
                  "Action",
                ]}
                data={filteredProgress.map((progress) => ({
                  "User Name": progress?.user?.name || "Unknown User",
                  Email: progress?.user?.email || "No Email",
                  Role: progress?.user?.role || "Unknown",
                  "Course Title":
                    progress?.course?.title?.length > 25
                      ? progress?.course?.title?.slice(0, 25) + "..."
                      : progress?.course?.title || "No title",
                  "Course Summary":
                    progress?.course?.summary || "No summary available",
                  "Completed At": progress?.completedAt,
                  Action: (
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={() =>
                          handleApprovalChange(progress.progressId, true)
                        }
                        className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
                          progress.approvedCertificate
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {progress.approvedCertificate && (
                          <Check className="w-3 h-3" />
                        )}
                        {progress.approvedCertificate ? "Approved" : "Approve"}
                      </button>

                      <div className="relative">
                        {progress.approvedCertificate !== false && (
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === progress.progressId
                                  ? null
                                  : progress.progressId
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        )}

                        {openDropdown === progress.progressId && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() =>
                                handleApprovalChange(progress.progressId, false)
                              }
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <X className="w-3 h-3 text-red-600" />
                              {"Reject"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                  _raw: progress,
                }))}
                renderCell={(col, value, row) => {
                  if (col === "Role") {
                    return (
                      <Badge className={getRoleColor(value)}>
                        {value === "DepartmentHead"
                          ? "Department Head"
                          : value || "Unknown"}
                      </Badge>
                    );
                  }
                  if (col === "Completed At") {
                    return value
                      ? format(new Date(value), "MMM dd, yyyy")
                      : "N/A";
                  }
                  if (col === "Course Summary") {
                    return (
                      <div className="max-w-xs">
                        <p
                          className="text-sm text-gray-600 truncate"
                          title={value}
                        >
                          {value || "No summary available"}
                        </p>
                      </div>
                    );
                  }
                  if (col === "Email") {
                    return (
                      <span className="text-sm text-gray-600">
                        {value || "No email"}
                      </span>
                    );
                  }
                  return value;
                }}
              />
            </div>
            {pagination && (
              <div className="mt-6 px-4 sm:px-0">
                <Pagination
                  currentCount={filteredProgress?.length}
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
      </div>
    );
}
