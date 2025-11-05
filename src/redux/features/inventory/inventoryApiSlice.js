import { apiSlice } from "../api/api";

export const inventoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConsumableItems: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "", categoryId }) => {
        let url = `api/inventory/consumables?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${search}`;
        }
        if (status) {
          url += `&status=${status}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["ConsumableItems"],
    }),
    getInventoryStats: builder.query({
      query: () => ({
        url: `api/inventory/stats`,
        method: "GET",
      }),
    }),
    getInventoryPriceStats: builder.query({
      query: ({startDate, endDate}) => ({
        url: `api/inventory/price-stats?startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
      }),
    }),
    addConsumableProduct: builder.mutation({
      query: ({ typeId, body }) => ({
        url: `api/inventory/add/${typeId}`,
        method: "POST",
        body,
      }),
    }),

    decreaseConsumableProduct: builder.mutation({
      query: ({ typeId, body }) => ({
        url: `api/inventory/use/${typeId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ConsumableItems"],
    }),
    // updateType: builder.mutation({
    //   query: ({ id, data }) => ({
    //     url: `api/type/${id}`,
    //     method: "PUT",
    //     body: data,
    //   }),
    //   invalidatesTags: (result, error, { id }) => [
    //     "Type",
    //     { type: "Type", id },
    //   ],
    // }),
    // deleteType: builder.mutation({
    //   query: (id) => ({
    //     url: `api/type/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Type"],
    // }),
  }),
});

export const {
    useAddConsumableProductMutation,
    useGetInventoryStatsQuery,
    useGetInventoryPriceStatsQuery,
    useGetConsumableItemsQuery,
    useDecreaseConsumableProductMutation
} = inventoryApiSlice;