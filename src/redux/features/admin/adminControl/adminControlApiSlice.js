import { apiSlice } from "../../api/api";

export const adminControlApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    existsWorkingDays: builder.query({
      query: (date) => `api/working-day/exists?monthKey=${date}`,
    }),

    requestToCompleteWorkingDays: builder.mutation({
      query: (data) => ({
        url: "api/working-day/create",
        method: "POST",
        body: data,
      }),
    }),

    adminConfigSetup: builder.mutation({
      query: (data) => ({
        url: `api/admin/config/setup`,
        method: "POST",
        body: data,
      })
    }),

    getAdminConfig: builder.query({
      query: () => `api/admin/config`,
    }),

    updateAdminConfig: builder.mutation({
      query: (data) => ({ 
        url: `api/admin/config/update`,
        method: "PUT",
        body: data,
      }),
    }),

    getAdminConfigStatus: builder.query({
      query: () => `api/admin/config/status`,
    })
    
  }),
});

export const {
    useExistsWorkingDaysQuery,
    useRequestToCompleteWorkingDaysMutation,
    useAdminConfigSetupMutation,
    useGetAdminConfigStatusQuery,
    useGetAdminConfigQuery,
    useUpdateAdminConfigMutation
} = adminControlApiSlice;
