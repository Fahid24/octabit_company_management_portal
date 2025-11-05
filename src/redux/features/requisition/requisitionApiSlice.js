// redux/features/model/typeApiSlice.js
import { apiSlice } from "../api/api";

export const requisitionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRequisitions: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" }) => {
        let url = `api/requisition?page=${page}&limit=${limit}`;

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
      providesTags: ["Requisition"],
    }),
    getRequisitionById: builder.query({
      query: (id) => ({
        url: `api/requisition/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Requisition", id }],
    }),
    createRequisition: builder.mutation({
      query: (data) => ({
        url: "api/requisition",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Requisition"],
    }),
    updateRequisition: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/requisition/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Requisition",
        { type: "Requisition", id },
      ],
    }),
    deleteRequisition: builder.mutation({
      query: (id) => ({
        url: `api/requisition/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Requisition"],
    }),
    statusUpdateAction: builder.mutation({
      query: ({ id, body }) => {
        console.log(id);
        return {
          url: `api/requisition/action/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        "Requisition",
        { type: "Requisition", id },
      ],
    }),
    validateRequisitionById: builder.query({
      query: (id) => ({
        url: `api/requisition/requisitionId/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetRequisitionsQuery,
  useGetRequisitionByIdQuery,
  useCreateRequisitionMutation,
  useUpdateRequisitionMutation,
  useDeleteRequisitionMutation,
  useStatusUpdateActionMutation,
  useValidateRequisitionByIdQuery,
} = requisitionApiSlice;
