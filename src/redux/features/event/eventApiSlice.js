import { apiSlice } from '../api/api';

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation({
      query: (data) => ({
        url: "api/events",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Events", id: "LIST" }],
    }),

    getAllEvents: builder.query({
      query: ({
        userId,
        userRole,
        startDate, 
        endDate,
        includePrivate,
        page,
        limit,
        type,
        status,
      }) => ({
        url: `api/events?page=${page}&limit=${limit}`,
        method: "GET",
        params: {
          userId,
          userRole,
          includePrivate,
          startDate, 
          endDate,
          type,
          status,
        },
      }),
      providesTags: (result) => {
        if (result?.events) {
          return [
            ...result.events.map(({ _id }) => ({ type: "Events", id: _id })),
            { type: "Events", id: "LIST" },
          ];
        }
        return [{ type: "Events", id: "LIST" }];
      },
    }),

    getEventById: builder.query({
      query: (id) => ({
        url: `api/events/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/events/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    deleteEvent: builder.mutation({
      query: ({ eventId, userId, userRole }) => ({
        url: `api/events/${eventId}?userId=${userId}&userRole=${userRole}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    getMonthlyEventsById: builder.query({
      query: ({employeeId, month}) => ({
        url: `api/events/monthly?userId=${employeeId}&month=${month}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetMonthlyEventsByIdQuery
} = eventApiSlice;
