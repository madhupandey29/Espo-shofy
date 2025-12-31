import { apiSlice } from "../api/apiSlice";

export const faqaApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllFaqA: builder.query({
      query: () => "/faqa",
    }),
  }),
});

export const { useGetAllFaqAQuery } = faqaApi;
