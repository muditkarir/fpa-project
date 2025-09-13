export default async function handler(req, res) {
  // Set CORS and caching headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=3600'); // Cache for 1 hour
  
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
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubToken}`,
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
    
    // Validate that we received meaningful data
    if (!data.name && !data.ticker) {
      return res.status(404).json({
        error: 'Company not found',
        message: `No profile data available for symbol ${symbol}`
      });
    }

    // Return only the fields we need
    const profile = {
      name: data.name || 'Unknown Company',
      ticker: data.ticker || symbol,
      exchange: data.exchange || 'Unknown',
      country: data.country || 'Unknown',
      currency: data.currency || 'USD',
      marketCapitalization: data.marketCapitalization || 0,
      weburl: data.weburl || '',
      logo: data.logo || '',
      shareOutstanding: data.shareOutstanding || 0,
      finnhubIndustry: data.finnhubIndustry || ''
    };

    return res.status(200).json(profile);

  } catch (error) {
    console.error('Finnhub profile2 error:', error.message);
    return res.status(500).json({
      error: 'Service error',
      message: 'Unable to fetch company profile. Please try again later.'
    });
  }
}