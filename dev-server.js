// Simple development server to proxy FRED API calls
// Run with: node dev-server.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// FRED API proxy endpoint
app.get('/api/fred', async (req, res) => {
  try {
    const { series_id, limit = '12', sort_order = 'desc', ...otherParams } = req.query;
    
    if (!series_id) {
      return res.status(400).json({ error: 'series_id parameter is required' });
    }

    const FRED_API_KEY = process.env.FRED_API_KEY;
    if (!FRED_API_KEY) {
      return res.status(500).json({ error: 'FRED_API_KEY environment variable not set' });
    }

    const params = new URLSearchParams({
      series_id,
      api_key: FRED_API_KEY,
      file_type: 'json',
      limit: String(limit),
      sort_order: String(sort_order),
      ...otherParams
    });

    const fredUrl = `https://api.stlouisfed.org/fred/series/observations?${params}`;
    
    console.log(`Fetching FRED data for ${series_id}`);
    
    const response = await fetch(fredUrl);
    
    if (!response.ok) {
      throw new Error(`FRED API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error_code) {
      throw new Error(`FRED API error: ${data.error_message}`);
    }

    // Set caching headers
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    
    res.json({
      success: true,
      series_id,
      count: data.observations?.length || 0,
      data: data
    });

  } catch (error) {
    console.error('FRED API proxy error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data from FRED API',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Development FRED API proxy running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoint: http://localhost:${PORT}/api/fred?series_id=CPIAUCSL\n`);
});