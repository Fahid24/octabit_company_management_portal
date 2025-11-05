// redux/features/model/vendorApiSlice.js
import { apiSlice } from "../api/api";

export const vendorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" }) => {
        let url = `api/vendor?page=${page}&limit=${limit}`;

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
      providesTags: ["Vendor"],
    }),
    getVendorById: builder.query({
      query: (id) => ({
        url: `api/vendor/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Vendor", id }],
    }),
    createVendor: builder.mutation({
      query: (data) => ({
        url: "api/vendor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vendor"],
    }),
    updateVendor: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/vendor/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Vendor",
        { type: "Vendor", id },
      ],
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `api/vendor/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendor"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApiSlice;
