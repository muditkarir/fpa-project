// Test script for EDGAR endpoints
// Run with: node test-edgar.js (requires .env setup with EDGAR_USER_AGENT)

const baseUrl = 'http://localhost:3000'; // Adjust if using different port

async function testEdgarEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    console.log(`URL: ${baseUrl}${endpoint}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`);
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return false;
  }
}

async function runEdgarTests() {
  console.log('🚀 Starting EDGAR API tests...');
  console.log('Make sure to run `vercel dev` first and set EDGAR_USER_AGENT in .env');
  console.log('Example: EDGAR_USER_AGENT=TestCompany-FPAAnalysis/1.0 test@example.com');
  
  const results = [];
  
  // Test latest filing discovery
  results.push(await testEdgarEndpoint(
    '/api/edgar/latest-filing?cik=0000796343&form=10-Q',
    'Adobe latest 10-Q filing discovery'
  ));
  
  // Test outlook extraction
  results.push(await testEdgarEndpoint(
    '/api/edgar/latest-outlook?cik=0000796343',
    'Adobe MD&A outlook extraction'
  ));
  
  // Test with different company (Microsoft)
  results.push(await testEdgarEndpoint(
    '/api/edgar/latest-filing?cik=0000789019&form=10-Q',
    'Microsoft latest 10-Q filing discovery'
  ));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All EDGAR tests passed!');
  } else {
    console.log('❌ Some tests failed. Check your EDGAR_USER_AGENT and network connection.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runEdgarTests();
}

module.exports = { testEdgarEndpoint, runEdgarTests };