// Soorya Trading - Exchange Authorization Code for Access Token
// This endpoint exchanges the authorization code for an access token from Upstox

const https = require('https');
const { URLSearchParams } = require('url');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;
    const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
    const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    // Validate inputs
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!UPSTOX_API_KEY || !UPSTOX_API_SECRET || !REDIRECT_URI) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing required environment variables'
      });
    }

    // Prepare token exchange request
    const params = new URLSearchParams({
      code: code,
      client_id: UPSTOX_API_KEY,
      client_secret: UPSTOX_API_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const postData = params.toString();

    const options = {
      hostname: 'api.upstox.com',
      path: '/v2/login/authorization/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Make request to Upstox API
    const apiRequest = https.request(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          return res.status(apiRes.statusCode).json(response);
        } catch (e) {
          return res.status(500).json({ error: 'Failed to parse response' });
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('Token Exchange Error:', error);
      return res.status(500).json({ error: error.message });
    });

    apiRequest.write(postData);
    apiRequest.end();

  } catch (error) {
    console.error('Token Exchange Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
