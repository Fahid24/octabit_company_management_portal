import { apiSlice } from "../api/api";

export const dropboxApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Create Dropbox Entry ─────────────────────
    createDropboxEntry: builder.mutation({
      query: (formData) => ({
        url: "/api/dropbox",
        method: "POST",
        body: formData,
      }),
    }),

    // ─── Update Dropbox Entry ─────────────────────
    updateDropboxEntry: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/dropbox/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // ─── Delete Entire Dropbox Entry ───────────────
    deleteDropboxEntry: builder.mutation({
      query: (id) => ({
        url: `/api/dropbox/${id}`,
        method: "DELETE",
      }),
    }),

    // ─── Get All Dropbox Entries for an Employee ───
    getDropboxByEmployee: builder.query({
      query: ({
        employeeId,
        page = 1,
        limit = 10,
        search = "",
        startDate,
        endDate,
      }) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);

        return {
          url: `/api/dropbox/employee/${employeeId}?${params.toString()}`,
          method: "GET",
        };
      },
    }),

    // ─── Get Single Dropbox Entry ──────────────────
    getDropboxById: builder.query({
      query: (id) => ({
        url: `/api/dropbox/${id}`,
        method: "GET",
      }),
    }),

    // ─── Delete a Single File from Dropbox Group ───
    deleteDropboxFile: builder.mutation({
      query: ({ dropboxId, fileId }) => ({
        url: `/api/dropbox/${dropboxId}/file/${fileId}`,
        method: "DELETE",
      }),
    }),

    // ─── Share Dropbox Entry with Users/Depts ──────
    shareDropboxEntry: builder.mutation({
      query: ({ id, shares }) => ({
        url: `/api/dropbox/${id}/share`,
        method: "PUT",
        body: { shares },
      }),
    }),

    // ─── Update Shared With List ───────────────────
    updateSharedWithList: builder.mutation({
      query: ({ dropboxId, data }) => ({
        url: `/api/dropbox/${dropboxId}/shared-with-update`,
        method: "PUT",
        body: data,
      }),
    }),

    // ─── Get Documents Shared With Me ──────────────
    getDocumentsSharedWithMe: builder.query({
      query: (args = {}) => {
        const { employeeId, departmentId } = args;

        const params = new URLSearchParams();
        // params.append("employeeId", employeeId);
        params.append("userId", employeeId); // ✅

        if (departmentId) params.append("departmentId", departmentId);

        return {
          url: `/api/dropbox/shared-with-me?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useCreateDropboxEntryMutation,
  useUpdateDropboxEntryMutation,
  useDeleteDropboxEntryMutation,
  useGetDropboxByEmployeeQuery,
  useDeleteDropboxFileMutation,
  useGetDropboxByIdQuery,
  useGetDocumentsSharedWithMeQuery,
  useUpdateSharedWithListMutation,
  useShareDropboxEntryMutation,
} = dropboxApiSlice;
