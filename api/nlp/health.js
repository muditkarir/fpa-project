// Vercel serverless function for NLP service health check
// GET /api/nlp/health
// Returns: { status: "healthy", services: [] }

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for Hugging Face token
    const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
    const hasToken = !!HUGGINGFACE_TOKEN;
    
    const healthStatus = {
      status: hasToken ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        huggingface: hasToken ? 'available' : 'configuration_missing',
        summarization: hasToken ? 'available' : 'unavailable',
        sentiment: hasToken ? 'available' : 'unavailable',
        qa: hasToken ? 'available' : 'unavailable'
      }
    };

    // Set cache headers - short cache for health checks
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=10');
    
    return res.status(200).json(healthStatus);

  } catch (error) {
    console.error('NLP health check error:', error);
    
    return res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}