// redux/features/model/departmentApiSlice.js
import { apiSlice } from "../../api/api";

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: ({
        page,
        limit,
        employeeId,
        startDate,
        dueDate,
        endDate,
        search,
        status,
        departmentHead = "",
        managerId = "",
      }) => {
        let url = `api/project?populate=true&page=${page}&limit=${limit}`;

        if (employeeId) {
          url += `&employeeId=${employeeId}`;
        }

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        if (status) {
          url += `&status=${encodeURIComponent(status)}`;
        }
        if (departmentHead) {
          url += `&departmentHead=${departmentHead}`;
        }

        if (managerId) {
          url += `&managerId=${managerId}`;
        }

        // Add startDate filters
        if (startDate?.from) {
          url += `&startDateFrom=${startDate.from}`;
        }
        if (startDate?.to) {
          url += `&startDateTo=${startDate.to}`;
        }

        // Add dueDate filters
        if (dueDate?.from) {
          url += `&dueDateFrom=${dueDate.from}`;
        }
        if (dueDate?.to) {
          url += `&dueDateTo=${dueDate.to}`;
        }

        // Add endDate filters
        if (endDate?.from) {
          url += `&endDateFrom=${endDate.from}`;
        }
        if (endDate?.to) {
          url += `&endDateTo=${endDate.to}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.projects
          ? [
              ...result.projects.map(({ _id }) => ({
                type: "Project",
                id: _id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    getProject: builder.query({
      query: (id) => `api/project/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),
    createProject: builder.mutation({
      query: (newProject) => ({
        url: "api/project",
        method: "POST",
        body: newProject,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/project/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),
    softDeleteProject: builder.mutation({
      query: (id) => ({
        url: `api/project/${id}`,
        method: "DELETE",
      }),
    }),
    hardDeleteProject: builder.mutation({
      query: (id) => ({
        url: `api/project/hard/${id}`,
        method: "DELETE",
      }),
    }),
    getEmployeeProject: builder.query({
      query: (id) => `api/project/employee/${id}`,
    }),
    getDepartmentProject: builder.query({
      query: (id) => `api/project/department/${id}`,
    }),
    getDepartmentHeadProject: builder.query({
      query: (id) => `api/project/department-head/${id}`,
    }),
    getProjectManagerProject: builder.query({
      query: (id) => `api/project/project-manager/${id}`,
    }),
    getDepartmentWiseTasksByProjectId: builder.query({
      query: (id) => `api/project/tasks/${id}`,
    }),
    getAssignmentsByProjectId: builder.query({
      query: (id) => `api/project/assignment/${id}`,
    }),
    getAllAssignedTasksByProjectId: builder.query({
      query: (id) => `/api/project/assignment-matrix/${id}`,
    }),
    addKpi: builder.mutation({
      query: (kpiData) => ({
        url: "api/project/add-kpi",
        method: "PUT",
        body: kpiData,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useSoftDeleteProjectMutation,
  useHardDeleteProjectMutation,
  useGetEmployeeProjectQuery,
  useGetDepartmentProjectQuery,
  useGetDepartmentHeadProjectQuery,
  useGetProjectManagerProjectQuery,
  useGetDepartmentWiseTasksByProjectIdQuery,
  useGetAssignmentsByProjectIdQuery,
  useGetAllAssignedTasksByProjectIdQuery,
  useAddKpiMutation
} = projectApiSlice;