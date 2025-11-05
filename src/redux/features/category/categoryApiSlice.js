// redux/features/model/categoryApiSlice.js
import { apiSlice } from "../api/api";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryCategories: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" }) => {
        let url = `api/category?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }
        if (status) {
          url += `&status=${status}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Category"],
    }),
    getInventoryCategoryById: builder.query({
      query: (id) => ({
        url: `api/category/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),
    createInventoryCategory: builder.mutation({
      query: (data) => ({
        url: "api/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateInventoryCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Category",
        { type: "Category", id },
      ],
    }),
    deleteInventoryCategory: builder.mutation({
      query: (id) => ({
        url: `api/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetInventoryCategoriesQuery,
  useGetInventoryCategoryByIdQuery,
  useCreateInventoryCategoryMutation,
  useUpdateInventoryCategoryMutation,
  useDeleteInventoryCategoryMutation,
} = categoryApiSlice;
