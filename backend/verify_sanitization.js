const fetch = require('node-fetch'); // Assuming node-fetch is available or using built-in fetch in newer node
// If node-fetch is not available, I'll use http module. 
// Checking package.json, node-fetch is NOT in dependencies.
// I will use standard http module to be safe.

const http = require('http');

const postData = JSON.stringify({
  name: '  Sanitization Test  ',
  phone: '123-456-7890',
  item: 'Test Item'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/customers',
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
    console.log('POST Response:', data);
    const response = JSON.parse(data);
    if (response.id) {
      // Now fetch it back
      http.get(`http://localhost:3000/customers/${response.id}`, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => {
          data2 += chunk;
        });
        res2.on('end', () => {
          console.log('GET Response:', data2);
          const customer = JSON.parse(data2);
          if (customer.name === 'Sanitization Test' && customer.phone === '1234567890') {
            console.log('VERIFICATION PASSED');
          } else {
            console.log('VERIFICATION FAILED');
            console.log('Expected name: "Sanitization Test", Got:', customer.name);
            console.log('Expected phone: "1234567890", Got:', customer.phone);
          }
        });
      });
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
