import { apiSlice } from "../api/apiSlice";

export const contactsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    addContact: builder.mutation({
      query: (data) => ({
        url: "/contacts",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useAddContactMutation } = contactsApi;
