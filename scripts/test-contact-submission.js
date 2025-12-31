/**
 * Test script for Contact Form Submission
 * This script tests the contact form submission endpoint
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.amrita-fashions.com/shopy';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function testContactSubmission() {
  console.log('🧪 Testing Contact Form Submission...\n');

  const testData = {
    companyName: 'Test Company',
    contactPerson: 'John Doe',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    businessType: 'garment-manufacturer',
    annualFabricVolume: '10k-50k',
    primaryMarkets: 'North America, Europe',
    fabricTypesOfInterest: ['Cotton', 'Silk'],
    specificationsRequirements: 'High quality cotton fabric',
    timeline: '1-3-months',
    additionalMessage: 'Looking forward to working together'
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    console.log('📤 Submitting test contact form...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...testData, isSubmitted: true })
    });

    console.log(`📡 API Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Form submitted successfully!\n');
    console.log('📄 Response:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n✅ Contact form submission test completed successfully!');
    
  } catch (error) {
    console.error('❌ Contact form submission test failed:');
    console.error('Error:', error.message);
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure your API server is running');
    console.log('2. Check if the /contacts endpoint accepts isSubmitted flag');
    console.log('3. Verify the API accepts the data format');
    console.log('4. Check server logs for detailed error information');
  }
}

// Test draft creation as well
async function testDraftCreation() {
  console.log('\n🧪 Testing Draft Creation...\n');

  const testData = {
    companyName: 'Draft Test Company',
    contactPerson: 'Jane Doe',
    email: 'draft@example.com',
    phoneNumber: '+0987654321'
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    console.log('📤 Creating test draft...');

    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testData)
    });

    console.log(`📡 Draft API Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Draft Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Draft created successfully!\n');
    console.log('📄 Draft Response:');
    console.log(JSON.stringify(result, null, 2));

    return result.data?._id;
    
  } catch (error) {
    console.error('❌ Draft creation test failed:');
    console.error('Error:', error.message);
    return null;
  }
}

// Run both tests
async function runAllTests() {
  await testDraftCreation();
  await testContactSubmission();
}

runAllTests();