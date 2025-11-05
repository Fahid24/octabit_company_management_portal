import { apiSlice } from "../api/api";

export const revenueApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation({
      query: (data) => ({
        url: "api/client-revenue",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Clients"],
    }),
    createClientIncome: builder.mutation({
      query: (data) => ({
        url: "api/client-revenue/income",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Income"],
    }),
    createFile: builder.mutation({
      query: (data) => ({
        url: "api/upload",
        method: "POST",
        body: data,
      }),
      //   invalidatesTags: [""]
    }),
    deleteFile: builder.mutation({
      query: (filename) => ({
        url: `api/upload?filename=${filename}`,
        method: "DELETE",
      }),
      //   invalidatesTags: [""]
    }),
    deleteAttachemnt: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/client-revenue/client/attachment/${id}`,
        method: "PATCH",
        body: data,
      }),
      //   invalidatesTags: [""]
    }),

    getClients: builder.query({
      query: ({ searchTerm = "", page, limit, selectOptions = [], userId=null, userRole=null} = {}) => {
        // console.log(page);
        let url = `/api/client-revenue?searchTerm=${searchTerm}&selectOptions=${JSON.stringify(selectOptions)}`;
        // let url = `/api/client-revenue?`;
        if (page && limit) {
          url += `&page=${page}&limit=${limit}`;
        }
        if(userRole && userId) {
          url += `&userId=${userId}&userRole=${userRole}`
        }
        
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Clients"],
    }),

    //create service option
    addServiceOptin: builder.mutation({
      query: (data) => ({
        url: "api/service-options/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
    //get service options
    getServiceOptions: builder.query({
      query: () => ({
        url: `api/service-options`,
        method: "GET",
      }),
      providesTags: ["Service"],
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `api/client-revenue/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clients"],
    }),
    getClientDetails: builder.query({
      query: (id) => ({
        url: `api/client-revenue/${id}`,
        method: "GET",
      }),
      providesTags: ["Clients"],
    }),
    updateClient: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/client-revenue/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Clients"],
    }),

    getIncomes: builder.query({
      query: ({
        page = 1,
        limit = 10,
        searchTerm = "",
        selectedDate = "",
      }) => ({
        url: `api/client-revenue/income/?page=${page}&limit=${limit}&searchTerm=${searchTerm}&selectedDate=${selectedDate}`,
        method: "GET",
      }),
      providesTags: ["Income"],
    }),

    getIncomesDetails: builder.query({
      query: (id) => ({
        url: `api/client-revenue/income/${id}`,
        method: "GET",
      }),
      providesTags: ["Income"],
    }),
    deleteIncome: builder.mutation({
      query: (id) => ({
        url: `api/client-revenue/income/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Income"],
    }),
    updateIncomeDeaisl: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/client-revenue/income/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Income"],
    }),
  }),
});

export const {
  useCreateFileMutation,
  useCreateClientMutation,
  useDeleteFileMutation,
  useGetClientsQuery,
  useCreateClientIncomeMutation,
  useAddServiceOptinMutation,
  useGetServiceOptionsQuery,
  useDeleteClientMutation,
  useGetClientDetailsQuery,
  useUpdateClientMutation,
  useGetIncomesQuery,
  useDeleteIncomeMutation,
  useGetIncomesDetailsQuery,
  useDeleteAttachemntMutation,
  useUpdateIncomeDeaislMutation
} = revenueApiSlice;
