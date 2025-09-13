export default async function handler(req, res) {
  // Set CORS and caching headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=7200'); // Cache for 2 hours (peers change less frequently)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol = 'ADBE' } = req.query;
  const finnhubToken = process.env.FINNHUB_TOKEN;
  
  if (!finnhubToken) {
    console.error('FINNHUB_TOKEN environment variable not set');
    return res.status(500).json({ 
      error: 'API configuration error',
      message: 'Service temporarily unavailable'
    });
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${finnhubToken}`,
      {
        headers: {
          'User-Agent': 'Adobe-FPA-Analysis'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      }
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Finnhub returns an array of peer ticker symbols
    const peers = Array.isArray(data) ? data : [];
    
    // Limit to reasonable number of peers and filter out empty/invalid tickers
    const validPeers = peers
      .filter(ticker => ticker && typeof ticker === 'string' && ticker.length > 0)
      .slice(0, 10); // Limit to 10 peers

    return res.status(200).json({
      symbol,
      peers: validPeers,
      count: validPeers.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Finnhub peers error:', error.message);
    return res.status(500).json({
      error: 'Service error',
      message: 'Unable to fetch peer companies. Please try again later.'
    });
  }
}