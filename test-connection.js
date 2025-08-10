import http from 'http';

// Test backend connection
function testBackendConnection() {
  console.log('Testing backend connection...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Backend Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Backend Response:', response);
        
        if (response.database === 'connected') {
          console.log('✅ Backend is running and database is connected!');
        } else {
          console.log('❌ Backend is running but database is not connected');
        }
      } catch (error) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Backend connection failed:', error.message);
  });

  req.end();
}

// Test API endpoints
function testAPIEndpoints() {
  console.log('\nTesting API endpoints...');
  
  const endpoints = [
    '/api/tasks',
    '/api/categories',
    '/api/habits'
  ];

  endpoints.forEach(endpoint => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`${endpoint}: ${res.statusCode}`);
    });

    req.on('error', (error) => {
      console.log(`${endpoint}: ❌ ${error.message}`);
    });

    req.end();
  });
}

// Run tests
console.log('🔍 Testing Frontend-Backend Connection...\n');
testBackendConnection();

// Wait a bit for the first test to complete, then test API endpoints
setTimeout(() => {
  testAPIEndpoints();
  console.log('\n🎯 Connection test completed!');
}, 1000);
