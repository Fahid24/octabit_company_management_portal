import { apiSlice } from "../api/api";

export const dailyTaskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllDailyTasks: builder.query({
      query: ({ page, limit, employeeId, departmentHead, managerId, departmentId }) => {
        let url = `/api/daily-task?page=${page}&limit=${limit}`;
        if (employeeId) {
          url += `&employeeId=${employeeId}`;
        }

        if (departmentHead) {
          url += `&departmentHead=${departmentHead}`;
        }
        if (departmentId) {
          url += `&departmentId=${departmentId}`;
        }

        if (managerId) {
          url += `&managerId=${managerId}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["DailyTask"],
    }),
    getAllDailyTasksByEmployeeId: builder.query({
      query: ({ employeeId }) => {
        let url = `/api/daily-task/todo/${employeeId}`;
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["DailyTask"],
    }),
    getDailyTaskById: builder.query({
      query: (id) => `/api/daily-task/${id}`,
      providesTags: (result, error, id) => [{ type: "DailyTask", id }],
    }),
    createDailyTask: builder.mutation({
      query: (newTask) => ({
        url: "/api/daily-task",
        method: "POST",
        body: newTask,
      }),
      invalidatesTags: ["DailyTask"],
    }),
    updateDailyTask: builder.mutation({
      query: (updatedTask) => ({
        url: `/api/daily-task/${updatedTask.id}`,
        method: "PUT",
        body: updatedTask,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "DailyTask", id }],
    }),
    updateDailyTaskStatus: builder.mutation({
      query: (updateStatusTask) => ({
        url: `/api/daily-task/status`,
        method: "PUT",
        body: updateStatusTask,
      }),
      invalidatesTags: ["DailyTask"],
    }),
    deleteDailyTask: builder.mutation({
      query: (id) => ({
        url: `/api/daily-task/hard/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DailyTask"],
    }),
  }),
});

export const {
  useGetAllDailyTasksQuery,
  useGetAllDailyTasksByEmployeeIdQuery,
  useGetDailyTaskByIdQuery,
  useCreateDailyTaskMutation,
  useUpdateDailyTaskMutation,
  useDeleteDailyTaskMutation,
  useUpdateDailyTaskStatusMutation,
} = dailyTaskApiSlice;
