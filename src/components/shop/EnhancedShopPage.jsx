import React, { useState, useMemo } from 'react';
import EnhancedShopSidebarFilters from './EnhancedShopSidebarFilters';
import { useFieldBasedFilters } from '@/hooks/useFieldBasedFilters';
import ProductItem from '../products/fashion/product-item';

/**
 * Enhanced Shop Page Component using the new field-based filter API
 * This demonstrates the complete integration of the new filtering system
 */
const EnhancedShopPage = ({ allProducts = [] }) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Use the field-based filters hook
  const { filteredProducts, isLoading, hasErrors } = useFieldBasedFilters(
    selectedFilters, 
    allProducts
  );

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({});
    setCurrentPage(1);
  };

  // Get active filter count
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (total, current) => total + (Array.isArray(current) ? current.length : 0),
    0
  );

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '20px', fontFamily: 'Inter, system-ui' }}>
      {/* Sidebar Filters */}
      <div style={{ width: '320px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '20px' }}>
          <EnhancedShopSidebarFilters
            selected={selectedFilters}
            onFilterChange={handleFilterChange}
          />
          
          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#f1f5ff', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  Active Filters ({activeFilterCount})
                </span>
                <button
                  onClick={clearAllFilters}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
              
              {Object.entries(selectedFilters).map(([field, values]) => (
                Array.isArray(values) && values.length > 0 && (
                  <div key={field} style={{ marginBottom: '4px', fontSize: '12px' }}>
                    <strong>{field}:</strong> {values.join(', ')}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px 0',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700 }}>
              Products
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Showing {paginatedProducts.length} of {sortedProducts.length} products
              {activeFilterCount > 0 && ` (${activeFilterCount} filters applied)`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="newest">Sort by Newest</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : '#64748b',
                  borderRadius: '7px 0 0 7px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  background: viewMode === 'list' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'list' ? '#fff' : '#64748b',
                  borderRadius: '0 7px 7px 0',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#64748b' 
          }}>
            Loading products...
          </div>
        )}

        {/* Error State */}
        {hasErrors && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#ef4444' 
          }}>
            Error loading products. Please try again.
          </div>
        )}

        {/* No Products */}
        {!isLoading && !hasErrors && sortedProducts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#64748b' 
          }}>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search criteria.</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {!isLoading && !hasErrors && paginatedProducts.length > 0 && (
          <>
            <div style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
              flexDirection: viewMode === 'list' ? 'column' : 'row',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {paginatedProducts.map((product) => (
                <div key={product.id || product._id}>
                  <ProductItem product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '8px',
                marginTop: '32px'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>

                <span style={{ 
                  padding: '8px 16px', 
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedShopPage;