// Centralized user selectors for consistent userId handling across the app

/**
 * Get userId from Redux store with fallback to localStorage
 * This ensures we always have the most up-to-date userId
 */
export const selectUserId = (state) => {
  // First try Redux store
  const reduxUserId = state?.auth?.userId || 
                     state?.auth?.user?._id || 
                     state?.auth?.user?.id ||
                     state?.auth?.userInfo?._id ||
                     state?.auth?.userInfo?.id ||
                     state?.user?.user?._id;
  
  if (reduxUserId) return reduxUserId;
  
  // Fallback to localStorage if available
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || null;
  }
  
  return null;
};

/**
 * Get user object from Redux store
 */
export const selectUser = (state) => {
  return state?.auth?.user || 
         state?.auth?.userInfo || 
         state?.user?.user || 
         null;
};

/**
 * Check if user is authenticated
 */
export const selectIsAuthenticated = (state) => {
  const userId = selectUserId(state);
  const user = selectUser(state);
  return !!(userId && user);
};

/**
 * Get user info for display purposes
 */
export const selectUserInfo = (state) => {
  const user = selectUser(state);
  const userId = selectUserId(state);
  
  return {
    userId,
    user,
    isAuthenticated: !!(userId && user),
    name: user?.name || user?.firstName || '',
    email: user?.email || '',
    avatar: user?.avatar || user?.avatarUrl || '',
  };
};
