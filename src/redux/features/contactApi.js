// src/redux/features/contactApi.js
import { apiSlice } from "../api/apiSlice"; // ← your existing base api slice

// We inject endpoints into the EXISTING apiSlice.
// No new reducerPath, no store changes needed.
export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /contacts -> create draft
    createContactDraft: builder.mutation({
      query: (payload) => ({
        url: `/contacts`,
        method: "POST",
        body: payload,
      }),
    }),

    // PUT /contacts/:id -> update draft
    updateContactDraft: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/contacts/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: "ContactDraft", id: arg.id }],
    }),

    // POST /contacts/submit -> final submission (using same endpoint as draft)
    submitContactForm: builder.mutation({
      query: (payload) => ({
        url: `/contacts`,
        method: "POST",
        body: { ...payload, isSubmitted: true },
      }),
    }),

    // GET /contacts/:id -> hydrate draft
    getContactDraft: builder.query({
      query: (id) => `/contacts/${id}`,
      providesTags: (_res, _err, id) => [{ type: "ContactDraft", id }],
    }),

    // Optional: office info
    getOfficeInfo: builder.query({
      query: () => `/officeinformation`,
    }),
  }),
  // optional: override/extend tag types if your base slice has them
  overrideExisting: false,
});

export const {
  useCreateContactDraftMutation,
  useUpdateContactDraftMutation,
  useSubmitContactFormMutation,
  useGetContactDraftQuery,
  useGetOfficeInfoQuery,
} = contactApi;
