// Test URL encoding for image paths with spaces
const API_BASE = 'https://test.amrita-fashions.com/shopy';

function processImageUrl(url) {
  console.log('Processing URL:', url);
  if (!url) {
    console.log('URL is null/undefined, returning null');
    return null;
  }
  
  // Check if it's already a remote URL
  if (/^https?:\/\//i.test(url)) {
    console.log('URL is remote, returning as-is:', url);
    return url;
  }
  
  const baseUrl = API_BASE || '';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  
  // Encode the path to handle spaces and special characters
  const encodedPath = encodeURIComponent(cleanPath);
  const result = `${cleanBaseUrl}/uploads/${encodedPath}`;
  console.log('Processed local URL:', result);
  return result;
}

// Test cases
const testUrls = [
  '30 x 150 Cotton Poly Denim Fabric',
  'silky-denim-5.jpg',
  '/uploads/test image.png',
  'https://res.cloudinary.com/test/image.jpg',
  'fabric with spaces & symbols.webp',
  null,
  undefined,
  ''
];

console.log('=== URL ENCODING TEST ===\n');

testUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`Input: ${JSON.stringify(url)}`);
  const result = processImageUrl(url);
  console.log(`Output: ${JSON.stringify(result)}`);
  
  if (result && result.includes(' ')) {
    console.log('⚠️  WARNING: Result still contains spaces!');
  } else if (result) {
    console.log('✅ URL properly encoded');
  }
  console.log('---\n');
});

console.log('🔧 NEXT STEPS:');
console.log('1. Restart your Next.js development server');
console.log('2. The next.config.js changes require a restart to take effect');
console.log('3. Test the quick view again after restart');