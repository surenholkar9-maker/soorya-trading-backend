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
    // CHANGE THIS: Use UPSTOX_CLIENT_ID (not UPSTOX_API_KEY)
    const UPSTOX_CLIENT_ID = process.env.UPSTOX_CLIENT_ID;
    
    // IMPORTANT: Use the exact redirect URI that matches Upstox console
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${UPSTOX_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;


    // Validate environment variables
    if (!UPSTOX_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        error: 'Client ID not configured',
        message: 'Please add UPSTOX_CLIENT_ID to environment variables'
      });
    }

    // FIXED: Use correct Upstox API endpoint and parameters
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${UPSTOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    console.log('Generated auth URL for client:', UPSTOX_CLIENT_ID.substring(0, 10) + '...');
    console.log('Redirect URI:', REDIRECT_URI);

    res.status(200).json({
      success: true,
      authUrl: authUrl,
      redirectUri: REDIRECT_URI,
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
