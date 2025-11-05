import Button from "@/component/Button";
import Modal from "@/component/Modal";
import { FileText, Image, Link } from "lucide-react";

// Utility function to format numbers in Bangladeshi style
const formatBDTAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0";
  
  const num = Number(amount);
  const numStr = num.toString();
  
  // Handle decimal part
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1].slice(0, 2) : '';
  
  // Reverse the string to apply formatting from right to left
  const reversed = integerPart.split('').reverse().join('');
  let formatted = '';
  
  for (let i = 0; i < reversed.length; i++) {
    if (i === 3 || i === 5 || (i > 5 && (i - 5) % 2 === 0)) {
      formatted = ',' + formatted;
    }
    formatted = reversed[i] + formatted;
  }
  
  return formatted + decimalPart;
};

// Utility function to convert UTC time to Bangladeshi timezone
const formatBangladeshiDateTime = (utcDateString) => {
  if (!utcDateString) return "N/A";
  
  try {
    const utcDate = new Date(utcDateString);
    
    // Check if the date is valid
    if (isNaN(utcDate.getTime())) {
      return "Invalid Date";
    }
    
    // Convert to Bangladeshi timezone (Asia/Dhaka - UTC+6)
    return utcDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka"
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const getDocumentType = (url) => {
  if (!url) return "link";

  const extension = url.split(".").pop()?.toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const pdfExtensions = ["pdf"];

  if (imageExtensions.includes(extension)) return "image";
  if (pdfExtensions.includes(extension)) return "pdf";
  return "link";
};

const getDocumentName = (url) => {
  if (!url) return "Document";

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop();
    return filename || "Document";
  } catch {
    // If URL parsing fails, try to extract filename from string
    const parts = url.split("/");
    return parts[parts.length - 1] || "Document";
  }
};

const DocumentPreview = ({ document, index }) => {
  const docType = getDocumentType(document);
  const docName = getDocumentName(document);

  const handleDocumentClick = () => {
    window.open(document, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleDocumentClick}
      className="group cursor-pointer bg-white border border-primary/20 rounded-lg p-3 hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        {docType === "image" ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
            <img
              src={document}
              alt={docName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="hidden w-full h-full items-center justify-center bg-primary/10">
              <Image className="w-6 h-6 text-primary/60" />
            </div>
          </div>
        ) : docType === "pdf" ? (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Link className="w-6 h-6 text-primary" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
            {docName}
          </p>
          <p className="text-xs text-gray-500 uppercase">
            {docType === "image"
              ? "Image"
              : docType === "pdf"
              ? "PDF Document"
              : "Link"}
          </p>
        </div>

        {/* <Download className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" /> */}
      </div>
    </div>
  );
};

const RequisitionDetailsModal = ({
  open,
  onClose,
  setIsViewModalOpen,
  viewRequisition,
}) => {
  return (
    <Modal open={open} onClose={onClose} className="max-w-5xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Requisition Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View complete requisition information
            </p>
          </div>
          <div className="flex items-center gap-3 pr-10">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                viewRequisition?.status === "Approved"
                  ? "bg-green-600 text-white border border-green-500"
                  : viewRequisition?.status === "Rejected"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              {viewRequisition?.status || "pending"}
            </span>
          </div>
        </div>

        {viewRequisition && (
          <div className="mt-6 space-y-8">
            {/* Basic Information Section */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Requisition ID
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 py-1 border border-gray-200">
                      <p className="text-gray-900">
                        {viewRequisition?.requisitionID || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Title
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 py-1 border border-gray-200">
                      <p className="text-gray-900">
                        {viewRequisition?.requisitionTitle || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Requested By
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 py-1 border border-gray-200">
                      <p className="text-gray-900">
                        {viewRequisition?.requestedBy?.firstName || "N/A"}{" "}
                        {viewRequisition?.requestedBy?.lastName || ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Created Date
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 py-1 border border-gray-200">
                      <p className="text-gray-900">
                        {formatBangladeshiDateTime(viewRequisition?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {viewRequisition?.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 py-1 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {viewRequisition?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Documents Section */}
            {viewRequisition?.documents &&
              viewRequisition?.documents?.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Attached Documents
                    </h3>
                    <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {viewRequisition?.documents?.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewRequisition?.documents?.map((doc, index) => (
                      <DocumentPreview key={index} document={doc} />
                    ))}
                  </div>
                </div>
              )}

            {/* Items Section */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Requisition Items
                </h3>
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {viewRequisition?.items?.length || 0}
                </span>
              </div>

              {viewRequisition?.items && viewRequisition?.items?.length > 0 ? (
                <div className="space-y-3">
                  {viewRequisition?.items?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors"
                    >
                      {/* Header with Item Number and Type */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                            <span className="text-primary font-medium text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {item?.type?.name || `Item ${index + 1}`}
                          </h4>
                        </div>
                      </div>

                      {/* Compact Grid Layout */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* Cost Section */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Estimated Cost
                            </label>
                            <div className="bg-gray-50 rounded p-2 text-xs">
                              <p className="font-semibold text-gray-900">
                                BDT {formatBDTAmount(item?.estimatedCost || 0)}
                              </p>
                            </div>
                          </div>
                          {item?.approvedCost > 0 && (
                            <div>
                              <label className="block text-xs font-medium text-green-600 mb-1">
                                Approved Cost
                              </label>
                              <div className="bg-green-50 rounded p-2 text-xs border border-green-200">
                                <p className="font-semibold text-green-800">
                                  BDT {formatBDTAmount(item.approvedCost)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity Section */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Requested Qty
                            </label>
                            <div className="bg-gray-50 rounded p-2 text-xs">
                              <p className="font-semibold text-gray-900">
                                {item?.quantityRequested || "N/A"}
                              </p>
                            </div>
                          </div>
                          {item?.quantityApproved > 0 && (
                            <div>
                              <label className="block text-xs font-medium text-green-600 mb-1">
                                Approved Qty
                              </label>
                              <div className="bg-green-50 rounded p-2 text-xs border border-green-200">
                                <p className="font-semibold text-green-800">
                                  {item.quantityApproved}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Vendor Section */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Requested Vendor
                            </label>
                            <div className="bg-gray-50 rounded p-2 text-xs">
                              <p className="font-medium text-gray-900 truncate">
                                {item?.vendor?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                          {item?.approvedVendor?.name && (
                            <div>
                              <label className="block text-xs font-medium text-green-600 mb-1">
                                Approved Vendor
                              </label>
                              <div className="bg-green-50 rounded p-2 text-xs border border-green-200">
                                <p className="font-medium text-green-800 truncate">
                                  {item.approvedVendor.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status/Actions Section */}
                        {/* <div className="flex flex-col justify-center">
                          {(item?.approvedCost || item?.quantityApproved || item?.approvedVendor?.name) && (
                            <div className="bg-green-100 rounded-full px-2 py-1 text-xs text-center">
                              <span className="text-green-800 font-medium">✓ Approved</span>
                            </div>
                          )}
                        </div> */}
                      </div>

                      {/* Documents Section - More Compact */}
                      {item?.documents && item?.documents?.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-sm  text-gray-600 mb-1 font-bold">
                            Item Documents
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {item?.documents?.map((doc, docIndex) => (
                              <DocumentPreview key={docIndex} document={doc} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    No items found for this requisition
                  </p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5 rounded-xl p-6 border border-primary/20 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">
                  Requisition Summary
                </h3>
                <div className="ml-auto flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Requested Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Requested
                    </h4>
                    <div className="w-12 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Total Items */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {viewRequisition?.items?.length || 0}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Items
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            Total Count
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total Requested Quantity */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {viewRequisition?.items?.reduce(
                              (sum, item) =>
                                sum + (Number(item?.quantityRequested) || 0),
                              0
                            ) || 0}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Quantity
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            Requested
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Estimated Cost */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Estimated Cost
                        </p>
                        <p className="text-xl font-bold text-primary">
                          BDT{" "}
                          {formatBDTAmount(
                            viewRequisition?.items?.reduce(
                              (sum, item) =>
                                sum + (Number(item?.estimatedCost) || 0),
                              0
                            ) || 0
                          )}
                        </p>
                      </div>
                      {/* <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* Right Column - Approved Stats (Conditional) */}
                {(viewRequisition?.totalQuantityApproved > 0 ||
                  viewRequisition?.totalApprovedCost > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                        Approved
                      </h4>
                      <div className="w-12 h-px bg-gradient-to-r from-emerald-400/30 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Total Approved Quantity */}
                      {viewRequisition?.totalQuantityApproved && (
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-emerald-700">
                                {viewRequisition.totalQuantityApproved}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                                Quantity
                              </p>
                              <p className="text-sm font-semibold text-emerald-800">
                                Approved
                              </p>
                            </div>
                            <div className="ml-auto">
                              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Total Approved Cost */}
                      {viewRequisition?.totalApprovedCost && (
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/60 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">
                                Approved Cost
                              </p>
                              <p className="text-xl font-bold text-emerald-700">
                                BDT{" "}
                                {formatBDTAmount(
                                  viewRequisition.totalApprovedCost
                                )}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  ✓
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {/* <div className="mt-3">
                            <div className="flex justify-between text-xs text-emerald-600 mb-1">
                              <span>Budget Utilization</span>
                              <span>
                                {Math.round((viewRequisition.totalApprovedCost / 
                                  (viewRequisition?.items?.reduce(
                                    (sum, item) => sum + (Number(item?.estimatedCost) || 0), 0
                                  ) || 1)) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-emerald-100 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.round((viewRequisition.totalApprovedCost / 
                                    (viewRequisition?.items?.reduce(
                                      (sum, item) => sum + (Number(item?.estimatedCost) || 0), 0
                                    ) || 1)) * 100))}%`
                                }}
                              ></div>
                            </div>
                          </div> */}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewRequisition?.comments && (
          <p className="text-sm font-bold pt-5 text-center">
            <span className="text-red-500">Reason for Rejection: </span>
            {viewRequisition.comments}
          </p>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsViewModalOpen(false)}
            className="px-6 py-2 rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RequisitionDetailsModal;
