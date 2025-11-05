import {
  Mail,
  Phone,
  Calendar,
  Edit,
  Users,
  Briefcase,
  MapPin,
  FileText,
  Shield,
  AlertCircle,
  User,
  FileCheck,
  Download,
  ExternalLink,
  Upload,
  CircleArrowRight,
  Settings,
  Camera,
  Heart,
  Building2,
  Edit3,
  Hourglass,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Building,
  CreditCard,
  X,
  Eye,
  Star,
  Award,
  IdCard,
  Droplet,
  Book,
  Home,
  Navigation,
  CalendarCheck,
  CalendarX2,
  SunMoon,
} from "lucide-react";

import { Badge } from "@/component/badge";
import Button from "@/component/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/tabs";
import { Separator } from "@/component/separator";
import { useNavigate } from "react-router-dom";
import { useUploadFileMutation } from "@/redux/features/upload/uploadApiSlice";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/employee/employeeApiSlice";
import { toast } from "@/component/Toast";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserPhoto } from "@/redux/features/auth/authSlice";
import verified from "@/assets/verified.png";
import notVerified from "@/assets/notverified.png";
import Tooltip from "@/component/Tooltip";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function EmployeeProfile({ employee, onPhotoUpdate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const fileInputRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(employee?.photoUrl || "");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userSlice.user).user;
  // Permission: only the owner (their own profile) or an Admin can edit
  const canEditProfile = user?._id === employee?._id || user?.role === "Admin";

  useEffect(() => {
    setPhotoUrl(employee?.photoUrl || "");
  }, [employee?.photoUrl]);

  const handleEditPhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await uploadFile(formData).unwrap();
      if (response?.fileUrl) {
        setPhotoUrl(response.fileUrl);
        // Update employee profile photo in DB
        await updateEmployee({ id: employee._id, photoUrl: response.fileUrl });
        if (onPhotoUpdate) onPhotoUpdate(response.fileUrl);
        // console.log(response.fileUrl);
        dispatch(updateUserPhoto(response.fileUrl));
        toast.success("Profile photo updated");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  if (!employee) return <div className="p-6">No employee data found.</div>;

  const fullName = `${employee?.firstName} ${employee?.lastName}`;
  const departmentName = employee?.department?.name || "N/A";
  const initials = `${employee?.firstName?.charAt(
    0
  )}${employee?.lastName?.charAt(0)}`;

  // Status badge color
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Hourglass className="w-4 h-4 text-blue-500" />; // or text-gray-500
      case "Active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "OnLeave":
        return <PauseCircle className="w-4 h-4 text-yellow-500" />;
      case "Terminated":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />; // fallback
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "OnLeave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Terminated":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "emergency", label: "Emergency Contact", icon: Shield },
    { id: "family", label: "Family Members", icon: Users },
    { id: "experience", label: "Experience", icon: Building },
    { id: "assets", label: "Assets", icon: Award },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileType = (url) => {
    if (!url) return "unknown";
    const extension = url.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
      return "image";
    if (["pdf"].includes(extension)) return "pdf";
    return "unknown";
  };

  const VerificationBadge = ({ isVerified, label }) => (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all duration-200 ${
        isVerified
          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 shadow-emerald-100"
          : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 shadow-red-100"
      }`}
    >
      {isVerified ? (
        <CheckCircle className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      <span className="font-medium">
        {isVerified ? "Verified" : "Not Verified"}
      </span>
    </div>
  );

  const InfoCard = ({
    title,
    children,
    className = "",
    enableBadge = false,
    isVerified = false,
    tooltipText = "",
    position = "top",
    icon: Icon,
  }) => (
    <div
      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className="p-2 bg-gradient-to-br from-primary to-[#9f9fe3] rounded-lg shadow-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            {title}
          </h3>
          {enableBadge && (
            <Tooltip text={tooltipText} position={position}>
              <img
                src={isVerified ? verified : notVerified}
                className="h-6 w-6"
                alt=""
              />
            </Tooltip>
          )}
        </div>
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-4 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors duration-200 group">
      {Icon && (
        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-600 block">{label}</span>
        <span className="text-gray-900 font-semibold text-base break-words selection:bg-primary/20 selection:text-primary">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  const DocumentPreview = ({ doc }) => {
    const fileType = getFileType(doc?.fileUrl);

    return (
      <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-2 selection:bg-primary/20 selection:text-primary">
                {doc?.docName || "N/A"}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 selection:bg-primary/20 selection:text-primary">
                {doc?.description || "No description"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary to-primary/40 text-white text-xs font-semibold rounded-full shadow-lg mt-1">
              <Award className="w-3 h-3" />
              {doc?.docType || "N/A"}
            </span>
          </div>

          {doc?.fileUrl && (
            <div className="mt-6">
              <div className="relative group/preview overflow-hidden rounded-xl">
                {fileType === "image" ? (
                  <img
                    src={doc?.fileUrl || "/placeholder.svg"}
                    alt={doc?.docName}
                    className="w-full h-40 object-cover cursor-pointer transition-transform duration-300 group-hover/preview:scale-105"
                    onClick={() => setSelectedDocument(doc)}
                  />
                ) : (
                  <div
                    className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group-hover/preview:scale-105"
                    onClick={() => window.open(doc?.fileUrl, "_blank")}
                  >
                    <div className="text-center">
                      <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-600 font-medium">
                        PDF Document
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/preview:opacity-100">
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        fileType === "image"
                          ? setSelectedDocument(doc)
                          : window.open(doc?.fileUrl, "_blank")
                      }
                      className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
                    >
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(doc?.fileUrl);
                          const blob = await response.blob();
                          const blobUrl = window.URL.createObjectURL(blob);

                          const link = document.createElement("a");
                          link.href = blobUrl;
                          link.download = doc?.docName || "document";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);

                          // Clean up
                          window.URL.revokeObjectURL(blobUrl);
                        } catch (error) {
                          console.error("Download failed:", error);
                          // Fallback to the original method if fetch fails
                          const link = document.createElement("a");
                          link.href = doc?.fileUrl;
                          link.download = doc?.docName || "document";
                          link.click();
                        }
                      }}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
                    >
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ImagePreview = ({ url, alt, fileName, onClick, fileType }) => {
    const getFileType = (url) => {
      if (!url) return "unknown";
      const extension = url.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
        return "image";
      if (["pdf"].includes(extension)) return "pdf";
      return "unknown";
    };

    const determinedFileType = fileType || getFileType(url);

    return (
      <div className="relative group cursor-pointer" onClick={onClick}>
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg group-hover:shadow-xl transition-all duration-300 w-40 h-24">
          {determinedFileType === "image" ? (
            <img
              src={url || "/placeholder.svg"}
              alt={alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center p-2">
                <FileText className="w-6 h-6 text-gray-400 mx-auto" />
                <span className="text-xs text-gray-600 font-medium block mt-1 truncate">
                  {fileName || "Document"}
                </span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                determinedFileType === "image"
                  ? onClick?.()
                  : window.open(url, "_blank");
              }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const response = await fetch(url);
                  const blob = await response.blob();
                  const blobUrl = window.URL.createObjectURL(blob);

                  const link = document.createElement("a");
                  link.href = blobUrl;
                  link.download = fileName || "document";
                  link.click();
                  window.URL.revokeObjectURL(blobUrl);
                } catch (error) {
                  console.error("Download failed:", error);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = fileName || "document";
                  link.click();
                }
              }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AssetPreview = ({ asset }) => {
    return (
      <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-zinc-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-2 selection:bg-primary/20 selection:text-primary">
                {asset?.name || "N/A"}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3 selection:bg-primary/20 selection:text-primary">
                {asset?.description || "No description available"}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary to-primary/40 text-white text-xs font-semibold rounded-full shadow-lg">
                  <Award className="w-3 h-3" />
                  Asset
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  ID: {asset?.productId || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {asset?.documents && asset?.documents?.length > 0 && (
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">
                Asset Documents
              </h5>
              <div className="grid grid-cols-1 gap-3">
                {asset?.documents?.map((docUrl, docIndex) => {
                  const fileType = getFileType(docUrl);
                  const fileName = `Asset Document ${docIndex + 1}`;

                  return (
                    <div
                      key={docIndex}
                      className="relative group/doc overflow-hidden rounded-xl border border-gray-200"
                    >
                      {fileType === "image" ? (
                        <img
                          src={docUrl || "/placeholder.svg"}
                          alt={fileName}
                          className="w-full h-32 object-cover cursor-pointer transition-transform duration-300 group-hover/doc:scale-105"
                          onClick={() =>
                            setSelectedDocument({
                              fileUrl: docUrl,
                              docName: fileName,
                              description: `Document for ${asset?.name}`,
                              docType: "Asset Document",
                            })
                          }
                        />
                      ) : (
                        <div
                          className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group-hover/doc:scale-105"
                          onClick={() => window.open(docUrl, "_blank")}
                        >
                          <div className="text-center">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-gray-600 font-medium text-sm">
                              PDF Document
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover/doc:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/doc:opacity-100">
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              fileType === "image"
                                ? setSelectedDocument({
                                    fileUrl: docUrl,
                                    docName: fileName,
                                    description: `Document for ${asset?.name}`,
                                    docType: "Asset Document",
                                  })
                                : window.open(docUrl, "_blank")
                            }
                            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = docUrl;
                              link.download = fileName;
                              link.click();
                            }}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(!asset?.documents || asset.documents?.length === 0) && (
            <div className="mt-6 p-4 py-10 bg-gray-50 rounded-lg text-center">
              <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No documents available for this asset
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-1 xl:px-0">
      <div className="relative z-10">
        {/* Header */}
        <div className="relative rounded-3xl shadow-lg border border-white/30 p-8 sm:p-8 mb-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-primary/40 to-primary/70 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-2xl ring-4 ring-white/50">
                  {employee?.photoUrl ? (
                    <img
                      src={employee?.photoUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    `${employee?.firstName?.[0] || ""}${
                      employee?.lastName?.[0] || ""
                    }`
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  {/* <VerificationBadge isVerified={employee?.isVerified} /> */}
                  <img
                    src={employee?.isVerified ? verified : notVerified}
                    className="h-9 w-9"
                    alt=""
                  />
                </div>
                <div className="absolute -top-2 right-2">
                  {canEditProfile && (
                    <>
                      <button
                        type="button"
                        className="absolute -top-1 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 border-2 border-primary flex items-center justify-center translate-x-1/2 translate-y-1/2"
                        onClick={handleEditPhotoClick}
                        title="Change Photo"
                        style={{ width: 30, height: 30 }}
                      >
                        <Camera className="text-primary" />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handlePhotoChange}
                        disabled={isLoading}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2 selection:bg-primary/20">
                    {`${employee?.firstName || ""} ${
                      employee?.lastName || ""
                    }`.trim() || "N/A"}
                  </h1>
                  <p className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent mb-2 selection:bg-primary/20">
                    {employee?.designation || "N/A"}
                  </p>
                  <p className="text-gray-600 font-medium selection:bg-primary/20 selection:text-primary">
                    {employee?.department?.name || "N/A"} • ID:{" "}
                    {employee?.employeeId || "N/A"}
                  </p>
                </div>

                {canEditProfile && (
                  <button
                    onClick={() =>
                      navigate("/employee-edit", { state: { employee } })
                    }
                    className="group relative bg-gradient-to-r from-primary to-[#5962ec] hover:from-[#5962ec] hover:to-primary text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-6 mt-2">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-white/30">
                  <div className="p-1 bg-primary/10 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>

                  <span className="text-sm font-medium text-gray-900 selection:bg-primary/20 selection:text-primary">
                    {employee?.email || "N/A"}
                  </span>
                  <Tooltip
                    text={
                      employee?.isEmailVerified ? "Verified" : "Not Verified"
                    }
                    position="top"
                  >
                    <img
                      src={employee?.isEmailVerified ? verified : notVerified}
                      className="h-5 w-5"
                      alt=""
                    />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-white/30">
                  <div className="p-1 bg-primary/10 rounded-lg">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>

                  <span className="text-sm font-medium text-gray-900 selection:bg-primary/20 selection:text-primary">
                    {employee?.phone || "N/A"}
                  </span>
                  <Tooltip
                    text={
                      employee?.isPhoneVerified ? "Verified" : "Not Verified"
                    }
                    position="top"
                  >
                    <img
                      src={employee?.isPhoneVerified ? verified : notVerified}
                      className="h-5 w-5"
                      alt=""
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="border-b border-gray-200/50">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-4 sm:px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? "text-primary bg-gradient-to-b from-primary/10 to-transparent"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-primary shadow-lg"
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          activeTab === tab.id ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <span className="selection:bg-primary/20 selection:text-primary">
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/40 rounded-t-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 sm:p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InfoCard title="Personal Information" icon={User}>
                  <div className="space-y-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InfoRow
                      label="Full Name"
                      value={`${employee?.firstName || ""} ${
                        employee?.lastName || ""
                      }`.trim()}
                      icon={User}
                    />
                    <InfoRow
                      label="Employee ID"
                      value={employee?.employeeId}
                      icon={IdCard}
                    />
                    <InfoRow
                      label="Date of Birth"
                      value={formatDate(employee?.dateOfBirth)}
                      icon={Calendar}
                    />
                    <InfoRow
                      label="Gender"
                      value={employee?.gender}
                      icon={User}
                    />
                    <InfoRow
                      label="Blood Group"
                      value={employee?.bloodGroup}
                      icon={Droplet}
                    />
                    <InfoRow
                      label="Religion"
                      value={employee?.religion}
                      icon={Book}
                    />
                    <InfoRow label="NID" value={employee?.nid} icon={IdCard} />
                    <InfoRow
                      label="Birth Certificate"
                      value={employee?.birthCertificateNo}
                      icon={FileText}
                    />
                    <InfoRow
                      label="Joining Date"
                      value={formatDate(employee?.startDate)}
                      icon={CalendarCheck}
                    />
                    {employee?.terminationDate && (
                      <InfoRow
                        label="Termination Date"
                        value={formatDate(employee?.terminationDate)}
                        icon={CalendarX2}
                      />
                    )}
                  </div>

                  {employee?.nidPhotoUrl && (
                    <div className="mt-8 pt-6 border-t border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        NID Photo
                      </h4>
                      <div className="flex items-center gap-6">
                        <ImagePreview
                          url={employee?.nidPhotoUrl}
                          alt="Employee NID"
                          fileName="Employee_NID"
                          onClick={() =>
                            setSelectedImage({
                              url: employee?.nidPhotoUrl,
                              title: "Employee NID",
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </InfoCard>

                <InfoCard
                  title="Address Information"
                  enableBadge={true}
                  isVerified={employee?.isAddressVerified}
                  tooltipText={
                    employee?.isAddressVerified
                      ? "Address is verified"
                      : "Address is not verified"
                  }
                  icon={MapPin}
                >
                  <div className="space-y-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InfoRow
                      label="House No"
                      value={employee?.address?.houseNo}
                      icon={Home}
                    />
                    <InfoRow
                      label="Flat No"
                      value={employee?.address?.flatNo}
                      icon={Building}
                    />
                    <InfoRow
                      label="Road No"
                      value={employee?.address?.roadNo}
                      icon={Navigation}
                    />
                    <InfoRow
                      label="Village"
                      value={employee?.address?.village}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="Police Station"
                      value={employee?.address?.policeStation}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="Post Office"
                      value={employee?.address?.postOffice}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="Union"
                      value={employee?.address?.union}
                      icon={MapPin}
                    />

                    <InfoRow
                      label="Sub District"
                      value={employee?.address?.subDistrict}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="District"
                      value={employee?.address?.district}
                      icon={MapPin}
                    />

                    <InfoRow
                      label="ZIP Code"
                      value={employee?.address?.zip}
                      icon={MapPin}
                    />

                    <div className="border-t border-zinc-200 col-span-1 md:col-span-2"></div>

                    <div className="col-span-1 md:col-span-2">
                      <InfoRow
                        label="Current Address"
                        value={employee?.address?.currentAddress}
                        icon={MapPin}
                      />
                    </div>
                  </div>

                  {employee?.address?.utilityProofUrl && (
                    <div className="mt-8 pt-6 border-t border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Address Utility Proof ({employee?.address?.proofType})
                      </h4>
                      <div className="flex items-center gap-6">
                        <ImagePreview
                          url={employee?.address?.utilityProofUrl}
                          alt="utilityProof"
                          fileName="Utility_Proof"
                          onClick={() =>
                            setSelectedImage({
                              url: employee?.address?.utilityProofUrl,
                              title: "Utility Proof",
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </InfoCard>

                <InfoCard
                  title="Bank Information"
                  className="lg:col-span-2"
                  icon={CreditCard}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <InfoRow
                        label="Bank Name"
                        value={employee?.bankInfo?.bankName}
                        // icon={CreditCard}
                      />
                      <InfoRow
                        label="Branch Name"
                        value={employee?.bankInfo?.branchName}
                      />
                    </div>
                    <div className="space-y-2">
                      <InfoRow
                        label="Account Number"
                        value={employee?.bankInfo?.accountNumber}
                      />
                      <InfoRow
                        label="Routing Number"
                        value={employee?.bankInfo?.routingNumber}
                      />
                    </div>
                  </div>
                </InfoCard>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === "employment" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InfoCard title="Employment Details" icon={Briefcase}>
                  <div className="space-y-2">
                    <InfoRow
                      label="Designation"
                      value={employee?.designation}
                      icon={Briefcase}
                    />
                    <InfoRow label="Role" value={employee?.role} icon={User} />
                    <InfoRow
                      label="Department"
                      value={employee?.department?.name}
                      icon={Building}
                    />
                  </div>
                </InfoCard>

                <InfoCard>
                  <div className="space-y-2">
                    <InfoRow
                      label="Shift"
                      value={employee?.shift}
                      icon={SunMoon}
                    />
                    <InfoRow
                      label="Employment Type"
                      value={employee?.employmentType}
                      icon={FileText}
                    />
                    <InfoRow
                      label="Work Location"
                      value={employee?.workLocation}
                      icon={MapPin}
                    />

                    <InfoRow
                      label="Status"
                      value={employee?.status}
                      icon={CheckCircle}
                    />
                  </div>
                </InfoCard>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div>
                <div className="flex items-center mb-8 gap-2">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-xl shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Documents
                    </h2>
                  </div>
                  <Tooltip
                    text={
                      employee?.isDocumentVerified
                        ? "Documents are verified"
                        : "Documents are not verified"
                    }
                    position="top"
                  >
                    <img
                      src={
                        employee?.isDocumentVerified ? verified : notVerified
                      }
                      className="h-5 w-5"
                      alt=""
                    />
                  </Tooltip>
                </div>

                {employee?.documents && employee?.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {employee?.documents.map((doc, index) => (
                      <DocumentPreview key={index} doc={doc} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No documents available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Emergency Contact Tab */}
            {activeTab === "emergency" && (
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-xl shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Emergency Contact
                    </h2>
                  </div>

                  <Tooltip
                    text={
                      employee?.isEmergencyContactVerified
                        ? "Emergency Contact is verified"
                        : "Emergency Contact is not verified"
                    }
                    position="top"
                  >
                    <img
                      src={
                        employee?.isEmergencyContactVerified
                          ? verified
                          : notVerified
                      }
                      className="h-5 w-5"
                      alt=""
                    />
                  </Tooltip>
                </div>

                {employee?.emergencyContact ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <InfoCard title="Contact Information" icon={User}>
                      <div className="space-y-1">
                        <InfoRow
                          label="Name"
                          value={employee?.emergencyContact.name}
                          icon={User}
                        />
                        <InfoRow
                          label="Relationship"
                          value={employee?.emergencyContact.relationship}
                        />
                        <InfoRow
                          label="Primary Phone"
                          value={employee?.emergencyContact.phonePrimary}
                          icon={Phone}
                        />
                        <InfoRow
                          label="Alternate Phone"
                          value={employee?.emergencyContact.phoneAlternate}
                        />
                        <InfoRow
                          label="Email"
                          value={employee?.emergencyContact.email}
                          icon={Mail}
                        />
                        <InfoRow
                          label="Address"
                          value={employee?.emergencyContact.address}
                          icon={MapPin}
                        />
                      </div>
                    </InfoCard>

                    <InfoCard title="Professional Information" icon={Briefcase}>
                      <div className="space-y-1">
                        <InfoRow
                          label="Occupation"
                          value={employee?.emergencyContact.occupation}
                          icon={Briefcase}
                        />
                        <InfoRow
                          label="Business Name"
                          value={employee?.emergencyContact.businessName}
                          icon={Building}
                        />
                        <InfoRow
                          label="NID"
                          value={employee?.emergencyContact.nid}
                        />
                      </div>

                      {employee?.emergencyContact.nidPhotoUrl && (
                        <div className="mt-8 pt-6 border-t border-gray-200/50">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4">
                            NID Photo
                          </h4>
                          <div className="flex items-center gap-6">
                            <ImagePreview
                              url={employee?.emergencyContact.nidPhotoUrl}
                              alt="Emergency Contact NID"
                              fileName="Emergency_Contact_NID"
                              onClick={() =>
                                setSelectedImage({
                                  url: employee?.emergencyContact.nidPhotoUrl,
                                  title: "Emergency Contact NID",
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </InfoCard>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No emergency contact information available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Family Members Tab */}
            {activeTab === "family" && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Family Members
                  </h2>
                </div>

                {employee?.familyMembers &&
                employee?.familyMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {employee?.familyMembers.map((member, index) => (
                      <InfoCard
                        key={index}
                        title={`Family Member ${index + 1}`}
                        icon={User}
                      >
                        <div className="space-y-1">
                          <InfoRow
                            label="Name"
                            value={member.name}
                            icon={User}
                          />
                          <InfoRow label="Relation" value={member.relation} />
                          <InfoRow
                            label="Phone"
                            value={member.phone}
                            icon={Phone}
                          />
                          <InfoRow
                            label="Email"
                            value={member.email}
                            icon={Mail}
                          />
                          <InfoRow
                            label="Address"
                            value={member.address}
                            icon={MapPin}
                          />
                        </div>
                      </InfoCard>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No family members information available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && (
              <div>
                <div className="flex items-center mb-8 gap-2">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-xl shadow-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Work Experience
                    </h2>
                  </div>
                  <Tooltip
                    text={
                      employee?.isPreviouslyEmployed
                        ? "Previously Employment is verified"
                        : "Previously Employment is not verified"
                    }
                    position="top"
                  >
                    <img
                      src={
                        employee?.isDocumentVerified ? verified : notVerified
                      }
                      className="h-5 w-5"
                      alt=""
                    />
                  </Tooltip>
                </div>

                {employee?.prevWorkExperience &&
                employee?.prevWorkExperience.length > 0 ? (
                  <div className="space-y-8">
                    {employee?.prevWorkExperience.map((exp, index) => (
                      <InfoCard
                        key={index}
                        title={`Experience ${index + 1}`}
                        icon={Briefcase}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="">
                            <InfoRow
                              label="Designation"
                              value={exp.designation}
                              icon={Briefcase}
                            />
                            <InfoRow
                              label="Employment Type"
                              value={exp.employmentType}
                            />

                            <InfoRow
                              label="Joining Date"
                              value={formatDate(exp.joiningDate)}
                              // icon={Calendar}
                            />
                          </div>
                          <div className="space-y-2 mt-14">
                            <InfoRow label="Job Type" value={exp.jobType} />
                            <InfoRow
                              label="End Date"
                              value={formatDate(exp.endDate)}
                            />
                          </div>
                        </div>
                      </InfoCard>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No previous work experience available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Assets Tab */}
            {activeTab === "assets" && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-xl shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Assigned Assets
                  </h2>
                </div>

                {employee?.assets && employee?.assets?.length > 0 ? (
                  <div>
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/40/10 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-lg">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Total Assets Assigned
                          </h3>
                          <p className="text-sm text-gray-600">
                            {employee?.assets?.length}{" "}
                            {employee?.assets?.length === 1
                              ? "asset"
                              : "assets"}{" "}
                            currently assigned to this employee
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {employee?.assets?.map((asset, index) => (
                        <AssetPreview key={index} asset={asset} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto shadow-lg">
                        <Award className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">
                      No Assets Assigned
                    </h3>
                    <p className="text-gray-500 text-lg font-medium mb-6 max-w-md mx-auto">
                      {user?._id !== employee?._id
                        ? `${employee?.firstName} ${employee?.lastName} has no assets assigned. Assets will appear here once they are allocated.`
                        : "You don’t have any assets assigned yet. Your assets will appear here once they are allocated."}
                    </p>
                    <div className="bg-gradient-to-r from-primary/10 to-primary/40/10 rounded-xl p-6 max-w-md mx-auto border border-primary/20">
                      <div className="flex items-center justify-center gap-2 text-primary font-medium">
                        <Award className="w-5 h-5" />
                        <span>Ready for asset assignment</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 selection:bg-primary/20 selection:text-primary">
                {selectedDocument?.docName}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  // onClick={() => {
                  //   const link = document.createElement("a");
                  //   link.href = selectedDocument.fileUrl;
                  //   link.download = selectedDocument.docName || "document";
                  //   link.click();
                  // }}
                  onClick={async (e) => {
                    e.stopPropagation(); // Prevent parent onClick (if applicable)
                    try {
                      const response = await fetch(selectedDocument.fileUrl);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);

                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = selectedDocument.docName || "document";
                      link.click();
                      window.URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                      console.error("Download failed:", error);
                      // Fallback to direct download if fetch fails
                      const link = document.createElement("a");
                      link.href = selectedDocument.fileUrl;
                      link.download = selectedDocument.docName || "document";
                      link.click();
                    }
                  }}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                >
                  <Download className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                </button>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <img
                src={selectedDocument.fileUrl || "/placeholder.svg"}
                alt={selectedDocument.docName}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 selection:bg-primary/20 selection:text-primary">
                {selectedImage.title}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedImage.url || "/placeholder.svg"}
                alt={selectedImage.title}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
