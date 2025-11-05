// This file defines the API endpoints for application-related operations using RTK Query
import { apiSlice } from '../api/api';

// Inject endpoints into the base apiSlice
export const applicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all equipment and maintenance requests
 getAll: builder.query({
  query: ({ startDate, endDate, search, status, priority, type, page = 1, limit = 10 }) => {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (search) params.append("search", search);
    if (status) params.append("status", status); // comma-separated string
    if (priority) params.append("priority", priority); // comma-separated string
    if (type) params.append("type", type); // educational | equipment | maintenance | all
    params.append("page", page);
    params.append("limit", limit);

    return {
      url: 'api/applications/all',
      method: 'GET',
      params,
    };
  },
  providesTags: ['EquipmentRequest', 'MaintenanceRequest', 'EducationalRequest'],
}),



    // Create a new equipment request
    createEquipmentRequest: builder.mutation({
      query: (newRequest) => ({
        url: 'api/applications/equipment-request',
        method: 'POST',
        body: newRequest,
      }),
      invalidatesTags: ['EquipmentRequest'],
    }),
    // Create a new maintenance request
    createMaintenanceRequest: builder.mutation({
      query: (newRequest) => ({
        url: 'api/applications/maintenance-request',
        method: 'POST',
        body: newRequest,
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),
    // Delete an equipment request by ID
    deleteEquipmentRequest: builder.mutation({
      query: (id) => ({
        url: `api/applications/equipment/${id}`,
        method: 'DELETE',
      })
    }),
    // Delete a maintenance request by ID
    deleteMaintenanceRequest: builder.mutation({
      query: (id) => ({
        url: `api/applications/maintenance/${id}`,
        method: 'DELETE',
      })
    }),
    // Get all equipment requests for a specific employee
    getEquipmentByEmployee: builder.query({
      query: (employeeId) => `api/applications/equipment/employee/${employeeId}`,
      providesTags: ['EquipmentRequest'],
      transformResponse: (response) => response.data,
    }),
    // Get all maintenance requests for a specific employee
    getMaintenanceByEmployee: builder.query({
      query: (employeeId) => `api/applications/maintenance/employee/${employeeId}`,
      providesTags: ['MaintenanceRequest'],
      transformResponse: (response) => response.data,
    }),
    // Update an equipment request by ID
    updateEquipmentRequest: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `api/applications/equipment-request/${id}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'EquipmentRequest', id },
        'EquipmentRequest',
      ],
    }),
    // Update a maintenance request by ID
    updateMaintenanceRequest: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `api/applications/maintenance-request/${id}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MaintenanceRequest', id },
        'MaintenanceRequest',
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAllQuery,
  useCreateEquipmentRequestMutation,
  useCreateMaintenanceRequestMutation,
  useDeleteEquipmentRequestMutation,
  useDeleteMaintenanceRequestMutation,
  useGetEquipmentByEmployeeQuery,
  useGetMaintenanceByEmployeeQuery,
  useUpdateEquipmentRequestMutation,
  useUpdateMaintenanceRequestMutation,
} = applicationApi;
