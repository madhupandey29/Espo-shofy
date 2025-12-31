'use client';

import React from 'react';
import PopularProducts from '@/components/products/fashion/popular-products';
import WeeksFeatured from '@/components/products/fashion/weeks-featured';
import FashionTestimonial from '@/components/testimonial/fashion-testimonial';

export default function TestCarouselPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Carousel Test Page</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Popular Products Carousel</h2>
        <PopularProducts />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Top Rated Products Carousel</h2>
        <WeeksFeatured />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Testimonials Carousel</h2>
        <FashionTestimonial />
      </div>
      
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        
        h1, h2 {
          color: #333;
          margin-bottom: 20px;
        }
        
        /* Debug styles */
        .swiper-slide {
          border: 2px solid red !important;
          min-height: 200px !important;
        }
        
        .tp-popular-product-card,
        .featured-card,
        .age-card {
          border: 2px solid blue !important;
        }
        
        /* Mobile debug */
        @media (max-width: 768px) {
          .swiper-slide {
            border: 2px solid green !important;
          }
        }
      `}</style>
    </div>
  );
}