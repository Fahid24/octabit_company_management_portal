import { useState, useMemo, useCallback } from "react";
import { Plus, Eye, Trash2, Edit } from "lucide-react";
import Button from "../../component/Button";
import Table from "../../component/Table";
import Pagination from "../../component/Pagination";
import ConfirmDialog from "../../component/ConfirmDialog";
import DateRangeSelector from "../../component/DateRangeSelector";
import BulkExpenseCreateModal from "./components/BulkExpenseCreateModal";
import ExpenseUpdateModal from "./components/ExpenseUpdateModal";
import ExpenseViewModal from "./components/ExpenseViewModal";
import { formatDate } from "../../utils/dateFormatFunction";
import {
  useGetExpensesQuery,
  useGetExpenseCategoriesQuery,
  useDeleteExpenseMutation,
} from "../../redux/features/expense/expenseApiSlice";
import Loader from "@/component/Loader";
import SelectInput from "@/component/select/SelectInput";

const ExpenseManagementPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setPage(1); // Reset to first page when filters change
  };

  // API hooks
  const {
    data: expensesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetExpensesQuery({
    page: page,
    limit: limit,
    category: selectedCategory?.value || "",
    startDate: dateRange.startDate || "",
    endDate: dateRange.endDate || "",
  });

  const { data: categoriesData } = useGetExpenseCategoriesQuery();

  const [deleteExpense] = useDeleteExpenseMutation();

  // Transform categories data for select options
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return categoriesData?.categories?.map((category) => ({
      value: category,
      label: category,
    }));
  }, [categoriesData]);

  // Table columns
  const columns = [
    "Title",
    "Category",
    "Amount",
    "Date",
    "Created By",
    "Actions",
  ];

  // Handle view details
  const handleViewClick = (expense) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  // Handle edit
  const handleEditClick = useCallback((expense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  }, []);

  // Handle delete
  const handleDeleteClick = useCallback((expenseId) => {
    console.log(expenseId);
    setDeleteExpenseId(expenseId);
    setIsDeleteDialogOpen(true);
  }, []);

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await deleteExpense(deleteExpenseId).unwrap();
      setIsDeleteDialogOpen(false);
      setDeleteExpenseId(null);
      refetch();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Transform data for table
  const tableData = useMemo(() => {
    if (!expensesData?.expenses) return [];

    return expensesData.expenses.map((expense) => ({
      Title: expense.title,
      Category: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {expense.category}
        </span>
      ),
      Amount: formatCurrency(expense.amount),
      Date: formatDate(expense.date),
      "Created By": expense.createdBy
        ? `${expense.createdBy.firstName} ${expense.createdBy.lastName}`
        : "N/A",
      Actions: (
        <div className="flex items-center gap-3">
          <button
          className="hover:text-blue-500"
            onClick={() => handleViewClick(expense)}
          >
            <Eye size={16} />
          </button>
          <button
          className="hover:text-primary"
            onClick={() => handleEditClick(expense)}
          >
            <Edit size={16} />
          </button>
          <button
          className="hover:text-red-500"
            onClick={() => handleDeleteClick(expense._id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }));
  }, [expensesData, handleEditClick, handleDeleteClick]);

  // Handle create expense
  const handleCreateClick = () => {
    setIsBulkModalOpen(true);
  };

  // Handle close update modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedExpense(null);
  };

  // Handle close view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Expense Management
          </h1>
          <p className="text-xs md:text-sm text-gray-600">Manage and track all company expenses</p>
        </div>
        <Button size="sm" onClick={handleCreateClick} className="flex items-center gap-2">
          <Plus size={20} />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 mx-6 md:mx-0">
        {/* Search */}
        {/* <FloatingInput
            label="Search expenses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title..."
          /> */}

        {/* Category Filter */}
        {/* <CSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select Category"
            isClearable
            isSearchable={false}
          /> */}

          <SelectInput
            options={[{ label: "All", value: "" }, ...categoryOptions]}
            value={selectedCategory}
            onChange={setSelectedCategory}
            label="Filter By Category"
          />

        {/* Date Range Filter */}
        <DateRangeSelector
          label="Date Range"
          onDateRangeChange={handleDateRangeChange}
          allowFutureDates={true}
        />
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader />
        </div>
      ) : (
        <div className="">
          <Table
            columns={columns}
            data={tableData}
            isLoading={isLoading || isFetching}
          />

          {/* Pagination */}
          {expensesData?.pagination && (
            <div className="">
              <Pagination
                totalCount={expensesData.pagination.totalCount}
                currentCount={tableData?.length || 0}
                currentPage={page}
                setCurrentPage={setPage}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* Bulk Expense Create Modal */}
      <BulkExpenseCreateModal
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        refetch={refetch}
      />

      {/* Expense Update Modal */}
      <ExpenseUpdateModal
        open={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        expense={selectedExpense}
        refetch={refetch}
      />

      {/* Expense View Modal */}
      <ExpenseViewModal
        open={isViewModalOpen}
        onClose={handleCloseViewModal}
        expense={selectedExpense}
      />
    </div>
  );
};

export default ExpenseManagementPage;
