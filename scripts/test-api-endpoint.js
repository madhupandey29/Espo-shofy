// Test script to check if the API endpoint is working
const API_BASE = 'https://test.amrita-fashions.com/shopy';
const API_KEY = 'rajeshsir';

async function testProductEndpoint() {
  console.log('=== TESTING PRODUCT API ENDPOINT ===');
  
  const endpoints = [
    `${API_BASE}/product/`,
    `${API_BASE}/product`,
    `${API_BASE}/products`,
    `${API_BASE}/newproduct/`,
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
          console.log('Sample product fields:', Object.keys(data.data[0]));
        }
        
        return { url, success: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ FAILED');
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.log('❌ NETWORK ERROR');
      console.log('Error:', error.message);
    }
  }
  
  return null;
}

// Run the test
testProductEndpoint()
  .then((result) => {
    if (result) {
      console.log('\n🎉 Found working endpoint:', result.url);
    } else {
      console.log('\n💥 No working endpoints found. Check:');
      console.log('1. API server is running');
      console.log('2. API base URL is correct');
      console.log('3. API key is valid');
      console.log('4. Network connectivity');
    }
  })
  .catch((error) => {
    console.error('Test failed:', error);
  });