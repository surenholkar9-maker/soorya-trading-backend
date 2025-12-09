// Soorya Trading - Upstox OAuth Callback Handler
// This endpoint handles the OAuth2 callback from Upstox
const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { code, state } = req.query;

    // Validate callback parameters
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Missing authorization code',
        message: 'Authorization code not provided in callback'
      });
    }

    const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
    const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    // Validate environment variables
    if (!UPSTOX_API_KEY || !UPSTOX_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Server misconfiguration',
        message: 'API credentials not configured'
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://api.upstox.com/v2/login/authorization/token',
      {
        code: code,
        client_id: UPSTOX_API_KEY,
        client_secret: UPSTOX_API_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const { access_token, token_type, expires_in } = tokenResponse.data;

// Redirect to frontend with token
res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?access_token=${access_token}&token_type=${token_type}&expires_in=${expires_in}&status=success`);
  } catch (error) {
    console.error('Error in Upstox auth callback:', error.message);

    // Handle Upstox API errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Authentication failed',
        message: error.response.data?.message || error.message,
        details: error.response.data
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
