
'use client';

import React from 'react';

import ProductDetailsArea from '@/components/product-details/product-details-area';
import ProductDetailsLoader from '@/components/loader/prd-details-loader';
import ErrorMsg from '@/components/common/error-msg';

import { useGetSingleNewProductQuery, useGetSingleNewProductByIdQuery } from '@/redux/features/newProductApi';


function mapBackendProductToFrontend(p) {
  // Handle Cloudinary image URLs - use correct API field names
  const mainImg = p.image1CloudUrl || p.img || p.image || '';
  const img1 = p.image1CloudUrl || p.image1 || '';
  const img2 = p.image2CloudUrl || p.image2 || '';
  const img3 = p.image3CloudUrl || p.image3 || '';
  const videoUrl = p.videoURL || p.videourl || p.video || '';
  const poster = p.videoThumbnail || '';

  const images = [
    mainImg && { type: 'image', img: mainImg },
    img1 && { type: 'image', img: img1 },
    img2 && { type: 'image', img: img2 },
    img3 && { type: 'image', img: img3 },
  ].filter(Boolean);

  if (videoUrl || poster) {
    images.push({ type: 'video', img: poster || mainImg || img1 || img2 || img3, video: videoUrl });
  }

  return {
    _id: p.id || p._id,
    slug: p.productslug || p.slug,
    title: p.name || p.productTitle || p.title,
    img: mainImg,
    image1: img1,
    image2: img2,
    image3: img3,
    video: videoUrl,
    videourl: videoUrl,
    videoThumbnail: poster,
    // expose raw fields needed for Details components
    color: p.color || p.colors || [],
    colors: p.colors || p.color || [],
    motif: p.motif || p.motifsize || null,
    motifId: (p.motif && p.motif._id) || p.motif || p.motifsize || null,
    imageURLs: images,
    videoId: videoUrl,
    price: p.salesPrice || p.price,
    // ✅ FIXED: Use correct API field names for descriptions
    description: p.fullProductDescription || p.description || p.productdescription || '',
    shortDescription: p.shortProductDescription || '',
    fullProductDescription: p.fullProductDescription || p.description || p.productdescription || '',
    shortProductDescription: p.shortProductDescription || '',
    status: p.status || 'in-stock',
    sku: p.sku || p.fabricCode,

    // ✅ FIXED: Map direct string/array values from API instead of looking for IDs
    category: p.category || '',
    categoryId: p.category?._id || p.category || '',
    structure: p.structure || '',
    structureId: p.structure?._id || p.structure || '',
    content: p.content || [],
    contentId: p.content?._id || p.content || '',
    finish: p.finish || [],
    finishId: p.finish?._id || p.finish || '',
    design: p.design || '',
    designId: p.design?._id || p.design || '',
    motifsizeId: p.motif?._id || p.motif || '',
    suitableforId: p.subsuitable?._id || p.subsuitable || '',
    vendorId: p.vendor?._id || p.vendor || '',
    collectionId: p.collectionId || p.collection?.id || '',
    
    // ✅ CRITICAL: Map the complete collection object
    collection: p.collection || null,

    gsm: p.gsm,
    oz: p.ozs || p.oz,
    cm: p.cm,
    inch: p.inch,
    productIdentifier: p.productIdentifier || p.fabricCode,
    width: p.cm
      ? `${p.cm} cm`
      : p.inch
        ? `${p.inch} inch`
        : 'N/A',

    tags: p.tags || p.merchTags || [],
    offerDate: p.offerDate || { endDate: null },
    additionalInformation: p.additionalInformation || [],
    
    // Add new fields from your API
    highlights: p.highlights || [],
    productQ1: p.productQ1,
    productA1: p.productA1,
    productQ2: p.productQ2,
    productA2: p.productA2,
    productQ3: p.productQ3,
    productA3: p.productA3,
    productQ4: p.productQ4,
    productA4: p.productA4,
    productQ5: p.productQ5,
    productA5: p.productA5,
    productQ6: p.productQ6,
    productA6: p.productA6,
    ratingCount: p.ratingCount,
    ratingValue: p.ratingValue,
    keywords: p.keywords || [],
    supplyModel: p.supplyModel,
    salesMOQ: p.salesMOQ,
    uM: p.uM,
  };
}

export default function ProductDetailsClient({ slug }) {
  console.log('ProductDetailsClient - slug parameter:', slug);

  // First try to get by slug
  const {
    data: slugData,
    isLoading: slugLoading,
    isError: slugError,
  } = useGetSingleNewProductQuery(slug, { skip: !slug });

  console.log('Slug query result:', { slugData, slugLoading, slugError });

  // If slug lookup fails, try by ID (assuming slug is actually an ID)
  const {
    data: idData,
    isLoading: idLoading,
    isError: idError,
  } = useGetSingleNewProductByIdQuery(slug, { 
    skip: !slug || (!slugError && !slugData) || (slugData?.data) 
  });

  console.log('ID query result:', { idData, idLoading, idError });

  const isLoading = slugLoading || idLoading;
  const isError = slugError && idError;
  const data = slugData?.data ? slugData : idData;

  console.log('Final result:', { isLoading, isError, data });

  if (isLoading) return <ProductDetailsLoader loading />;
  if (isError) return <ErrorMsg msg="There was an error" />;
  if (!data?.data) return <ErrorMsg msg="No product found!" />;

  const product = mapBackendProductToFrontend(data.data);
  return <ProductDetailsArea product={product} />;
}
