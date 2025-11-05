import Button from "@/component/Button"
import ConfirmDialog from "@/component/ConfirmDialog"
import { FloatingInput } from "@/component/FloatiingInput"
import { FloatingTextarea } from "@/component/FloatingTextarea"
import Loader from "@/component/Loader"
import Modal from "@/component/Modal"
import Pagination from "@/component/Pagination"
import SelectInput from "@/component/select/SelectInput"
import Table from "@/component/Table"
import { toast } from "@/component/Toast"
import Tooltip from "@/component/Tooltip"
import Tooltips from "@/component/Tooltip2"
import useIsMobile from "@/hook/useIsMobile"
import { 
  useCreateInventoryCategoryMutation, 
  useDeleteInventoryCategoryMutation, 
  useGetInventoryCategoriesQuery, 
  useUpdateInventoryCategoryMutation 
} from "@/redux/features/category/categoryApiSlice"
import { CircleAlert, FileEdit, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

const CategoryManagementPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [modalType, setModalType] = useState("create")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [formData, setFormData] = useState({
        _id: "",
        name: "",
        description: "",
        status: { value: "Active", label: "Active" }
    })
    const [formErrors, setFormErrors] = useState({})

    const { data, isLoading, isFetching } = useGetInventoryCategoriesQuery({
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
    })

    const [createCategory, { isLoading: isCreating }] = useCreateInventoryCategoryMutation()
    const [updateCategory, { isLoading: isUpdating }] = useUpdateInventoryCategoryMutation()
    const [deleteCategory] = useDeleteInventoryCategoryMutation()

    const tableData = useMemo(() => {
        return (
            data?.data?.map((category) => ({
                "Category Name": category.name,
                "Description": category.description || "No description",
                "Status": (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {category.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                ),
                Actions: (
                    <div className="flex gap-2">
                        <Tooltip text="Edit Category" position="left">
                            <button
                                className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors border border-primary"
                                onClick={() => {
                                    setFormData({
                                        ...category, 
                                        status: { 
                                            value: category.status, 
                                            label: category.status === 'Active' ? 'Active' : 'Inactive' 
                                        }
                                    })
                                    setModalType('update')
                                    setIsModalOpen(true)
                                }}
                                title="Edit Category"
                            >
                                <FileEdit size={18} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Delete Category" position="left">
                            <button
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-500"
                                onClick={() => handleDeleteClick(category._id)}
                                title="Delete Category"
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
            newErrors.name = "Category Name is required"
        }

        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const resetForm = () => {
        setFormData({
            _id: "",
            name: "",
            description: "",
            status: { value: "Active", label: "Active" }
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
                await createCategory({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status.value
                })
                toast.success("Category created successfully")
                resetForm()
                setIsModalOpen(false)
            } else {
                const { _id, ...dataWithoutId } = formData
                await updateCategory({ 
                    id: _id, 
                    data: {
                        name: dataWithoutId.name,
                        description: dataWithoutId.description,
                        status: formData.status.value
                    }
                })
                toast.success("Category updated successfully")
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
            await deleteCategory(itemToDelete).unwrap()
            toast.success("Category deleted successfully!")
            setIsDialogOpen(false)
            setItemToDelete(null)
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete category.")
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
            <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
            <div className="ml-2 pt-2 cursor-pointer">
              <Tooltips
                text="You can view category names, descriptions, and statuses. Use the action buttons to edit or delete categories, or click “Add Category” to create a new one and keep your structure up to date."
                position={isMobile ? "bottom" : "right"}
              >
                <CircleAlert />
              </Tooltips>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage Categories and Their Details.
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
            <span>Add Category</span>
          </div>
        </Button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <FloatingInput
              label="Search categories..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            //   placeholder="Search by name or description"
            />
          </div>
          <div className="md:col-span-1">
            <SelectInput
              label="Filter by Status"
              value={statusFilter ? { value: statusFilter, label: statusFilter === 'active' ? 'Active' : 'Inactive' } : null}
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
                "Category Name",
                "Description",
                "Status",
                "Actions",
              ]}
            />
          </div>
          {tableData && (
            <div className="mt-6 px-4 sm:px-0">
              <Pagination
                currentCount={tableData.length}
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
          <h2 className="text-2xl font-semibold mb-6 p-5">
            {modalType === "create" ? "Add New Category" : "Update Category"}
          </h2>

          <div className="p-8 space-y-4">
            <FloatingInput
              label="Category Name"
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
                <span>{isCreating ? "Creating..." : "Create Category"}</span>
              ) : (
                <span>{isUpdating ? "Updating..." : "Update Category"}</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
      
      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

export default CategoryManagementPage