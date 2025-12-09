// /api/index.js - OAuth Callback Handler
module.exports = async (req, res) => {
  console.log('=== /api endpoint called ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If it's a GET request with code parameter (OAuth callback)
  if (req.method === 'GET' && req.query.code) {
    console.log('OAuth callback received with code:', req.query.code);
    
    try {
      const UPSTOX_CLIENT_ID = process.env.UPSTOX_CLIENT_ID || process.env.UPSTOX_API_KEY;
      const UPSTOX_CLIENT_SECRET = process.env.UPSTOX_CLIENT_SECRET || process.env.UPSTOX_API_SECRET;
      
      // CRITICAL: This must match exactly what's in Upstox console
      const REDIRECT_URI = 'https://soorya-trading-backend.vercel.app/api';
      
      console.log('Exchanging code for token...');
      
      const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          code: req.query.code,
          client_id: UPSTOX_CLIENT_ID,
          client_secret: UPSTOX_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });
      
      const data = await response.json();
      console.log('Token response:', data);
      
      if (data.access_token) {
        // Redirect to frontend with token
        const frontendUrl = `https://surenholkar9-maker.github.io/soorya-trading/?access_token=${data.access_token}&status=success`;
        console.log('Redirecting to:', frontendUrl);
        return res.redirect(frontendUrl);
      } else {
        const errorMsg = encodeURIComponent(data.error_description || 'Authentication failed');
        return res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?error=${errorMsg}`);
      }
      
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = encodeURIComponent(error.message);
      return res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?error=${errorMsg}`);
    }
  }
  
  // For other requests to /api
  res.json({
    success: true,
    message: 'Soorya Trading API',
    endpoints: {
      authUrl: '/api/auth-url (GET) - Get Upstox login URL',
      callback: '/api?code=XXX (GET) - OAuth callback handler'
    }
  });
};
