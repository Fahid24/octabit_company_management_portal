import { apiSlice } from '../api/api';

export const statsManagerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManagerKpiStats: builder.query({
      query: ({ managerId, from, to }) => {
        let url = `api/stats/manager/kpi/${managerId}`;
        
        // Add query parameters if they exist
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      transformResponse: (response) => response,
      providesTags: (result, error, { managerId }) => [{ type: 'ManagerStats', id: managerId }],
    }),
  }),
});

export const { useGetManagerKpiStatsQuery } = statsManagerApiSlice;
