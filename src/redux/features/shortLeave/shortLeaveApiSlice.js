import { apiSlice } from '../api/api';

export const shortLeaveApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShortLeaves: builder.query({
      query: ({page=1, limit=10, userId, departmentIds, employeeIds, status, role, startDate, endDate}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        
        if (userId) params.append('userId', userId);
        if (departmentIds && departmentIds.length > 0) {
          departmentIds.forEach(id => params.append('departmentIds', id));
        }
        if (employeeIds && employeeIds.length > 0) {
          employeeIds.forEach(id => params.append('employeeIds', id));
        }
        if (status) params.append('status', status);
        if (role) params.append('role', role);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return {
          url: `api/short-leave?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ShortLeaves'],
    }),
    getSingleShortLeave: builder.query({
      query: (id) => ({
        url: `api/short-leave/${id}`,
        method: 'GET',
      }),
      providesTags: ['ShortLeaves'],
    }),
    createShortLeave: builder.mutation({
      query: (data) => ({
        url: 'api/short-leave/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShortLeaves'],
    }),
    shortLeaveAction: builder.mutation({
      query: ({ id, role, action, comment, startTime, endTime, date }) => ({
        url: `api/short-leave/action/${id}`,
        method: 'PATCH',
        body: { role, action, comment, startTime, endTime, date },
      }),
      invalidatesTags: ['ShortLeaves'],
    }),
    updateShortLeave: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `api/short-leave/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ShortLeaves'],
    }),
    deleteShortLeave: builder.mutation({
      query: (id) => ({
        url: `api/short-leave/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShortLeaves'],
    }),
}),
});

export const {
  useGetShortLeavesQuery,
  useGetSingleShortLeaveQuery,
  useCreateShortLeaveMutation,
  useShortLeaveActionMutation,
  useUpdateShortLeaveMutation,
  useDeleteShortLeaveMutation,
} = shortLeaveApiSlice;
