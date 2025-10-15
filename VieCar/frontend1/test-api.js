// Test API connectivity
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:6969/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.text();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Network error:', error);
  }
};

testAPI();