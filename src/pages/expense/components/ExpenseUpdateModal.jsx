import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "../../../component/Modal";
import Button from "../../../component/Button";

import SelectInput from "../../../component/select/SelectInput";
import BulkProductFileUpload from "@/pages/product/components/BulkProductFileUpload";
import {
  useGetExpenseCategoriesQuery,
  useUpdateExpenseMutation,
} from "../../../redux/features/expense/expenseApiSlice";
import { toast } from "@/component/Toast";
import { useSelector } from "react-redux";
import { FloatingInput } from "@/component/FloatiingInput";

const ExpenseUpdateModal = ({ open, onClose, expense, refetch }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: null,
    customCategory: "", // Add custom category field
    amount: "",
    date: "",
    proofUrl: [],
  });
  const [formErrors, setFormErrors] = useState({});

  const loginUser = useSelector((state) => state.userSlice.user);

  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const { data: categoriesData } = useGetExpenseCategoriesQuery();

  // Transform categories data for select options
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.categories) return [];
    const options = categoriesData.categories.map((category) => ({
      value: category,
      label: category,
    }));
    // Add "Other" option
    options.push({
      value: "",
      label: "Other",
    });
    return options;
  }, [categoriesData]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    // Create date object from the UTC string
    const date = new Date(dateString);

    // Get year, month, and day components in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Format as YYYY-MM-DD
    return `${year}-${month}-${day}`;
  };


  useEffect(() => {
    if (expense && open) {

      const proofFiles =
        expense.proofUrl?.map((url, index) => ({
          id: `existing-${index}`,
          name: getFileNameFromUrl(url),
          url: url,
          type: getDocumentType(url),
        })) || [];

      // Find matching category option or check if it's a custom category
      let categoryOption = categoryOptions.find(
        (option) => option.value === expense.category
      );
      
      let customCategoryValue = "";
      
      // If no match found in predefined categories, it's a custom category
      if (!categoryOption && expense.category) {
        // Set to "Other" option and populate custom category field
        categoryOption = categoryOptions.find(option => option.value === "");
        customCategoryValue = expense.category;
      }

      setFormData({
        title: expense.title || "",
        category: categoryOption || null,
        customCategory: customCategoryValue,
        amount: expense.amount?.toString() || "",
        date: formatDateForInput(expense.date) || "",
        proofUrl: proofFiles,
      });
      setFormErrors({});
    }
  }, [expense, open, categoryOptions]);

  // Helper functions for file handling
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop();
      return filename || "Document";
    } catch {
      const parts = url.split("/");
      return parts[parts.length - 1] || "Document";
    }
  };

  const getDocumentType = (url) => {
    if (!url) return "link";
    const extension = url.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    if (imageExtensions.includes(extension)) return "image";
    return "document";
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Check if category is selected (either from dropdown or custom)
    const hasCategory = formData.category?.value || 
      (formData.category?.value === "" && formData.customCategory.trim());

    if (!hasCategory) {
      errors.category = "Category is required";
    }

    // If "Other" is selected but no custom category is provided
    if (formData.category?.value === "" && !formData.customCategory.trim()) {
      errors.customCategory = "Custom category is required";
    }

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Amount is required and must be greater than 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Process documents for submission
  const processDocuments = (documents) => {
    if (!documents || !Array.isArray(documents)) return [];
    return documents.map((doc) => doc.url).filter(Boolean);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        updatedBy: loginUser?.user?._id,
        updates: {
          id: expense._id,
          title: formData.title.trim(),
          category: formData.category?.value === "" ? formData.customCategory.trim() : formData.category.value,
          amount: parseFloat(formData.amount),
          date: formData.date || expense.date,
          proofUrl: processDocuments(formData.proofUrl),
        },
      };

      await updateExpense(updateData).unwrap();

      toast.success("Expense updated successfully");

      // Close modal and refresh data
      handleClose();
      refetch();
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense", error?.data?.error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      title: "",
      category: null,
      customCategory: "", // Add custom category field
      amount: "",
      date: "",
      proofUrl: [],
    });
    setFormErrors({});
    onClose();
  };

  if (!expense) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Update Expense
            </h2>
            <p className="text-sm text-gray-600">
              Edit expense details and save changes
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            {formData.category?.value === "" ? (
              <div>
                <FloatingInput
                  label="Custom Category"
                  value={formData.customCategory}
                  onChange={(e) => handleFormChange("customCategory", e.target.value)}
                  error={formErrors.customCategory}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    handleFormChange("category", null);
                    handleFormChange("customCategory", "");
                  }}
                  className="text-xs underline text-blue-600 hover:text-blue-800"
                >
                  Back to Categories
                </button>
              </div>
            ) : (
              // Show select input by default
              <SelectInput
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(value) => {
                  handleFormChange("category", value);
                  // Clear custom category when switching back from "Other"
                  if (value?.value !== "") {
                    handleFormChange("customCategory", "");
                  }
                }}
                error={formErrors.category}
                required
              />
            )}

            {/* Title */}
            <FloatingInput
              label="Title"
              value={formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              error={formErrors.title}
              required
            />

            {/* Amount */}
            <FloatingInput
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleFormChange("amount", e.target.value)}
              error={formErrors.amount}
              required
            />

            {/* Date */}
            <FloatingInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
              error={formErrors.date}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof Documents
            </label>
            <BulkProductFileUpload
              value={formData.proofUrl}
              onChange={(files) => handleFormChange("proofUrl", files)}
              error={formErrors.proofUrl}
              productIndex={0}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="min-w-[120px]"
          >
            {isUpdating ? "Updating..." : "Update Expense"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ExpenseUpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  expense: PropTypes.object,
  refetch: PropTypes.func.isRequired,
};

export default ExpenseUpdateModal;
