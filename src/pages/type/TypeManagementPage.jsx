

import Button from "@/component/Button"
import ConfirmDialog from "@/component/ConfirmDialog"
import { FloatingInput } from "@/component/FloatiingInput"
import { FloatingTextarea } from "@/component/FloatingTextarea"
import Loader from "@/component/Loader"
import LogoUpload from "@/component/LogoUpload"
import Modal from "@/component/Modal"
import Pagination from "@/component/Pagination"
import SelectInput from "@/component/select/SelectInput"
import Table from "@/component/Table"
import { toast } from "@/component/Toast"
import Tooltip from "@/component/Tooltip"
import Tooltips from "@/component/Tooltip2"
import useIsMobile from "@/hook/useIsMobile"
import { useGetInventoryCategoriesQuery } from "@/redux/features/category/categoryApiSlice"
import { 
  useCreateTypeMutation, 
  useDeleteTypeMutation, 
  useGetTypesQuery, 
  useUpdateTypeMutation 
} from "@/redux/features/type/typeApiSlice"
import { Aperture, CircleAlert, FileEdit, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

const TypeManagementPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [modalType, setModalType] = useState("create")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [formData, setFormData] = useState({
        _id: "",
        name: "",
        description: "",
        categoryId: null,
        trackingMode: { value: "ASSET", label: "ASSET" },
        status: { value: "Active", label: "Active" },
        logo: ""
    })
    const [formErrors, setFormErrors] = useState({})

    const { data, isLoading, isFetching } = useGetTypesQuery({
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
        categoryId: categoryFilter,
    })

    // Fetch categories for the dropdown
    const { data: categoriesData } = useGetInventoryCategoriesQuery({
        page: 1,
        limit: 100, // Get all categories for dropdown
        search: "",
        status: "Active",
    })

    // console.log(categoriesData);

    const [createType, { isLoading: isCreating }] = useCreateTypeMutation()
    const [updateType, { isLoading: isUpdating }] = useUpdateTypeMutation()
    const [deleteType] = useDeleteTypeMutation()

    // Transform categories data for SelectInput
    const categoryOptions = useMemo(() => {
        return categoriesData?.data?.map((category) => ({
            value: category._id,
            label: category.name
        })) || []
    }, [categoriesData])

    const tableData = useMemo(() => {
        return (
            data?.data?.map((type) => ({
                "Logo": type.logo ? (
                    <div className="flex justify-center">
                        <img 
                            src={type.logo} 
                            alt={`${type.name} logo`}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />
                        <div className="hidden w-10 h-10 rounded-full bg-gray-100 items-center justify-center border border-gray-200">
                            <span className="text-xs text-gray-500">No Logo</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <span className="text-xs text-gray-500">
                                <Aperture />
                            </span>
                        </div>
                    </div>
                ),
                "Item Name": type.name,
                "Category": type.categoryId?.name || "No Category",
                "Description": type.description || "No description",
                "Status": (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {type.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                ),
                Actions: (
                    <div className="flex gap-2">
                        <Tooltip text="Edit Type" position="left">
                            <button
                                className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors border border-primary"
                                onClick={() => {
                                    setFormData({
                                        ...type, 
                                        categoryId: type.categoryId ? {
                                            value: type.categoryId._id,
                                            label: type.categoryId.name
                                        } : null,
                                        trackingMode: { 
                                            value: type.trackingMode, 
                                            label: type.trackingMode 
                                        },
                                        status: { 
                                            value: type.status, 
                                            label: type.status === 'Active' ? 'Active' : 'Inactive' 
                                        },
                                        logo: type.logo || ""
                                    })
                                    setModalType('update')
                                    setIsModalOpen(true)
                                }}
                                title="Edit Type"
                            >
                                <FileEdit size={18} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Delete Type" position="left">
                            <button
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-500"
                                onClick={() => handleDeleteClick(type._id)}
                                title="Delete Type"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Tooltip>
                    </div>
                ),
            })) || []
        )
    }, [data])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name) {
            newErrors.name = "Item Name is required"
        }

        if (!formData.categoryId) {
            newErrors.categoryId = "Category is required"
        }

        if (!formData.trackingMode) {
            newErrors.trackingMode = "Tracking Mode is required"
        }

        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const resetForm = () => {
        setFormData({
            _id: "",
            name: "",
            description: "",
            categoryId: null,
            trackingMode: { value: "ASSET", label: "ASSET" },
            status: { value: "Active", label: "Active" },
            logo: ""
        })
        setFormErrors({})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            if (modalType === "create") {
                await createType({
                    name: formData.name,
                    description: formData.description,
                    categoryId: formData.categoryId.value,
                    status: formData.status.value,
                    trackingMode: formData.trackingMode.value,
                    logo: formData.logo
                })
                toast.success("New Item Added Successfully")
                resetForm()
                setIsModalOpen(false)
            } else {
                const { _id, ...dataWithoutId } = formData
                await updateType({ 
                    id: _id, 
                    data: {
                        name: dataWithoutId.name,
                        description: dataWithoutId.description,
                        categoryId: formData.categoryId.value,
                        trackingMode: formData.trackingMode.value,
                        status: formData.status.value,
                        logo: formData.logo
                    }
                })
                toast.success("Item Updated Successfully")
                setIsModalOpen(false)
                resetForm()
            }
        } catch (error) {
            console.log(error)
            toast.error("An error occurred")
        }
    }

    const handleDeleteClick = (id) => {
        setItemToDelete(id)
        setIsDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteType(itemToDelete).unwrap()
            toast.success("Item deleted successfully!")
            setIsDialogOpen(false)
            setItemToDelete(null)
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete item.")
        }
    }

    const handleCancelDelete = () => {
        setIsDialogOpen(false)
        setItemToDelete(null)
    }

    const isMobile = useIsMobile()

    return (
        <div className="p-4 md:pl-24 pb-20 md:pb-4">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div className="mb-4 sm:mb-0">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-semibold text-gray-800">Items</h1>
                        <div className="ml-2 pt-2 cursor-pointer">
                            <Tooltips
                                text="You can view item names, categories, descriptions, and statuses. Use the action buttons to edit or delete items, or click 'Add Item' to create a new one and keep your structure up to date."
                                position={isMobile ? "bottom" : "right"}
                            >
                                <CircleAlert />
                            </Tooltips>
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage Items and Their Details.
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setIsModalOpen(true)
                        setModalType("create")
                        resetForm()
                    }}
                    variant="primary"
                    className="bg-primary hover:bg-primary/90 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Add Item</span>
                    </div>
                </Button>
            </div>

            {/* Filters Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <FloatingInput
                            label="Search items..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // placeholder="Search by name or description"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <SelectInput
                            label="Filter by Category"
                            value={categoryFilter ? categoryOptions.find(cat => cat.value === categoryFilter) : null}
                            onChange={(selectedOption) => setCategoryFilter(selectedOption?.value || "")}
                            options={categoryOptions}
                            placeholder="All categories"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <SelectInput
                            label="Filter by Status"
                            value={statusFilter ? { value: statusFilter, label: statusFilter === 'Active' ? 'Active' : 'Inactive' } : null}
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
                                setSearchTerm("")
                                setStatusFilter("")
                                setCategoryFilter("")
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
                                "Logo",
                                "Item Name",
                                "Category",
                                "Description",
                                "Status",
                                "Actions",
                            ]}
                        />
                    </div>
                    {tableData && (
                        <div className="mt-6 px-4 sm:px-0">
                            <Pagination
                                totalCount={data?.pagination?.totalCount}
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
                className="max-w-lg"
            >
                <div className="">
                    <h2 className="text-2xl font-semibold  p-5">
                        {modalType === "create" ? "Add New Item" : "Update Item"}
                    </h2>

                    <div className="p-8 space-y-4">
                        <LogoUpload
                            label="Item Logo"
                            value={formData.logo}
                            onChange={(logoUrl) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    logo: logoUrl,
                                }))
                                setFormErrors((prev) => ({
                                    ...prev,
                                    logo: "",
                                }))
                            }}
                            error={formErrors.logo}
                        />

                        <FloatingInput
                            label="Item Name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                                setFormErrors((prev) => ({
                                    ...prev,
                                    name: "",
                                }))
                            }}
                            error={formErrors.name}
                        />

                        <SelectInput
                            className="z-40"
                            label="Category"
                            isMulti={false}
                            value={formData.categoryId}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    categoryId: e,
                                }))
                                setFormErrors((prev) => ({
                                    ...prev,
                                    categoryId: "",
                                }))
                            }}
                            options={categoryOptions}
                            error={formErrors.categoryId}
                        />

                        <SelectInput
                            className="z-40"
                            label="Tracking Mood"
                            isMulti={false}
                            value={formData.trackingMode}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    trackingMode: e,
                                }))
                                setFormErrors((prev) => ({
                                    ...prev,
                                    trackingMode: "",
                                }))
                            }}
                            options={[
                                { label: "ASSET", value: "ASSET" },
                                { label: "CONSUMABLE", value: "CONSUMABLE" }
                            ]}
                            error={formErrors.trackingMode}
                        />

                        <FloatingTextarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                                setFormErrors((prev) => ({
                                    ...prev,
                                    description: "",
                                }))
                            }}
                            error={formErrors.description}
                            rows={3}
                        />

                        <SelectInput
                            className="z-30"
                            label="Status"
                            isMulti={false}
                            value={formData.status}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e,
                                }))
                                setFormErrors((prev) => ({
                                    ...prev,
                                    status: "",
                                }))
                            }}
                            options={[
                                { label: "Active", value: "Active" },
                                { label: "Inactive", value: "Inactive" },
                            ]}
                            error={formErrors.status}
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-6 p-8">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false)
                                resetForm()
                            }}
                            className="bg-gray-500 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            onClick={handleSubmit}
                            className="rounded-lg"
                            size="sm"
                        >
                            {modalType === "create" ? (
                                <span>{isCreating ? "Creating..." : "Create Item"}</span>
                            ) : (
                                <span>{isUpdating ? "Updating..." : "Update Item"}</span>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
            
            <ConfirmDialog
                open={isDialogOpen}
                title="Confirm Deletion"
                message="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    )
}

export default TypeManagementPage