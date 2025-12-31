import { apiSlice } from "../api/apiSlice";

export const officeInformationApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOfficeInformation: builder.query({
      query: () => "/officeinformation",
    }),
  }),
});

export const { useGetOfficeInformationQuery } = officeInformationApi;
