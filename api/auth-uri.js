// Soorya Trading - Generate Upstox Authorization URL
// This endpoint returns the OAuth2 authorization URL for user login

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    // Validate environment variables
    if (!UPSTOX_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API key not configured',
        message: 'Please add UPSTOX_API_KEY to environment variables'
      });
    }

    if (!REDIRECT_URI) {
      return res.status(500).json({
        success: false,
        error: 'Redirect URI not configured',
        message: 'Please add REDIRECT_URI to environment variables'
      });
    }

    // Construct the authorization URL
    const authUrl = `https://api.upstox.com/v2/login/authorization?response_type=code&client_id=${UPSTOX_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    res.status(200).json({
      success: true,
      authUrl: authUrl,
      message: 'Authorization URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate authorization URL'
    });
  }
};
