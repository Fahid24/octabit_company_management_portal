// redux/features/model/departmentApiSlice.js
import { apiSlice } from "../../api/api";

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: ({ page = 0, limit = 0, isPopulate = true, department, status, role, workLocation, employmentType, departmentHead = "", search }) => {
        let queryParams = `populate=${isPopulate}&page=${page}&limit=${limit}`;
        if (department) queryParams += `&department=${department}`;
        if (status) queryParams += `&status=${status}`;
        if (search) queryParams += `&search=${search}`;
        if (departmentHead) queryParams += `&departmentHead=${departmentHead}`;
        if (Array.isArray(role)) {
          queryParams += `&role=${role.join(',')}`;
        } else if (role) {
          queryParams += `&role=${role}`;
        }
        if (Array.isArray(workLocation)) {
          queryParams += `&workLocation=${workLocation.join(',')}`;
        } else if (workLocation) {
          queryParams += `&workLocation=${workLocation}`;
        }
        if (Array.isArray(employmentType)) {
          queryParams += `&employmentType=${employmentType.join(',')}`;
        } else if (employmentType) {
          queryParams += `&employmentType=${employmentType}`;
        }

        return {
          url: `api/employee/all?${queryParams}`,
          method: "GET",
        };
      },
    }),
    getEmployeeById: builder.query({
      query: (id) => `api/employee/${id}`,
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),
    updateEmployee: builder.mutation({
      query: (data) => ({
        url: "api/employee/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} = employeeApiSlice;
