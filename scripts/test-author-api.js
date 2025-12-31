const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.amrita-fashions.com/shopy';

async function testAuthorAPI() {
  console.log('🧪 Testing Author API...');
  console.log('API Base URL:', API_BASE_URL);

  const headers = {
    'Content-Type': 'application/json',
  };

  // Add API key if available
  if (process.env.NEXT_PUBLIC_API_KEY) {
    headers['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY;
  }

  try {
    console.log('📤 Fetching authors...');
    
    const response = await fetch(`${API_BASE_URL}/author`, {
      method: 'GET',
      headers,
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Authors fetched successfully:');
    console.log('📊 Data:', JSON.stringify(data, null, 2));
    console.log('📊 Number of authors:', Array.isArray(data) ? data.length : 'Not an array');

    if (Array.isArray(data) && data.length > 0) {
      console.log('👤 First author details:');
      console.log('  - ID:', data[0]._id);
      console.log('  - Name:', data[0].name);
      console.log('  - Designation:', data[0].designation);
      console.log('  - Description:', data[0].description);
      console.log('  - Image:', data[0].authorimage);
      console.log('  - Alt Image:', data[0].altimage);
    }

  } catch (error) {
    console.error('❌ Error testing author API:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Run the test
testAuthorAPI();