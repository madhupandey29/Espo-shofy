import React, { useState } from 'react';
import { useGetFieldValuesQuery, useGetProductsByFieldValueQuery } from '@/redux/api/apiSlice';

/**
 * Demo component showing how to use the new field-based filter API
 */
const FieldFilterDemo = () => {
  const [selectedField, setSelectedField] = useState('color');
  const [selectedValue, setSelectedValue] = useState('');

  // Step 1: Get all available values for a field
  const { 
    data: fieldData, 
    isLoading: fieldLoading, 
    error: fieldError 
  } = useGetFieldValuesQuery(selectedField);

  // Step 2: Get products for a specific field value (only when value is selected)
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useGetProductsByFieldValueQuery(
    { fieldName: selectedField, value: selectedValue },
    { skip: !selectedValue }
  );

  const fields = ['category', 'color', 'content', 'design', 'structure', 'finish', 'motif'];
  const fieldValues = fieldData?.values || [];
  const products = productsData?.products || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, system-ui' }}>
      <h2>Field-Based Filter API Demo</h2>
      
      {/* Field Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Select Field:
        </label>
        <select 
          value={selectedField} 
          onChange={(e) => {
            setSelectedField(e.target.value);
            setSelectedValue(''); // Reset value when field changes
          }}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            minWidth: '200px'
          }}
        >
          {fields.map(field => (
            <option key={field} value={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Field Values */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Available Values for "{selectedField}":
        </label>
        
        {fieldLoading && <p>Loading field values...</p>}
        {fieldError && <p style={{ color: 'red' }}>Error: {fieldError.message}</p>}
        
        {fieldValues.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {fieldValues.map(value => (
              <button
                key={value}
                onClick={() => setSelectedValue(value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: selectedValue === value ? '#3b82f6' : '#fff',
                  color: selectedValue === value ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* API Response Info */}
      {fieldData && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          background: '#f8fafc', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>API Response for field "{selectedField}":</strong>
          <pre style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
            {JSON.stringify(fieldData, null, 2)}
          </pre>
        </div>
      )}

      {/* Products for Selected Value */}
      {selectedValue && (
        <div>
          <h3>Products with {selectedField} = "{selectedValue}":</h3>
          
          {productsLoading && <p>Loading products...</p>}
          {productsError && <p style={{ color: 'red' }}>Error: {productsError.message}</p>}
          
          {products.length > 0 && (
            <div>
              <p><strong>Found {products.length} products</strong></p>
              <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                {products.slice(0, 5).map(product => (
                  <div 
                    key={product.id} 
                    style={{ 
                      padding: '12px', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      background: '#fff'
                    }}
                  >
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      {product.name}
                    </h4>
                    <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                      Category: {product.category} | Color: {Array.isArray(product.color) ? product.color.join(', ') : product.color}
                    </p>
                  </div>
                ))}
                {products.length > 5 && (
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    ... and {products.length - 5} more products
                  </p>
                )}
              </div>
            </div>
          )}

          {productsData && (
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>API Response for products:</strong>
              <pre style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                {JSON.stringify({
                  success: productsData.success,
                  total: productsData.total,
                  field: productsData.field,
                  value: productsData.value,
                  productCount: productsData.products?.length || 0
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldFilterDemo;