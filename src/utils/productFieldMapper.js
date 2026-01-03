/**
 * Product Field Mapper - Handles differences between old and new API structures
 * 
 * Old API Structure:
 * - Fields were nested objects: category.name, substructure.name, etc.
 * - Arrays contained objects: color[].name, content[].name
 * - Used _id for identifiers
 * 
 * New API Structure:
 * - Fields are direct strings/arrays: category, structure, etc.
 * - Arrays contain strings: color[], content[]
 * - Uses id for identifiers
 */

/**
 * Get product ID - handles both old (_id) and new (id) formats
 */
export const getProductId = (product) => {
  return product?.id || product?._id || null;
};

/**
 * Get category name - handles both nested object and direct string
 */
export const getCategoryName = (product) => {
  if (typeof product?.category === 'string') {
    return product.category; // New API format
  }
  return product?.category?.name || ''; // Old API format
};

/**
 * Get structure name - handles substructure -> structure rename
 */
export const getStructureName = (product) => {
  if (product?.structure) {
    return typeof product.structure === 'string' ? product.structure : product.structure.name;
  }
  // Fallback to old field name
  return product?.substructure?.name || '';
};

/**
 * Get content array - handles both object array and string array
 */
export const getContentArray = (product) => {
  if (!product?.content) return [];
  
  if (Array.isArray(product.content)) {
    // Check if it's array of strings (new format) or objects (old format)
    if (typeof product.content[0] === 'string') {
      return product.content; // New API format
    }
    // Old API format - extract names
    return product.content.map(item => item?.name || '').filter(Boolean);
  }
  
  return [];
};

/**
 * Get first content name
 */
export const getContentName = (product) => {
  const contentArray = getContentArray(product);
  return contentArray[0] || '';
};

/**
 * Get design name - handles both nested object and direct string
 */
export const getDesignName = (product) => {
  if (typeof product?.design === 'string') {
    return product.design; // New API format
  }
  return product?.design?.name || ''; // Old API format
};

/**
 * Get color array - handles both object array and string array
 */
export const getColorArray = (product) => {
  if (!product?.color) return [];
  
  if (Array.isArray(product.color)) {
    // Check if it's array of strings (new format) or objects (old format)
    if (typeof product.color[0] === 'string') {
      return product.color; // New API format
    }
    // Old API format - extract names
    return product.color.map(item => item?.name || '').filter(Boolean);
  }
  
  return [];
};

/**
 * Get first color name
 */
export const getColorName = (product) => {
  const colorArray = getColorArray(product);
  return colorArray[0] || '';
};

/**
 * Get finish array - handles subfinish -> finish rename and format change
 */
export const getFinishArray = (product) => {
  // New API format - direct array of strings
  if (Array.isArray(product?.finish)) {
    return product.finish;
  }
  
  // Old API format - single object with name
  if (product?.subfinish?.name) {
    return [product.subfinish.name];
  }
  
  return [];
};

/**
 * Get first finish name
 */
export const getFinishName = (product) => {
  const finishArray = getFinishArray(product);
  return finishArray[0] || '';
};

/**
 * Get motif name - handles both nested object and direct string
 */
export const getMotifName = (product) => {
  if (typeof product?.motif === 'string') {
    return product.motif; // New API format
  }
  return product?.motif?.name || ''; // Old API format
};

/**
 * Get groupcode name - Note: groupcode removed in new API
 */
export const getGroupcodeName = (product) => {
  // This field is removed in new API, return empty string
  if (product?.groupcode?.name) {
    return product.groupcode.name; // Old API format only
  }
  return '';
};

/**
 * Get product weight in oz - handles oz -> ozs rename
 */
export const getProductOz = (product) => {
  return product?.ozs || product?.oz || 0;
};

/**
 * Get product images - handles new detailed image structure
 */
export const getProductImages = (product) => {
  const images = {};
  
  // New API format - detailed image objects
  if (product?.image1CloudUrl) {
    images.image1 = {
      url: product.image1CloudUrl,
      alt: product.altTextImage1 || product.altimg1 || '',
      thumb: product.image1ThumbUrl,
      width: product.image1Width,
      height: product.image1Height
    };
  } else if (product?.image1) {
    // Old API format - simple URL
    images.image1 = {
      url: product.image1,
      alt: product.altimg1 || '',
    };
  }
  
  if (product?.image2CloudUrl) {
    images.image2 = {
      url: product.image2CloudUrl,
      alt: product.altTextImage2 || product.altimg2 || '',
      thumb: product.image2ThumbUrl,
      width: product.image2Width,
      height: product.image2Height
    };
  } else if (product?.image2) {
    images.image2 = {
      url: product.image2,
      alt: product.altimg2 || '',
    };
  }
  
  if (product?.image3CloudUrl) {
    images.image3 = {
      url: product.image3CloudUrl,
      alt: product.altTextImage3 || product.altimg3 || '',
      thumb: product.image3ThumbUrl,
      width: product.image3Width,
      height: product.image3Height
    };
  } else if (product?.image3) {
    images.image3 = {
      url: product.image3,
      alt: product.altimg3 || '',
    };
  }
  
  return images;
};

/**
 * Get primary product image URL
 */
export const getPrimaryImageUrl = (product) => {
  const images = getProductImages(product);
  return images.image1?.url || images.image2?.url || images.image3?.url || '';
};

/**
 * Get product tags - handles productTag -> merchTags rename
 */
export const getProductTags = (product) => {
  if (Array.isArray(product?.merchTags)) {
    return product.merchTags; // New API format
  }
  if (Array.isArray(product?.productTag)) {
    return product.productTag; // Old API format
  }
  return [];
};

/**
 * Get video URL - handles videourl -> videoURL rename
 */
export const getVideoUrl = (product) => {
  return product?.videoURL || product?.videourl || '';
};

/**
 * Get product slug - handles new productslug field
 */
export const getProductSlug = (product) => {
  return product?.productslug || product?.slug || '';
};

/**
 * Get suitable for array - handles subsuitable removal
 */
export const getSuitableArray = (product) => {
  // This field might be removed in new API
  if (Array.isArray(product?.subsuitable)) {
    return product.subsuitable; // Old API format
  }
  return [];
};

/**
 * Get lead time array - handles leadtime removal
 */
export const getLeadTimeArray = (product) => {
  // This field might be removed in new API
  if (Array.isArray(product?.leadtime)) {
    return product.leadtime; // Old API format
  }
  return [];
};

/**
 * Complete product field mapper - transforms product object to consistent format
 */
export const mapProductFields = (product) => {
  if (!product) return null;
  
  return {
    // Core identifiers
    id: getProductId(product),
    name: product.name || '',
    slug: getProductSlug(product),
    
    // Categories and attributes
    category: getCategoryName(product),
    structure: getStructureName(product),
    content: getContentArray(product),
    contentName: getContentName(product),
    design: getDesignName(product),
    color: getColorArray(product),
    colorName: getColorName(product),
    finish: getFinishArray(product),
    finishName: getFinishName(product),
    motif: getMotifName(product),
    
    // Measurements
    gsm: product.gsm || 0,
    oz: getProductOz(product),
    cm: product.cm || 0,
    inch: product.inch || 0,
    
    // Descriptions
    productTitle: product.productTitle || '',
    productTagline: product.productTagline || '',
    shortProductDescription: product.shortProductDescription || '',
    fullProductDescription: product.fullProductDescription || '',
    
    // Media
    images: getProductImages(product),
    primaryImage: getPrimaryImageUrl(product),
    videoUrl: getVideoUrl(product),
    
    // Tags and metadata
    tags: getProductTags(product),
    rating: product.ratingValue || product.rating || 0,
    ratingCount: product.ratingCount || 0,
    
    // Business fields (new API)
    salesMOQ: product.salesMOQ || 0,
    purchaseMOQ: product.purchaseMOQ || 0,
    purchasePrice: product.purchasePrice || 0,
    supplyModel: product.supplyModel || '',
    fabricCode: product.fabricCode || '',
    vendorFabricCode: product.vendorFabricCode || '',
    
    // Legacy fields (might be removed)
    groupcode: getGroupcodeName(product),
    suitable: getSuitableArray(product),
    leadtime: getLeadTimeArray(product),
    
    // Timestamps
    createdAt: product.createdAt || '',
    modifiedAt: product.modifiedAt || product.updatedAt || '',
    
    // Keep original product for any unmapped fields
    _original: product
  };
};

/**
 * Map array of products
 */
export const mapProductsArray = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(mapProductFields).filter(Boolean);
};