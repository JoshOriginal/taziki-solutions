// Test script for admin endpoints
const http = require('http');

// Test 1: Login
console.log('Testing admin login...');

const loginData = JSON.stringify({
  username: 'admin',
  password: 'taziki2025'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
    
    // If login successful, test blog API
    try {
      const response = JSON.parse(data);
      if (response.success && response.token) {
        testBlogAPI(response.token);
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(loginData);
req.end();

// Test blog API with token
function testBlogAPI(token) {
  console.log('\nTesting blog API with token...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/admin/blogs',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Blogs:', response.blogs.length, 'total blogs');
        console.log('✅ Admin system working!');
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}
