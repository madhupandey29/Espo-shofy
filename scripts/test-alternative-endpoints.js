// Test alternative product endpoints that might work
const API_BASE = 'https://test.amrita-fashions.com/shopy';
const API_KEY = 'rajeshsir';

async function testAlternativeEndpoints() {
  console.log('=== TESTING ALTERNATIVE PRODUCT ENDPOINTS ===');
  
  const endpoints = [
    // Try endpoints that might not involve category population
    `${API_BASE}/product/all`,
    `${API_BASE}/product/list`,
    `${API_BASE}/product/simple`,
    `${API_BASE}/product?limit=10`,
    `${API_BASE}/product/?limit=10`,
    `${API_BASE}/product?populate=false`,
    `${API_BASE}/product/?populate=false`,
    // Try specific product by ID (if we can find one)
    `${API_BASE}/product/slug/silky-denim-5-5-ozs`,
    // Try other endpoints
    `${API_BASE}/groupcode/`,
    `${API_BASE}/category/`,
  ];
  
  for (const url of endpoints) {
    console.log(`\nTesting: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS!');
        console.log('Response structure:', {
          hasData: !!data.data,
          dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
          dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
          topLevelKeys: Object.keys(data),
        });
        
        if (Array.isArray(data.data) && data.data.length > 0) {
          console.log('Sample item keys:', Object.keys(data.data[0]));
          console.log('Sample category field:', data.data[0].category);
        } else if (data.data && typeof data.data === 'object') {
          console.log('Single item keys:', Object.keys(data.data));
        }
        
        return { url, success: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ FAILED');
        console.log('Error response:', errorText.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ NETWORK ERROR');
      console.log('Error:', error.message);
    }
  }
  
  return null;
}

// Run the test
testAlternativeEndpoints()
  .then((result) => {
    if (result) {
      console.log('\n🎉 Found working endpoint:', result.url);
      console.log('\n💡 RECOMMENDATION:');
      console.log('Update your Redux API to use this working endpoint instead.');
    } else {
      console.log('\n💥 No working endpoints found.');
      console.log('\n🔧 BACKEND FIXES NEEDED:');
      console.log('1. Fix Category model data - ensure all category references use valid ObjectIds');
      console.log('2. Add data validation to prevent string values in ObjectId fields');
      console.log('3. Consider adding a /product/simple endpoint that doesn\'t populate categories');
    }
  })
  .catch((error) => {
    console.error('Test failed:', error);
  });