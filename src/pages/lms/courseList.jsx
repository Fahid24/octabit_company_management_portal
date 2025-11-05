import {
  useGetCourseSummaryQuery,
  useGetCourseByIdQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
} from "@/redux/features/lms/lmsApiSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";
import { Badge } from "@/component/badge";
import { Progress } from "@/component/Progress";
import {
  Edit,
  Trash2,
  Users,
  BookOpen,
  TrendingUp,
  PlusCircle,
  Star,
  Play,
  Eye,
  Filter,
  CircleAlert,
} from "lucide-react";
import Button from "@/component/Button";
import { useState, useEffect } from "react";
import ConfirmDialog from "@/component/ConfirmDialog";
import Loader from "@/component/Loader";
import defaultThumbnail from "@/assets/Thumbnail.png";
import LazyImage from "../../utils/LazyImage";
import Pagination from "@/component/Pagination";
import FilterPanel from "@/component/FilterPanel";
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice";
import ActiveFilters from "@/component/ActiveFilters";
import { FloatingInput } from "@/component/FloatiingInput";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile"; // Import useIsMobile hook

export default function CourseList() {
  const isMobile = useIsMobile(); // Use the custom hook to check if the device is mobile
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  // console.log(search);
  const [filter, setFilter] = useState({ category: [], level: [], status: [] });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const {
    data: response = {},
    isLoading,
    isError,
    refetch,
  } = useGetCourseSummaryQuery({
    page,
    limit,
    level: filter.level.join(","),
    department: filter.category.join(","),
    status: filter.status.join(","),
    search: search,
  });

  const filteredCourses = response.data || [];

  const totalDocs = response.pagination?.totalDocs || 0;
  const totalPages = response.pagination?.totalPages || 1;

  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const { data: fetchedCourse, isLoading: isFetchingCourse } =
    useGetCourseByIdQuery(selectedCourseId, { skip: !selectedCourseId });
  const location = useLocation();
  const [deleteCourse, { isLoading: isDeleting, error: deleteError }] =
    useDeleteCourseMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [
    updateCourse,
    { isLoading: isUpdatingStatus, error: updateStatusError },
  ] = useUpdateCourseMutation();
  const [updatingId, setUpdatingId] = useState(null);

  const { data: departmentsData } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
    isPopulate: true,
  });
  const departmentOptions = Array.isArray(departmentsData?.data)
    ? departmentsData.data
        .filter((d) => !d.isDeleted)
        .map((dept) => ({ id: dept._id, name: dept.name }))
    : [];

  const totalStudents = filteredCourses.reduce(
    (sum, course) => sum + course.enrolledStudents,
    0
  );
  const avgCompletion = filteredCourses.length
    ? Math.round(
        filteredCourses.reduce(
          (sum, course) => sum + course.completionRate,
          0
        ) / filteredCourses.length
      )
    : 0;

  const handleEdit = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleDeleteClick = (courseId) => {
    setPendingDeleteId(courseId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    setConfirmOpen(false);
    try {
      await deleteCourse(pendingDeleteId).unwrap();
      refetch();
    } catch {
      // Optionally handle error
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleToggleStatus = async (course) => {
    setUpdatingId(course.id || course._id);
    try {
      await updateCourse({
        id: course.id || course._id,
        courseData: {
          status: course.status === "Published" ? "Draft" : "Published",
        },
      }).unwrap();
      refetch();
    } catch {
      // Optionally handle error
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  const handleFilterChange = (updatedFilter) => {
    setFilter(updatedFilter);

    // console.log("Filter changed:", filter.level);
  };

  // Navigate when fetchedCourse is loaded
  useEffect(() => {
    if (fetchedCourse && selectedCourseId) {
      navigate(`/lms/course-edit/${selectedCourseId}`, {
        state: { course: fetchedCourse },
      });
      setSelectedCourseId(null);
    }
  }, [fetchedCourse, selectedCourseId, navigate]);

  useEffect(() => {
    if (location.state?.refetch) {
      refetch();
    }
  }, [location.state, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }
  if (isError) return <div>Error loading modules.</div>;

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 ">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-semibold leading-tight text-gray-900">
              Manage Modules
            </h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="View, create, and manage all learning modules here.
Track total modules, enrollments, and completion rates.
Edit, publish, or delete modules as needed.
Monitor learner progress and keep your catalog up to date."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm md:text-base text-gray-600">
            Manage Your Modules and Track Enroller Progress
          </p>
        </div>
        <Button
          className="flex items-center"
          onClick={() => navigate("/lms/course-create")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Module
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrolled
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletion}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Sort, Search, and Filter Controls - Responsive for Mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-6">
        {/* <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="font-medium mb-1 sm:mb-0 sm:mr-2">Sort by:</label>
          <select className="border border-gray-300 rounded-md px-2 py-1 w-full sm:w-auto">
            <option value="lastName">Last name</option>
            <option value="firstName">First name</option>
            <option value="status">Status</option>
          </select>
        </div> */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full sm:w-auto">
          {/* <input
            type="text"
            placeholder="Search by name or email"
            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64"
          /> */}
          <FloatingInput
            className="min-w-64"
            label="Search By Module Name"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => setFilterPanelOpen(true)}
            type="button"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterPanelOpen && (
        <FilterPanel
          filter={filter}
          setFilter={setFilter}
          setFilterPanelOpen={setFilterPanelOpen}
          filterOptions={{
            level: ["Beginner", "Intermediate", "Advanced"],
            category: departmentOptions,
            status: ["Published", "Draft"],
          }}
          optionLabels={{
            category: departmentOptions.reduce((acc, d) => {
              acc[d.id] = d.name;
              return acc;
            }, {}),
          }}
        />
      )}

      {/* Active Filters Display */}
      <ActiveFilters
        filter={filter}
        onRemove={(key, val) => {
          const updated = { ...filter };
          updated[key] = updated[key].filter((v) => v !== val);
          setFilter(updated);
        }}
        optionLabels={{
          category: departmentOptions.reduce((acc, d) => {
            acc[d.id] = d.name;
            return acc;
          }, {}),
        }}
      />

      {/* Courses Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Module Catalog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group transition-all bg-white duration-300 overflow-hidden border-0 shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              {/* Course Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                {course.thumbnail ? (
                  <LazyImage
                    src={course.thumbnail}
                    alt={course.title}
                    imgClass="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    containerClass="relative h-48 overflow-hidden"
                  />
                ) : (
                  <LazyImage
                    src={defaultThumbnail}
                    alt={course.title}
                    imgClass="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    containerClass="relative h-48 overflow-hidden"
                  />
                )}
                {/* Fallback gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hidden group-hover:opacity-90 transition-opacity duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-80" />
                      <div className="text-sm font-medium opacity-90">
                        {course.modules} Modules
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      course.status === "Published" ? "default" : "secondary"
                    }
                    className={`${
                      course.status === "Published"
                        ? "bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-lg"
                    }`}
                  >
                    {course.status}
                  </Badge>
                </div>

                {/* Level badge */}
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="outline"
                    className="bg-white/90 text-gray-700 border-white/50 backdrop-blur-sm"
                  >
                    {course.level}
                  </Badge>
                </div>

                {/* Play button overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-8 w-8 text-white fill-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Module count overlay */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                    {course.modules} Modules
                  </div>
                </div>
              </div>{" "}
              <CardContent className="p-6 bg-white">
                {/* Course Title */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Learning Path • {course.level} Level
                  </p>
                </div>

                {/* Departments */}
                {course.departments && course.departments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.departments.slice(0, 2).map((dept) => (
                      <Badge
                        key={dept._id}
                        variant="outline"
                        className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
                      >
                        {dept.name}
                      </Badge>
                    ))}
                    {course.departments.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        +{course.departments.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Course Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {course.enrolledStudents}
                        </span>
                        <span>Enrolled</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {course.completionRate / 100}
                        </span>
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        Course Progress
                      </span>
                      <span className="font-bold text-gray-900">
                        {course.completionRate}%
                      </span>
                    </div>
                    <Progress
                      value={course.completionRate}
                      className="h-2 bg-gray-200"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {Math.round(
                        (course.completionRate / 100) * course.enrolledStudents
                      )}{" "}
                      of {course.enrolledStudents} completed
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course.id || course._id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(course)}
                    disabled={
                      isUpdatingStatus &&
                      updatingId === (course.id || course._id)
                    }
                  >
                    {isUpdatingStatus &&
                    updatingId === (course.id || course._id) ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        {course.status === "Published" ? "Draft" : "Publish"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(course.id || course._id)}
                    disabled={
                      isDeleting && deletingId === (course.id || course._id)
                    }
                  >
                    {isDeleting && deletingId === (course.id || course._id) ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No Modules found
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Start building your learning platform by creating your first
              module
            </p>
            {/* <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            className="bg-primary hover:bg-primary/90"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <span>New Leave Request</span>
            </div>
          </Button> */}
          </div>
        )}
      </div>

      {isFetchingCourse && (
        <div className="text-center text-blue-600 mt-4">
          Loading module data...
        </div>
      )}

      {deleteError && (
        <div className="text-center text-red-600 mt-4">
          Error deleting module.
        </div>
      )}

      {updateStatusError && (
        <div className="text-center text-red-600 mt-4">
          Error updating module status.
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Module?"
        message="Are you sure you want to delete this module? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {filteredCourses.length !== 0 && (
        <Pagination
          totalCount={totalDocs}
          limit={limit}
          currentPage={page}
          setCurrentPage={handlePageChange}
          setLimit={handleLimitChange}
          className="mt-6"
        />
      )}
    </div>
  );
}
