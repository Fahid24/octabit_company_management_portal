import { apiSlice } from '../api/api';

export const kpiStatsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeKpiStats: builder.query({
      query: (employeeId) => ({
        url: `api/stats/employee/kpi/${employeeId}`,
        method: 'GET',
      }),
      // Optionally add providesTags here if needed for caching
    }),
    getDepartmentKpiStats: builder.query({
      query: (departmentId) => ({
        url: `api/stats/department/kpi/${departmentId}`,
        method: 'GET',
      }),
      // Optionally add providesTags here if needed for caching
    }),
  }),
});

export const {
  useGetEmployeeKpiStatsQuery,
  useGetDepartmentKpiStatsQuery,
} = kpiStatsApiSlice;
