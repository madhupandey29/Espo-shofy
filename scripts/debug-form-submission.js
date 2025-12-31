/**
 * Debug script to test form submission directly
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.amrita-fashions.com/shopy';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function debugFormSubmission() {
  console.log('🔍 Debugging Form Submission Issues...\n');

  // Test data that matches what the form would send
  const testFormData = {
    companyName: 'Debug Test Company',
    contactPerson: 'Debug User',
    email: 'debug@test.com',
    phoneNumber: '+1234567890',
    businessType: 'garment-manufacturer',
    annualFabricVolume: '10k-50k',
    primaryMarkets: 'Test Markets',
    fabricTypesOfInterest: ['Cotton', 'Silk'],
    specificationsRequirements: 'Test specifications',
    timeline: '1-3-months',
    additionalMessage: 'Debug test message',
    isSubmitted: true
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    console.log('📤 Testing form submission...');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Headers:', headers);
    console.log('Payload:', JSON.stringify(testFormData, null, 2));

    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testFormData)
    });

    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📡 Response Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log('✅ Form submission successful!');
      console.log('📄 Parsed Response:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.log('⚠️ Response is not valid JSON:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Form submission failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Network Error - Check:');
      console.log('1. Internet connection');
      console.log('2. API server is running');
      console.log('3. CORS settings');
    } else if (error.message.includes('404')) {
      console.log('\n💡 404 Error - Check:');
      console.log('1. API endpoint exists');
      console.log('2. Base URL is correct');
      console.log('3. Route is properly configured');
    } else if (error.message.includes('500')) {
      console.log('\n💡 500 Error - Check:');
      console.log('1. Server logs for detailed error');
      console.log('2. Database connection');
      console.log('3. Required fields in payload');
    }
  }
}

// Test validation logic
function testValidation() {
  console.log('\n🔍 Testing Validation Logic...\n');

  const testCases = [
    {
      name: 'Valid email only',
      data: { email: 'test@example.com', phone: '' },
      shouldPass: true
    },
    {
      name: 'Valid phone only',
      data: { email: '', phone: '+1234567890' },
      shouldPass: true
    },
    {
      name: 'Both email and phone',
      data: { email: 'test@example.com', phone: '+1234567890' },
      shouldPass: true
    },
    {
      name: 'Neither email nor phone',
      data: { email: '', phone: '' },
      shouldPass: false
    },
    {
      name: 'Invalid email format',
      data: { email: 'invalid-email', phone: '' },
      shouldPass: false
    },
    {
      name: 'Invalid phone format',
      data: { email: '', phone: 'invalid-phone' },
      shouldPass: false
    }
  ];

  testCases.forEach(testCase => {
    const errors = validateTestData(testCase.data);
    const passed = Object.keys(errors).length === 0;
    const result = passed === testCase.shouldPass ? '✅' : '❌';
    
    console.log(`${result} ${testCase.name}: ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) {
      console.log(`   Errors: ${JSON.stringify(errors)}`);
    }
  });
}

function validateTestData(formData) {
  const errors = {};
  
  // Require either email or phone
  if (!formData.email && !formData.phone) {
    errors.contact = 'Please provide either an email address or phone number';
  }
  
  // Basic email validation if provided
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Basic phone validation if provided
  if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return errors;
}

// Run all tests
async function runAllTests() {
  testValidation();
  await debugFormSubmission();
}

runAllTests();