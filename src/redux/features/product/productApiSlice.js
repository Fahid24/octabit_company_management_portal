// redux/features/product/productApiSlice.js
import { apiSlice } from "../api/api";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "",
        typeId = "",
        currentOwner = "",
      }) => {
        let url = `api/product?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }
        if (status) {
          url += `&status=${status}`;
        }
        if (typeId) {
          url += `&type=${typeId}`;
        }
        if (currentOwner) {
          url += `&currentOwner=${currentOwner}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id) => ({
        url: `api/product/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: "api/product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/product/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Product",
        { type: "Product", id },
      ],
    }),
    deleteProduct: builder.mutation({
      query: ({ productId, actionBy }) => ({
        url: `api/product/${productId}?actionBy=${actionBy}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    createBulkProducts: builder.mutation({
      query: (data) => ({
        url: "api/product/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    assignProduct: builder.mutation({
      query: ({ productId, body }) => ({
        url: `api/product/handover/${productId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    dischargeProduct: builder.mutation({
      query: ({ productId, body }) => ({
        url: `api/product/return/${productId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateBulkProductsMutation,
  useAssignProductMutation,
  useDischargeProductMutation,
} = productApiSlice;