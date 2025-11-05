import React, { useState, useEffect } from "react";
import {
  FileUp,
  Trash2,
  Layers,
  FolderDown,
  Database,
  CircleAlert,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  useGetDropboxByEmployeeQuery,
  useCreateDropboxEntryMutation,
  useDeleteDropboxEntryMutation,
  useUpdateDropboxEntryMutation,
  useGetDocumentsSharedWithMeQuery,
} from "@/redux/features/dropbox/dropboxApiSlice";

import { useGetAdminConfigQuery } from "@/redux/features/admin/adminControl/adminControlApiSlice";

import UploadDropboxModal from "./components/UploadDropboxModal";
import EditDropboxModal from "./components/EditDropboxModal";
// import ShareDropboxModal from "./components/ShareDropboxModal";
import DropboxCard from "./components/DropboxCard";
import { Badge } from "@/component/badge";
import Button from "@/component/Button";
import Loader from "@/component/Loader";
import ErrorMessage from "@/component/isError";
import Pagination from "@/component/Pagination";
import { FloatingInput } from "@/component/FloatiingInput";
import { toast } from "@/component/Toast";
import { skipToken } from "@reduxjs/toolkit/query";
import Tooltips from "@/component/Tooltip2";

export default function DropboxPage() {
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;
  const departmentId = user?.user?.department?._id;

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("my"); // "my" or "shared"

  const { data, isLoading, isError, error, refetch } =
    useGetDropboxByEmployeeQuery(
      {
        employeeId,
        page: currentPage,
        limit,
        search: debouncedSearch,
      },
      {
        refetchOnMountOrArgChange: true,
      }
    );

  const [createDropboxEntry] = useCreateDropboxEntryMutation();
  const [deleteDropboxEntry] = useDeleteDropboxEntryMutation();
  const [updateDropboxEntry] = useUpdateDropboxEntryMutation();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: sharedData,
    isLoading: isSharedLoading,
    isError: isSharedError,
    error: sharedError,
    refetch: refetchShared,
  } = useGetDocumentsSharedWithMeQuery(
    employeeId && departmentId ? { employeeId, departmentId } : skipToken
  );

  const documents = React.useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    if (activeTab === "shared") {
      return (sharedData?.data || []).filter((doc) =>
        doc.docName.toLowerCase().includes(lowerSearch)
      );
    }

    return (data?.data || []).filter((doc) =>
      doc.docName.toLowerCase().includes(lowerSearch)
    );
  }, [activeTab, sharedData, data, debouncedSearch]);

  // storage call
  const { data: adminConfig } = useGetAdminConfigQuery();
  const getBytesFromUnit = (value, unit) => {
    const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    return value * (units[unit] || units.MB); // default to MB
  };

  const recentDocuments = documents.filter((doc) => {
    const uploaded = new Date(doc.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return uploaded >= sevenDaysAgo;
  });

  const trashedDocuments = documents.filter((doc) => doc.isDeleted);

  // Dynamic pagination based on active tab
  const totalDocuments =
    activeTab === "shared"
      ? (sharedData?.data || []).length
      : data?.pagination?.totalDocs || 0;

  const paginatedDocuments = documents.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const maxStorageValue = user?.user?.storageLimit?.value || 800;
  const maxStorageUnit = user?.user?.storageLimit?.unit || "MB";
  const MAX_STORAGE_BYTES = getBytesFromUnit(maxStorageValue, maxStorageUnit);
  const MAX_STORAGE_MB = MAX_STORAGE_BYTES / 1024 / 1024;

  const { data: allDocumentsData, refetch: refetchAllDocuments } =
    useGetDropboxByEmployeeQuery(
      {
        employeeId,
        page: 1, // Fetch the first page
        limit: 1000, // Set a high limit to fetch all documents
      },
      {
        refetchOnMountOrArgChange: true,
      }
    );

  const totalUsedBytes = (allDocumentsData?.data || []).reduce((total, doc) => {
    return (
      total +
      (doc.files?.reduce((sum, file) => sum + (file.fileSize || 0), 0) || 0)
    );
  }, 0);

  const usedStorageMB = totalUsedBytes / 1024 / 1024;
  const usedStorageRounded = usedStorageMB.toFixed(2);

  const remainingStorageMB = Math.max(
    MAX_STORAGE_MB - usedStorageMB,
    0
  ).toFixed(2);

  const usagePercentage = Math.min(
    (usedStorageMB / MAX_STORAGE_MB) * 100,
    100
  ).toFixed(2);

  const remainingPercentage = (100 - usagePercentage).toFixed(2);

  const handleDeleteDropbox = async (id) => {
    try {
      await deleteDropboxEntry(id).unwrap();
      refetch();
      refetchAllDocuments(); // Refresh storage data
    } catch (err) {
      console.error("Delete failed:", err);
      throw err;
    }
  };

  const handleAddFileToDoc = (doc) => {
    setActiveDoc(doc);
    setAddFileModalOpen(true);
  };

  const handleUploadSubmit = async (formData) => {
    const payload = {
      ...activeDoc,
      files: [...(activeDoc.files || []), ...formData.files],
    };
    await updateDropboxEntry({ id: activeDoc._id, data: payload });
  };

  const handleUpdate = async (updatedDoc) => {
    await updateDropboxEntry({ id: updatedDoc._id, data: updatedDoc });
    setEditModalOpen(false);
    refetch();
  };

  const handleEditSubmit = async (updatedDoc) => {
    try {
      await updateDropboxEntry({
        id: updatedDoc._id,
        data: {
          files: updatedDoc.files,
        },
      }).unwrap();

      setEditModalOpen(false);
      await refetch();
      await refetchAllDocuments(); // Refresh storage data
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed", "Document update failed");
    }
  };

  if (isLoading || (activeTab === "shared" && isSharedLoading)) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (isError || (activeTab === "shared" && isSharedError)) {
    return (
      <ErrorMessage
        error={activeTab === "shared" ? sharedError : error}
        message="Failed to load documents."
      />
    );
  }

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-primary/40 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Section: Icon + Text */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-primary/20 shrink-0">
            <FolderDown size={28} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">Dropbox</h1>
              <Tooltips
                text="Dropbox is your secure document vault. Upload, manage, and share files with your team. Track your storage usage and access shared documents here."
                position="right"
              >
                <CircleAlert
                  className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  size={20}
                />
              </Tooltips>
            </div>
            <p className="text-sm text-gray-600 leading-snug">
              Securely store your important documents
            </p>
            <Badge variant="outline" className="mt-1 w-fit">
              {user?.user?.fullName || "Your"} Vault
            </Badge>
          </div>
        </div>

        {/* Upload Button */}
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => setUploadModalOpen(true)}
            variant="primary"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            <FileUp size={16} className="mr-2" />
            Upload New
          </Button>
        </div>
      </div>

      {/* Enhanced Storage Overview Section with Gradient Bars */}
      <div className="bg-gradient-to-br from-[#fffdf9] to-[#f6f4f0] border border-gray-200 rounded-xl px-6 py-6 shadow-md space-y-5 transition-all">
        <div className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Database className="text-primary" size={18} />
          Storage Overview{" "}
          <span className="text-sm text-gray-500">
            ({MAX_STORAGE_MB}MB total)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Used Storage */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-700 font-medium mb-2 flex justify-between">
              <span>Used Storage</span>
              <span className="text-primary font-bold">
                {usedStorageRounded}MB / {MAX_STORAGE_MB}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usagePercentage}%`,
                  background: "linear-gradient(90deg, #6366f1, #a855f7)",
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Remaining: {remainingStorageMB}MB
            </p>
          </div>

          {/* Reserved for Trash (Placeholder) */}
          {/* <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-700 font-medium mb-2 flex justify-between">
              <span>Reserved for Trash</span>
              <span className="text-yellow-600 font-bold">0MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: "0%",
                  background: "linear-gradient(90deg, #facc15, #fbbf24)",
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Auto-purged regularly</p>
          </div> */}

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-700 font-medium mb-2 flex justify-between">
              <span>Shared With You</span>
              <span className="text-indigo-600 font-bold">
                {sharedData?.data?.length || 0} Docs
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (sharedData?.data?.length || 0) * 10,
                    100
                  )}%`,
                  background: "linear-gradient(90deg, #6366f1, #a855f7)",
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on current shared items
            </p>
          </div>

          {/* Total Utilization */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-700 font-medium mb-2 flex justify-between">
              <span>Total Utilization</span>
              <span className="text-emerald-600 font-bold">
                {usagePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usagePercentage}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Available: {remainingPercentage}%
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-[#f7f4ef] p-1 rounded-full border border-[#e2ded4] w-fit shadow-sm">
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "my"
              ? "bg-primary text-white shadow hover:bg-primary/75"
              : "text-gray-700 hover:bg-[#ece6dd]"
          }`}
          onClick={() => {
            setActiveTab("my");
            setCurrentPage(1); // Reset to first page when switching tabs
          }}
        >
          My Documents
        </button>

        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "shared"
              ? "bg-primary text-white shadow hover:bg-primary/75"
              : "text-gray-700 hover:bg-[#ece6dd]"
          }`}
          onClick={() => {
            setActiveTab("shared");
            setCurrentPage(1); // Reset to first page when switching tabs
          }}
        >
          Shared With Me
        </button>
      </div>

      {/* Search Field */}
      <div className="w-full flex justify-end mt-4">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <FloatingInput
            name="search"
            label="Search by Document Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
          />
        </div>
      </div>

      {/* Dynamic Document Cards */}
      {(activeTab === "shared"
        ? sharedData?.data?.length || 0
        : data?.data?.length || 0) === 0 ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-300 bg-white/60">
          <FolderDown className="h-10 w-10 text-gray-400 mb-4" />
          <p className="text-sm md:text-base font-medium text-gray-600">
            No documents{" "}
            {activeTab === "shared" ? "shared yet" : "uploaded yet"}.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {activeTab === "shared"
              ? "Files shared with you will appear here."
              : "Upload your first document to get started."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex flex-col gap-5 w-full sm:w-1/2">
            {paginatedDocuments
              .filter((_, index) => index % 2 === 0)
              .map((doc) => (
                <DropboxCard
                  key={doc._id}
                  doc={doc}
                  isExpanded={expandedCardId === doc._id}
                  onToggleExpand={() =>
                    setExpandedCardId((prev) =>
                      prev === doc._id ? null : doc._id
                    )
                  }
                  onDelete={handleDeleteDropbox}
                  onAddFile={handleAddFileToDoc}
                  onEditClick={(doc) => {
                    setSelectedDoc(doc);
                    setEditModalOpen(true);
                  }}
                  refetch={refetch}
                />
              ))}
          </div>

          <div className="flex flex-col gap-5 w-full sm:w-1/2">
            {paginatedDocuments
              .filter((_, index) => index % 2 === 1)
              .map((doc) => (
                <DropboxCard
                  key={doc._id}
                  doc={doc}
                  isExpanded={expandedCardId === doc._id}
                  onToggleExpand={() =>
                    setExpandedCardId((prev) =>
                      prev === doc._id ? null : doc._id
                    )
                  }
                  onDelete={handleDeleteDropbox}
                  onAddFile={handleAddFileToDoc}
                  onEditClick={(doc) => {
                    setSelectedDoc(doc);
                    setEditModalOpen(true);
                  }}
                  refetch={refetch}
                />
              ))}
          </div>
        </div>
      )}

      <UploadDropboxModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={async (formData) => {
          await createDropboxEntry({
            employeeId: user?.user?._id,
            docName: formData.docName,
            files: formData.files,
          }).unwrap();
          setUploadModalOpen(false);
          await refetch();
          await refetchAllDocuments(); // Refresh storage data
        }}
        totalUsedBytes={totalUsedBytes} // ← make sure this is defined
        maxAllowedBytes={MAX_STORAGE_MB * 1024 * 1024} // convert MB to bytes
      />

      <EditDropboxModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialValues={selectedDoc}
        usedStorageMB={usedStorageMB}
        maxStorageMB={MAX_STORAGE_MB}
      />

      <Pagination
        totalCount={totalDocuments}
        limit={limit}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setLimit={setLimit}
      />
    </div>
  );
}
