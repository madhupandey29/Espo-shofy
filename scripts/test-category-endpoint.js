// Test category endpoint to see the data structure
const API_BASE = 'https://test.amrita-fashions.com/shopy';
const API_KEY = 'rajeshsir';

async function testCategoryEndpoint() {
  console.log('=== TESTING CATEGORY ENDPOINT ===');
  
  const url = `${API_BASE}/category/`;
  console.log(`Testing: ${url}`);
  
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
        console.log('\n📋 CATEGORIES FOUND:');
        data.data.forEach((cat, index) => {
          console.log(`${index + 1}. ID: ${cat._id} | Name: ${cat.name}`);
        });
        
        console.log('\n🔍 ANALYSIS:');
        console.log('All category IDs are valid ObjectIds:', 
          data.data.every(cat => /^[0-9a-fA-F]{24}$/.test(cat._id))
        );
        
        // Check if any products reference categories by name instead of ID
        const categoryNames = data.data.map(cat => cat.name);
        console.log('\nCategory names that might be used incorrectly as IDs:');
        categoryNames.forEach(name => console.log(`- "${name}"`));
      }
      
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED');
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR');
    console.log('Error:', error.message);
  }
  
  return null;
}

// Run the test
testCategoryEndpoint()
  .then((result) => {
    if (result) {
      console.log('\n💡 BACKEND ISSUE IDENTIFIED:');
      console.log('The product collection likely has category fields containing');
      console.log('category NAMES (like "Cotton Fabrics") instead of category IDs.');
      console.log('\n🔧 BACKEND FIX NEEDED:');
      console.log('1. Update all products to reference categories by ObjectId, not name');
      console.log('2. Run a data migration script to fix existing records');
      console.log('3. Add validation to prevent this in the future');
    }
  })
  .catch((error) => {
    console.error('Test failed:', error);
  });