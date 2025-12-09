// Soorya Trading - Exchange Authorization Code for Access Token
// This endpoint exchanges the authorization code for an access token from Upstox

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Token endpoint called. Method:', req.method);
  console.log('Query params:', req.query);

  try {
    // CRITICAL: Get code from query parameters (Upstox redirects with ?code=XXX)
    const { code } = req.query;
    
    // FIX: Use correct environment variable names
    const UPSTOX_CLIENT_ID = process.env.UPSTOX_CLIENT_ID;
    const UPSTOX_CLIENT_SECRET = process.env.UPSTOX_CLIENT_SECRET;
    
    // FIX: Use fixed redirect URI (must match Upstox console exactly)
    const REDIRECT_URI = 'https://soorya-trading-backend.vercel.app/api/token';

    // Validate inputs
    if (!code) {
      console.error('No code provided in query:', req.query);
      return res.status(400).json({ 
        success: false,
        error: 'Authorization code is required',
        message: 'Authorization code not provided in callback'
      });
    }

    if (!UPSTOX_CLIENT_ID || !UPSTOX_CLIENT_SECRET) {
      console.error('Missing env vars. Client ID:', !!UPSTOX_CLIENT_ID, 'Client Secret:', !!UPSTOX_CLIENT_SECRET);
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        message: 'Missing required environment variables (CLIENT_ID or CLIENT_SECRET)'
      });
    }

    console.log('Exchanging code for token. Client ID:', UPSTOX_CLIENT_ID.substring(0, 10) + '...');
    console.log('Redirect URI:', REDIRECT_URI);

    // Prepare token exchange request
    const params = new URLSearchParams({
      code: code,
      client_id: UPSTOX_CLIENT_ID,
      client_secret: UPSTOX_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const postData = params.toString();

    // Use fetch instead of https for simpler code
    const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: postData
    });

    const data = await response.json();
    console.log('Token response status:', response.status);
    console.log('Token response data:', JSON.stringify(data).substring(0, 200) + '...');

    if (data.access_token) {
      console.log('✅ Success! Got access token');
      
      // CRITICAL: Redirect back to frontend with the token
      // This tells the browser to go back to your app with the token
      const frontendUrl = `https://surenholkar9-maker.github.io/soorya-trading/?access_token=${data.access_token}&token_type=${data.token_type}&status=success`;
      console.log('Redirecting to frontend:', frontendUrl);
      
      res.redirect(frontendUrl);
      
    } else {
      console.error('❌ Token exchange failed:', data);
      
      // If error, redirect to frontend with error
      const errorMsg = encodeURIComponent(data.error_description || data.error || 'Token exchange failed');
      res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?error=${errorMsg}&status=failed`);
    }

  } catch (error) {
    console.error('💥 Token exchange error:', error);
    
    // On error, redirect to frontend
    const errorMsg = encodeURIComponent(error.message);
    res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?error=${errorMsg}&status=error`);
  }
};
