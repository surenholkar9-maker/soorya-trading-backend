module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If it has a code parameter, it's an OAuth callback
  if (req.query.code) {
    console.log('OAuth callback with code:', req.query.code);
    
    try {
      const UPSTOX_API_KEY = process.env.UPSTOX_CLIENT_ID;
      const REDIRECT_URI = 'https://soorya-trading-backend.vercel.app/api/auth-url';
      
      // Exchange code for token
      const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          code: req.query.code,
          client_id: UPSTOX_API_KEY,
          client_secret: process.env.UPSTOX_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        // Redirect to frontend with token
        res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?access_token=${data.access_token}&status=success`);
      } else {
        res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?error=${encodeURIComponent(data.error || 'Auth failed')}`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      res.redirect(`https://surenholkar9-maker.github.io/soorya-trading/?error=${encodeURIComponent(error.message)}`);
    }
  } 
  // If no code, generate auth URL
  else {
    const UPSTOX_API_KEY = process.env.UPSTOX_CLIENT_ID;
    const REDIRECT_URI = 'https://soorya-trading-backend.vercel.app/api/auth-url';
    
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${UPSTOX_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Authorization URL generated'
    });
  }
};
