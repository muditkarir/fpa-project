// Simple test script for NLP endpoints
// Run with: node test-nlp.js (requires .env setup)

const baseUrl = 'http://localhost:3000'; // Adjust if using different port

async function testEndpoint(endpoint, body) {
  try {
    console.log(`\n🧪 Testing ${endpoint}...`);
    console.log('Request:', JSON.stringify(body, null, 2));
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting NLP API tests...');
  console.log('Make sure to run `vercel dev` first and set HUGGINGFACE_TOKEN in .env');
  
  const results = [];
  
  // Test summarization
  results.push(await testEndpoint('/api/nlp/summarize', {
    text: 'Adobe Inc. is a multinational computer software company. The company is headquartered in San Jose, California. Adobe has historically focused upon the creation of multimedia and creativity software products. Adobe is best known for its Adobe Flash web software ecosystem, Photoshop image editing software, Adobe Illustrator vector graphics editor, Acrobat Reader, the Portable Document Format, and Adobe Creative Suite, as well as its successor Adobe Creative Cloud.'
  }));
  
  // Test tone analysis  
  results.push(await testEndpoint('/api/nlp/tone', {
    text: 'Adobe reported strong quarterly earnings with revenue growth exceeding expectations. The company faces challenges in the competitive market but maintains a positive outlook for the future.'
  }));
  
  // Test Q&A
  results.push(await testEndpoint('/api/nlp/qa', {
    question: 'Where is Adobe headquartered?',
    context: 'Adobe Inc. is a multinational computer software company. The company is headquartered in San Jose, California. Adobe has historically focused upon the creation of multimedia and creativity software products.'
  }));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed. Check your HUGGINGFACE_TOKEN and API setup.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint, runTests };