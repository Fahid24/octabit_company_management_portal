import { apiSlice } from "../api/api";

export const lmsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourse: builder.query({
      query: () => ({
        url: "api/lms",
        method: "GET",
      }),
    }),
    getCourseById: builder.query({
      query: (id) => ({
        url: `api/lms/${id}`,
        method: "GET",
      }),
    }),
    getCourseSummary: builder.query({
      query: ({ page = 1, limit = 10, department, status, level, search }) => {
        // console.log(search);
        let queryParams = `page=${page}&limit=${limit}`;
        if (search) queryParams += `&search=${search}`;
        if (department) queryParams += `&department=${department}`;
        if (status) queryParams += `&status=${status}`;
        if (Array.isArray(level)) {
          queryParams += `&level=${level.join(',')}`;
        } else if (level) {
          queryParams += `&level=${level}`;
        }

        return {
          url: `api/lms/course-summary?${queryParams}`,
          method: "GET",
        };
      },
    }),
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "api/lms",
        method: "POST",
        body: courseData,
      }),
    }),
    updateCourse: builder.mutation({
      query: ({ id, courseData }) => ({
        url: `api/lms/${id}`,
        method: "PUT",
        body: courseData,
      }),
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `api/lms/${id}`,
        method: "DELETE",
      }),
    }),
    getCourseProgress: builder.query({
      query: (id) => ({
        url: `api/lms/${id}/progress`,
        method: "GET",
      }),
    }),
    getCoursesByDepartment: builder.query({
      query: (departmentId) => ({
        url: `api/by-department/${departmentId}`,
        method: "GET",
      }),
    }),
    getUserSummaries: builder.query({
      query: ({ userId, departmentId }) => ({
        url: `api/lms/user-summaries?userId=${userId}&departmentId=${departmentId}`,
        method: "GET",
      }),
    }),
    trackProgress: builder.mutation({
      query: (progressData) => ({
        url: "api/progress",
        method: "POST",
        body: progressData,
      }),
    }),
    getProgressByCourseId: builder.query({
      query: (courseId) => ({
        url: `api/progress/course/${courseId}`,
        method: "GET",
      }),
    }),
    getProgressByUserAndCourse: builder.query({
      query: ({ userId, courseId }) => ({
        url: `api/progress/${userId}/${courseId}`,
        method: "GET",
      }),
    }),
    createCertificate: builder.mutation({
      query: (certificateData) => ({
        url: "api/progress/certificate",
        method: "POST",
        body: certificateData,
      }),
    }),
    getCertificateByUserId: builder.query({
      query: (userId) => ({
        url: `api/progress/certificate/user/${userId}`,
        method: "GET",
      }),
    }),
    getCertificate: builder.query({
      query: ({ userId, courseId }) => ({
        url: `api/progress/certificate/${userId}/${courseId}`,
        method: "GET",
      }),
    }),
    getCompletedProgress: builder.query({
      query: ({ search, role, startDate, endDate, page = 1, limit = 10 }) => {
        let url = "api/lms/completed/all",
          queryParams = `?page=${page}&limit=${limit}`;
        if (search) queryParams += `&search=${search}`;
        if (role) queryParams += `&role=${role}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        return {
          url: `${url}${queryParams}`,
          method: "GET",
        };

      },
    }),
    updateCertificateApproval: builder.mutation({
      query: ({ progressId, approvedCertificate }) => ({
        url: `api/lms/completed/all/${progressId}`,
        method: 'PUT',
        body: { approvedCertificate }
      }),
    }),
  }),
});

export const {
  useGetAllCourseQuery,
  useGetCourseByIdQuery,
  useGetCourseSummaryQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseProgressQuery,
  useGetCoursesByDepartmentQuery,
  useGetUserSummariesQuery,
  useTrackProgressMutation,
  useGetProgressByCourseIdQuery,
  useGetProgressByUserAndCourseQuery,
  useCreateCertificateMutation,
  useGetCertificateByUserIdQuery,
  useLazyGetCertificateQuery,
  useGetCompletedProgressQuery,
  useUpdateCertificateApprovalMutation,
} = lmsApiSlice;
