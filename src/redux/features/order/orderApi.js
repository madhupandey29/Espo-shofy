import { apiSlice } from "../../api/apiSlice";

// Base URL of apiSlice should be: https://test.amrita-fashions.com/shopy
// so these paths are relative to /shopy

export const orderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // POST /shopy/orders — create order
    createOrder: builder.mutation({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["UserOrders"],
    }),

    // GET /shopy/users/:id — profile for invoice
    getUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, arg) => [{ type: "User", id: arg }],
      keepUnusedDataFor: 600,
    }),

    // Optional: list of user orders (if you add it later)
    getUserOrders: builder.query({
      query: () => `/user-order`,
      providesTags: ["UserOrders"],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserByIdQuery,
  useGetUserOrdersQuery,
} = orderApi;
