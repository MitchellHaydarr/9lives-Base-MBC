// circleServer.mjs (ESM server for Circle sandbox)

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;

if (!CIRCLE_API_KEY) {
  console.warn('⚠️  CIRCLE_API_KEY is missing in .env');
}

// Simple demo endpoint: fetch Circle sandbox business balances
app.get('/api/circle/balances', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api-sandbox.circle.com/v1/businessAccount/balances',
      {
        headers: {
          Authorization: `Bearer ${CIRCLE_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Circle API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch Circle balances',
      details: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.CIRCLE_PORT || 8787;
app.listen(PORT, () => {
  console.log(`✅ Circle proxy server listening on http://localhost:${PORT}`);
});