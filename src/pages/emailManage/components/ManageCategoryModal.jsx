import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, Save, AlertCircle } from "lucide-react";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/features/email/emailApiSlice";
import { toast } from "@/component/Toast";

const ManageCategoryModal = ({ isOpen, setIsOpen }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Redux hooks
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setEditingCategory(null);
      setShowDeleteConfirm(null);
      setShowAddForm(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await createCategory({
        name: name.trim(),
        description: description.trim(),
      }).unwrap();

      toast.success("Category created successfully!");
      setName("");
      setDescription("");
      setShowAddForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await updateCategory({
        id: editingCategory._id,
        name: name.trim(),
        description: description.trim(),
      }).unwrap();

      toast.success("Category updated successfully!");
      setEditingCategory(null);
      setName("");
      setDescription("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (categoryId) => {
    console.log(categoryId);
    try {
      await deleteCategory({ id: categoryId }).unwrap();
      toast.success("Category deleted successfully!");
      setShowDeleteConfirm(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Categories
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add New Category Button */}
          <div className="mb-6">
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Category
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingCategory) && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <form onSubmit={editingCategory ? handleUpdate : handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Enter category description"
                    />
                  </div> */}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {editingCategory
                      ? isUpdating
                        ? "Updating..."
                        : "Update Category"
                      : isCreating
                      ? "Creating..."
                      : "Create Category"}
                  </button>
                  <button
                    type="button"
                    onClick={
                      editingCategory ? cancelEdit : () => setShowAddForm(false)
                    }
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Existing Categories</h3>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">
                  Loading categories...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center p-8 text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>Failed to load categories</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading &&
              !error &&
              (!categories || categories.length === 0) && (
                <div className="text-center p-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No categories found</p>
                  <p className="text-sm">
                    Create your first category to get started
                  </p>
                </div>
              )}

            {/* Categories Grid */}
            {!isLoading && !error && categories && categories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(category._id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm === category._id && (
                      <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center p-4 rounded-lg border-2 border-red-200">
                        <p className="text-sm text-center mb-3 text-gray-700">
                          Delete "{category.name}"?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={isDeleting}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoryModal;
