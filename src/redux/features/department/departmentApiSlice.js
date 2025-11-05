// redux/features/model/departmentApiSlice.js
import { apiSlice } from "../api/api";

export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: ({ page = 0, limit = 0, isPopulate = true, departmentHead }) => {
        let url = `api/department`;

        url += `?page=${page}&limit=${limit}`;

        if (isPopulate) {
          url += `&populate=true`;
        }
        if (departmentHead) {
          url += `&departmentHead=${departmentHead}`;
        }
        return {
          url,
          method: "GET",
        };
      },
    }),
    getDepartmentList: builder.query({
      query: () => "api/department/departments/list",
      providesTags: ["Department"],
    }),
    createDepartment: builder.mutation({
      query: (data) => ({
        url: "api/department",
        method: "POST",
        body: data,
      }),
    }),
    updateDepartment: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/department/${id}`,
        method: "PATCH",
        body: data,
      }),
      // Invalidate and refetch the departments list after update
      invalidatesTags: ["Department"],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `api/department/${id}`,
        method: "DELETE",
      }),
      // Invalidate and refetch the departments list after deletion
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentListQuery 
} = departmentApiSlice;
