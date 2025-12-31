import { apiSlice } from "../api/apiSlice";

/**
 * Ensure apiSlice has: tagTypes: ['Cart']
 *
 * export const apiSlice = createApi({
 *   baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
 *   tagTypes: ['Cart'],
 *   endpoints: () => ({}),
 * });
 */
export const cartApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // GET /cart/user/:userId
    getCartData: builder.query({
      query: (userId) => {
        console.log("Cart API: Fetching cart data for user", { userId });
        return { url: `cart/user/${userId}`, method: "GET", cache: 'no-store' };
      },
      providesTags: (result, error, userId) => [{ type: "Cart", id: userId ?? "UNKNOWN" }],
      keepUnusedDataFor: 60,
      // With RTKQ, returning true forces a refetch when same arg remounts
      forceRefetch({ currentArg, previousArg }) {
        return currentArg === previousArg;
      },
      async onQueryStarted(userId, { queryFulfilled }) {
        try {
          console.log("Cart API: Starting cart fetch for user", { userId });
          const result = await queryFulfilled;
          console.log("Cart API: Cart fetch successful", { userId, data: result.data });
        } catch (err) {
          console.error("Cart API: Failed to fetch cart data:", err);
        }
      },
    }),

    // PUT /cart/update/:productId
    updateCartItem: builder.mutation({
      query: ({ productId, quantity, userId }) => {
        console.log("Cart API: Updating cart item", { productId, quantity, userId });
        return {
          url: `cart/update/${productId}`,
          method: "PUT",
          body: { quantity, userId },
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: "Cart", id: userId ?? "UNKNOWN" }],
      async onQueryStarted({ productId, quantity }, { queryFulfilled }) {
        try {
          console.log("Cart API: Starting update for", { productId, quantity });
          const result = await queryFulfilled;
          console.log("Cart API: Update successful", result);
        } catch (err) {
          console.error("Cart API: Failed to update cart item:", err);
        }
      },
    }),

    // DELETE /cart/remove/:productId
    removeCartItem: builder.mutation({
      query: ({ productId, userId }) => {
        console.log("Cart API: Removing cart item", { productId, userId });
        return {
          url: `cart/remove/${productId}`,
          method: "DELETE",
          body: { userId },
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: "Cart", id: userId ?? "UNKNOWN" }],
      async onQueryStarted({ productId }, { queryFulfilled }) {
        try {
          console.log("Cart API: Starting removal for", { productId });
          const result = await queryFulfilled;
          console.log("Cart API: Removal successful", result);
        } catch (err) {
          console.error("Cart API: Failed to remove cart item:", err);
        }
      },
    }),

    // DELETE /cart/clear
    clearCart: builder.mutation({
      // Accept { userId } so invalidation can be precise
      query: ({ userId }) => {
        // Some backends ignore bodies on DELETE; put userId in querystring too.
        const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        return {
          url: `cart/clear/${userId}`,
          method: "DELETE",
          body: { userId }, // keep for servers that do accept DELETE bodies
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: "Cart", id: userId ?? "UNKNOWN" }],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log("Cart API: Clear successful");
        } catch (err) {
          console.error("Failed to clear cart:", err);
        }
      },
    }),

    // POST /cart/add
    addToCart: builder.mutation({
      query: ({ productId, userId, quantity = 1 }) => {
        console.log("Cart API: Adding item to cart", { productId, userId, quantity });
        return {
          url: "cart/add",
          method: "POST",
          body: { productId, userId, quantity },
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: "Cart", id: userId ?? "UNKNOWN" }],
      async onQueryStarted({ productId, quantity }, { queryFulfilled }) {
        try {
          console.log("Cart API: Starting add for", { productId, quantity });
          const result = await queryFulfilled;
          console.log("Cart API: Add successful", result);
        } catch (err) {
          console.error("Cart API: Failed to add item to cart:", err);
        }
      },
    }),
  }),
});

export const {
  useGetCartDataQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useAddToCartMutation,
} = cartApi;
