import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, Trash2, X } from "lucide-react";
import PropTypes from "prop-types";
import Modal from "../../../component/Modal";
import Button from "../../../component/Button";
import { FloatingInput } from "../../../component/FloatiingInput";
import SelectInput from "../../../component/select/SelectInput";

import {
  useGetExpenseCategoriesQuery,
  useCreateBulkExpenseMutation,
} from "../../../redux/features/expense/expenseApiSlice";
import BulkProductFileUpload from "@/pages/product/components/BulkProductFileUpload";
import { toast } from "@/component/Toast";

const BulkExpenseCreateModal = ({ open, onClose, refetch }) => {
  const [expenses, setExpenses] = useState([
    {
      title: "",
      category: null,
      customCategory: "", // Add custom category field
      amount: "",
      date: new Date().toISOString().split("T")[0],
      proofUrl: [],
    },
  ]);
  const [expenseErrors, setExpenseErrors] = useState({});

  const loginUser = useSelector((state) => state.userSlice.user);

  const [createBulkExpenses, { isLoading: isCreating }] = useCreateBulkExpenseMutation();

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

  // Handle expense field changes
  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    setExpenses(updatedExpenses);

    // Clear errors for this field when user starts typing
    if (expenseErrors[index]?.[field]) {
      setExpenseErrors((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: "",
        },
      }));
    }
  };

  // Add another expense
  const handleAddExpense = () => {
    // Validate current expenses before adding a new one
    const currentIndex = expenses.length - 1;
    const currentExpense = expenses[currentIndex];
    
    // Check if category is selected (either from dropdown or custom)
    const hasCategory = currentExpense.category?.value || 
      (currentExpense.category?.value === "" && currentExpense.customCategory.trim());
    
    if (!hasCategory || !currentExpense.title || !currentExpense.amount) {
      // Set errors for required fields
      setExpenseErrors((prev) => ({
        ...prev,
        [currentIndex]: {
          ...prev[currentIndex],
          category: !hasCategory ? "Category is required" : "",
          customCategory: (currentExpense.category?.value === "" && !currentExpense.customCategory.trim()) ? "Custom category is required" : "",
          title: !currentExpense.title ? "Title is required" : "",
          amount: !currentExpense.amount ? "Amount is required" : "",
        },
      }));
      return;
    }

    setExpenses([
      ...expenses,
      {
        title: "",
        category: null,
        customCategory: "", // Add custom category field
        amount: "",
        date: new Date().toISOString().split("T")[0],
        proofUrl: [],
      },
    ]);
  };

  // Remove expense
  const handleRemoveExpense = (index) => {
    if (expenses.length > 1) {
      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);
      
      // Remove errors for this expense
      setExpenseErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        // Reindex remaining errors
        const reindexedErrors = {};
        Object.keys(newErrors).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            reindexedErrors[keyIndex - 1] = newErrors[key];
          } else {
            reindexedErrors[key] = newErrors[key];
          }
        });
        return reindexedErrors;
      });
    }
  };

  // Validate all expenses
  const validateExpenses = () => {
    const errors = {};
    let hasErrors = false;

    expenses.forEach((expense, index) => {
      const expenseErrors = {};

      // Check if category is selected (either from dropdown or custom)
      const hasCategory = expense.category?.value || 
        (expense.category?.value === "" && expense.customCategory.trim());

      if (!hasCategory) {
        expenseErrors.category = "Category is required";
        hasErrors = true;
      }

      // If "Other" is selected but no custom category is provided
      if (expense.category?.value === "" && !expense.customCategory.trim()) {
        expenseErrors.customCategory = "Custom category is required";
        hasErrors = true;
      }

      if (!expense.title.trim()) {
        expenseErrors.title = "Title is required";
        hasErrors = true;
      }

      if (!expense.amount || expense.amount <= 0) {
        expenseErrors.amount = "Amount is required and must be greater than 0";
        hasErrors = true;
      }

      if (Object.keys(expenseErrors).length > 0) {
        errors[index] = expenseErrors;
      }
    });

    setExpenseErrors(errors);
    return !hasErrors;
  };

  // Process documents for submission
  const processDocuments = (documents) => {
    if (!documents || !Array.isArray(documents)) return [];
    return documents.map((doc) => doc.url).filter(Boolean);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateExpenses()) {
      return;
    }

    try {
      const expensesData = expenses.map((expense) => ({
        title: expense.title.trim(),
        category: expense.category?.value === "" ? expense.customCategory.trim() : expense.category.value,
        amount: parseFloat(expense.amount),
        date: expense.date || new Date().toISOString().split('T')[0],
        proofUrl: processDocuments(expense.proofUrl),
      }));

      const payload = {
        createdBy: loginUser?.user?._id,
        expenses: expensesData,
      };

      await createBulkExpenses(payload).unwrap();

      toast.success("Bulk expense(s) created successfully");

      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error("Error creating bulk expenses:", error);
      toast.error("Failed to create expenses", error?.data?.error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setExpenses([
      {
        title: "",
        category: null,
        customCategory: "", // Add custom category field
        amount: "",
        date: new Date().toISOString().split("T")[0],
        proofUrl: [],
      },
    ]);
    setExpenseErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-3xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Expenses
            </h2>
            <p className="text-sm text-gray-600">
              Create multiple expenses at once
            </p>
          </div>
          {/* <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button> */}
        </div>

        {/* Expenses Form */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {expenses.map((expense, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 relative"
            >
              {/* Remove button (only show if more than 1 expense) */}
              {expenses.length > 1 && (
                <button
                  onClick={() => handleRemoveExpense(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Expense {index + 1}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                {expense.category?.value === "" ? (
                  <div>
                    <FloatingInput
                      label="Custom Category"
                      value={expense.customCategory}
                      onChange={(e) => handleExpenseChange(index, "customCategory", e.target.value)}
                      error={expenseErrors[index]?.customCategory}
                      required
                      // placeholder="Enter custom category name"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleExpenseChange(index, "category", null);
                        handleExpenseChange(index, "customCategory", "");
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
                    value={expense.category}
                    onChange={(value) => {
                      handleExpenseChange(index, "category", value);
                      // Clear custom category when switching back from "Other"
                      if (value?.value !== "") {
                        handleExpenseChange(index, "customCategory", "");
                      }
                    }}
                    error={expenseErrors[index]?.category}
                    required
                  />
                )}

                {/* Title */}
                <FloatingInput
                  label="Title"
                  value={expense.title}
                  onChange={(e) => handleExpenseChange(index, "title", e.target.value)}
                  error={expenseErrors[index]?.title}
                  required
                />

                {/* Amount */}
                <FloatingInput
                  label="Amount"
                  type="number"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(index, "amount", e.target.value)}
                  error={expenseErrors[index]?.amount}
                  required
                />

                {/* Date */}
                <FloatingInput
                  label="Date"
                  type="date"
                  value={expense.date}
                  onChange={(e) => handleExpenseChange(index, "date", e.target.value)}
                  error={expenseErrors[index]?.date}
                />
              </div>

              {/* File Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Documents
                </label>
                <BulkProductFileUpload
                  value={expense.proofUrl}
                  onChange={(files) => handleExpenseChange(index, "proofUrl", files)}
                  error={expenseErrors[index]?.proofUrl}
                  expenseIndex={index}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Expense Button */}
        <div className="mt-6 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddExpense}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Another Expense
          </Button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating}
            className="min-w-[120px]"
          >
            {isCreating ? "Creating..." : "Create Expenses"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

BulkExpenseCreateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};

export default BulkExpenseCreateModal;
