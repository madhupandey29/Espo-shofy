 'use client';
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUserId } from "@/utils/userSelectors";
import { useGetCartDataQuery } from "@/redux/features/cartApi";

const useCartInfo = () => {
    const userId = useSelector(selectUserId);
    const dispatch = useDispatch();
    
    // Try to get cart data from API first
    const { data: cartData, refetch } = useGetCartDataQuery(userId, {
        skip: !userId,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    
    // Force refetch when userId changes or component mounts
    useEffect(() => {
        if (userId) {
            refetch();
        }
    }, [userId, refetch]);
    
    // Clear Redux cart state if API returns empty cart
    useEffect(() => {
        if (cartData && Array.isArray(cartData?.data?.items) && cartData.data.items.length === 0) {
            // Clear any stale Redux cart data
            dispatch({ type: 'cart/clearCart' });
            // Also clear the cart_products array
            dispatch({ type: 'cart/fetch_cart_products/fulfilled', payload: [] });
            
            // Clear any browser storage that might be caching cart data
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('cart');
                    localStorage.removeItem('cartItems');
                    sessionStorage.removeItem('cart');
                    sessionStorage.removeItem('cartItems');
                } catch (e) {
                    // Ignore storage errors
                }
            }
        }
    }, [cartData, dispatch]);
    
    // Fallback to Redux cart data if API data is not available
    const { cart_products = [] } = useSelector((state) => state.cart);
    
    // Use API data if available, otherwise fallback to Redux
    // Fix: Use the correct path for cart items from API response
    const cartItems = Array.isArray(cartData?.data?.items) 
        ? cartData.data.items 
        : Array.isArray(cartData?.items) 
            ? cartData.items 
            : Array.isArray(cart_products) 
                ? cart_products 
                : [];

    // Debug: Log cart data in development
    if (process.env.NODE_ENV === 'development') {
        console.log('useCartInfo Debug:', {
            userId,
            cartData,
            cartItems,
            cart_products,
            itemsLength: cartItems.length,
            itemsDetails: cartItems.map(item => ({
                hasProductId: !!item?.productId,
                productId: item?.productId?._id,
                quantity: item?.quantity,
                item: item
            }))
        });
    }

    const { total, quantity } = useMemo(() => {
        // If API returns empty cart, make sure we return 0
        if (cartData && Array.isArray(cartData?.data?.items) && cartData.data.items.length === 0) {
            return { total: 0, quantity: 0 };
        }
        
        return cartItems.reduce(
            (cartTotal, cartItem) => {
                // Use the same validation logic as cart-area.jsx
                // Only count items that have a valid productId
                if (!cartItem?.productId) {
                    return cartTotal;
                }
                
                // Handle nested product structure from API
                const product = cartItem?.productId || cartItem?.product || cartItem;
                const { salesPrice, price, orderQuantity, quantity: itemQuantity } = cartItem;
                
                // Only count items that have valid product data with _id
                if (!product || !product._id) {
                    return cartTotal;
                }
                
                const itemPrice = salesPrice || price || 0;
                const qty = orderQuantity || itemQuantity || cartItem?.quantity || 0;
                
                // Only count items with quantity > 0
                if (qty > 0) {
                    const itemTotal = itemPrice * qty;
                    cartTotal.total += itemTotal;
                    cartTotal.quantity += qty;
                }
                
                return cartTotal;
            },
            {
                total: 0,
                quantity: 0,
            }
        );
    }, [cartItems, cartData]);

    // Debug: Log final results in development
    if (process.env.NODE_ENV === 'development') {
        console.log('useCartInfo Final Results:', {
            quantity,
            total,
            cartItemsCount: cartItems.length
        });
    }

    return {
        quantity,
        total: Number(total.toFixed(2)),
    };
}

export default useCartInfo;