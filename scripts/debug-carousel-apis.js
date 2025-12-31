#!/usr/bin/env node

/**
 * Debug script to test carousel API endpoints
 * Run with: node scripts/debug-carousel-apis.js
 */

const https = require('https');
const http = require('http');

// Get API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

console.log('🔍 Debugging Carousel API Endpoints');
console.log('API Base URL:', API_BASE_URL);
console.log('API Key:', API_KEY ? '✅ Present' : '❌ Missing');
console.log('=' * 50);

// Helper function to make HTTP requests
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...headers
      }
    };

    const req = client.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test endpoints
async function testEndpoints() {
  const endpoints = [
    {
      name: 'Popular Products',
      url: `${API_BASE_URL}/product/producttag/popular`,
      component: 'PopularProducts'
    },
    {
      name: 'Top Rated Products', 
      url: `${API_BASE_URL}/product/producttag/top-rated`,
      component: 'WeeksFeatured'
    },
    {
      name: 'All Products (fallback)',
      url: `${API_BASE_URL}/product/`,
      component: 'Fallback'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    console.log(`Component: ${endpoint.component}`);
    
    try {
      const response = await makeRequest(endpoint.url);
      
      console.log(`Status: ${response.status}`);
      
      if (response.parseError) {
        console.log('❌ JSON Parse Error:', response.parseError);
        console.log('Raw Response:', response.data.substring(0, 200) + '...');
        continue;
      }

      if (response.status === 200) {
        const data = response.data;
        
        if (data && typeof data === 'object') {
          console.log('✅ Response Structure:');
          console.log('  - Status:', data.status || data.success || 'unknown');
          console.log('  - Message:', data.message || 'none');
          
          if (Array.isArray(data.data)) {
            console.log(`  - Products Count: ${data.data.length}`);
            
            if (data.data.length > 0) {
              const firstProduct = data.data[0];
              console.log('  - First Product Sample:');
              console.log('    - ID:', firstProduct._id || firstProduct.id || 'missing');
              console.log('    - Name:', firstProduct.name || firstProduct.product?.name || 'missing');
              console.log('    - Image:', firstProduct.image1 || firstProduct.img || firstProduct.image || 'missing');
              console.log('    - Slug:', firstProduct.slug || firstProduct.product?.slug || 'missing');
              console.log('    - ProductTag:', firstProduct.productTag || firstProduct.product?.productTag || 'missing');
            } else {
              console.log('⚠️  No products in response');
            }
          } else if (data.data) {
            console.log('  - Data Type:', typeof data.data);
            console.log('  - Data:', JSON.stringify(data.data).substring(0, 100) + '...');
          } else {
            console.log('❌ No data field in response');
          }
        } else {
          console.log('❌ Invalid response format');
        }
      } else {
        console.log(`❌ HTTP Error: ${response.status}`);
        if (response.data) {
          console.log('Error Response:', JSON.stringify(response.data, null, 2));
        }
      }
      
    } catch (error) {
      console.log('❌ Request Failed:', error.message);
    }
    
    console.log('-'.repeat(40));
  }
}

// Test image URL resolution
function testImageUrl() {
  console.log('\n🖼️  Testing Image URL Resolution');
  
  const testImages = [
    'uploads/image1.jpg',
    '/uploads/image2.jpg', 
    'api/uploads/image3.jpg',
    '/api/uploads/image4.jpg',
    'https://example.com/image5.jpg',
    '//cdn.example.com/image6.jpg'
  ];

  const base = API_BASE_URL.replace(/\/$/, '');
  
  testImages.forEach(img => {
    let resolved;
    
    if (/^(https?:)?\/\//i.test(img)) {
      resolved = img.startsWith('//') ? `https:${img}` : img;
    } else {
      const clean = img.replace(/^\/+/, '').replace(/^api\/uploads\/?/, '').replace(/^uploads\/?/, '');
      resolved = `${base}/uploads/${clean}`;
    }
    
    console.log(`  ${img} → ${resolved}`);
  });
}

// Main execution
async function main() {
  try {
    await testEndpoints();
    testImageUrl();
    
    console.log('\n🎯 Recommendations:');
    console.log('1. Check if API endpoints are returning data');
    console.log('2. Verify productTag field exists in product documents');
    console.log('3. Ensure image URLs are properly formatted');
    console.log('4. Test mobile touch/swipe functionality');
    console.log('5. Check browser console for JavaScript errors');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();