// redux/features/model/typeApiSlice.js
import { apiSlice } from "../api/api";

export const typeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTypes: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "", categoryId }) => {
        let url = `api/type?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }
        if (status) {
          url += `&status=${status}`;
        }

        if (categoryId) {
          url += `&categoryId=${categoryId}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Type"],
    }),
    getTypeById: builder.query({
      query: (id) => ({
        url: `api/type/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Type", id }],
    }),
    createType: builder.mutation({
      query: (data) => ({
        url: "api/type",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Type"],
    }),
    updateType: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/type/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Type",
        { type: "Type", id },
      ],
    }),
    deleteType: builder.mutation({
      query: (id) => ({
        url: `api/type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Type"],
    }),
  }),
});

export const {
  useGetTypesQuery,
  useGetTypeByIdQuery,
  useCreateTypeMutation,
  useUpdateTypeMutation,
  useDeleteTypeMutation,
} = typeApiSlice;
