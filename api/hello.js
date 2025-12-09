// /api/hello.js
module.exports = async (req, res) => {
  res.json({ 
    message: 'Hello from Soorya Trading API',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/auth-url - Get Upstox login URL',
      '/api - OAuth callback endpoint'
    ]
  });
};
