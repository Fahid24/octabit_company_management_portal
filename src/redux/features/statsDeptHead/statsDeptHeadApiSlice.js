import { apiSlice } from "../api/api";

export const statsDeptHeadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartmentHeadKpiStats: builder.query({
      query: ({ headId, from, to }) => ({
        url: `api/stats/department-head/kpi/${headId}`,
        params: { from, to },
      }),
    }),
  }),
});

export const { useGetDepartmentHeadKpiStatsQuery } = statsDeptHeadApiSlice;
