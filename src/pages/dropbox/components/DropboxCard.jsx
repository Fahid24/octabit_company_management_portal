import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ShareDropboxModal from "./ShareDropboxModal";
import {
  MoreVertical,
  Trash2,
  Eye,
  Download,
  ChevronDown,
  FileText,
  PlusCircle,
  Paperclip,
  HardDrive,
  Share2,
  Lock,
  Globe2,
  Image as ImageIcon,
} from "lucide-react";
import ReusableDeleteModal from "./ReusableDeleteModal";
import { toast } from "@/component/Toast";
import {
  useDeleteDropboxFileMutation,
  useShareDropboxEntryMutation,
} from "@/redux/features/dropbox/dropboxApiSlice";
import { useGetSingleEmployeeStatsByIdQuery } from "@/redux/features/employee/employeeApiSlice";
import { useGetEmployeeByIdQuery } from "@/redux/features/admin/employee/employeeApiSlice";

export default function DropboxCard({
  doc,
  onDelete,
  isExpanded,
  onToggleExpand,
  onEditClick,
  refetch,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDeleteModalOpen, setFileDeleteModalOpen] = useState(false);
  const [fileMenuOpenId, setFileMenuOpenId] = useState(null);
  const [deleteDropboxFile, { isLoading: isDeletingFile }] =
    useDeleteDropboxFileMutation();

  const [selectedDocForDelete, setSelectedDocForDelete] = useState(null);
  const [docDeleteModalOpen, setDocDeleteModalOpen] = useState(false);

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDropboxId, setSelectedDropboxId] = useState(null);

  const [shareDropboxEntry] = useShareDropboxEntryMutation();
  const user = useSelector((state) => state.userSlice.user);

  const created = new Date(doc.createdAt).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const { data: creatorData } = useGetEmployeeByIdQuery(doc.employeeId);
  // console.log("Creator Data: ", creatorData);

  const updated = new Date(doc.updatedAt).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const menuRef = useRef(null);
  const fileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutsideFileMenu = (event) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
        setFileMenuOpenId(null);
      }
    };

    if (fileMenuOpenId) {
      document.addEventListener("mousedown", handleClickOutsideFileMenu);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFileMenu);
    };
  }, [fileMenuOpenId]);

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-600 mb-1" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="w-8 h-8 text-blue-600 mb-1" />;
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-700 mb-1" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-8 h-8 text-green-600 mb-1" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500 mb-1" />;
    }
  };

  return (
    <div
      className="w-full h-fit bg-white border border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition"
      onClick={onToggleExpand}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <ChevronDown
            size={18}
            className={`mt-1 text-primary cursor-pointer transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          />
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base md:text-md font-semibold text-gray-800 max-w-full truncate">
              {doc.docName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs md:text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                {doc.files?.length || 0} attachment
                {doc.files?.length === 1 ? "" : "s"}
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                {(
                  (doc.files?.reduce((sum, f) => sum + (f.fileSize || 0), 0) ||
                    0) /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="flex items-center gap-1 text-gray-700 font-semibold">
                {doc.sharedWith && doc.sharedWith.length > 0 ? (
                  <>
                    <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Only Me</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              className="absolute top-8 right-0 bg-white rounded-md shadow z-10 w-36 text-sm"
              ref={menuRef}
            >
              {/* Preview */}
              <button
                className="flex w-full px-4 py-2 items-center hover:bg-gray-50"
                onClick={() => window.open(doc.files[0]?.fileUrl, "_blank")}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>

              {/* Share */}
              {doc.employeeId === user?.user?._id && (
                <>
                  <button
                    className="flex w-full px-4 py-2 items-center hover:bg-gray-50 text-primary"
                    onClick={() => {
                      setSelectedDropboxId(doc._id);
                      setShareModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>

                  {/* Delete */}
                  <button
                    className="flex w-full px-4 py-2 items-center text-red-500 hover:bg-gray-50"
                    onClick={() => {
                      setSelectedDocForDelete(doc);
                      setDocDeleteModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="mt-5 space-y-4">
          {/* Show creator only if sharedWith exists */}
          {doc.sharedWith?.length > 0 &&
            creatorData &&
            (doc.employeeId?._id || doc.employeeId) !== user?.user?._id && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary/10 text-primary rounded-full p-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.45 0 4.747.662 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Created By
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Name */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-md p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Name
                    </p>
                    <p className="text-sm text-gray-800">
                      {(creatorData?.firstName || "") +
                        " " +
                        (creatorData?.lastName || "")}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-md p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Department
                    </p>
                    <p className="text-sm text-gray-800">
                      {creatorData?.department?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Timeline Section */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/10 text-primary rounded-full p-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-800">Timeline</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-800">{created}</p>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-gray-800">{updated}</p>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 relative">
            {/* Title and + icon row */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                Attachments ({doc.files?.length || 0})
              </h3>
              {doc.employeeId === user?.user?._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick?.(doc);
                  }}
                  className="text-primary hover:text-primary/80"
                  title="Edit Document"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Grid of attachments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doc.files?.map((file, i) => {
                const isPdf = file.docType?.toLowerCase().includes("pdf");
                return (
                  <div
                    key={file._id || i}
                    onClick={() => window.open(file.fileUrl, "_blank")}
                    className="relative flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-4 text-center shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* File Icon */}
                    <div className="mb-2">
                      {getFileIcon(file.fileUrl || file.name || "")}
                    </div>

                    {/* File Info */}
                    <p className="text-sm font-medium text-gray-700 truncate w-full mb-1">
                      {file.docType || "Attachment"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.fileSize
                        ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                        : "Unknown size"}
                    </p>

                    {/* File Menu Trigger */}
                    <button
                      className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileMenuOpenId((prev) =>
                          prev === file._id ? null : file._id
                        );
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* File Menu Dropdown */}
                    {fileMenuOpenId === file._id && (
                      <div
                        ref={fileMenuRef}
                        className="absolute top-8 right-2 bg-white shadow rounded text-sm z-30 w-36"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 w-full text-gray-700"
                          onClick={() => {
                            window.open(file.fileUrl, "_blank");
                            setFileMenuOpenId(null);
                          }}
                        >
                          <Eye size={14} /> View
                        </button>
                        {doc.employeeId === user?.user?._id && (
                          <button
                            className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-gray-50 w-full"
                            onClick={() => {
                              setSelectedFile({ ...file });
                              setFileDeleteModalOpen(true);
                              setFileMenuOpenId(null);
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FILE DELETE MODAL */}
      <ReusableDeleteModal
        open={fileDeleteModalOpen}
        onClose={() => {
          setFileDeleteModalOpen(false);
          setSelectedFile(null);
        }}
        loading={isDeletingFile}
        title="Delete File?"
        description={`Are you sure you want to delete "${
          selectedFile?.docType || "this file"
        }"? This cannot be undone.`}
        onConfirm={async () => {
          if (!selectedFile) {
            throw new Error("No file selected");
          }

          const res = await deleteDropboxFile({
            dropboxId: doc._id,
            fileId: selectedFile._id,
          }).unwrap();
          refetch();

          toast.success("File deleted successfully!");

          setFileDeleteModalOpen(false);
          setSelectedFile(null);
        }}
      />

      {/* DOCUMENT DELETE MODAL */}
      <ReusableDeleteModal
        open={docDeleteModalOpen}
        onClose={() => {
          setDocDeleteModalOpen(false);
          setSelectedDocForDelete(null);
        }}
        loading={false}
        title="Delete Document?"
        description={`Are you sure you want to delete "${selectedDocForDelete?.docName}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (!selectedDocForDelete) {
            throw new Error("No document selected");
          }

          await onDelete(selectedDocForDelete._id);
          toast.success("Document deleted successfully!");

          setDocDeleteModalOpen(false);
          setSelectedDocForDelete(null);
        }}
        refetch={refetch}
      />
      {isShareModalOpen && selectedDropboxId && (
        <ShareDropboxModal
          isOpen={isShareModalOpen}
          onClose={() => setShareModalOpen(false)}
          dropboxId={selectedDropboxId}
        />
      )}
    </div>
  );
}
