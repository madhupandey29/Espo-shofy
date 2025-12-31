'use client';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { userLoggedIn, setUserId } from "@/redux/features/auth/authSlice";

export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const localAuth = Cookies.get('userInfo');
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

        if (localAuth) {
            const auth = JSON.parse(localAuth);
            if (auth?.accessToken && auth?.user) {
                const userId = auth.user?._id || auth.user?.id || storedUserId;
                
                dispatch(
                    userLoggedIn({
                        accessToken: auth.accessToken,
                        user: auth.user,
                        userId: userId,
                    })
                );

                // Ensure userId is persisted
                if (userId && typeof window !== 'undefined') {
                    localStorage.setItem('userId', userId);
                }
            }
        } else if (storedUserId) {
            // If we have a stored userId but no cookie, set it in Redux
            dispatch(setUserId(storedUserId));
        }
        
        setAuthChecked(true);
    }, [dispatch]);

    return authChecked;
}
