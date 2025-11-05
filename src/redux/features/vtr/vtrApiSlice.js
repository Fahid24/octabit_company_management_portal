// import { apiSlice } from "../../api/api";

import { apiSlice } from "../api/api";

export const vtrApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all VTRs
    getAllVtr: builder.query({
      query: ({ page=1, limit=10, userId, search }) => {
        let url = `/api/vtr/getAll?page=${page}&limit=${limit}`;
        if (userId) {
          url += `&userId=${userId}`;
        }
        if (search) {
          url += `&search=${search}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: [{ type: "VTRs", id: "LIST" }],
    }),
    // Create a new VTR
    createVtr: builder.mutation({
      query: (newVtr) => ({
        url: "/api/vtr/create",
        method: "POST",
        body: newVtr,
      }),
      invalidatesTags: [{ type: "VTRs", id: "LIST" }],
    }),

    // Delete a VTR
    deleteVtr: builder.mutation({   
        query: (id) => ({
            url: `/api/vtr/delete/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: [{ type: "VTRs", id: "LIST" }],    
    }),

    // Update a VTR
    updateVtr: builder.mutation({
      query: ({ id, ...updatedVtr }) => ({
        url: `/api/vtr/update/${id}`,
        method: "PUT",
        body: updatedVtr,
      }),
      invalidatesTags: [{ type: "VTRs", id: "LIST" }],
    }),

    // Get single VTR by id
    getVtrById: builder.query({
      query: (id) => ({
        url: `/api/vtr/single/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "VTRs", id }],
    }),
  }),
});

export const {
  useGetAllVtrQuery,
  useCreateVtrMutation,
  useDeleteVtrMutation,
  useUpdateVtrMutation,
  useGetVtrByIdQuery,
} = vtrApiSlice;
