'use client';

import React, { useState, useEffect, useMemo } from 'react';

import DetailsThumbWrapper from './details-thumb-wrapper';
import DetailsWrapper from './details-wrapper';
import DetailsTabNav from './details-tab-nav';
import RelatedProducts from './related-products';

import { useGetSeoByProductQuery } from '@/redux/features/seoApi';

export default function ProductDetailsContent({ productItem }) {
  // ✅ IMPORTANT: normalize productItem (handles {data:[{...}]} / [{...}] / {...})
  const p = useMemo(() => {
    if (!productItem) return {};
    
    let normalizedProduct = {};
    
    if (Array.isArray(productItem)) {
      normalizedProduct = productItem[0] || {};
    } else if (Array.isArray(productItem?.data)) {
      normalizedProduct = productItem.data[0] || {};
    } else if (productItem?.data && typeof productItem.data === 'object') {
      normalizedProduct = productItem.data;
    } else {
      normalizedProduct = productItem;
    }
    
    // ✅ CRITICAL: Ensure collection data is preserved
    if (!normalizedProduct.collection && productItem?.data?.[0]?.collection) {
      normalizedProduct.collection = productItem.data[0].collection;
    }
    
    return normalizedProduct;
  }, [productItem]);

  const _id = p?._id;

  // ✅ normalize product media (your API uses image1,image2,image3 + videourl)
  const img = p?.img || p?.image || p?.image0 || p?.image1 || null;
  const image1 = p?.image1 || null;
  const image2 = p?.image2 || null;
  
  // Try to get image3 from multiple sources including raw productItem
  const image3 = p?.image3 || 
                 (Array.isArray(productItem?.data) ? productItem.data[0]?.image3 : null) ||
                 (productItem?.data?.image3) ||
                 (productItem?.image3) ||
                 null;

  // Try to get videourl from multiple sources including raw productItem  
  const videourl = p?.videourl || 
                   p?.videoUrl || 
                   (Array.isArray(productItem?.data) ? productItem.data[0]?.videourl : null) ||
                   (productItem?.data?.videourl) ||
                   (productItem?.videourl) ||
                   (p?.video && p.video !== "" ? p.video : null) || 
                   null;
                   
  const videoThumbnail = p?.videoThumbnail || null;
  
  const status = p?.status;
  const collectionId = p?.collectionId || p?.collection?.id || null;
  
  // Note: Group code functionality has been replaced with collection-based approach
  // const { groupCodeData, loading: groupCodeLoading, error: groupCodeError } = useGroupCodeData(collectionId);
  
  const collectionData = p?.collection || null;
  
  // ✅ active image (start from image1 for best UX)
  const [activeImg, setActiveImg] = useState(image1 || img || null);
  useEffect(() => {
    setActiveImg(image1 || img || null);
  }, [image1, img]);

  const handleImageActive = (item) => setActiveImg(item?.img ?? (image1 || img || null));

  // ✅ SEO hook
  const { data: seoPayload } = useGetSeoByProductQuery(_id, { skip: !_id });
  const seoData = seoPayload?.data ?? null;

  // ✅ if product missing after normalize
  if (!_id) {
    return (
      <section className="tp-product-details-area">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
                No product found!
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tp-product-details-area">
      <div className="tp-product-details-top pb-25">
        <div className="container">
          <div className="row">
            {/* Left: gallery */}
            <div className="col-xl-7 col-lg-6">
              <DetailsThumbWrapper
                key={_id}

                // ✅ PASS REAL product object (not wrapper)
                apiImages={p}
                
                // ✅ PASS collection data as groupCodeData for compatibility
                groupCodeData={collectionData}

                // ✅ control main image properly
                activeImg={activeImg}
                handleImageActive={handleImageActive}

                // ✅ keep legacy props too (safe)
                img={img}
                image1={image1}
                image2={image2}
                image3={image3}
                videourl={videourl}
                videoThumbnail={videoThumbnail}

                // ✅ Perfect square with Amazon-style zoom
                imgWidth={600}
                imgHeight={600}
                zoomPaneWidth={600}
                zoomPaneHeight={600}
                objectFitMode="contain"
                lensSize={150}
                extraZoom={2.0}
                status={status}
              />
            </div>

            {/* Right: details */}
            <div className="col-xl-5 col-lg-6">
              <DetailsWrapper
                productItem={p} // ✅ pass normalized product
                handleImageActive={handleImageActive}
                activeImg={activeImg || img}
                detailsBottom
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tp-product-details-bottom pb-10">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <DetailsTabNav product={p} seoData={seoData} /> {/* ✅ pass normalized product */}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="tp-related-product pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="tp-section-title-wrapper-6 text-center mb-40">
              <span className="tp-section-title-pre-6">Style it with</span>
              <h3 className="tp-section-title-6">Mix &amp; Match</h3>
            </div>
          </div>
          <div className="row">
            <RelatedProducts id={_id} collectionId={collectionId} />
          </div>
        </div>
      </section>
    </section>
  );
}