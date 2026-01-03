import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  // ensure UI reflects latest data when window gains focus or reconnects
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      // keep your headers logic, but without TS assertions
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) headers.set("x-api-key", apiKey);
      headers.set("Content-Type", "application/json");

      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/admin")) {
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          if (adminEmail) headers.set("x-admin-email", adminEmail);
        }
      }

      const userInfo = Cookies.get("userInfo");
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          if (user && user.accessToken) {
            headers.set("Authorization", `Bearer ${user.accessToken}`);
          }
        } catch (_err) {
          Cookies.remove("userInfo");
        }
      }
      return headers;
    },
  }),

  // IMPORTANT: include query arg in cache key (fixes “same data everywhere”)
  serializeQueryArgs: ({ endpointName, queryArgs }) => {
    const argKey =
      typeof queryArgs === "string" ? queryArgs : JSON.stringify(queryArgs);
    return `${endpointName}|${argKey}`;
  },

  endpoints: (builder) => ({
    // Filter endpoints
    getFilterOptions: builder.query({
      query: (endpoint) => {
        const url =
          typeof endpoint === "string" ? endpoint.replace(/^\/+/, "") : String(endpoint);
        return { url, method: "GET" };
      },
      providesTags: (_result, _err, endpoint) => {
        // Use a plain object instead of TS Record<>
        const tagMap = {
          "/category/": "Category",
          "/color/": "Color",
          "/content/": "Content",
          "/design/": "Design",
          "/structure/": "Structure",
          "/substructure/": "Structure",
          "/finish/": "Finish",
          "/subfinish/": "Finish",
          "/groupcode/": "GroupCode",
          "/vendor/": "Vendor",
          "/suitablefor/": "SuitableFor",
          "/subsuitable/": "SuitableFor",
          "/motifsize/": "MotifSize",
        };

        const raw = typeof endpoint === "string" ? endpoint : String(endpoint);
        const key = raw.startsWith("/") ? raw : `/${raw}`;
        const tagType = tagMap[key] || "Filter";

        return [{ type: tagType, id: key }];
      },
    }),

    // New field-based filter endpoints
    getFieldValues: builder.query({
      query: (fieldName) => ({
        url: `product/fieldname/${fieldName}`,
        method: "GET",
      }),
      providesTags: (_result, _err, fieldName) => [
        { type: "FieldValues", id: fieldName }
      ],
      // Force fresh data on every request during development
      keepUnusedDataFor: 0,
    }),

    getProductsByFieldValue: builder.query({
      query: ({ fieldName, value }) => ({
        url: `product/fieldname/${fieldName}/${encodeURIComponent(value)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, { fieldName, value }) => [
        { type: "ProductsByField", id: `${fieldName}-${value}` }
      ],
    }),

    // New endpoint for getting product by slug
    getProductBySlug: builder.query({
      query: (slug) => ({
        url: `product/fieldname/productslug/${slug}`,
        method: "GET",
      }),
      providesTags: (_result, _err, slug) => [
        { type: "ProductBySlug", id: slug }
      ],
    }),

    // ...other endpoints (unchanged)
  }),

  tagTypes: [
    "Products",
    "Coupon",
    "Product",
    "RelatedProducts",
    "UserOrder",
    "UserOrders",
    "ProductType",
    "OfferProducts",
    "PopularProducts",
    "TopRatedProducts",
    "NewProducts",
    "Structure",
    "Content",
    "Finish",
    "Design",
    "Color",
    "MotifSize",
    "SuitableFor",
    "Vendor",
    "PopularNewProducts",
    "OfferNewProducts",
    "TopRatedNewProducts",
    "Category",
    "GroupCode",
    "Filter",
    "Substructure",
    "Subfinish",
    "Subsuitable",
    "Group",
    "Cart",
    "ContactDraft",
    "Author",
    "FieldValues",
    "ProductsByField",
    "ProductBySlug",
  ],
});

export const { useGetFilterOptionsQuery, useGetFieldValuesQuery, useGetProductsByFieldValueQuery, useGetProductBySlugQuery } = apiSlice;
