import { useMemo } from 'react';
import { useGetFieldValuesQuery, useGetProductsByFieldValueQuery } from '@/redux/api/apiSlice';

/**
 * Hook to manage field-based filtering using the new API
 * @param {Object} selectedFilters - Current selected filters
 * @param {Array} allProducts - All available products for fallback
 * @returns {Object} - Filter management utilities
 */
export const useFieldBasedFilters = (selectedFilters = {}, allProducts = []) => {
  // Get all field values for each filter type
  const categoryQuery = useGetFieldValuesQuery('category');
  const colorQuery = useGetFieldValuesQuery('color');
  const contentQuery = useGetFieldValuesQuery('content');
  const designQuery = useGetFieldValuesQuery('design');
  const structureQuery = useGetFieldValuesQuery('structure');
  const finishQuery = useGetFieldValuesQuery('finish');
  const motifQuery = useGetFieldValuesQuery('motif');

  // Collect all field queries for easy access
  const fieldQueries = {
    category: categoryQuery,
    color: colorQuery,
    content: contentQuery,
    design: designQuery,
    structure: structureQuery,
    finish: finishQuery,
    motif: motifQuery,
  };

  // Combine and filter products based on selected filters
  const filteredProducts = useMemo(() => {
    // If no filters are selected, return all products
    if (Object.keys(selectedFilters).length === 0) {
      return allProducts;
    }

    // Fallback to client-side filtering since we can't use hooks inside useMemo
    return allProducts.filter(product => {
      return Object.entries(selectedFilters).every(([fieldName, values]) => {
        if (!Array.isArray(values) || values.length === 0) return true;
        
        const productFieldValue = product[fieldName];
        
        // Handle array fields (like color, content, etc.)
        if (Array.isArray(productFieldValue)) {
          return values.some(filterValue => 
            productFieldValue.some(pv => String(pv).toLowerCase() === String(filterValue).toLowerCase())
          );
        }
        
        // Handle single value fields
        return values.some(filterValue => 
          String(productFieldValue).toLowerCase() === String(filterValue).toLowerCase()
        );
      });
    });
  }, [selectedFilters, allProducts]);

  // Get available filter options for each field
  const getFieldOptions = (fieldName) => {
    const query = fieldQueries[fieldName];
    return {
      options: query?.data?.values || [],
      isLoading: query?.isLoading || false,
      error: query?.error || null,
    };
  };

  // Check if any filters are loading
  const isLoading = Object.values(fieldQueries).some(query => query.isLoading);

  // Check if there are any errors
  const hasErrors = Object.values(fieldQueries).some(query => query.error);

  return {
    filteredProducts,
    getFieldOptions,
    isLoading,
    hasErrors,
    fieldQueries,
  };
};

export default useFieldBasedFilters;