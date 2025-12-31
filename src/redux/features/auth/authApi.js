// src/redux/features/auth/authApi.js
import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn } from "./authSlice";
import Cookies from "js-cookie";

/* --------------------------------- helpers --------------------------------- */
const getUserIdLS = (uid) => {
  if (uid) return uid;
  if (typeof window !== "undefined") {
    // unified: we now use localStorage 'userId' (NOT sessionStorage)
    return localStorage.getItem("userId") || "";
  }
  return "";
};

const persistUserIdLS = (uid) => {
  if (!uid || typeof window === "undefined") return;
  try {
    localStorage.setItem("userId", uid);
  } catch  { return [];}
};

const clearUserIdLS = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("userId");
  } catch {return [];}
};

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /* ──────────────────────────────────────────
     * Registration
     * ────────────────────────────────────────── */
    sendRegistrationOTP: builder.mutation({
      query: (data) => ({
        url: "users/send-otp",
        method: "POST",
        credentials: "include",
        body: data,
      }),
    }),
    verifyOTPAndRegister: builder.mutation({
      query: ({ email, otp }) => ({
        url: "users/verify-otp",
        method: "POST",
        credentials: "include",
        body: { email, otp },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("verifyOTPAndRegister error:", err);
        }
      },
    }),

    /* ──────────────────────────────────────────
     * Login (store userId in localStorage)
     * ────────────────────────────────────────── */
    loginUser: builder.mutation({
      query: ({ identifier, password }) => ({
        url: "users/login",
        method: "POST",
        credentials: "include",
        body: { identifier, password },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const { user } = data || {};
          const userId =
            user?._id || user?.id || data?.userId || data?.id || ""; // ← adjust if your API returns a different field

          if (user) {
            Cookies.set("userInfo", JSON.stringify({ user }), { expires: 0.5 }); // ~12h
          }
          if (userId) {
            persistUserIdLS(userId);
          }
          if (user || userId) {
            dispatch(userLoggedIn({ user, userId }));
          }
        } catch (err) {
          console.error("loginUser error:", err);
        }
      },
    }),

    requestLoginOTP: builder.mutation({
      query: ({ email }) => ({
        url: "users/login/otp/request",
        method: "POST",
        credentials: "include",
        body: { email },
      }),
    }),

    verifyLoginOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "users/login/otp/verify",
        method: "POST",
        credentials: "include",
        body: { email, otp },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const { user } = data || {};
          const userId =
            user?._id || user?.id || data?.userId || data?.id || ""; // ← adjust if needed

          if (user) {
            Cookies.set("userInfo", JSON.stringify({ user }), { expires: 0.5 });
          }
          if (userId) {
            persistUserIdLS(userId);
          }
          if (user || userId) {
            dispatch(userLoggedIn({ user, userId }));
          }
        } catch (err) {
          console.error("verifyLoginOTP error:", err);
        }
      },
    }),

    /* ──────────────────────────────────────────
     * Fetch session details (using userId in localStorage)
     * ────────────────────────────────────────── */
    getSessionInfo: builder.query({
      query: ({ userId } = {}) => {
        const uid = getUserIdLS(userId);
        // Prefer explicit userId param if available; fall back to cookie session
        const url = uid
          ? `users/session?userId=${encodeURIComponent(uid)}`
          : "users/session";
        return { url, credentials: "include" };
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // normalize: server may return { session: { user } } or { user } or full user
          const user = data?.session?.user || data?.user || data;
          const userId =
            user?._id || user?.id || arg?.userId || getUserIdLS() || "";

          if (user) {
            // ensure userId is persisted if gleaned from API
            if (userId) persistUserIdLS(userId);
            dispatch(userLoggedIn({ user, userId }));
          }
        } catch (err) {
          // Keep this silent-ish to avoid noisy console when not logged in
          if (process.env.NODE_ENV === "development") {
            console.warn("getSessionInfo (no active session?):", err);
          }
        }
      },
    }),

    /* ──────────────────────────────────────────
     * LOGOUT using userId from localStorage
     * Calls: DELETE /users/logout/{userId} (preferred) or /users/logout
     * ────────────────────────────────────────── */
    logoutUser: builder.mutation({
      query: ({ userId } = {}) => {
        const uid = getUserIdLS(userId);
        const url = uid ? `users/logout/${encodeURIComponent(uid)}` : "users/logout";
        return {
          url,
          method: "DELETE", // change to POST if your backend needs POST
          credentials: "include",
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          // Even if server replies "not found", clear local state to avoid ghost sessions
          console.warn("logoutUser server response:", err?.error || err);
        } finally {
          clearUserIdLS();
          Cookies.remove("userInfo");
        }
      },
    }),

    /* ──────────────────────────────────────────
     * Update Profile
     * ────────────────────────────────────────── */
    updateProfile: builder.mutation({
      query: ({ id, avatar, ...data }) => {
        // Ensure we have a valid user ID
        if (!id) {
          throw new Error('User ID is required');
        }

        // Always use FormData when there's a file or when we need to send the avatar
        if (avatar instanceof File || (data.avatar && typeof data.avatar === 'string')) {
          const formData = new FormData();
          
          // If we have a file, append it
          if (avatar instanceof File) {
            formData.append('userImage', avatar);
          }
          
          // Append all other data fields to formData
          Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null && key !== 'id') {
              // Convert to string if it's not a file
              const value = typeof data[key] === 'object' && !(data[key] instanceof File) 
                ? JSON.stringify(data[key]) 
                : data[key];
              formData.append(key, value);
            }
          });
          
          return {
            url: `/users/${id}`,  // Ensure leading slash for absolute URL
            method: "PUT",
            credentials: "include",
            body: formData,
            headers: {},
          };
        }
        
        // For non-file updates, send as JSON
        return {
          url: `/users/${id}`,  // Ensure leading slash for absolute URL
          method: "PUT",
          credentials: "include",
          body: data,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // Keep userId from localStorage if API doesn't echo it
          const userId = getUserIdLS();
          dispatch(userLoggedIn({ user: data, userId }));
        } catch (err) {
          console.error("updateProfile error:", err);
        }
      },
    }),

    /* ──────────────────────────────────────────
     * Extra auth endpoints
     * ────────────────────────────────────────── */
    confirmEmail: builder.query({
      query: (token) => ({
        url: `users/verify-email/${token}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ verifyEmail }) => ({
        url: "users/password/forgot/request",
        method: "POST",
        credentials: "include",
        body: { email: verifyEmail },
      }),
    }),

    confirmForgotPassword: builder.mutation({
      query: ({ password, token }) => ({
        url: "users/password/forgot/confirm",
        method: "POST",
        credentials: "include",
        body: { password, token },
      }),
    }),
  }),
});

/* --------------------------------- hooks ---------------------------------- */
export const {
  useSendRegistrationOTPMutation,
  useVerifyOTPAndRegisterMutation,
  useLoginUserMutation,
  useRequestLoginOTPMutation,
  useVerifyLoginOTPMutation,
  useGetSessionInfoQuery,
  useLogoutUserMutation,
  useUpdateProfileMutation,
  useConfirmEmailQuery,
  useResetPasswordMutation,
  useConfirmForgotPasswordMutation,
} = authApi;
