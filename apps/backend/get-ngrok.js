const http = require('http');

http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const httpsTunnel = json.tunnels.find(t => t.public_url.startsWith('https'));
      if (httpsTunnel) {
        console.log('NGROK_URL:', httpsTunnel.public_url);
      } else {
        console.log('No HTTPS tunnel found');
      }
    } catch(e) {
      console.log('Error parsing JSON:', e);
    }
    process.exit(0);
  });
}).on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});
