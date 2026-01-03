import React, { useState } from 'react';
import { useGetFieldValuesQuery } from '@/redux/api/apiSlice';

const ApiDebugger = () => {
  const [selectedField, setSelectedField] = useState('category');
  
  // Test the API call
  const { data, error, isLoading, isError } = useGetFieldValuesQuery(selectedField);
  
  // Manual fetch test
  const [manualResult, setManualResult] = useState(null);
  const [manualError, setManualError] = useState(null);
  
  const testManualFetch = async () => {
    try {
      setManualError(null);
      setManualResult(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = `${baseUrl}/product/fieldname/${selectedField}`;
      
      console.log('Testing URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_API_KEY && {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY
          })
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      setManualResult(result);
      
    } catch (err) {
      console.error('Manual fetch error:', err);
      setManualError(err.message);
    }
  };

  const fields = ['category', 'color', 'content', 'design', 'structure', 'finish', 'motif'];

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Inter, system-ui',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2>API Debugger</h2>
      
      {/* Environment Info */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Environment Configuration</h3>
        <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</p>
        <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_API_KEY ? 'Set' : 'Not set'}</p>
      </div>

      {/* Field Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Test Field:
        </label>
        <select 
          value={selectedField} 
          onChange={(e) => setSelectedField(e.target.value)}
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

      {/* RTK Query Test */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3>RTK Query Test</h3>
        <p><strong>Field:</strong> {selectedField}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {isError ? 'Yes' : 'No'}</p>
        
        {isLoading && <p style={{ color: '#3b82f6' }}>Loading...</p>}
        
        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '8px'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>
              <strong>Error:</strong> {error.message || JSON.stringify(error)}
            </p>
            {error.status && <p style={{ color: '#dc2626', margin: '4px 0 0 0' }}>
              <strong>Status:</strong> {error.status}
            </p>}
            {error.data && <p style={{ color: '#dc2626', margin: '4px 0 0 0' }}>
              <strong>Data:</strong> {JSON.stringify(error.data)}
            </p>}
          </div>
        )}
        
        {data && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '8px'
          }}>
            <p style={{ color: '#16a34a', margin: '0 0 8px 0' }}>
              <strong>Success!</strong>
            </p>
            <pre style={{ 
              background: '#fff',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              margin: 0
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Manual Fetch Test */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3>Manual Fetch Test</h3>
        <button
          onClick={testManualFetch}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Test Manual Fetch
        </button>
        
        {manualError && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '8px'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>
              <strong>Manual Fetch Error:</strong> {manualError}
            </p>
          </div>
        )}
        
        {manualResult && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '8px'
          }}>
            <p style={{ color: '#16a34a', margin: '0 0 8px 0' }}>
              <strong>Manual Fetch Success!</strong>
            </p>
            <pre style={{ 
              background: '#fff',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              margin: 0
            }}>
              {JSON.stringify(manualResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Test URLs */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>Test URLs</h3>
        <p><strong>Current Test URL:</strong></p>
        <code style={{ 
          background: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {process.env.NEXT_PUBLIC_API_BASE_URL}/product/fieldname/{selectedField}
        </code>
        
        <p style={{ marginTop: '12px' }}><strong>Expected Working URL:</strong></p>
        <code style={{ 
          background: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          https://espobackend.vercel.app/api/product/fieldname/{selectedField}
        </code>
      </div>
    </div>
  );
};

export default ApiDebugger;