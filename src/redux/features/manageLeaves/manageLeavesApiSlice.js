import { apiSlice } from '../api/api';

export const manageLeavesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveStats: builder.query({
      query: ({ departmentHeadId }) => ({
        url: 'api/leave/stats',
        method: 'GET',
        params: { departmentHeadId },
      }),
      providesTags: ['LeaveStats'],
    }),
    getLeaves: builder.query({
      query: ({ page = 1, limit = 10, employeeIds, departmentIds, status, leaveType, year }) => ({
        url: `api/leave?page=${page}&limit=${limit}`,
        method: 'GET',
        params: { employeeIds, departmentIds, status, leaveType, year },
      }),
      providesTags: ['Leaves'],
    }),
    createLeave: builder.mutation({
      query: (data) => ({
        url: 'api/leave/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Leaves', 'LeaveStats'],
    }),
    deptHeadAction: builder.mutation({
      query: ({ leaveId, deptHeadId, action, comment, startDate, endDate, paidLeave }) => ({
        url: `api/leave/dept-head-action/${leaveId}`,
        method: 'PATCH',
        body: { deptHeadId, action, comment, startDate, endDate, paidLeave },
      }),
      invalidatesTags: ['Leaves', 'LeaveStats'],
    }),
    adminAction: builder.mutation({
      query: ({ leaveId, adminId, action, comment, startDate, endDate, paidLeave }) => ({
        url: `api/leave/admin-action/${leaveId}`,
        method: 'PATCH',
        body: { adminId, action, comment, startDate, endDate, paidLeave },
      }),
      invalidatesTags: ['Leaves', 'LeaveStats'],
    }),
    getLeavesByUserId: builder.query({
      query: ({ userId, page = 1, limit = 10, status, leaveType, year }) => ({
        url: `api/leave/user/${userId}?page=${page}&limit=${limit}`,
        method: 'GET',
        params: { status, leaveType, year },
      }),
      providesTags: ['Leaves'],
    }),
    getLeavesForDepartmentHead: builder.query({
      query: ({ deptHeadId, page = 1, limit = 10, departmentIds, employeeIds, leaveType, status, year }) => ({
        url: `api/leave/department-head/leaves?page=${page}&limit=${limit}`,
        method: 'GET',
        params: { deptHeadId, departmentIds, employeeIds, leaveType, status, year },
      }),
      providesTags: ['Leaves'],
    }),
    getLeaveAdminStats: builder.query({
      query: ({ employeeId, year, departmentId, role, userId, page = 1, limit = 10 }) => ({
        url: 'api/leave/admin-stats',
        method: 'GET',
        params: { page, limit, employeeId, year, departmentId, role, userId },
      }),
      providesTags: ['LeaveAdminStats'],
    }),
    getSingleLeave: builder.query({
      query: (id) => ({
        url: `api/leave/${id}`,
        method: 'GET',
      }),
      providesTags: ['Leaves'],
    }),
    updateLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/leave/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Leaves', 'LeaveStats'],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({
        url: `api/leave/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves', 'LeaveStats'],
    }),
  }),
});

export const {
  useGetLeaveStatsQuery,
  useGetLeavesQuery,
  useCreateLeaveMutation,
  useDeptHeadActionMutation,
  useAdminActionMutation,
  useGetLeavesByUserIdQuery,
  useGetLeavesForDepartmentHeadQuery,
  useGetLeaveAdminStatsQuery,
  useGetSingleLeaveQuery,
  useUpdateLeaveMutation,
  useDeleteLeaveMutation,
} = manageLeavesApiSlice;
