import { apiSlice } from "../../api/api";

export const workingDetailsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeWorkStats: builder.query({
      query: (employeeId) => ({
        url: `api/attendence/workstats/single`,
        method: "GET",
        params: { employeeId },
      }),
    }),
    getAllEmployeeWorkStats: builder.query({
      query: ({ employeeIds, startDate, endDate, departmentIds } = {}) => {
        let queryParams = "";
        if (employeeIds) {
          queryParams += `employeeIds=${
            Array.isArray(employeeIds) ? employeeIds.join(",") : employeeIds
          }`;
        }
        if (departmentIds) {
          queryParams += `${queryParams ? "&" : ""}departmentIds=${
            Array.isArray(departmentIds)
              ? departmentIds.join(",")
              : departmentIds
          }`;
        }
        if (startDate) {
          queryParams += `${queryParams ? "&" : ""}startDate=${startDate}`;
        }
        if (endDate) {
          queryParams += `${queryParams ? "&" : ""}endDate=${endDate}`;
        }
        return {
          url: `api/attendence/workstats/all${
            queryParams ? `?${queryParams}` : ""
          }`,
          method: "GET",
        };
      },
    }),

    getDashboardStats: builder.query({
      query: ({ startDate, endDate, departmentIds, employeesId, userId }) => {
        let url = `api/stats/dashboard-summary?startDate=${startDate}&endDate=${endDate}&userId=${userId}`

        if (departmentIds) {
          url += `&departmentIds=${Array.isArray(departmentIds) ? departmentIds.join(",") : departmentIds}`;
        }

        if (employeesId) {
          url += `&employeesId=${Array.isArray(employeesId) ? employeesId.join(",") : employeesId}`;
        }

        return {
          url,
          method: "GET",
        };
        
      },
    }),
  }),
});

export const { useGetEmployeeWorkStatsQuery, useGetAllEmployeeWorkStatsQuery, useGetDashboardStatsQuery } = workingDetailsApiSlice;