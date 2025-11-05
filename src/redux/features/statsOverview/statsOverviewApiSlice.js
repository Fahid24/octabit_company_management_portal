// redux/features/statsOverview/statsOverviewApiSlice.js
import { apiSlice } from '../api/api';

export const statsOverviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query({
      query: ({ role, departmentId, page = 1, limit = 10, search = '' }) => {
        let url = `api/stats/overview?page=${page}&limit=${limit}`;
        
        if (role) {
          url += `&role=${role}`;
        }
        
        if (departmentId) {
          url += `&departmentId=${departmentId}`;
        }
        
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        
        return url;
      },
      providesTags: ['StatsOverview'],
    }),
  }),
});

export const {
  useGetOverviewStatsQuery,
} = statsOverviewApiSlice;
