import { apiSlice } from "../api/apiSlice";

export const newProductApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllNewProducts: builder.query({
      query: (params = {}) => {
        const { limit = 50, page = 1 } = params;
        return `/product/?limit=${limit}&page=${page}`;
      },
      transformResponse: (res) => {
        console.log('API Response:', res); // Debug log
        
        // Handle the new API response structure
        if (res?.success && res?.data && Array.isArray(res.data)) {
          return {
            data: res.data,
            total: res.total || res.data.length,
            success: res.success || true,
            pagination: res.pagination || {
              page: 1,
              limit: res.data.length,
              totalPages: Math.ceil((res.total || res.data.length) / 50)
            }
          };
        }
        
        if (res?.products && Array.isArray(res.products)) {
          return {
            data: res.products,
            total: res.total || res.products.length,
            success: res.success || true,
            pagination: res.pagination || {
              page: 1,
              limit: res.products.length,
              totalPages: Math.ceil((res.total || res.products.length) / 50)
            }
          };
        }
        
        if (res?.data) {
          return res;
        }
        return { data: res || [] };
      },
      // Enable merging of paginated results
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg?.page === 1) {
          // First page - replace cache
          return newItems;
        }
        // Subsequent pages - merge with existing
        return {
          ...newItems,
          data: [...(currentCache?.data || []), ...(newItems?.data || [])],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    getSingleNewProduct: builder.query({
      query: (slugOrId) => {
        // The route parameter could be either a slug or an ID
        // First try to get by productslug
        return `/product/fieldname/productslug/${slugOrId}`;
      },
      transformResponse: (res) => {
        // Handle the new API response structure - it returns data array
        if (res?.success && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          return { data: res.data[0] }; // Return the first product
        }
        if (res?.products && Array.isArray(res.products) && res.products.length > 0) {
          return { data: res.products[0] }; // Fallback for products array
        }
        if (res?.data) {
          return { data: res.data };
        }
        return { data: null };
      },
    }),
    // Add endpoint to get product by ID when slug lookup fails
    getSingleNewProductById: builder.query({
      query: (id) => `/product/${id}`,
      transformResponse: (res) => {
        if (res?.success && res?.data) {
          return { data: res.data };
        }
        if (res?.data) {
          return { data: res.data };
        }
        return { data: null };
      },
    }),
    addNewProduct: builder.mutation({
      query: (data) => ({
        url: "/product/",
        method: "POST",
        body: data,
      }),
    }),
    updateNewProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/product/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteNewProduct: builder.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
    }),
    searchNewProduct: builder.query({
      query: (q) => `/product/search/${q}`,
      transformResponse: (res) => {
        console.log('Search API Response:', res); // Debug log
        
        // Handle the new API response structure from espobackend.vercel.app
        if (res?.success && res?.data && Array.isArray(res.data)) {
          return {
            data: res.data,
            total: res.total || res.data.length,
            success: res.success,
            pagination: res.pagination || {
              page: 1,
              limit: res.data.length,
              totalPages: Math.ceil((res.total || res.data.length) / 20)
            }
          };
        }
        
        // Fallback for old API structure
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
    // Note: groupcode might be removed in new API
    getGroupCodeProducts: builder.query({
      query: (groupcodeId) => `/product/groupcode/${groupcodeId}`,
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
    getCategoryProducts: builder.query({
      query: (id) => `/product/category/${id}`,
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
    getStructureProducts: builder.query({
      query: (id) => `/product/structure/${id}`,
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
    getContentProducts: builder.query({
      query: (id) => `/product/content/${id}`,
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
    getFinishProducts: builder.query({
      query: (id) => `/product/finish/${id}`,
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
    getDesignProducts: builder.query({
      query: (id) => `/product/design/${id}`,
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
    getColorProducts: builder.query({
      query: (id) => `/product/color/${id}`,
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
    getMotifProducts: builder.query({
      query: (id) => `/product/motif/${id}`,
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
    // Get SEO by Product ID
    getSeoByProduct: builder.query({
      query: (productId) => `/seo/product/${productId}`,
    }),
    // Get products by collection ID for related products
    getProductsByCollection: builder.query({
      query: (collectionId) => `/product/fieldname/collectionId/${collectionId}`,
      transformResponse: (res) => {
        if (res?.success && res?.data && Array.isArray(res.data)) {
          return res.data; // Return the array directly for compatibility
        }
        if (res?.products) {
          return res.products;
        }
        return res?.data ?? res ?? [];
      },
    }),
    getSuitableProducts: builder.query({
      query: (id) => `/product/suitable/${id}`,
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
    getVendorProducts: builder.query({
      query: (id) => `/product/vendor/${id}`,
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
    getIdentifierProducts: builder.query({
      query: (identifier) => `/product/identifier/${identifier}`,
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
    getGsmUpto: builder.query({
      query: (value) => `/product/gsm/${value}`,
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
    getOzUpto: builder.query({
      query: (value) => `/product/ozs/${value}`, // Updated from 'oz' to 'ozs'
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
    getInchUpto: builder.query({
      query: (value) => `/product/inch/${value}`,
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
    getCmUpto: builder.query({
      query: (value) => `/product/cm/${value}`,
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
    getPriceUpto: builder.query({
      query: (value) => `/product/price/${value}`,
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
    getQuantityUpto: builder.query({
      query: (value) => `/product/quantity/${value}`,
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
    getPurchasePriceUpto: builder.query({
      query: (value) => `/product/purchaseprice/${value}`,
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
    getGroupCodeById: builder.query({
      query: (id) => `/groupcode/view/${id}`,
    }),
    getPopularNewProducts: builder.query({
      query: () => "/product/fieldname/merchTags/PopularFabrics",
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
   /*  getOffers: builder.query({
      query: () => "/product/offers",
    }), */
    getTopRated: builder.query({
      query: () => "/product/fieldname/merchTags/TopRatedFabrics",
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
  }),
});

export const {
  useGetAllNewProductsQuery,
  useGetSingleNewProductQuery,
  useGetSingleNewProductByIdQuery,
  useAddNewProductMutation,
  useUpdateNewProductMutation,
  useDeleteNewProductMutation,
  useSearchNewProductQuery,
  useGetGroupCodeProductsQuery,
  useGetCategoryProductsQuery,
  useGetStructureProductsQuery,
  useGetContentProductsQuery,
  useGetFinishProductsQuery,
  useGetDesignProductsQuery,
  useGetColorProductsQuery,
  useGetMotifProductsQuery,
  useGetSuitableProductsQuery,
  useGetVendorProductsQuery,
  useGetIdentifierProductsQuery,
  useGetGsmUptoQuery,
  useGetOzUptoQuery,
  useGetInchUptoQuery,
  useGetCmUptoQuery,
  useGetPriceUptoQuery,
  useGetQuantityUptoQuery,
  useGetPurchasePriceUptoQuery,
  useGetGroupCodeByIdQuery,
  useGetPopularNewProductsQuery,
  useGetOffersQuery,
  useGetTopRatedQuery,
  useGetSeoByProductQuery,
  useGetProductsByCollectionQuery,
} = newProductApi; 