'use client';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, clear_wishlist_for_user_switch } from '@/redux/features/wishlist-slice';
import { selectUserId } from '@/utils/userSelectors';

/**
 * Custom hook to manage wishlist data based on userId changes
 * Handles user switching scenarios (Google account switching, etc.)
 */
export default function useWishlistManager() {
  const dispatch = useDispatch();
  const userId = useSelector(selectUserId);
  const { currentUserId, wishlist, loading } = useSelector((state) => state.wishlist);
  const previousUserIdRef = useRef(null);

  useEffect(() => {
    // Track userId changes
    if (previousUserIdRef.current !== userId) {
      const previousUserId = previousUserIdRef.current;
      previousUserIdRef.current = userId;

      // If userId changed (user switched accounts)
      if (previousUserId && previousUserId !== userId) {
        console.log('User switched from', previousUserId, 'to', userId);
        // Clear wishlist data for the previous user
        dispatch(clear_wishlist_for_user_switch());
      }

      // Fetch wishlist for current user
      if (userId) {
        console.log('Fetching wishlist for user:', userId);
        dispatch(fetchWishlist(userId));
      }
    }
  }, [dispatch, userId]);

  // Handle window focus/visibility changes to refresh data
  useEffect(() => {
    const handleFocus = () => {
      if (userId && currentUserId !== userId) {
        console.log('Window focused, refreshing wishlist for user:', userId);
        dispatch(fetchWishlist(userId));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId && currentUserId !== userId) {
        console.log('Page visible, refreshing wishlist for user:', userId);
        dispatch(fetchWishlist(userId));
      }
    };

    // Handle storage events (when user switches accounts in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'userId' && e.newValue !== e.oldValue) {
        console.log('userId changed in localStorage, refreshing wishlist');
        if (e.newValue) {
          dispatch(fetchWishlist(e.newValue));
        } else {
          dispatch(clear_wishlist_for_user_switch());
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch, userId, currentUserId]);

  return {
    userId,
    currentUserId,
    wishlist,
    loading,
    isUserSwitched: previousUserIdRef.current && previousUserIdRef.current !== userId,
  };
}
