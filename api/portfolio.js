// Soorya Trading - Get User Portfolio
// This endpoint fetches the user's portfolio holdings from Upstox

const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    const options = {
      hostname: 'api.upstox.com',
      path: '/v2/portfolio/long-term-holdings',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
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
          return res.status(500).json({ error: 'Failed to parse portfolio data' });
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('Portfolio Error:', error);
      return res.status(500).json({ error: error.message });
    });

    apiRequest.end();

  } catch (error) {
    console.error('Portfolio Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
