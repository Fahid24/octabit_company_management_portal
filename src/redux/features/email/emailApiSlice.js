import { apiSlice } from "../api/api";


export const emailApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllEmails: builder.query({
      query: ({ search, page, limit, status, startDate, endDate }) => {
        // Only pass date parameters if they have valid values
        const formattedStartDate = startDate && startDate !== '' ? startDate : undefined;
        const formattedEndDate = endDate && endDate !== '' ? endDate : undefined;

        const params = {
          search,
          page,
          limit,
          status,
        };

        // Only add date params if they exist
        if (formattedStartDate) {
          params.startDate = formattedStartDate;
        }
        if (formattedEndDate) {
          params.endDate = formattedEndDate;
        }

        return {
          url: `/api/emails/getAll`,
          method: 'GET',
          params,
        };
      },
    }),

    fetchEmailById: builder.query({
      query: (id) => `/api/emails/details/${id}`,
    }),
    deleteEmail: builder.mutation({
      query: ({ id, userId, userModel }) => ({
        url: `/api/emails/delete/${id}?userId=${userId}&userModel=${userModel}`,
        method: 'DELETE',
      }),
    }),
    updateEmail: builder.mutation({
      query: ({ id, email, userId, userModel }) => ({
        url: `/api/emails/update/${id}?userId=${userId}&userModel=${userModel}`,
        method: 'PUT',
        body: email,
      }),
    }),
    resendEmail: builder.mutation({
      query: ({ id, userId, userModel }) => ({
        url: `/api/emails/resend`,
        method: 'POST',
        body: { userId, id, userModel },
      }),
    }),
    sendEmail: builder.mutation({
      query: ({ to, subject, body, userId, userModel }) => ({
        url: `/api/emails/sendEmail`,
        method: 'POST',
        body: { to, subject, body, userId, userModel },
      }),
    }),
    sendBulkEmail: builder.mutation({
      query: ({ role, subject, plan, to, body, status, orgId, userId, userModel }) => ({
        url: `/api/emails/send-bulk-email`,
        method: 'POST',
        body: { role, subject, plan, to, body, status, orgId, userId, userModel },
      }),
    }),
    sendTestEmail: builder.mutation({
      query: ({ to, subject, body, templateId, userId, userModel }) => ({
        url: `/api/emails/send-test-email`,
        method: 'POST',
        body: { to, subject, body, templateId, userId, userModel },
      }),
    }),
    sendWelcomeEmail: builder.mutation({
      query: ({ email, userId, userModel, role }) => ({
        url: `/api/emails/send-welcome-email`,
        method: 'POST',
        body: { email, userId, userModel, role },
      }),
    }),
    resendAllEmails: builder.mutation({
      query: ({ emailIds, userId, userModel }) => ({
        url: '/api/emails/resend-all',
        method: 'POST',
        body: { emailIds: emailIds, userId: userId, userModel: userModel },
      }),
    }),
    createTemplate: builder.mutation({
      query: (data) => ({
        url: '/api/emails/template/',
        method: 'POST',
        body: data,
      }),
      // invalidatesTags: ['EmailTemplate'],
    }),
    getTemplates: builder.query({
      query: ({ status = "", category }) => {

        let url = `/api/emails/template?`;

        url += `type=${status}`;
        if (category) {
          url += `&category=${category}`;
        }
        return {
          url: url,
          method: 'GET'
        }
      },
      // providesTags: ['EmailTemplate'],
    }),
    getTemplateById: builder.query({
      query: (id) => `/api/emails/template/${id}`,
      // providesTags: (result, error, id) => [{ type: 'EmailTemplate', id }],
    }),
    updateTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/emails/template/${id}`,
        method: 'PUT',
        body: data,
      }),
      // invalidatesTags: (result, error, { id }) => [
      //   { type: 'EmailTemplate', id },
      //   { type: 'EmailTemplate' },
      // ],
    }),
    deleteTemplate: builder.mutation({
      query: ({ id, userId, userModel }) => ({
        url: `/api/emails/template/${id}?userId=${userId}&userModel=${userModel}`,
        method: 'DELETE',
      }),
    }),
    // --- CATEGORY ENDPOINTS ---
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/api/emails/categories',
        method: 'POST',
        body: data,
      }),
    }),

    getCategories: builder.query({
      query: () => ({
        url: '/api/emails/categories',
        method: 'GET',
      }),
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/emails/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),

    deleteCategory: builder.mutation({
      query: ({ id }) => ({
        url: `/api/emails/categories/${id}`,
        method: 'DELETE',
      }),
    }),

    // Fetch emails with optional filters
    // Fetch emails with optional filters
    fetchEmails: builder.query({
      query: ({ role, status, department, clientIds, member, senderType }) => {
        const params = new URLSearchParams();
        // Role(s)
        if (role && role.length > 0) {
          const roles = Array.isArray(role) ? role : [role];
          roles.forEach((r) => params.append("role", r));
        }

        // Status(es)
        if (status && status.length > 0) {
          const statuses = Array.isArray(status) ? status : [status];
          statuses.forEach((s) => params.append("status", s));
        }

        // Department(s)
        if (department && department.length > 0) {
          const depts = Array.isArray(department) ? department : [department];
          depts.forEach((d) => params.append("department", d));
        }

        // Client IDs
        if (clientIds && clientIds.length > 0) {
          const ids = Array.isArray(clientIds) ? clientIds : [clientIds];
          ids.forEach((id) => params.append("clientIds", id));
        }

        // Members (by name)
        if (member && member.length > 0) {
          const members = Array.isArray(member) ? member : [member];
          members.forEach((m) => params.append("member", m));
        }

        // Sender type (clients | members | both)
        if (senderType) {
          params.append("senderType", senderType);
        }

        return {
          url: `/api/emails/bulk-sending-emails?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Emails"],
    }),

  }),
});

export const {
  useGetAllEmailsQuery,
  useFetchEmailByIdQuery,
  useDeleteEmailMutation,
  useUpdateEmailMutation,
  useResendEmailMutation,
  useSendEmailMutation,
  useSendBulkEmailMutation,
  useSendTestEmailMutation,
  useSendWelcomeEmailMutation,
  useResendAllEmailsMutation,
  useCreateTemplateMutation,
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchEmailsQuery,
} = emailApiSlice;
