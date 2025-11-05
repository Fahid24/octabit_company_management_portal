import { apiSlice } from "../api/api";

export const incidentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createIncident: builder.mutation({
      query: (data) => ({
        url: "api/incident/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => {
        if (error) return [];
        return [{ type: "Incidents", id: "LIST" }];
      },
    }),
    getAllIncidents: builder.query({
      query: (params = {}) => {
        // console.log("params",params);
        return {
          url: "api/incident/all",
          method: "GET",
          params,
        };
      },
      providesTags: (result) => {
        if (result?.data) {
          return [
            ...result.data.map(({ _id }) => ({ type: "Incidents", id: _id })),
            { type: "Incidents", id: "LIST" },
          ];
        }
        return [{ type: "Incidents", id: "LIST" }];
      },
    }),
    getIncidentById: builder.query({
      query: (id) => ({
        url: `api/incident/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Incidents", id }],
    }),
    updateIncident: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/incident/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => {
        if (error) return [];
        return [
          { type: "Incidents", id },
          { type: "Incidents", id: "LIST" },
        ];
      },
    }),
    deleteIncident: builder.mutation({
      query: (id) => ({
        url: `api/incident/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => {
        if (error) return [];
        return [
          { type: "Incidents", id },
          { type: "Incidents", id: "LIST" },
        ];
      },
    }),
  }),
});

export const {
  useCreateIncidentMutation,
  useGetAllIncidentsQuery,
  useGetIncidentByIdQuery,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
} = incidentApiSlice;
