export default async function handler(req, res) {
  // Set CORS and caching headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=1800'); // Cache for 30 minutes
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol = 'ADBE', metric = 'all' } = req.query;
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
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=${metric}&token=${finnhubToken}`,
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
    
    // Extract key metrics for display
    const metrics = data.metric || {};
    
    // Select the most important financial metrics
    const headlineMetrics = {
      // Valuation ratios
      peRatio: metrics.peBasicExclExtraTTM || metrics.peTTM || null,
      pbRatio: metrics.pbQuarterly || null,
      evToSales: metrics.evToSalesTTM || null,
      
      // Profitability metrics  
      grossMargin: metrics.grossMarginTTM || metrics.grossMarginAnnual || null,
      operatingMargin: metrics.operatingMarginTTM || metrics.operatingMarginAnnual || null,
      netMargin: metrics.netProfitMarginTTM || null,
      roeTTM: metrics.roeTTM || null,
      roaTTM: metrics.roaTTM || null,
      
      // Financial health
      debtToEquity: metrics.totalDebt2TotalEquityQuarterly || null,
      currentRatio: metrics.currentRatioQuarterly || null,
      
      // Returns
      dividendYield: metrics.dividendYieldIndicatedAnnual || null,
      
      // Growth (if available)
      revenueGrowthTTM: metrics.revenueGrowthTTMYoy || null,
      
      // Other key metrics
      beta: metrics.beta || null
    };

    // Filter out null values and format for display
    const formattedMetrics = {};
    Object.entries(headlineMetrics).forEach(([key, value]) => {
      if (value !== null && !isNaN(value)) {
        formattedMetrics[key] = value;
      }
    });

    return res.status(200).json({
      symbol,
      metrics: formattedMetrics,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Finnhub basic-financials error:', error.message);
    return res.status(500).json({
      error: 'Service error',
      message: 'Unable to fetch financial metrics. Please try again later.'
    });
  }
}