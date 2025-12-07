require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Get auth URL (for frontend to redirect to Upstox login)
app.get('/api/auth-url', (req, res) => {
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?` +
        `response_type=code&` +
        `client_id=${UPSTOX_API_KEY}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.json({ authUrl });
});

// Exchange code for access token (called after Upstox redirects back)
app.post('/api/token', async (req, res) => {
    const { code } = req.body;
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
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Place order (example: proxy authenticated call to Upstox)
app.post('/api/place-order', async (req, res) => {
    const { token, orderData } = req.body;
    try {
        const response = await axios.post(
            'https://api.upstox.com/v2/order/place',
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch portfolio (holdings) for authenticated user
app.get('/api/portfolio', async (req, res) => {
  const { token } = req.query;
  try {
    const response = await axios.get(
      'https://api.upstox.com/v2/portfolio/long-term-holdings',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch live market data for instrument
app.get('/api/market-data', async (req, res) => {
  const { token, instrumentKeys } = req.query;
  try {
    const response = await axios.get(
      'https://api.upstox.com/v2/market-quote/quotes/?mode=LTP',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
          'instrument_key': instrumentKeys
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
