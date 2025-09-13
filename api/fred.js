// Vercel serverless function to proxy FRED API calls securely
// GET /api/fred?series_id=CPIAUCSL&limit=12&sort_order=desc

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required API key
  const FRED_API_KEY = process.env.FRED_API_KEY;
  if (!FRED_API_KEY) {
    console.error('FRED_API_KEY environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Extract and validate query parameters
  const { series_id, limit = '12', sort_order = 'desc', ...otherParams } = req.query;
  
  if (!series_id) {
    return res.status(400).json({ error: 'series_id parameter is required' });
  }

  try {
    // Build FRED API URL
    const baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
    const params = new URLSearchParams({
      series_id,
      api_key: FRED_API_KEY,
      file_type: 'json',
      limit: String(limit),
      sort_order: String(sort_order),
      ...otherParams
    });

    const fredUrl = `${baseUrl}?${params}`;

    // Fetch data from FRED API
    const response = await fetch(fredUrl, {
      headers: {
        'User-Agent': 'Adobe-FPA-Analysis/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`FRED API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Check for FRED API errors
    if (data.error_code) {
      throw new Error(`FRED API error: ${data.error_message}`);
    }

    // Set caching headers (cache for 1 hour)
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Vary', 'series_id, limit, sort_order');

    // Return the data
    return res.status(200).json({
      success: true,
      series_id,
      count: data.observations?.length || 0,
      data: data
    });

  } catch (error) {
    console.error('FRED API proxy error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch data from FRED API',
      message: error.message
    });
  }
}