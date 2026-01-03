import React from 'react';
import Image from 'next/image';
import { Rating } from 'react-simple-star-rating';
import Link from 'next/link';
// internal
import ErrorMsg from '@/components/common/error-msg';
import { useGetTopRatedQuery } from '@/redux/features/newProductApi';
import ShopTopRatedLoader from '@/components/loader/shop/top-rated-prd-loader';

const TopRatedProducts = () => {
  const { data, isError, isLoading } = useGetTopRatedQuery();

  // Debug the API response
  console.log('Top Rated API Response:', { data, isError, isLoading });

  // Helper function to get image URL with Cloudinary support
  const getImageUrl = (item) => {
    // The item IS the product data directly from the API
    const p = item;
    
    console.log('Processing item for image:', {
      itemKeys: Object.keys(item || {}),
      image1CloudUrl: p?.image1CloudUrl,
      image2CloudUrl: p?.image2CloudUrl,
      image3CloudUrl: p?.image3CloudUrl
    });
    
    // First check for Cloudinary URLs (direct URLs) - check all image fields
    const cloudinaryFields = [
      p?.image1CloudUrl, p?.image2CloudUrl, p?.image3CloudUrl,
      p?.imageCloudUrl, p?.cloudUrl
    ];

    for (const field of cloudinaryFields) {
      if (field && typeof field === 'string' && field.trim() && 
          field !== 'null' && field !== 'undefined' && field !== '') {
        const cleanUrl = field.trim();
        if (cleanUrl.startsWith('http')) {
          console.log('Found Cloudinary URL:', cleanUrl);
          return cleanUrl;
        }
      }
    }

    // Fallback to other image fields
    const imageFields = [
      p?.image1, p?.image2, p?.image3, p?.img, p?.image,
      p?.images, p?.thumbnail, p?.cover, p?.photo, p?.picture, p?.media
    ];

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    
    for (const field of imageFields) {
      if (field && typeof field === 'string' && field.trim() && 
          field !== 'null' && field !== 'undefined' && field !== '') {
        const cleanUrl = field.trim();
        if (cleanUrl.startsWith('http')) {
          console.log('Found HTTP URL:', cleanUrl);
          return cleanUrl;
        }
        if (baseUrl) {
          const fullUrl = `${baseUrl}/uploads/${cleanUrl.replace(/^\/+/, '')}`;
          console.log('Constructed URL:', fullUrl);
          return fullUrl;
        }
      }
    }

    console.log('Using fallback image');
    return '/assets/img/product/default-product-img.jpg';
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <ShopTopRatedLoader loading={isLoading}/>
    );
  }
  else if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  else if (!isLoading && !isError && (!data?.data || data.data.length === 0)) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  else if (!isLoading && !isError && data?.data?.length > 0) {
    const product_items = data.data.slice(0, 3);
    content = product_items.map((item) => {
      // The item IS the product data directly from the API
      const p = item;
      const productId = p?._id || p?.id;
      const slug = p?.slug || p?.productslug || productId;
      const title = p?.name || p?.title || p?.productTitle || 'Product';
      const rating = p?.ratingValue || p?.rating || 0;
      const ratingCount = p?.ratingCount || 0;
      const price = p?.price || p?.salesPrice || 0;
      const imageUrl = getImageUrl(item);

      return (
        <div key={productId} className="tp-shop-widget-product-item d-flex align-items-center">
          <div className="tp-shop-widget-product-thumb">
            <Link href={`/fabric/${slug}`}>
              <Image 
                src={imageUrl} 
                alt={title} 
                width={70} 
                height={70}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/img/product/default-product-img.jpg';
                }}
              />
            </Link>
          </div>
          <div className="tp-shop-widget-product-content">
            <div className="tp-shop-widget-product-rating-wrapper d-flex align-items-center">
              <div className="tp-shop-widget-product-rating">
                <Rating allowFraction size={16} initialValue={rating} readonly={true} />
              </div>
              <div className="tp-shop-widget-product-rating-number">
                <span>({rating})</span>
              </div>
            </div>
            <h4 className="tp-shop-widget-product-title">
              <Link href={`/fabric/${slug}`}>{title?.substring(0,20) || ''}...</Link>
            </h4>
            <div className="tp-shop-widget-product-price-wrapper">
              <span className="tp-shop-widget-product-price">₹{price?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      );
    });
  }
  return (
    <>
      <div className="tp-shop-widget mb-50">
        <h3 className="tp-shop-widget-title">Top Rated Products</h3>
        <div className="tp-shop-widget-content">
          <div className="tp-shop-widget-product">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopRatedProducts;