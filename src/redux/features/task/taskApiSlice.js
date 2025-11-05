// import { apiSlice } from "../../api/api";

import { apiSlice } from "../api/api";

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: ({ page, limit }) => {
        let url = `/api/task?page=${page}&limit=${limit}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getTaskById: builder.query({
      query: (id) => `/api/task/${id}`,
    }),
    createTask: builder.mutation({
      query: (newTask) => ({
        url: "/api/task",
        method: "POST",
        body: newTask,
      }),
    }),
    createBulkTask: builder.mutation({
      query: (newTask) => ({
        url: "/api/task/bulkTasks",
        method: "POST",
        body: newTask,
      }),
    }),
    updateBulkTask: builder.mutation({
      query: (newTask) => ({
        url: "/api/task/bulkTasks",
        method: "PUT",
        body: newTask,
      }),
    }),
    updateTask: builder.mutation({
      query: (updatedTask) => ({
        url: `/api/task/${updatedTask.id}`,
        method: "PUT",
        body: updatedTask,
      }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/api/task/${id}`,
        method: "DELETE",
      }),
    }),
    assignTasksToEmployees: builder.mutation({
      query: (taskData) => ({
        url: "/api/task/bulk-assign",
        method: "PUT",
        body: taskData,
      }),
    }),
    // updateAssignTasksToEmployees: builder.mutation({
    //   query: (taskData) => ({
    //     url: "/api/project/assignment/$",
    //     method: "PUT",
    //     body: taskData,
    //   }),
    // }),
    getAllTasksByProjectId: builder.query({
      query: (id) => `/api/task/project/${id}`,
    }),

    getAllTasksForEmployeeBoard: builder.query({
      query: ({ employeeId, projectId, departmentHead, managerId }) => {
        let url = `/api/task/all`;
        const queryParts = [];

        if (employeeId?.length) {
          // Send array items as multiple query params: ?employeeId=1&employeeId=2
          employeeId.forEach((id) => {
            queryParts.push(`employeeId=${id}`);
          });
        }

        if (projectId?.length) {
          projectId.forEach((id) => {
            queryParts.push(`projectId=${id}`);
          });
        }

        if (departmentHead) {
          queryParts.push(`departmentHeadId=${departmentHead}`);
        }

        if (managerId) {
          queryParts.push(`managerId=${managerId}`);
        }

        if (queryParts.length) {
          url += `?${queryParts.join("&")}`;
        }

        return url;
      },
    }),
    updateTaskStatus: builder.mutation({
      query: (taskData) => ({
        url: "/api/task/status",
        method: "PUT",
        body: taskData,
      }),
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useCreateBulkTaskMutation,
  useUpdateBulkTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAssignTasksToEmployeesMutation,
  useGetAllTasksByProjectIdQuery,
  useGetAllTasksForEmployeeBoardQuery,
  useUpdateTaskStatusMutation,
} = taskApiSlice;
