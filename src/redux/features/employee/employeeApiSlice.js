import { apiSlice } from '../api/api';

export const employeeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        checkin: builder.mutation({
            query: (data) => ({ 
                url: 'api/attendence/checkin',
                method: 'POST',
                body: data,
            }),
        }),
        checkout: builder.mutation({
            query: (data) => ({
                url: 'api/attendence/checkout',
                method: 'POST',
                body: data,
            }),
        }),
        getSingleEmployeeStatsById: builder.query({
            query: ({ id, startDate, endDate }) => {
                let url = `/api/attendence/single-employee/${id}`;

                if (startDate && endDate) {
                    url += `?startDate=${startDate}&endDate=${endDate}`;
                }

                return ({
                    url: url,
                    method: 'GET',
                })
            },
        }),
        getAllEmployees: builder.query({
            query: ({ page = 1, limit = 10 }) => ({
                url: `api/employee/all?page=${page}&limit=${limit}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useCheckinMutation,
    useCheckoutMutation,
    useGetSingleEmployeeStatsByIdQuery,
    useGetAllEmployeesQuery
} = employeeApiSlice;
