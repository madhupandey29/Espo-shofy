'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUserId } from '@/utils/userSelectors';
import { useGetCartDataQuery } from '@/redux/features/cartApi';

export const useCartDebug = () => {
  const userId = useSelector(selectUserId);
  const { cart_products: reduxCartProducts = [] } = useSelector((state) => state.cart);
  
  const { 
    data: cartData, 
    isLoading, 
    error 
  } = useGetCartDataQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    console.log('=== CART DEBUG INFO ===');
    console.log('User ID:', userId);
    console.log('API Loading:', isLoading);
    console.log('API Error:', error);
    console.log('API Data:', cartData);
    console.log('Redux Cart Products:', reduxCartProducts);
    console.log('========================');
  }, [userId, isLoading, error, cartData, reduxCartProducts]);

  return {
    userId,
    apiData: cartData,
    reduxData: reduxCartProducts,
    isLoading,
    error
  };
};

