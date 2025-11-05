import { apiSlice } from '../api/api';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create notification
    createNotification: builder.mutation({
      query: (body) => ({
        url: '/api/notification',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    // Get notifications for a user
    getUserNotifications: builder.query({
      query: ({ userId, ...params }) => ({
        url: `/api/notification/user/${userId}`,
        params,
      }),
      providesTags: ['Notification'],
    }),
    // Mark a notification as read
    markAsRead: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/api/notification/${id}/read`,
        method: 'PATCH',
        body: { userId },
      }),
      invalidatesTags: ['Notification'],
    }),
    // Delete a notification
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/api/notification/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    // Mark all notifications as read for a user
    markAllAsRead: builder.mutation({
      query: (userId) => ({
        url: `/api/notification/user/${userId}/read-all`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    // Admin edit notification
    editNotification: builder.mutation({
      query: ({ id, ...update }) => ({
        url: `/api/notification/${id}`,
        method: 'PUT',
        body: update,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateNotificationMutation,
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
  useEditNotificationMutation,
} = notificationApiSlice;
