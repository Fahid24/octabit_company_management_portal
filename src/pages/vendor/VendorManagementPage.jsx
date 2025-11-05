import Button from "@/component/Button";
import ConfirmDialog from "@/component/ConfirmDialog";
import FileUploadInput from "@/component/FileUploadInput";
import { FloatingInput } from "@/component/FloatiingInput";
import Loader from "@/component/Loader";
import Modal from "@/component/Modal";
import Pagination from "@/component/Pagination";
import SelectInput from "@/component/select/SelectInput";
import Table from "@/component/Table";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import Tooltips from "@/component/Tooltip2";
import useIsMobile from "@/hook/useIsMobile";
import { useCreateVendorMutation, useDeleteVendorMutation, useGetVendorsQuery, useUpdateVendorMutation } from "@/redux/features/vendor/vendorApiSlice";
import { getNestedValue } from "@/utils/getAndSetNestedValues";
import { CircleAlert, File, FileEdit, FileText, Image, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

const VendorManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalType, setModalType] = useState("create");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    logo: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    website: "",
    status: { value: "Active", label: "Active" },
    documents: [],
  });
  console.log(formData);
  const [formErrors, setFormErrors] = useState({});

  const { data, isLoading, isFetching } = useGetVendorsQuery({
    page: currentPage,
    limit,
    search: searchTerm,
    status: statusFilter,
  });

  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();
  // console.log(data);

  const tableData = useMemo(() => {
    return (
      data?.data?.map((vendor) => ({
        "Vendor Name": vendor.name,
        "Contact Person": vendor.contactPerson,
        "Contact Email": vendor.contactEmail,
        "Contact Phone": vendor.contactPhone,
        // "Address": vendor.address,
        "Website": <a className="text-blue-500 hover:underline" href={vendor.website} target="_blank" rel="noopener noreferrer">{vendor.website?.length > 20 ? vendor.website.slice(0, 20) + "..." : vendor.website}</a>,
        "Status": vendor.status,
        Actions: (
          <div className="flex gap-2">
            <Tooltip text="Edit Vendor" position="left">
              <button
                className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors border border-primary"
                onClick={() => {
                  setFormData({...vendor, status: { value: vendor.status, label: vendor.status }});
                  setModalType('update')
                  setIsModalOpen(true);
                }}
                title="Edit Vendor"
              >
                <FileEdit size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Delete Vendor" position="left">
              <button
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-500"
                onClick={() => handleDeleteClick(vendor._id)}
                title="Delete Vendor"
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
          </div>
        ),
      })) || []
    );
  }, [data]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Vendor Name is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      website: "",
      status: { value: "Active", label: "Active" },
      documents: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (modalType === "create") {
        await createVendor({...formData, status: formData.status.value });
        toast.success("Vendor created successfully");
        resetForm()
        setIsModalOpen(false);
      } else {
        const { _id, ...dataWithoutId } = formData;
        await updateVendor({ id: _id, data:{...dataWithoutId, status: formData.status.value }});
        toast.success("Vendor updated successfully");
        setIsModalOpen(false);
        resetForm()
      }

    } catch (error) {
      console.log(error);
    }

  };

    const handleDeleteClick = (id) => {
      setItemToDelete(id); // store the item to delete
      setIsDialogOpen(true); // open the confirmation modal
    };
  
    const handleConfirmDelete = async () => {
      try {
        await deleteVendor(itemToDelete).unwrap();
        toast.success("Success", "Vendor deleted successfully!");
  
        // cleanup
        setIsDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        toast.error(
          "Error",
          error?.data?.message || "Failed to delete vendor."
        );
      }
    };
  
    const handleCancelDelete = () => {
      setIsDialogOpen(false);
      setItemToDelete(null);
    };

  const isMobile = useIsMobile();
  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Vendors</h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="You can view vendor names, contact details, and statuses. Use the action buttons to edit or delete vendors, or click “Add Vendor” to create a new one and keep your structure up to date."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage Your Vendor&apos;s and Their Details.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsModalOpen(true)
            setModalType("create")
          }}
          variant="primary"
          className="bg-primary hover:bg-primary/90 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Vendor</span>
          </div>
        </Button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <FloatingInput
              label="Search vendors..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // placeholder="Search by name, contact person, or email"
            />
          </div>
          <div className="md:col-span-1">
            <SelectInput
              label="Filter by Status"
              value={statusFilter ? { value: statusFilter, label: statusFilter } : null}
              onChange={(selectedOption) => setStatusFilter(selectedOption?.value || "")}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
              placeholder="All statuses"
            />
          </div>
          <div className="md:col-span-1">
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
              variant="outline"
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      ) : (
        <>
          <div className="">
            <Table
              isLoading={isLoading || isFetching}
              data={tableData}
              columns={[
                "Vendor Name",
                "Contact Person",
                "Contact Email",
                "Contact Phone",
                // 'Address',
                "Website",
                "Status",
                "Actions",
              ]}
            />
          </div>
          {tableData && (
            <div className=" mt-6 px-4 sm:px-0 ">
              <Pagination
                currentCount={tableData.length}
                totalCount={data?.pagination.totalCount}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          )}
        </>
      )}

      <Modal
        onClose={() => {setIsModalOpen(false); resetForm();}}
        open={isModalOpen}
        className="max-w-2xl"
      >
        <div className="">
          <h2 className="text-2xl font-semibold mb-6 p-5">
            {modalType === "create" ? "Add New Vendor" : "Update Vendor"}
          </h2>

          <div className="flex items-center justify-center ">
          {formData.logo && (
            <div className="relative">
              <img
                src={formData.logo}
                alt="Vendor Logo Preview"
                className="w-32 h-32 object-contain rounded-full border border-primary bg-white p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center w-20 h-20 rounded-lg border border-gray-200 bg-white">
                <Image className="h-8 w-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">No Preview</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, logo: "" }));
                  setFormErrors((prev) => ({ ...prev, logo: "" }));
                }}
                className="absolute top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              label="Vendor Name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  name: "",
                }));
              }}
              error={formErrors.name}
            />

            <FileUploadInput
              label="Upload Vendor Logo"
              targetPath="logo" // Top-level field
              icon={<FileText className="h-5 w-5" />}
              setFormData={setFormData}
              setErrors={setFormErrors}
              formData={formData}
              error={getNestedValue(formErrors, "logo")}
              accept="image/*,.pdf"
              multiple={false}
            />

            <FloatingInput
              label="Contact Person"
              type="text"
              value={formData.contactPerson}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  contactPerson: e.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  contactPerson: "",
                }));
              }}
              error={formErrors.contactPerson}
            />

            <FloatingInput
              label="Contact Email"
              type="text"
              value={formData.contactEmail}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  contactEmail: "",
                }));
              }}
              error={formErrors.contactEmail}
            />

            <FloatingInput
              label="Contact Phone"
              type="text"
              value={formData.contactPhone}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  contactPhone: e.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  contactPhone: "",
                }));
              }}
              error={formErrors.contactPhone}
            />

            <FloatingInput
              label="Website"
              type="text"
              value={formData.website}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  website: e.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  website: "",
                }));
              }}
              error={formErrors.website}
            />

            <div className="col-span-1 sm:col-span-2">
              <FloatingInput
              label="Address"
              type="text"
              value={formData.address}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  address: "",
                }));
              }}
              error={formErrors.address}
            />
            </div>
            

            <SelectInput
              className={"z-30"}
              label="Status"
              isMulti={false}
              value={formData.status}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  status: e,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  status: "",
                }));
              }}
              options={[
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              error={formErrors.departmentHead}
            />

            <FileUploadInput
              label="Upload Document"
              targetPath="documents" // Top-level field
              icon={<FileText className="h-5 w-5" />}
              setFormData={setFormData}
              setErrors={setFormErrors}
              formData={formData}
              error={getNestedValue(formErrors, "documents")}
              accept="image/*,.pdf"
              multiple={true}
            />

            {formData.documents && formData.documents.length > 0 && (
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Uploaded Documents ({formData.documents.length})
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {formData.documents.map((doc, index) => {
                const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                const fileExtension = fileName.split('.').pop()?.toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                
                return (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {isImage ? (
                        <Image className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate"
                        title={fileName}
                      >
                        {fileName.length > 25 ? fileName.slice(0, 25) + '...' : fileName}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          documents: prev.documents.filter((_, i) => i !== index)
                        }));
                      }}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Remove document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </div>

          <div className="flex justify-end gap-4 mt-6 p-8">
              <Button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm()
                }}
                className="bg-gray-500 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                  disabled={isCreating}
                  onClick={handleSubmit}
                className="rounded-lg"
                size="sm"
              >
                {
                  modalType === "create" ? (
                    <span>{isCreating ? "Creating..." : "Create Vendor"}</span>
                  ) : (
                    <span>{isUpdating ? "Updating..." : "Update Vendor Details"}</span>
                  )
                }
                {/* <span>Create Vendor</span> */}
              </Button>
            </div>
        </div>
      </Modal>
      
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this vendor data? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default VendorManagementPage;
