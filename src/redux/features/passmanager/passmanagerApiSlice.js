import { apiSlice } from "../api/api";

export const passmanagerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── 1. Get all MY projects & credentials ───────────────
    getProjectsByEmployee: builder.query({
      query: (employeeId) => `/api/password-manager/my/${employeeId}`,
      providesTags: ["Projects"],
    }),

    // ─── 2. Get all SHARED projects for an employee ─────────
    getSharedProjectsByEmployee: builder.query({
      query: ({ employeeId, departmentId }) => {
        let url = `/api/password-manager/shared/${employeeId}`;
        if (departmentId) {
          url + `?departmentId=${departmentId}`
        }

        return {
          url: url,
        }
      },
      providesTags: ["SharedProjects"],
      // Add error handling for when endpoint doesn't exist
      transformErrorResponse: (response) => {
        if (response.status === 404) {
          return { data: [], error: null };
        }
        return response;
      },
    }),

    // ─── 3. Get a single project (with credentials) ─────────
    getProjectById: builder.query({
      query: (projectId) => `/api/password-manager/project/${projectId}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // ─── 4. Get a single credential from a project ──────────
    getCredentialById: builder.query({
      query: ({ projectId, credentialId }) =>
        `/api/password-manager/project/${projectId}/credential/${credentialId}`,
      providesTags: (result, error, { credentialId }) => [
        { type: "Credential", id: credentialId },
      ],
    }),

    // ─── 5. Create a new project with credentials ───────────
    createProjectWithCredentials: builder.mutation({
      query: (data) => ({
        url: `/api/password-manager/project`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Projects"],
    }),

    // ─── 6. Add a credential to an existing project ─────────
    addCredentialToProject: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `/api/password-manager/project/${projectId}/add-credential`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Projects"],
    }),

    // ─── 7. Update a credential inside a project ────────────
    updateCredentialInProject: builder.mutation({
      query: ({ projectId, credentialId, ...data }) => ({
        url: `/api/password-manager/project/${projectId}/credential/${credentialId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { credentialId }) => [
        { type: "Credential", id: credentialId },
        "Projects",
      ],
    }),

    // ─── 8. Delete a credential from a project ──────────────
    deleteCredentialInProject: builder.mutation({
      query: ({ projectId, credentialId }) => ({
        url: `/api/password-manager/project/${projectId}/credential/${credentialId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    // ─── 9. Delete an entire project ────────────────────────
    deleteProjectById: builder.mutation({
      query: (projectId) => ({
        url: `/api/password-manager/project/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    // ─── 10. Update project-level sharing ───────────────────
    updateProjectSharing: builder.mutation({
      query: ({ projectId, sharedWith }) => ({
        url: `/api/password-manager/project/${projectId}/share`,
        method: "PUT",
        body: { sharedWith },
      }),
      invalidatesTags: ["Projects", "SharedProjects"],
    }),

    // ─── 11. Update credential-level sharing ────────────────
    updateCredentialSharing: builder.mutation({
      query: ({ projectId, credentialId, sharedWith }) => ({
        url: `/api/password-manager/project/${projectId}/credential/${credentialId}/share`,
        method: "PUT",
        body: { sharedWith },
      }),
      invalidatesTags: ["Projects", "SharedProjects"],
    }),
  }),
});

export const {
  useGetProjectsByEmployeeQuery,
  useGetSharedProjectsByEmployeeQuery,
  useGetProjectByIdQuery,
  useGetCredentialByIdQuery,
  useCreateProjectWithCredentialsMutation,
  useAddCredentialToProjectMutation,
  useUpdateCredentialInProjectMutation,
  useDeleteCredentialInProjectMutation,
  useDeleteProjectByIdMutation,
  useUpdateProjectSharingMutation,
  useUpdateCredentialSharingMutation,
} = passmanagerApi;
