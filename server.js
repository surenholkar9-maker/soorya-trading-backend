require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET;
let REDIRECT_URI = process.env.REDIRECT_URI || 'https://surenholkar9-maker.github.io/soorya-trading/callback.html';
if (REDIRECT_URI.endsWith('/callback')) REDIRECT_URI += '.html';

app.get('/api/auth-url', (req, res) => {
    const authUrl = 'https://api.upstox.com/v2/login/authorization/dialog?' +
        'response_type=code&' +
        'client_id=' + UPSTOX_API_KEY + '&' +
        'redirect_uri=' + encodeURIComponent(REDIRECT_URI);
    res.json({ authUrl, success: true });
});

app.get('/api/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code' });

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

        res.json({ access_token: response.data.access_token, success: true });
    } catch (error) {
        console.error('Token error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Token exchange failed' });
    }
});

app.get('/api/portfolio', async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const response = await axios.get('https://api.upstox.com/v2/portfolio/long-term-holdings', {
            headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
        });
        const holdings = response.data.data || [];
        const portfolio_value = holdings.reduce((sum, h) => sum + (h.quantity * h.last_price), 0);
        res.json({ success: true, holdings, portfolio_value, margin: 0 });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Fetch failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server on ' + PORT));
module.exports = app;
