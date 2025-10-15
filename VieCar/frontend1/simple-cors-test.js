// Simple CORS test script
const testCORS = () => {
  console.log('Testing CORS configuration...');
  
  fetch('http://localhost:6969/api/auth/test', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    }
  })
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.text();
  })
  .then(data => {
    console.log('Response data:', data);
    console.log('✅ CORS test successful!');
  })
  .catch(error => {
    console.error('❌ CORS test failed:', error.message);
    if (error.message.includes('CORS')) {
      console.log('💡 CORS configuration needs to be fixed');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Backend server is not running');
    }
  });
};

testCORS();