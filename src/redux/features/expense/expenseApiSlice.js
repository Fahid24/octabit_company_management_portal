import { apiSlice } from "../api/api";

export const expenseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: ({ page = 0, limit = 0, category, startDate, endDate }) => {
        let url = `api/expense?page=${page}&limit=${limit}`;
        if (category) {
          url += `&category=${category}`;
        }
        if (startDate) {
          url += `&start=${startDate}`;
        }
        if (endDate) {
          url += `&end=${endDate}`;
        }
        return url;
      },
      providesTags: ["Expense"],
    }),

    getSingleExpense: builder.query({
      query: (id) => `api/expense/${id}`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),

    getExpenseCategories: builder.query({
      query: () => `api/expense/categories`,
      providesTags: ["ExpenseCategory"],
    }),

    createSingleExpense: builder.mutation({
      query: (newExpense) => ({
        url: `api/expense`,
        method: "POST",
        body: newExpense,
      }),
      invalidatesTags: ["Expense", "ExpenseCategory"],
    }),

    createBulkExpense: builder.mutation({
      query: (newExpenses) => ({
        url: `api/expense/bulk`,
        method: "POST",
        body: newExpenses,
      }),
      invalidatesTags: ["Expense", "ExpenseCategory"],
    }),

    updateExpense: builder.mutation({
      query: (updatedExpense) => ({
        url: `api/expense/${updatedExpense?.updates?.id}`,
        method: "PATCH",
        body: updatedExpense,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Expense",
        { type: "Expense", id },
      ],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `api/expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"],
    }),

    financeDashboard: builder.query({
      query: () => `api/expense/finance-dashboard`,
      // providesTags: ["FinanceDashboard"],
    }),
  }),
});


export const {
    useGetExpensesQuery,
    useGetSingleExpenseQuery,
    useGetExpenseCategoriesQuery,
    useCreateSingleExpenseMutation,
    useCreateBulkExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useFinanceDashboardQuery,
} = expenseApiSlice;