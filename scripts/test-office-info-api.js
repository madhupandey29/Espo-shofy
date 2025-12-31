/**
 * Test script for Office Information API
 * This script tests the office information API endpoint to ensure it returns the expected data structure
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.amrita-fashions.com/shopy';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function testOfficeInfoAPI() {
  console.log('🧪 Testing Office Information API...\n');

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(`${API_BASE_URL}/officeinformation`, {
      method: 'GET',
      headers,
    });

    console.log(`📡 API Response Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received successfully\n');

    // Check data structure
    console.log('📋 Data Structure Analysis:');
    console.log('- Response has data property:', !!data.data);
    console.log('- Data is array:', Array.isArray(data.data));
    
    if (data.data && data.data[0]) {
      const officeData = data.data[0];
      console.log('- Company Name:', officeData.companyName || 'Not provided');
      console.log('- Email:', officeData.companyEmail || 'Not provided');
      console.log('- Phone 1:', officeData.companyPhone1 || 'Not provided');
      console.log('- Phone 2:', officeData.companyPhone2 || 'Not provided');
      console.log('- WhatsApp:', officeData.whatsappNumber || 'Not provided');
      console.log('- Office Address:', officeData.companyAddress || 'Not provided');
      console.log('- Social Media Links:', {
        facebook: !!officeData.facebook,
        instagram: !!officeData.instagram,
        linkedin: !!officeData.linkedin,
        twitter: !!officeData.twitter,
        youtube: !!officeData.youtube
      });
    }

    console.log('\n📄 Full Response:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n✅ Office Information API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Office Information API test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure your API server is running');
      console.log('2. Check if the API_BASE_URL is correct');
      console.log('3. Verify the /officeinformation endpoint exists');
    }
  }
}

// Run the test
testOfficeInfoAPI();