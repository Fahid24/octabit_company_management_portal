import { apiSlice } from "../api/api";

export const moraleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMoralSurvey: builder.mutation({
      query: (data) => ({
        url: '/api/morale/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Morale'],
    }),
    getAllMoralSurveys: builder.query({
      query: () => '/api/morale/all',
      providesTags: ['Morale'],
    }),
  }),
});

export const {
  useCreateMoralSurveyMutation,
  useGetAllMoralSurveysQuery,
} = moraleApiSlice;
