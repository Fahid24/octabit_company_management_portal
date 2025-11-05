import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetProjectsByEmployeeQuery,
  useGetSharedProjectsByEmployeeQuery,
  useAddCredentialToProjectMutation,
  useUpdateCredentialInProjectMutation,
  useDeleteCredentialInProjectMutation,
  useCreateProjectWithCredentialsMutation,
  useDeleteProjectByIdMutation,
} from "@/redux/features/passmanager/passmanagerApiSlice";
import OwnerInfo from "./components/OwnerInfo";

import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";
import { Badge } from "@/component/badge";
import {
  Lock,
  KeyRound,
  Plus,
  Trash2,
  FileEdit,
  FolderKanban,
  Bookmark,
  AlignLeft,
  Mail,
  MoreVertical,
  Copy,
  Share2,
  Globe2,
  FolderOpen,
  CircleAlert,
} from "lucide-react";
import Tooltip from "@/component/Tooltip";
import { ChevronDown } from "lucide-react";
import Button from "@/component/Button";
import { toast } from "@/component/Toast";
import PasswordCell from "./components/PasswordCell";
import DeleteModal from "./components/DeleteModal";
import ReusableFormModal from "./components/ReusableFormModal";
import Pagination from "@/component/Pagination";
import { FloatingInput } from "@/component/FloatiingInput";
import SharePassModal from "./components/SharePassModal";
import Tooltips from "@/component/Tooltip2";

export default function PasswordManager() {
  const [openProjects, setOpenProjects] = useState({});
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my"); // "my" or "shared"
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const toggleProject = (projectId) => {
    setOpenProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;
  const departmentId = user?.user?.department?._id;

  // Query for my projects
  const {
    data: myData,
    isLoading: myLoading,
    isError: myError,
    error: myErrorDetail,
    refetch: refetchMy,
  } = useGetProjectsByEmployeeQuery(employeeId);

  // Query for shared projects - now properly structured
  const {
    data: sharedData,
    isLoading: sharedLoading,
    isError: sharedError,
    error: sharedErrorDetail,
    refetch: refetchShared,
  } = useGetSharedProjectsByEmployeeQuery(
    employeeId && departmentId
      ? { employeeId, departmentId }
      : { employeeId, departmentId: null },
    {
      skip: !employeeId,
    }
  );
  // console.log("sharedData", sharedData);
  // console.log("myData", myData);
  // Remove the try-catch wrapper since we're now properly using the hook
  // Determine current data based on active tab
  const isLoading = activeTab === "my" ? myLoading : sharedLoading;
  const isError = activeTab === "my" ? myError : sharedError;
  const error = activeTab === "my" ? myErrorDetail : sharedErrorDetail;
  const refetch = activeTab === "my" ? refetchMy : refetchShared;

  let allProjects = [];
  if (activeTab === "my") {
    allProjects = myData?.data || [];
  } else {
    allProjects = sharedData?.data || [];
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter projects based on search term
  const filteredProjects = React.useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    if (!lowerSearch) return allProjects;

    return allProjects.filter((project) => {
      // Search in project name
      const projectNameMatch = project.projectName
        .toLowerCase()
        .includes(lowerSearch);

      // Search in credentials (title, description, email)
      const credentialMatch = project.credentials?.some(
        (cred) =>
          cred.title?.toLowerCase().includes(lowerSearch) ||
          cred.description?.toLowerCase().includes(lowerSearch) ||
          cred.email?.toLowerCase().includes(lowerSearch)
      );

      // For shared projects, also search in owner information
      const ownerMatch =
        activeTab === "shared" && project.createdBy
          ? project.createdBy.fullName?.toLowerCase().includes(lowerSearch) ||
            project.createdBy.email?.toLowerCase().includes(lowerSearch)
          : false;

      return projectNameMatch || credentialMatch || ownerMatch;
    });
  }, [allProjects, debouncedSearch, activeTab]);

  // Sort filtered projects by number of credentials (descending)
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => (b.credentials?.length || 0) - (a.credentials?.length || 0)
  );

  // Calculate pagination - ensure this matches DropboxPage pattern
  const totalProjects = sortedProjects.length;
  const totalPages = Math.ceil(totalProjects / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const projects = sortedProjects.slice(startIndex, endIndex);

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate statistics based on active tab (use all projects, not paginated)
  const allMyProjects = myData?.data || [];
  const allSharedProjects = sharedData?.data || [];
  const statsProjects = activeTab === "my" ? allMyProjects : allSharedProjects;

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editModal, setEditModal] = useState({
    open: false,
    credential: null,
    projectId: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: null,
    type: null, // "project" or "credential"
    projectId: null, // required for credential only
  });

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [deleteProjectById] = useDeleteProjectByIdMutation();
  const [addCredentialToProject] = useAddCredentialToProjectMutation();
  const [updateCredentialInProject] = useUpdateCredentialInProjectMutation();
  const [deleteCredentialInProject] = useDeleteCredentialInProjectMutation();
  const [createProjectWithCredentials] =
    useCreateProjectWithCredentialsMutation();

  const handleAddPassword = async (formData) => {
    try {
      await addCredentialToProject({
        projectId: selectedProjectId,
        ...formData,
      }).unwrap();
      toast.success("Added", "Credential added successfully.");
      setAddModalOpen(false);
      refetchMy();
      if (refetchShared) refetchShared();
    } catch (err) {
      toast.error("Error", "Failed to add credential.");
    }
  };

  const handleUpdate = async (credId, updatedData, projectId) => {
    try {
      await updateCredentialInProject({
        projectId,
        credentialId: credId,
        ...updatedData,
      }).unwrap();
      toast.success("Updated", "Credential updated successfully.");
      setEditModal({ open: false, credential: null, projectId: null });
      refetchMy();
      if (refetchShared) refetchShared();
    } catch (err) {
      toast.error("Error", "Failed to update credential.");
    }
  };
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProjectById(projectId).unwrap();
      toast.success("Deleted", "Project deleted successfully.");
      refetchMy();
      if (refetchShared) refetchShared();
    } catch (err) {
      toast.error("Error", "Failed to delete project.");
    }
  };

  const handleDelete = async (credId, projectId) => {
    try {
      await deleteCredentialInProject({
        projectId,
        credentialId: credId,
      }).unwrap();
      toast.success("Deleted", "Credential deleted.");
      setDeleteModal({ open: false, credential: null, projectId: null });
      refetchMy();
      if (refetchShared) refetchShared();
    } catch (err) {
      toast.error("Error", "Failed to delete credential.");
    }
  };

  const [shareModal, setShareModal] = useState({
    open: false,
    type: null, // "project" or "credential"
    project: null,
    credential: null,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  if (isError) return <ErrorMessage error={error} refetch={refetch} />;

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-6">
      {/* Header */}

      <div className="bg-white rounded-lg shadow-sm border border-primary/40 p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/20">
            <KeyRound size={32} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Password Manager</h1>
              <Tooltips
                text="Securely manage and share project credentials. Create projects, add passwords, and control access for your team."
                position="right"
              >
                <CircleAlert
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  size={20}
                />
              </Tooltips>
            </div>
            <p className="text-sm text-gray-600">
              Project-based secure credential storage
            </p>
            <Badge variant="outline" className="mt-1">
              {user?.user?.firstName || "Your"}'s Vault
            </Badge>
          </div>
        </div>

        {/* Add Project Button - only show for "my" tab */}
        {activeTab === "my" && (
          <Button
            variant="primary"
            className="bg-primary hover:bg-primary/90"
            onClick={() => setNewProjectModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-700 font-semibold">
              {activeTab === "my" ? "My Projects" : "Shared Projects"}
            </h2>
            <div className="bg-yellow-100 text-yellow-600 rounded-full p-2">
              <FolderKanban size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statsProjects.length}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === "my" ? "Your project vaults" : "Shared with you"}
          </p>
        </div>

        {/* Total Credentials */}
        <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-700 font-semibold">Total Credentials</h2>
            <div className="bg-green-100 text-green-600 rounded-full p-2">
              <Lock size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statsProjects.reduce(
              (acc, p) => acc + (p.credentials?.length || 0),
              0
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Available password entries
          </p>
        </div>

        {/* Empty Projects */}
        <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-700 font-semibold">Empty Projects</h2>
            <div className="bg-red-100 text-red-500 rounded-full p-2">
              <FolderOpen size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {
              statsProjects.filter((p) => (p.credentials?.length || 0) === 0)
                .length
            }
          </div>
          <p className="text-sm text-gray-500 mt-1">No credentials yet</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-[#fefdfc] p-1 rounded-full border border-[#d9e8f5] w-fit shadow-sm">
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "my"
              ? "bg-primary text-white shadow hover:bg-[#7594ee]"
              : "text-gray-700 hover:bg-[#ece6dd]"
          }`}
          onClick={() => {
            setActiveTab("my");
            setCurrentPage(1);
            setSearchTerm("");
          }}
        >
          My Passwords
        </button>
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "shared"
              ? "bg-primary text-white shadow hover:bg-[#7594ee]"
              : "text-gray-700 hover:bg-[#ece6dd]"
          }`}
          onClick={() => {
            setActiveTab("shared");
            setCurrentPage(1);
            setSearchTerm("");
          }}
        >
          Shared With Me
        </button>
      </div>

      {/* Search Field */}
      <div className="w-full flex justify-end">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <FloatingInput
            name="search"
            label="Search projects or credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
          />
        </div>
      </div>

      {/* Results Summary */}
      {(debouncedSearch || projects.length !== statsProjects.length) && (
        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
          {debouncedSearch && (
            <span>
              Showing {totalProjects} result
              {totalProjects !== 1 ? "s" : ""} for "{debouncedSearch}"
            </span>
          )}
          {!debouncedSearch && projects.length !== statsProjects.length && (
            <span>
              Showing {projects.length} of {statsProjects.length} projects (Page{" "}
              {currentPage} of {totalPages})
            </span>
          )}
        </div>
      )}

      {/* No Results Message */}
      {projects.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <div className="text-gray-500 text-lg mb-2">
            {debouncedSearch
              ? "No projects found"
              : activeTab === "shared"
              ? "No shared projects available"
              : "No credential added yet. Create new project to store your credentials."}
          </div>
          {debouncedSearch && (
            <div className="text-gray-400 text-sm">
              Try adjusting your search terms or{" "}
              <button
                onClick={() => setSearchTerm("")}
                className="text-primary underline hover:text-primary/80"
              >
                clear search
              </button>
            </div>
          )}
          {!debouncedSearch && activeTab === "my" && (
            <div className="text-gray-400 text-sm">
              <button
                onClick={() => setNewProjectModalOpen(true)}
                className="text-primary underline hover:text-primary/80"
              >
                Create your first project
              </button>
            </div>
          )}
          {!debouncedSearch && activeTab === "shared" && (
            <div className="text-gray-400 text-sm">
              Projects shared with you will appear here
            </div>
          )}
        </div>
      )}

      {/* Projects List */}
      {projects.map((project) => (
        <Card
          key={project._id}
          className="rounded-xl border bg-white shadow-sm"
        >
          {/* Project Name at Top Left, Dropdown Icon at Top Right */}
          <CardHeader className="rounded-tr-xl rounded-tl-xl px-6 pt-4 pb-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15">
            <div className="flex items-center justify-between w-full">
              {/* Left side: title & credential count */}
              <div
                onClick={() => toggleProject(project._id)}
                className="cursor-pointer flex-1"
              >
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {project.projectName}
                  {activeTab === "shared" && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Shared
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  {project.credentials.length} credentials saved
                  {/* Visibility state for "my" tab */}
                  {activeTab === "my" ? (
                    project.sharedWith && project.sharedWith.length > 0 ? (
                      <>
                        <Globe2 size={15} className="text-gray-700 ml-2" />
                        <span className="text-gray-700 font-medium">
                          Public
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} className="text-gray-500 ml-2" />
                        <span className="text-gray-500 font-medium">
                          Only Me
                        </span>
                      </>
                    )
                  ) : null}
                  {/* Creator info for shared tab */}
                  {activeTab === "shared" && (
                    <OwnerInfo
                      createdBy={
                        project.createdBy ||
                        project.employeeId ||
                        project.ownerId
                      }
                      label="Shared by"
                    />
                  )}
                </div>
              </div>

              {/* Right side: conditional delete + toggle + share */}
              <div className="flex items-center gap-2">
                {/* Share Project Button */}
                {activeTab === "my" && (
                  <Tooltip text="Share Project" position="left">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-blue-500"
                      onClick={() =>
                        setShareModal({
                          open: true,
                          type: "project",
                          project,
                          credential: null,
                        })
                      }
                      title="Share Project"
                    >
                      <Share2 size={18} /> {/* Changed icon */}
                    </button>
                  </Tooltip>
                )}

                {/* Show delete button only if project has NO credentials AND it's in "my" tab */}
                {activeTab === "my" && project.credentials.length === 0 && (
                  <Tooltip text="Delete Project" position="left">
                    <button
                      className="p-2 border text-red-500 hover:bg-red-50 rounded-full transition-colors border-red-500"
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          item: project,
                          type: "project",
                          projectId: null,
                        })
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </Tooltip>
                )}

                {/* Expand/Collapse toggle icon */}
                <ChevronDown
                  className={`w-5 h-5 ml-1 transition-transform duration-200 cursor-pointer ${
                    openProjects[project._id] ? "rotate-180" : ""
                  }`}
                  onClick={() => toggleProject(project._id)}
                />
              </div>
            </div>
          </CardHeader>

          {openProjects[project._id] && (
            <CardContent className="p-0">
              {/* Responsive table wrapper */}
              <div className="w-full overflow-x-auto">
                {project.credentials.length > 0 ? (
                  <table className="w-full table-auto min-w-[700px]">
                    <thead className="bg-[#FAFAFA] border-t border-b border-gray-200 text-sm text-gray-600 font-semibold">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <div className="flex items-center gap-2">
                            <Bookmark size={14} />
                            <span>TITLE</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left">
                          <div className="flex items-center gap-2">
                            <AlignLeft size={14} />
                            <span>DESCRIPTION</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left">
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span>EMAIL / USERNAME</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left">
                          <div className="flex items-center gap-2">
                            <Lock size={14} />
                            <span>PASSWORD</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <MoreVertical size={14} />
                            <span>ACTIONS</span>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                      {project.credentials.map((cred) => (
                        <tr
                          key={cred._id}
                          className="hover:bg-gray-50 transition-all"
                        >
                          <td className="px-6 py-4 font-medium">
                            {cred.title}
                          </td>
                          <td
                            className="px-6 py-4 max-w-[240px] truncate text-ellipsis overflow-hidden whitespace-nowrap"
                            title={cred.description}
                          >
                            {cred.description}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span>{cred.email}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(cred.email);
                                  toast.success(
                                    "Copied",
                                    "Email copied to clipboard"
                                  );
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <PasswordCell
                              password={cred.password}
                              readOnly={activeTab === "shared"}
                            />
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <div className="flex gap-2 justify-end">
                              {/* Share Credential Button */}
                              {activeTab === "my" && (
                                <Tooltip
                                  text="Share Credential"
                                  position="left"
                                >
                                  <button
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-blue-500"
                                    onClick={() =>
                                      setShareModal({
                                        open: true,
                                        type: "credential",
                                        project,
                                        credential: cred,
                                      })
                                    }
                                    title="Share Credential"
                                  >
                                    <Share2 size={18} /> {/* Changed icon */}
                                  </button>
                                </Tooltip>
                              )}
                              {/* Edit button - disabled for shared projects or show different behavior */}
                              <Tooltip
                                text={
                                  activeTab === "shared"
                                    ? "View Only"
                                    : "Edit Credential"
                                }
                                position="left"
                              >
                                <button
                                  className={`p-2 hover:bg-blue-50 rounded-full transition-colors border ${
                                    activeTab === "shared"
                                      ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                      : "text-primary border-primary"
                                  }`}
                                  onClick={() => {
                                    if (activeTab === "my") {
                                      setEditModal({
                                        open: true,
                                        credential: cred,
                                        projectId: project._id,
                                      });
                                    }
                                  }}
                                  disabled={activeTab === "shared"}
                                  title={
                                    activeTab === "shared"
                                      ? "View Only"
                                      : "Edit Credential"
                                  }
                                >
                                  <FileEdit size={18} />
                                </button>
                              </Tooltip>
                              {/* Delete button - only show for my projects */}
                              {activeTab === "my" && (
                                <Tooltip
                                  text="Delete Credential"
                                  position="left"
                                >
                                  <button
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-500"
                                    onClick={() =>
                                      setDeleteModal({
                                        open: true,
                                        item: cred,
                                        type: "credential",
                                        projectId: project._id,
                                      })
                                    }
                                    title="Delete Credential"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-gray-500 py-10 text-center">
                    No credentials in this project yet.
                  </div>
                )}
              </div>
              {/* Add Credential Button below table, right aligned - only show for "my" tab */}
              {activeTab === "my" && (
                <div className="flex justify-end px-6 py-4">
                  <Button
                    variant="primary"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setSelectedProjectId(project._id);
                      setAddModalOpen(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add More
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      {/* Pagination - Always show when there are projects, matching DropboxPage style */}
      {totalProjects > 0 && (
        <Pagination
          totalCount={totalProjects}
          limit={limit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setLimit={setLimit}
        />
      )}

      {/* Modals */}
      <ReusableFormModal
        isOpen={addModalOpen}
        title="Add Credential"
        onClose={() => setAddModalOpen(false)}
        onSubmit={(formData) =>
          handleAddPassword({ projectId: selectedProjectId, ...formData })
        }
        fields={[
          { name: "title", label: "Credential Title", required: true },
          { name: "description", label: "Description" },
          {
            name: "email",
            label: "Email / Username",
            type: "email",
            required: true,
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
          },
        ]}
        initialValues={{ title: "", description: "", email: "", password: "" }}
        submitText="Save"
      />

      <ReusableFormModal
        isOpen={editModal.open}
        title="Edit Credential"
        onClose={() =>
          setEditModal({ open: false, credential: null, projectId: null })
        }
        onSubmit={(formData) =>
          handleUpdate(editModal.credential._id, formData, editModal.projectId)
        }
        fields={[
          { name: "title", label: "Credential Title", required: true },
          { name: "description", label: "Description" },
          {
            name: "email",
            label: "Email / Username",
            type: "email",
            required: true,
          },
          { name: "password", label: "New Password", type: "password" },
        ]}
        initialValues={{
          title: editModal.credential?.title || "",
          description: editModal.credential?.description || "",
          email: editModal.credential?.email || "",
          password: "",
        }}
        submitText="Update"
      />

      <ReusableFormModal
        isOpen={newProjectModalOpen}
        title="Create New Project"
        onClose={() => setNewProjectModalOpen(false)}
        onSubmit={(formData) => {
          const payload = {
            projectName: formData.projectName,
            employeeId: user?.user?._id,
            credentials: formData.title
              ? [
                  {
                    title: formData.title,
                    description: formData.description,
                    email: formData.email,
                    password: formData.password,
                  },
                ]
              : [],
          };

          createProjectWithCredentials(payload)
            .unwrap()
            .then(() => {
              toast.success("Created", "New project created successfully.");
              setNewProjectModalOpen(false);
              refetchMy();
              if (refetchShared) refetchShared();
            })
            .catch(() => toast.error("Error", "Failed to create project."));
        }}
        fields={[
          { name: "projectName", label: "Project Name", required: true },
          { name: "title", label: "Credential Title" },
          { name: "description", label: "Description" },
          { name: "email", label: "Email / Username", type: "email" },
          { name: "password", label: "Password", type: "password" },
        ]}
        initialValues={{
          projectName: "",
          title: "",
          description: "",
          email: "",
          password: "",
        }}
        submitText="Create"
        validate={(fd) => {
          const errors = {};
          const email = (fd.email || "").trim();
          const password = (fd.password || "").trim();
          const title = (fd.title || "").trim();

          // If user is adding credential (any of email/password filled), title is required
          if ((email || password) && !title) {
            errors.title =
              "Credential Title is required when adding email or password.";
          }
          return errors;
        }}
      />

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({
            open: false,
            item: null,
            type: null,
            projectId: null,
          })
        }
        onDelete={async () => {
          try {
            if (deleteModal.type === "project") {
              await deleteProjectById(deleteModal.item._id).unwrap();
              toast.success("Deleted", "Project deleted successfully.");
            } else if (deleteModal.type === "credential") {
              await deleteCredentialInProject({
                projectId: deleteModal.projectId,
                credentialId: deleteModal.item._id,
              }).unwrap();
              toast.success("Deleted", "Credential deleted.");
            }

            setDeleteModal({
              open: false,
              item: null,
              type: null,
              projectId: null,
            });
            refetchMy();
            if (refetchShared) refetchShared();
          } catch (err) {
            toast.error("Error", `Failed to delete ${deleteModal.type}.`);
          }
        }}
        item={deleteModal.item}
        type={deleteModal.type}
      />

      {/* Share Modal */}
      <SharePassModal
        isOpen={shareModal.open}
        onClose={() =>
          setShareModal({
            open: false,
            type: null,
            project: null,
            credential: null,
          })
        }
        type={shareModal.type}
        project={shareModal.project}
        credential={shareModal.credential}
      />
    </div>
  );
}
