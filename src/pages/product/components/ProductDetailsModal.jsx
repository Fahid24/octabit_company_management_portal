import Button from "@/component/Button";
import Modal from "@/component/Modal";
import { Image, Link } from "lucide-react";

// Utility function to get document type
const getDocumentType = (url) => {
  if (!url) return "link";

  const extension = url.split(".").pop()?.toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];

  if (imageExtensions.includes(extension)) return "image";
  return "link";
};

// Utility function to get document name
const getDocumentName = (url) => {
  if (!url) return "Image";

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop();
    return filename || "Image";
  } catch {
    // If URL parsing fails, try to extract filename from string
    const parts = url.split("/");
    return parts[parts.length - 1] || "Image";
  }
};

const ImagePreview = ({ image, index }) => {
  const docType = getDocumentType(image);
  const docName = getDocumentName(image);

  const handleImageClick = () => {
    window.open(image, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleImageClick}
      className="group cursor-pointer bg-white border border-primary/20 rounded-lg p-3 hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        {docType === "image" ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
            <img
              src={image}
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
            {docType === "image" ? "Image" : "Link"}
          </p>
        </div>
      </div>
    </div>
  );
};

const ProductDetailsModal = ({
  open,
  onClose,
  setIsViewModalOpen,
  viewProduct,
}) => {
  console.log(viewProduct);
  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
      ASSIGNED: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      UNUSABLE: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
      },
      MAINTENANCE: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
      },
    };

    const config = statusConfig[status] || statusConfig.AVAILABLE;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} border ${config.border}`}
      >
        {status?.replace("_", " ") || "Available"}
      </span>
    );
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View complete product information
            </p>
          </div>
          <div className="flex items-center gap-3 pr-10">
            {getStatusBadge(viewProduct?.status)}
          </div>
        </div>

        {viewProduct && (
          <div className="mt-6 space-y-6">
            {/* Basic Information Section */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Product Name
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900">
                      {viewProduct?.name || "N/A"}
                    </p>
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900">
                      {viewProduct?.type?.name || "N/A"}
                    </p>
                  </div>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Product ID
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="inline-block">
                        {viewProduct?.productId || "N/A"}
                      </div>
                    </div>
                  </div>

                <div className="col-span-1 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {viewProduct?.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Created Date
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900">
                      {viewProduct?.createdAt
                        ? new Date(viewProduct.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Origin
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900">
                      {viewProduct?.origin || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Owner Section */}
            {viewProduct?.currentOwner && (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Owner
                  </h3>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-lg p-6 border border-primary/20">
                  <div className="flex items-center space-x-4">
                    {/* Owner Photo */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20">
                        {viewProduct.currentOwner.photoUrl ? (
                          <img
                            src={viewProduct.currentOwner.photoUrl}
                            alt={`${viewProduct.currentOwner.firstName} ${viewProduct.currentOwner.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-primary font-semibold text-lg">
                              {viewProduct.currentOwner.firstName?.charAt(0)}
                              {viewProduct.currentOwner.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        {viewProduct.currentOwner.photoUrl && (
                          <div className="hidden w-full h-full items-center justify-center bg-primary/10">
                            <span className="text-primary font-semibold text-lg">
                              {viewProduct.currentOwner.firstName?.charAt(0)}
                              {viewProduct.currentOwner.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Owner Information */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {viewProduct.currentOwner.firstName}{" "}
                            {viewProduct.currentOwner.lastName}
                          </h4>
                          <p className="text-sm text-primary font-medium">
                            {viewProduct.currentOwner.designation || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {viewProduct.currentOwner.email || "N/A"}
                          </p>
                        </div>
                        {/* <div className="flex items-center">
                          <div className="flex gap-2">
                            <span className="text-xs text-gray-500 uppercase">Role</span>
                            <p className="text-sm font-medium text-gray-900">
                              {viewProduct.currentOwner.role || "N/A"}
                            </p>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Images Section */}
            {viewProduct?.documents && viewProduct?.documents?.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Product Images
                  </h3>
                  <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {viewProduct?.documents?.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {viewProduct?.documents?.map((image, index) => (
                    <ImagePreview key={index} image={image} />
                  ))}
                </div>
              </div>
            )}

            {/* Summary Section */}
            {/* <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-primary">
                      {viewProduct?.images?.length || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Images</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-primary">
                      {viewProduct?.type?.name?.substring(0, 3).toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Type</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-primary">
                      {viewProduct?.status?.replace("_", " ") || "Available"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div> */}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsViewModalOpen(false)}
            className="px-6 py-2"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
