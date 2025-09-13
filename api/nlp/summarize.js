// Vercel serverless function for text summarization via Hugging Face
// POST /api/nlp/summarize with body: { text }
// Returns: { summaryBullets: string[] }

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required API key
  const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
  if (!HUGGINGFACE_TOKEN) {
    console.error('HUGGINGFACE_TOKEN environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Extract and validate input
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text field is required and must be a non-empty string' });
    }

    // Limit input length to prevent abuse
    if (text.length > 10000) {
      return res.status(400).json({ error: 'Text too long. Maximum 10,000 characters allowed' });
    }

    // Call Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Adobe-FPA-Analysis/1.0'
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Model is currently busy. Please try again in a moment.' });
      }
      
      if (response.status === 503) {
        return res.status(503).json({ error: 'Summarization model is loading. Please try again in a moment.' });
      }
      
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();

    // Handle potential API error responses
    if (result.error) {
      console.error('Hugging Face model error:', result.error);
      return res.status(500).json({ error: 'Summarization service temporarily unavailable' });
    }

    // Extract summary text and convert to bullet points
    let summaryText = '';
    if (Array.isArray(result)) {
      summaryText = result[0]?.summary_text || result[0]?.generated_text || '';
    } else {
      summaryText = result.summary_text || result.generated_text || '';
    }

    // Split summary into bullet points (by sentences)
    const summaryBullets = summaryText
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1));

    // Set cache headers (1 minute cache, 2 minutes stale)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return res.status(200).json({
      summaryBullets
    });

  } catch (error) {
    console.error('Summarization error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to generate summary'
    });
  }
}