// Vercel serverless function to fetch Federal Reserve H.10 foreign exchange rates
// GET /api/fx/h10
// Returns: { data: { eurUsd, gbpUsd, tradeWeightedIndex }, lastUpdated }

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Federal Reserve H.10 FRED series IDs
    const series = {
      eurUsd: 'DEXUSEU',      // US/Euro Foreign Exchange Rate (USD per 1 EUR)
      gbpUsd: 'DEXUSUK',      // US/UK Foreign Exchange Rate (USD per 1 GBP)
      tradeWeightedIndex: 'DTWEXBGS' // Trade Weighted U.S. Dollar Index: Broad, Goods and Services
    };

    // Fetch all three series concurrently
    const promises = Object.entries(series).map(async ([key, seriesId]) => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${seriesId}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const observations = data.observations;
      
      if (!observations || observations.length === 0) {
        throw new Error(`No data available for ${seriesId}`);
      }
      
      const latest = observations[0];
      return {
        key,
        value: latest.value === '.' ? null : parseFloat(latest.value),
        date: latest.date,
        seriesId
      };
    });

    const results = await Promise.all(promises);
    
    // Transform results into organized response
    const fxData = {};
    let lastUpdated = null;
    
    for (const result of results) {
      // Convert USD-based rates to proper EUR/USD and GBP/USD format
      let displayValue = result.value;
      let label = '';
      
      if (result.key === 'eurUsd') {
        // DEXUSEU is USD per EUR (already in correct format)
        displayValue = result.value ? result.value.toFixed(4) : null;
        label = 'EUR/USD';
      } else if (result.key === 'gbpUsd') {
        // DEXUSUK is USD per GBP (already in correct format)
        displayValue = result.value ? result.value.toFixed(4) : null;
        label = 'GBP/USD';
      } else if (result.key === 'tradeWeightedIndex') {
        displayValue = result.value ? result.value.toFixed(2) : null;
        label = 'Trade-Weighted USD Index';
      }
      
      fxData[result.key] = {
        value: displayValue,
        date: result.date,
        label: label,
        seriesId: result.seriesId
      };
      
      // Track the most recent update date
      if (!lastUpdated || result.date > lastUpdated) {
        lastUpdated = result.date;
      }
    }

    // Set cache headers - cache for 6 hours since FX data updates daily
    res.setHeader('Cache-Control', 'public, max-age=21600, stale-while-revalidate=3600');
    
    return res.status(200).json({
      success: true,
      data: fxData,
      lastUpdated,
      source: 'Federal Reserve H.10'
    });

  } catch (error) {
    console.error('H.10 FX data fetch error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch exchange rate data',
      details: error.message,
      source: 'Federal Reserve H.10'
    });
  }
}