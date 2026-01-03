// src/redux/features/productApi.js
import { apiSlice } from "../api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/all`,
      transformResponse: (res) => {
        // Handle new API structure: { success: true, products: [...], total: N }
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        // Fallback for old structure
        return res?.data ? res : { data: res || [] };
      },
    }),
    getProductsByType: builder.query({
      query: ({ type, query }) =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/${type}?${query}`,
      transformResponse: (res) => {
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        return res?.data ? res : { data: res || [] };
      },
    }),
    getOfferProducts: builder.query({
      query: (type) =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/offer?type=${type}`,
      transformResponse: (res) => {
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        return res?.data ? res : { data: res || [] };
      },
    }),
    getPopularProducts: builder.query({
      query: (type) =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/popular/${type}`,
      transformResponse: (res) => {
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        return res?.data ? res : { data: res || [] };
      },
    }),
    getTopRatedProducts: builder.query({
      query: () =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/top-rated`,
      transformResponse: (res) => {
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        return res?.data ? res : { data: res || [] };
      },
    }),
    getSingleProduct: builder.query({
      query: (id) =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/single-product/${id}`,
      transformResponse: (res) => {
        // For single product, might return { success: true, product: {...} }
        if (res?.product) {
          return res.product;
        }
        return res?.data ? res.data : res;
      },
    }),
    getRelatedProducts: builder.query({
      query: (id) =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/related-product/${id}`,
      transformResponse: (res) => {
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        return res?.data ? res : { data: res || [] };
      },
    }),
    getPopularNewProducts: builder.query({
      query: () =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newproduct/popular`,
      transformResponse: (res) => {
        if (res?.products) {
          return {
            data: res.products,
            total: res.total,
            success: res.success
          };
        }
        return res?.data ? res : { data: res || [] };
      },
    }),

    // Note: groupcode functionality might be removed in new API
    // Keep for backward compatibility but may need removal
    getProductsByGroupcode: builder.query({
      query: (groupcodeId) =>
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/groupcode/${groupcodeId}`,
      transformResponse: (res) => {
        if (res?.products) {
          return res.products; // return the array directly
        }
        return res?.data ?? res;
      },
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductsByTypeQuery,
  useGetOfferProductsQuery,
  useGetPopularProductsQuery,
  useGetTopRatedProductsQuery,
  useGetSingleProductQuery,
  useGetRelatedProductsQuery,
  useGetPopularNewProductsQuery,

  // 🔥 export the new hook
  useGetProductsByGroupcodeQuery,
} = productApi;
