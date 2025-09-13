// Vercel serverless function for financial tone analysis via Hugging Face
// POST /api/nlp/tone with body: { text }
// Returns: { sentences: [{ text, label, score }] }

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
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text too long. Maximum 5,000 characters allowed' });
    }

    // Split text into sentences for analysis
    const sentences = text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);

    if (sentences.length === 0) {
      return res.status(400).json({ error: 'No valid sentences found in text' });
    }

    // Analyze each sentence for financial sentiment
    const analysisPromises = sentences.slice(0, 10).map(async (sentence) => { // Limit to 10 sentences
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/ProsusAI/finbert', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Adobe-FPA-Analysis/1.0'
          },
          body: JSON.stringify({
            inputs: sentence,
            options: {
              wait_for_model: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const result = await response.json();

        // Handle potential API error responses
        if (result.error) {
          throw new Error(result.error);
        }

        // Extract the highest confidence prediction
        let bestPrediction = null;
        if (Array.isArray(result) && result.length > 0) {
          if (Array.isArray(result[0])) {
            bestPrediction = result[0].reduce((max, curr) => curr.score > max.score ? curr : max);
          } else {
            bestPrediction = result[0];
          }
        }

        return {
          text: sentence,
          label: bestPrediction?.label || 'neutral',
          score: Math.round((bestPrediction?.score || 0) * 1000) / 1000 // Round to 3 decimal places
        };
      } catch (error) {
        console.error('Sentence analysis error:', error.message);
        return {
          text: sentence,
          label: 'neutral',
          score: 0.5
        };
      }
    });

    const sentenceResults = await Promise.all(analysisPromises);

    // Set cache headers (1 minute cache, 2 minutes stale)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return res.status(200).json({
      sentences: sentenceResults
    });

  } catch (error) {
    console.error('Tone analysis error:', error.message);
    
    if (error.message.includes('429') || error.message.includes('busy')) {
      return res.status(429).json({ error: 'Tone analysis model is currently busy. Please try again in a moment.' });
    }
    
    if (error.message.includes('503') || error.message.includes('loading')) {
      return res.status(503).json({ error: 'Tone analysis model is loading. Please try again in a moment.' });
    }
    
    return res.status(500).json({
      error: 'Failed to analyze tone'
    });
  }
}