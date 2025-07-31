// Simple test script to verify backend is working
const http = require('http');

const testHealth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Backend Health Check Response:');
        console.log(JSON.parse(data));
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error connecting to backend:', error.message);
      reject(error);
    });

    req.end();
  });
};

const testAnalytics = async (propertyId) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      propertyId: propertyId,
      metrics: ['totalUsers', 'sessions'],
      startDate: '7daysAgo',
      endDate: 'today'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/analytics',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Analytics API Test Response:');
          console.log('Status:', res.statusCode);
          console.log('Data received successfully');
        } else {
          console.log('⚠️ Analytics API Response:');
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
        }
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error testing analytics endpoint:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Run tests
async function runTests() {
  console.log('🧪 Testing Backend API...\n');
  
  try {
    // Test health endpoint
    await testHealth();
    console.log('');
    
    // Test analytics endpoint with a test property ID
    console.log('🧪 Testing Analytics Endpoint...');
    console.log('Note: This may fail if the property ID doesn\'t exist or the service account doesn\'t have access');
    await testAnalytics('123456789'); // Test property ID
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  console.log('\n✅ Backend testing complete!');
  console.log('If health check passed, your backend is ready for clients to use.');
}

runTests();