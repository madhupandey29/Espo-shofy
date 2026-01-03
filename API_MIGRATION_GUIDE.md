# API Migration Guide: Old to New Structure

## Overview
This guide documents the changes needed to migrate from the old API structure to the new API structure.

## Key Changes

### 1. Root Response Structure
```javascript
// OLD API
{
  "success": true,
  "data": [...]
}

// NEW API
{
  "success": true,
  "products": [...],
  "total": 5
}
```

### 2. Field Mapping Changes

| Old Field | New Field | Type Change | Notes |
|-----------|-----------|-------------|-------|
| `_id` | `id` | String | MongoDB ObjectId → Simple ID |
| `category.name` | `category` | Object → String | Direct string value |
| `substructure.name` | `structure` | Object → String | Renamed and flattened |
| `content[].name` | `content[]` | Array<Object> → Array<String> | Array of strings |
| `design.name` | `design` | Object → String | Direct string value |
| `subfinish.name` | `finish[]` | Object → Array<String> | Single → Array |
| `color[].name` | `color[]` | Array<Object> → Array<String> | Array of strings |
| `motif.name` | `motif` | Object → String | Direct string value |
| `oz` | `ozs` | Number | Field name change |
| `groupcode` | **REMOVED** | - | No longer available |
| `subsuitable` | **REMOVED** | - | No longer available |
| `leadtime` | **REMOVED** | - | No longer available |
| `productTag` | `merchTags` | Array | Renamed |
| `videourl` | `videoURL` | String | Capitalization change |

### 3. New Fields Added
- `deleted` (boolean)
- `productslug` (string)
- `visibility[]` (array)
- `salesMOQ` / `purchaseMOQ` (numbers)
- `purchasePrice` / `purchaseNotes` (number/string)
- `supplyModel` (string)
- `fabricCode` / `vendorFabricCode` (strings)
- `ratingCount` / `ratingValue` (numbers)
- `keywords[]` (array)
- Detailed image metadata fields
- User/account tracking fields
- `isStarred` / `versionNumber` (boolean/number)

### 4. Image Structure Changes
```javascript
// OLD API
{
  "image1": "https://...",
  "image2": "https://...",
  "altimg1": "Alt text"
}

// NEW API
{
  "image1CloudUrl": "https://...",
  "image1ThumbUrl": "https://...",
  "image1Width": 405,
  "image1Height": 510,
  "altTextImage1": "Alt text",
  // ... similar for image2, image3
}
```

## Updated Files

### 1. API Layer Updates
- ✅ `src/redux/features/productApi.js` - Added transformResponse for new structure
- ✅ `src/redux/features/newProductApi.js` - Added transformResponse for new structure
- ✅ `src/utils/productFieldMapper.js` - **NEW** - Utility for field mapping

### 2. Component Updates
- ✅ `src/components/product-details/related-products.jsx` - Updated field access
- ✅ `src/components/shop/shop-list-item.jsx` - Added field mapper import
- ✅ `src/components/cart-wishlist/wishlist-item.jsx` - Updated field access
- ✅ `src/hooks/useGroupCodeData.js` - Updated for new ID handling

### 3. Field Mapper Utility
The `productFieldMapper.js` utility provides:
- Backward compatibility functions
- Consistent field access across old/new APIs
- Image handling for both structures
- Complete product mapping function

## Usage Examples

### Using the Field Mapper
```javascript
import { mapProductFields, getCategoryName, getPrimaryImageUrl } from '@/utils/productFieldMapper';

// Map entire product
const mappedProduct = mapProductFields(rawProduct);

// Get specific fields
const category = getCategoryName(product);
const imageUrl = getPrimaryImageUrl(product);
const colors = getColorArray(product);
```

### Component Updates
```javascript
// OLD WAY
const categoryName = product.category?.name;
const colorName = product.color?.[0]?.name;

// NEW WAY (works with both APIs)
const categoryName = getCategoryName(product);
const colorName = getColorName(product);
```

## Testing Checklist

### API Endpoints to Test
- [ ] `GET /product/all` - Product listing
- [ ] `GET /product/single-product/{id}` - Single product
- [ ] `GET /product/search/{query}` - Search
- [ ] `GET /product/category/{id}` - Category filtering
- [ ] `GET /product/structure/{id}` - Structure filtering
- [ ] `GET /product/color/{id}` - Color filtering
- [ ] `GET /product/ozs/{value}` - Weight filtering (note: ozs not oz)

### Components to Test
- [ ] Product listing pages
- [ ] Product detail pages
- [ ] Related products section
- [ ] Wishlist functionality
- [ ] Cart functionality
- [ ] Search results
- [ ] Filter functionality

### Data Fields to Verify
- [ ] Product images display correctly
- [ ] Category names show properly
- [ ] Color arrays work
- [ ] Structure/finish information
- [ ] Product ratings
- [ ] MOQ and pricing (new fields)

## Rollback Plan

If issues occur:
1. Revert API endpoint changes in `productApi.js` and `newProductApi.js`
2. Remove `transformResponse` functions
3. Temporarily disable field mapper usage
4. Test with old API structure

## Notes

- The field mapper provides backward compatibility
- Components should gradually migrate to use the mapper functions
- Some fields (groupcode, subsuitable, leadtime) are no longer available
- New business fields (MOQ, pricing) are now available
- Image handling is more robust with metadata