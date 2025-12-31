import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shipping_info: {},
  stripe_client_secret: "",
  last_order: null,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    set_shipping: (state, { payload }) => {
      state.shipping_info = payload;
    },
    get_shipping: (state) => {
      if (typeof window === "undefined") return;
      const data = localStorage.getItem("shipping_info");
      state.shipping_info = data ? JSON.parse(data) : {};
    },
    set_client_secret: (state, { payload }) => {
      state.stripe_client_secret = payload;
    },
    set_last_order: (state, { payload }) => {
      state.last_order = payload || null;
      if (typeof window !== "undefined") {
        if (payload) localStorage.setItem("lastOrder", JSON.stringify(payload));
        else localStorage.removeItem("lastOrder");
      }
    },
    clear_last_order: (state) => {
      state.last_order = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("lastOrder");
      }
    },
  },
});

export const {
  get_shipping,
  set_shipping,
  set_client_secret,
  set_last_order,
  clear_last_order,
} = orderSlice.actions;

export default orderSlice.reducer;
