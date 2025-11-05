import { apiSlice } from "../api/api";

export const attendanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceSummary: builder.query({
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
          queryParams += `${queryParams ? "&" : ""}from=${startDate}`;
        }
        if (endDate) {
          queryParams += `${queryParams ? "&" : ""}to=${endDate}`;
        }
        return {
          url: `api/attendence/summary${
            queryParams ? `?${queryParams}` : ""
          }`,
          method: "GET",
        };
      },
            providesTags: ['AttendanceSummary'],
    }),
    getAttendanceById: builder.query({
      query: (id) => {
        return {
          url: `api/attendence/by-id/${id}`,
          method: "GET",
        };
      },
      providesTags: (result, error, id) => [{ type: 'Attendance', id }],
    }),
    createAttendance: builder.mutation({
      query: (data) => ({
        url: 'api/attendence/admin-create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AttendanceSummary'],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `api/attendence/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Attendance', id },
        'AttendanceSummary'
      ],
    }),
    getMonthlyAttendanceSummary: builder.query({
      query: ({ employeeIds, date, departmentIds } = {}) => {
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
        if (date) {
          // Using date directly as the parameter
          queryParams += `${queryParams ? "&" : ""}date=${date}`;
        }
        
        return {
          url: `api/attendence/detailed-report${queryParams ? `?${queryParams}` : ""}`,
          method: "GET",
        };
      },
    }),
  
  }),
});

export const { useGetAttendanceSummaryQuery, useGetAttendanceByIdQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation, useGetMonthlyAttendanceSummaryQuery } = attendanceApiSlice;