import { apiSlice } from "../api/apiSlice";

export const authorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuthors: builder.query({
      query: () => ({
        url: "author",
        method: "GET",
      }),
      providesTags: ["Author"],
    }),
    getAuthorById: builder.query({
      query: (id) => ({
        url: `author/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Author", id }],
    }),
  }),
});

export const { useGetAuthorsQuery, useGetAuthorByIdQuery } = authorApi;