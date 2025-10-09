// test-api-companies.js
async function testAPI() {
  try {
    console.log('🔍 Probando API /api/companies...');
    
    const response = await fetch('http://localhost:3001/api/companies');
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📄 Raw response:', text);
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('✅ Parsed JSON:', json);
        console.log('📈 Companies count:', json.length);
      } catch (e) {
        console.log('❌ Error parsing JSON:', e.message);
      }
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

testAPI();