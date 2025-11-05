import { apiSlice } from "../api/api";

export const foodApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllFoodItems: builder.query({
      query: ({ page = 100, limit = 10000, startDate, endDate, mealType }) => {
        let queryParams = `page=${page}&limit=${limit}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (mealType && mealType !== "all") {
          queryParams += `&mealType=${mealType}`;
        }
        return {
          url: `api/food/all?${queryParams}`,
          method: "GET",
        };
      }
    }),

    getFoodItemById: builder.query({
      query: (id) => ({
        url: `api/food/${id}`,
        method: "GET",
      }),
    }),

    getEmployeesForFood: builder.query({
      query: () => ({
        url: "api/food/employees",
        method: "GET",
      }),
    }),

    // getAllFoodItemStats: builder.query({
    //   query: ({ startDate, endDate, mealType }) => ({
    //     url: `api/food/stats?startDate=${startDate}&endDate=${endDate}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["Food"], // allows mutation to invalidate
    // }),

    getAllFoodItemStats: builder.query({
      query: ({ startDate, endDate, mealType }) => {
        let queryParams = `startDate=${startDate}&endDate=${endDate}`;
        if (mealType && mealType !== "all") {
          queryParams += `&mealType=${mealType}`;
        }
        return {
          url: `api/food/stats?${queryParams}`,
          method: "GET",
        };
      }
    }),

    addFoodItem: builder.mutation({
      query: (data) => ({
        url: "api/food/create",
        method: "POST",
        body: data,
      }),
    }),
    updateFoodItem: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/food/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Food"], // marks stats as stale
    }),
    deleteFoodItem: builder.mutation({
      query: (id) => ({
        url: `api/food/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllFoodItemsQuery,
  useAddFoodItemMutation,
  useUpdateFoodItemMutation,
  useDeleteFoodItemMutation,
  useGetAllFoodItemStatsQuery,
  useGetEmployeesForFoodQuery,
  useGetFoodItemByIdQuery,
} = foodApiSlice;
export default foodApiSlice;
