import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  accessToken: undefined,
  user: undefined,
  userId: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
      state.userId = payload.userId || payload.user?._id || payload.user?.id;
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      state.userId = undefined;
      Cookies.remove('userInfo');
      // Clear userId from localStorage when logging out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
      }
    },
    setUserId: (state, { payload }) => {
      state.userId = payload;
      // Persist userId to localStorage
      if (typeof window !== 'undefined' && payload) {
        localStorage.setItem('userId', payload);
      }
    },
    clearUserId: (state) => {
      state.userId = undefined;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut, setUserId, clearUserId } = authSlice.actions;
export default authSlice.reducer;
