import React, { useState, useEffect } from 'react';

const ApiTestPage = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      console.log('Testing API...');
      console.log('Base URL from env:', process.env.NEXT_PUBLIC_API_BASE_URL);
      
      // Test the exact URL that should work
      const url = 'https://espobackend.vercel.app/api/product/fieldname/content';
      console.log('Testing URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your API key if needed
          'x-api-key': 'rajeshsir'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setTestResult({
        success: true,
        data: data,
        url: url,
        status: response.status
      });
      
    } catch (error) {
      console.error('API Test Error:', error);
      setTestResult({
        success: false,
        error: error.message,
        url: 'https://espobackend.vercel.app/api/product/fieldname/content'
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>API Connection Test</h1>
      
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Environment Check</h3>
        <p><strong>Current Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
        <p><strong>Expected Base URL:</strong> https://espobackend.vercel.app/api</p>
        <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_API_KEY ? 'Set' : 'Not set'}</p>
      </div>

      <button 
        onClick={testApi} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          background: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      {testResult && (
        <div style={{
          background: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: testResult.success ? '#155724' : '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>{testResult.success ? '✅ Success!' : '❌ Failed'}</h3>
          <p><strong>URL:</strong> {testResult.url}</p>
          {testResult.status && <p><strong>Status:</strong> {testResult.status}</p>}
          
          {testResult.success ? (
            <div>
              <p><strong>API Response:</strong></p>
              <pre style={{ 
                background: 'white', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '14px'
              }}>
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          ) : (
            <p><strong>Error:</strong> {testResult.error}</p>
          )}
        </div>
      )}

      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
        <h3>🔧 Troubleshooting Steps</h3>
        <ol>
          <li><strong>Restart your dev server:</strong> Stop and restart with <code>npm run dev</code></li>
          <li><strong>Check browser console:</strong> Open DevTools → Console for detailed errors</li>
          <li><strong>Check network tab:</strong> Open DevTools → Network to see actual requests</li>
          <li><strong>CORS issues:</strong> If you see CORS errors, the API needs to allow your domain</li>
        </ol>
      </div>

      <div style={{ background: '#e2e3e5', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>📋 Expected vs Actual</h3>
        <p><strong>Your API works at:</strong> https://espobackend.vercel.app/api/product/fieldname/content</p>
        <p><strong>Your app should call:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}/product/fieldname/content</p>
        <p><strong>Match:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL === 'https://espobackend.vercel.app/api' ? '✅ Yes' : '❌ No - Update .env.local'}</p>
      </div>
    </div>
  );
};

export default ApiTestPage;