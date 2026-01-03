# Field-Based Filter API Integration Guide

This guide explains how to use the new field-based filter API that provides dynamic filtering capabilities for your shop page.

## API Endpoints

### 1. Get Field Values
**Endpoint:** `GET /api/product/fieldname/{fieldName}`

**Example:** `https://espobackend.vercel.app/api/product/fieldname/color`

**Response:**
```json
{
  "success": true,
  "field": "color",
  "values": ["Black", "Indigo Blue", "Lemon", "Red", "White"],
  "total": 5
}
```

### 2. Get Products by Field Value
**Endpoint:** `GET /api/product/fieldname/{fieldName}/{value}`

**Example:** `https://espobackend.vercel.app/api/product/fieldname/color/White`

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "6944fb9b32e028166",
      "name": "Nokia 607 White Poplin Fabric",
      "category": "Woven Fabrics",
      "color": ["White"],
      // ... other product fields
    }
  ],
  "total": 1,
  "field": "color",
  "value": "White",
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

## Implementation

### 1. API Integration

First, add the new endpoints to your Redux API slice:

```javascript
// src/redux/api/apiSlice.js
export const apiSlice = createApi({
  // ... existing config
  endpoints: (builder) => ({
    // ... existing endpoints
    
    // New field-based filter endpoints
    getFieldValues: builder.query({
      query: (fieldName) => ({
        url: `product/fieldname/${fieldName}`,
        method: "GET",
      }),
      providesTags: (_result, _err, fieldName) => [
        { type: "FieldValues", id: fieldName }
      ],
    }),

    getProductsByFieldValue: builder.query({
      query: ({ fieldName, value }) => ({
        url: `product/fieldname/${fieldName}/${encodeURIComponent(value)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, { fieldName, value }) => [
        { type: "ProductsByField", id: `${fieldName}-${value}` }
      ],
    }),
  }),
  
  tagTypes: [
    // ... existing tags
    "FieldValues",
    "ProductsByField",
  ],
});

export const { 
  useGetFieldValuesQuery, 
  useGetProductsByFieldValueQuery 
} = apiSlice;
```

### 2. Using the Hooks

#### Get Available Field Values
```javascript
import { useGetFieldValuesQuery } from '@/redux/api/apiSlice';

const ColorFilter = () => {
  const { data, isLoading, error } = useGetFieldValuesQuery('color');
  
  const colorOptions = data?.values || [];
  
  if (isLoading) return <div>Loading colors...</div>;
  if (error) return <div>Error loading colors</div>;
  
  return (
    <div>
      {colorOptions.map(color => (
        <button key={color} onClick={() => selectColor(color)}>
          {color}
        </button>
      ))}
    </div>
  );
};
```

#### Get Products by Field Value
```javascript
import { useGetProductsByFieldValueQuery } from '@/redux/api/apiSlice';

const ProductsByColor = ({ selectedColor }) => {
  const { data, isLoading, error } = useGetProductsByFieldValueQuery(
    { fieldName: 'color', value: selectedColor },
    { skip: !selectedColor } // Only fetch when color is selected
  );
  
  const products = data?.products || [];
  
  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;
  
  return (
    <div>
      <h3>Products in {selectedColor}</h3>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### 3. Complete Filter Component

Use the provided `EnhancedShopSidebarFilters` component:

```javascript
import EnhancedShopSidebarFilters from '@/components/shop/EnhancedShopSidebarFilters';

const ShopPage = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  
  return (
    <div className="shop-layout">
      <aside className="filters-sidebar">
        <EnhancedShopSidebarFilters
          selected={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </aside>
      
      <main className="products-area">
        {/* Your products display logic */}
      </main>
    </div>
  );
};
```

### 4. Filter State Management

The filter state structure:

```javascript
const selectedFilters = {
  color: ['White', 'Black'],
  category: ['Woven Fabrics'],
  content: ['Cotton'],
  // ... other fields
};
```

### 5. Using the Custom Hook

For advanced filtering logic, use the `useFieldBasedFilters` hook:

```javascript
import { useFieldBasedFilters } from '@/hooks/useFieldBasedFilters';

const ShopPage = ({ allProducts }) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  
  const { 
    filteredProducts, 
    getFieldOptions, 
    isLoading, 
    hasErrors 
  } = useFieldBasedFilters(selectedFilters, allProducts);
  
  // Get options for a specific field
  const colorOptions = getFieldOptions('color');
  
  return (
    <div>
      {/* Render filtered products */}
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## Available Fields

The following fields are supported by the API:

- `category` - Product categories
- `color` - Available colors
- `content` - Material content (e.g., Cotton, Polyester)
- `design` - Design patterns
- `structure` - Fabric structures
- `finish` - Finishing treatments
- `motif` - Motif patterns

## Components Provided

### 1. EnhancedShopSidebarFilters
Main filter sidebar component with modern UI and field-based filtering.

### 2. FilterOnly
Mobile-optimized single filter component for modal/drawer usage.

### 3. FieldFilterDemo
Demo component showing API usage examples.

### 4. EnhancedShopPage
Complete shop page implementation with integrated filtering.

## Migration from Old System

To migrate from the old filter system:

1. Replace `ShopSidebarFilters` with `EnhancedShopSidebarFilters`
2. Update imports in `shop-filter-offcanvas.jsx`
3. Replace individual filter components (CategoryFilter, ColorFilter, etc.) with the unified system
4. Update filter state management to use the new structure

## Benefits

1. **Dynamic Fields**: No need to hardcode filter options
2. **Real-time Data**: Always shows current available options
3. **Better Performance**: Server-side filtering reduces client-side processing
4. **Consistent UI**: Unified filter interface across all field types
5. **Mobile Optimized**: Responsive design with mobile-specific components
6. **Type Safety**: Proper error handling and loading states

## Error Handling

The system includes comprehensive error handling:

- Loading states for all API calls
- Error boundaries for failed requests
- Fallback to client-side filtering if API fails
- Graceful degradation for missing data

## Performance Considerations

- Uses RTK Query for efficient caching
- Implements proper cache invalidation
- Skips unnecessary API calls when no filters are selected
- Debounced filter updates to prevent excessive requests

## Testing

Use the `FieldFilterDemo` component to test the API integration:

```javascript
import FieldFilterDemo from '@/components/shop/FieldFilterDemo';

// Add to your development routes
<Route path="/filter-demo" component={FieldFilterDemo} />
```

This will show you exactly how the API works and help debug any issues.