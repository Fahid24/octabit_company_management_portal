import { apiSlice } from '../api/api';

export const learningApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLearningRequest: builder.mutation({
      query: (data) => ({
        url: 'api/applications/learning-request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LearningRequest'],
    }),
    getLearningRequestsByEmployee: builder.query({
      query: (employeeId) => ({
        url: `api/applications/learning/employee/${employeeId}`,
        method: 'GET',
      }),
      providesTags: ['LearningRequest'],
    }),
    getLearningRequestById: builder.query({
      query: (id) => ({
        url: `api/learning-requests/${id}`,
        method: 'GET',
      }),
       providesTags: ['LearningRequest'],
    }),
    updateLearningStatusRequest: builder.mutation({
        query: ({ id, updatedData }) => ({
            url: `api/applications/learning-request/${id}`,
            method: 'PUT',
            body: updatedData,
        }),
        invalidatesTags: ['LearningRequest'],
    }),
    updateLearningRequest: builder.mutation({
        query: ({ id, data }) => ({
            url: `api/applications/learning-request/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['LearningRequest'],
    }),
    deleteLearningRequest: builder.mutation({
      query: (id) => ({
        url: `api/applications/learning-request/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearningRequest'],
    }),
  }),
});

export const {
  useCreateLearningRequestMutation,
  useGetLearningRequestsByEmployeeQuery,
  useGetLearningRequestByIdQuery,
  useUpdateLearningStatusRequestMutation,
  useUpdateLearningRequestMutation,
  useDeleteLearningRequestMutation,
} = learningApiSlice; 