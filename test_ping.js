const https = require('https');

https.get('https://api-quan-ly-nha-tro.onrender.com/api/rooms/all', (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
}).on('error', (e) => {
  console.error('ERROR:', e);
});
