require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET;
// Ensure redirect URI ends with callback.html for GitHub Pages
let REDIRECT_URI = process.env.REDIRECT_URI || 'https://surenholkar9-maker.github.io/soorya-trading/callback.html';
if (REDIRECT_URI.endsWith('/callback')) {
    REDIRECT_URI += '.html';
}

// Get auth URL (for frontend to redirect to Upstox login)
app.get('/api/auth-url', (req, res) => {
    const authUrl = 'https://api.upstox.com/v2/login/authorization/dialog?' +
        'response_type=code&' +
        'client_id=' + UPSTOX_API_KEY + '&' +
        'redirect_uri=' + encodeURIComponent(REDIRECT_URI);
    res.json({ authUrl, url: authUrl, success: true });
});

// Exchange code for access token
app.get('/api/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const response = await axios.post(
            'https://api.upstox.com/v2/login/authorization/token',
            new URLSearchParams({
                code,
                client_id: UPSTOX_API_KEY,
                client_secret: UPSTOX_API_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // Redirect back to frontend with the token
        const frontendUrl = REDIRECT_URI.replace('/callback.html', '/');
        res.redirect(frontendUrl + '?token=' + response.data.access_token);
    } catch (error) {
        console.error('Token exchange failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to exchange code for token' });
    }
});

// Proxy portfolio requests
app.get('/api/portfolio', async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const response = await axios.get('https://api.upstox.com/v2/portfolio/long-term-holdings', {
            headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
        });
        
        // Calculate summary for UI
        const holdings = response.data.data || [];
        const portfolio_value = holdings.reduce((sum, h) => sum + (h.quantity * h.last_price), 0);
        
        res.json({
            success: true,
            holdings: holdings,
            portfolio_value: portfolio_value,
            margin: 0 // Fetch from other endpoint if needed
        });
    } catch (error) {
        console.error('Portfolio fetch failed:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});

module.exports = app;
