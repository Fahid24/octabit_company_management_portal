// redux/features/jobSafety/jobSafetyApiSlice.js
import { apiSlice } from '../api/api';

export const jobSafetyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createJobSafety: builder.mutation({
      query: (data) => ({
        url: "api/job-safety",
        method: "POST",
        body: data,
      }),
      // Optionally add invalidatesTags here if needed for caching
    }),
    getAllJobSafeties: builder.query({
      query: () => ({
        url: "api/job-safety",
        method: "GET",
      }),
      providesTags: ["JobSafety"],
    }),
    getJobSafetyById: builder.query({
      query: (id) => ({
        url: `api/job-safety/${id}`,
        method: "GET",
      }),
      // Optionally add providesTags here if needed for caching
    }),
    deleteJobSafety: builder.mutation({
      query: (id) => ({
        url: `api/job-safety/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["JobSafety"],
    }),
  }),
});

export const {
  useCreateJobSafetyMutation,
  useGetAllJobSafetiesQuery, // Export the new hook
  useGetJobSafetyByIdQuery, // Export the new hook
  useDeleteJobSafetyMutation, // Export the new hook
  // Export other hooks here as you add endpoints
} = jobSafetyApiSlice;
