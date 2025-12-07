// Soorya Trading - Place Order
// This endpoint places a trading order through Upstox

const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const orderData = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    const postData = JSON.stringify(orderData);

    const options = {
      hostname: 'api.upstox.com',
      path: '/v2/order/place',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiRequest = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          return res.status(apiRes.statusCode).json(response);
        } catch (e) {
          return res.status(500).json({ error: 'Failed to parse order response' });
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('Place Order Error:', error);
      return res.status(500).json({ error: error.message });
    });

    apiRequest.write(postData);
    apiRequest.end();

  } catch (error) {
    console.error('Place Order Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
