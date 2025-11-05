import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import Pagination from "@/component/Pagination";
import SelectInput from "@/component/select/SelectInput";
import Table from "@/component/Table";
import {
  useDeleteProductMutation,
  useDischargeProductMutation,
  useGetProductsQuery,
} from "@/redux/features/product/productApiSlice";
import { useGetTypesQuery } from "@/redux/features/type/typeApiSlice";
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  Package,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ProductCreateAndUpdateModal from "./components/ProductCreateAndUpdateModal";
import ProductDetailsModal from "./components/ProductDetailsModal";
import AssignProductModal from "./components/AssignProductModal";
import ConfirmDialog from "@/component/ConfirmDialog";
import BulkProductCreateModal from "./components/BulkProductCreateModal";
import Tooltip from "@/component/Tooltip";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "UNUSABLE", label: "Unusable" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const ProductManagementPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [selectedType, setSelectedType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("single"); // "single" or "bulk"
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDischargeProductDialogOpen, setIsDischargeProductDialogOpen] =
    useState(false);
  const [dischargeProductId, setDischargeProductId] = useState(null);
  const [assignProduct, setAssignProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    type: null,
    status: { value: "AVAILABLE", label: "Available" },
    images: [],
    currentOwner: null
  });
  console.log(formData);

  const loginUser = useSelector((state) => state.userSlice.user);
  const isAdmin = loginUser?.user?.role === "Admin";

  const [dischargeProduct, { isLoading: isDischarging }] =
    useDischargeProductMutation();

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery({
    page: page,
    limit: limit,
    search: searchTerm,
    status: selectedStatus?.value || "",
    typeId: selectedType?.value || "",
  });
  // console.log(productsData);

  const { data: typesData } = useGetTypesQuery({
    page: 1,
    limit: 1000000,
    status: "Active",
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Memoized type options for filter dropdown
  const typeOptions = useMemo(() => {
    const allOption = { value: "", label: "All Types" };
    const types =
      typesData?.data?.map((type) => ({
        value: type._id,
        label: type.name,
      })) || [];
    return [allOption, ...types];
  }, [typesData]);

  // Table columns
  const columns = [
    "Product ID",
    "Product Name",
    "Type",
    "Status",
    "Current Owner",
    "Created At",
    "Actions",
  ];

  // Handle view details
  const handleViewClick = (product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditClick = useCallback((product) => {
    console.log(product);
    setSelectedProduct(product);

    // Convert image URLs to file objects for FileUpload component
    const normalizedImages = (product?.documents || []).map(
      (imageUrl, index) => {
        if (typeof imageUrl === "string") {
          return {
            id: `existing-${index}-${Date.now()}`,
            name: imageUrl.split("/").pop() || `image-${index + 1}`,
            fileUrl: imageUrl,
            type: "file",
            title: imageUrl.split("/").pop() || `image-${index + 1}`,
          };
        }
        return imageUrl; // If it's already an object, keep it as is
      }
    );

    setFormData({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      type: product.type
        ? { value: product.type._id, label: product.type.name }
        : null,
      status: {
        value: product.status,
        label: product.status,
      },
      images: normalizedImages,
      currentOwner: product.currentOwner
        ? { value: product.currentOwner._id, label: `${product.currentOwner.firstName} ${product.currentOwner.lastName}` }
        : null,
    });
    setIsEditMode(true);
    setIsModalOpen(true);

  }, []);

  // Handle delete
  const handleDeleteClick = useCallback((productId) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDischargeClick = useCallback((productId) => {
    setDischargeProductId(productId);
    setIsDischargeProductDialogOpen(true);
  }, []);

  // Handle assign product
  const handleAssignClick = useCallback((product) => {
    setAssignProduct(product);
    setIsAssignModalOpen(true);
  }, []);

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: "bg-green-100 text-green-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      UNUSABLE: "bg-red-100 text-red-800",
      MAINTENANCE: "bg-orange-100 text-orange-800",
    };

    const className = statusConfig[status] || statusConfig.AVAILABLE;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      >
        {status?.replace("_", " ") || "Available"}
      </span>
    );
  };

  // Transform data for table
  const tableData = useMemo(() => {
    if (!productsData?.data) return [];

    return productsData?.data?.map((product) => ({
      "Product Name": product?.name || "N/A",
      Type: product?.type?.name || "N/A",
      Status: getStatusBadge(product?.status),
      // "Images": (
      //   <div key={`images-${product._id}`} className="flex items-center">
      //     <span className="text-sm text-gray-600">
      //       {product.documents?.length || 0} image(s)
      //     </span>
      //     {product.documents?.length > 0 && (
      //       <div className="ml-2 w-8 h-8 rounded-md overflow-hidden bg-gray-100">
      //         <img
      //           src={product.documents[0]}
      //           alt="Product preview"
      //           className="w-full h-full object-cover"
      //           onError={(e) => {
      //             e.target.style.display = "none";
      //           }}
      //         />
      //       </div>
      //     )}
      //   </div>
      // ),
      "Product ID": product?.productId || "N/A",
      "Current Owner": `${product?.currentOwner?.firstName || "N/A"} ${
        product?.currentOwner?.lastName || ""
      }`,
      "Created At": product?.createdAt
        ? new Date(product?.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A",
      Actions: (
        <div
          key={`actions-${product?._id}`}
          className="flex items-center space-x-2"
        >
          <Tooltip text="View Details">
            <button
            onClick={() => handleViewClick(product)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          </Tooltip>
          
          {isAdmin && (
            <>
              {product?.status === "ASSIGNED" ? (
                <Tooltip text="Discharge This Product">
                  <button
                    onClick={() => handleDischargeClick(product?._id)}
                    className="p-1 text-red-600 transition-colors"
                    title="Discharge Product"
                  >
                    <UserMinus size={16} />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip text="Assign This Product">
                  <button
                    onClick={() => handleAssignClick(product)}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                    title="Assign Product"
                  >
                    <UserPlus size={16} />
                  </button>
                </Tooltip>
              )}

              <Tooltip text="Update This Product">
                <button
                onClick={() => handleEditClick(product)}
                className="p-1 text-gray-500 hover:text-yellow-600 transition-colors"
                title="Edit Product"
              >
                <Edit size={16} />
              </button>
              </Tooltip>
              
              <Tooltip text="Delete This Product" position="left">
                <button
                onClick={() => handleDeleteClick(product._id)}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete Product"
              >
                <Trash2 size={16} />
              </button>
              </Tooltip>
              
            </>
          )}
        </div>
      ),
    }));
  }, [
    productsData,
    handleEditClick,
    handleDeleteClick,
    handleAssignClick,
    isAdmin,
  ]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: null,
      status: { value: "AVAILABLE", label: "Available" },
      images: [],
    });
    setFormErrors({});
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  // Handle create/edit modal
  const handleCreateClick = () => {
    resetForm();
    setActiveTab("single");
    setIsModalOpen(true);
  };

  // Handle bulk create modal
  const handleBulkCreateClick = () => {
    setActiveTab("bulk");
    setIsBulkModalOpen(true);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "single") {
      resetForm();
      setIsModalOpen(true);
      setIsBulkModalOpen(false);
    } else if (tab === "bulk") {
      setIsBulkModalOpen(true);
      setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct({
        productId: deleteProductId,
        actionBy: loginUser?.user?._id,
      }).unwrap();
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const confirmDischarge = async () => {
    try {
      await dischargeProduct({
        productId: dischargeProductId,
        body: { returnBy: loginUser?.user?._id },
      }).unwrap();
      setIsDischargeProductDialogOpen(false);
      setDischargeProductId(null);
      refetch();
    } catch (error) {
      console.error("Error discharging product:", error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteProductId(null);
  };

  const handleCancelDischarge = () => {
    setIsDischargeProductDialogOpen(false);
    setDischargeProductId(null);
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your product inventory
          </p>
        </div>
        {isAdmin && (
          <div className="flex bg-gray-100 rounded-lg p-1 gap-2">
            {/* <Button
              onClick={() => handleTabChange("single")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
              variant={activeTab === "single" ? "primary" : "outline"}
            >
              <Plus size={16} />
              Add Product
            </Button> */}
            <Button
              onClick={() => handleTabChange("bulk")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
              variant={"primary"}
            >
              <Package size={16} />
              Add Products
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FloatingInput
          label="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />

        <SelectInput
          label="Filter by Status"
          options={statusOptions}
          value={selectedStatus}
          onChange={setSelectedStatus}
        />

        <SelectInput
          label="Filter by Type"
          options={typeOptions}
          value={selectedType}
          onChange={setSelectedType}
        />
        <div className="flex items-end w-32">
          <Button
            variant="primary"
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus(statusOptions[0]);
              setSelectedType(null);
              setPage(1);
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="">
        <Table
          columns={columns}
          data={tableData}
          isLoading={isLoading || isFetching}
          emptyMessage="No products found"
        />

        {/* Pagination */}
        {tableData.length > 0 && (
          <div className="mt-6 px-4 sm:px-0">
            <Pagination
              totalCount={productsData?.pagination?.totalCount}
              currentPage={page}
              setCurrentPage={setPage}
              limit={limit}
              setLimit={setLimit}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <ProductCreateAndUpdateModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (!isEditMode) setActiveTab("single");
        }}
        isEditMode={isEditMode}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        setIsModalOpen={setIsModalOpen}
        selectedProduct={selectedProduct}
        refetch={refetch}
        resetForm={resetForm}
      />

      {/* Bulk Create Modal */}
      <BulkProductCreateModal
        open={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setActiveTab("single");
        }}
        refetch={refetch}
      />

      {/* View Details Modal */}
      <ProductDetailsModal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        setIsViewModalOpen={setIsViewModalOpen}
        viewProduct={viewProduct}
      />

      {/* Assign Product Modal */}
      <AssignProductModal
        open={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignProduct(null);
        }}
        product={assignProduct}
        refetch={refetch}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={isDischargeProductDialogOpen}
        onCancel={handleCancelDischarge}
        onConfirm={confirmDischarge}
        title="Discharge Product"
        message="Are you sure you want to discharge this product? This action cannot be undone."
        confirmText="Discharge"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ProductManagementPage;
