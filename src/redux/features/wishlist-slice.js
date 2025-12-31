// redux/features/wishlist-slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notifyError, notifySuccess } from "@/utils/toast";

/* ------------------------- API base helpers ------------------------- */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
const WISHLIST_BASE = (() => {
  if (!API_BASE) return "https://test.amrita-fashions.com/shopy";
  if (/\/api$/i.test(API_BASE)) return API_BASE.replace(/\/api$/i, "");
  if (/\/shopy$/i.test(API_BASE)) return API_BASE;
  return `${API_BASE}/shopy`;
})();

/* ------------------------------- GET ------------------------------- */
/** GET /shopy/wishlist/:userId  -> returns array of {_id,...} or ids */
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) return [];
      const url = `${WISHLIST_BASE}/wishlist/${encodeURIComponent(userId)}`;
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`GET wishlist ${res.status}`);
      const data = await res.json();

      // Expected shape: { success, data: { products: [ {_id,...} ] } }
      if (Array.isArray(data?.data?.products)) return data.data.products;

      // Fallback shapes:
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.data?.items)) return data.data.items;

      const idsA = data?.data?.productIds;
      const idsB = data?.productIds;
      if (Array.isArray(idsA)) return idsA.map((x) => ({ _id: x?._id || x?.id || x }));
      if (Array.isArray(idsB)) return idsB.map((x) => ({ _id: x?._id || x?.id || x }));

      return [];
    } catch (e) {
      return rejectWithValue(e.message || "Failed to fetch wishlist");
    }
  }
);

/* ------------------------------- PUT ------------------------------- */
/** PUT /shopy/wishlist/:userId  body: { userId, productIds } */
async function putWishlistIds(userId, productIds) {
  const url = `${WISHLIST_BASE}/wishlist/${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productIds }),
  });
  if (!res.ok) throw new Error(`PUT wishlist ${res.status}`);
  return res.json();
}

/* Toggle helper to find product id */
const getPid = (x) => x?._id || x?.id || x?.product?._id || x?.productId || x?.product || x;

/** Toggle an item in wishlist (server is source of truth; optimistic) */
export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async ({ userId, product }, { getState, rejectWithValue }) => {
    try {
      if (!userId) throw new Error("Not logged in");
      const state = getState();
      const current = state.wishlist?.wishlist || [];
      const pid = String(getPid(product));
      if (!pid) throw new Error("Product ID missing");

      const exists = current.some((it) => String(getPid(it)) === pid);
      let nextList;

      if (exists) {
        nextList = current.filter((it) => String(getPid(it)) !== pid);
      } else {
        const title =
          product?.title ||
          product?.name ||
          product?.product?.name ||
          product?.seoTitle ||
          "Product";
        const item = { ...product, _id: pid, id: pid, title };
        nextList = [...current, item];
      }

      const productIds = nextList.map((it) => getPid(it)).filter(Boolean);
      await putWishlistIds(userId, productIds);

      if (exists) {
        notifyError("Removed from wishlist");
      } else {
        notifySuccess("Added to wishlist");
      }

      return nextList;
    } catch (e) {
      return rejectWithValue(e.message || "Failed to update wishlist");
    }
  }
);

/* ------------------------------------------------------------------ */
/* ✅ COMPAT EXPORT (FIX FOR YOUR ERROR)                               */
/* ------------------------------------------------------------------ */
/**
 * Your DetailsWrapper is calling:
 *   dispatch(add_to_wishlist(productItem))
 *
 * But earlier you removed the old "add_to_wishlist" action.
 * So this function restores that name WITHOUT changing your wishlist logic.
 * It simply dispatches toggleWishlistItem after resolving userId.
 */
export const add_to_wishlist = (product) => async (dispatch, getState) => {
  const state = getState();

  // Try common places where userId may exist (adjust if you have a different auth slice)
  const userId =
    state.wishlist?.currentUserId ||
    state.auth?.user?._id ||
    state.auth?.userId ||
    state.user?.user?._id ||
    state.user?.userId;

  if (!userId) {
    notifyError("Please login to use wishlist");
    return;
  }

  return dispatch(toggleWishlistItem({ userId, product }));
};

/* ------------------------------ DELETE ----------------------------- */
/** DELETE /shopy/wishlist/:userId/product/:productId */
export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async ({ userId, productId, title }, { getState, rejectWithValue }) => {
    try {
      if (!userId) throw new Error("Not logged in");

      const url = `${WISHLIST_BASE}/wishlist/${encodeURIComponent(
        userId
      )}/product/${encodeURIComponent(productId)}`;
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`DELETE wishlist ${res.status}`);

      notifyError(`${title || "Item"} removed from wishlist`);

      const current = getState().wishlist?.wishlist || [];
      const next = current.filter((it) => String(getPid(it)) !== String(productId));
      return next;
    } catch (e) {
      return rejectWithValue(e.message || "Failed to remove from wishlist");
    }
  }
);

/* ------------------------------- Slice ----------------------------- */
const initialState = {
  wishlist: [],     // array of product docs (local for UI; server persists IDs)
  loading: false,
  error: null,
  currentUserId: null,
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    set_wishlist(state, { payload }) {
      state.wishlist = Array.isArray(payload) ? payload : [];
    },
    clear_wishlist(state) {
      state.wishlist = [];
      state.error = null;
      state.loading = false;
      state.currentUserId = null;
    },
    clear_wishlist_for_user_switch(state) {
      state.wishlist = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, { payload, meta }) => {
        state.loading = false;
        state.wishlist = (Array.isArray(payload) ? payload : []).map((x) => {
          const id = getPid(x);
          return typeof x === "object" ? { ...x, _id: id, id } : { _id: id, id };
        });
        state.currentUserId = meta.arg;
      })
      .addCase(fetchWishlist.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed fetching wishlist";
      })
      // toggle
      .addCase(toggleWishlistItem.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, { payload }) => {
        state.wishlist = Array.isArray(payload) ? payload : [];
      })
      .addCase(toggleWishlistItem.rejected, (state, { payload }) => {
        state.error = payload || "Failed updating wishlist";
      })
      // remove
      .addCase(removeWishlistItem.fulfilled, (state, { payload }) => {
        state.wishlist = Array.isArray(payload) ? payload : [];
      })
      .addCase(removeWishlistItem.rejected, (state, { payload }) => {
        state.error = payload || "Failed removing wishlist item";
      });
  },
});

export const { set_wishlist, clear_wishlist, clear_wishlist_for_user_switch } = wishlistSlice.actions;
export default wishlistSlice.reducer;
