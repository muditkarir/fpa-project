// Vercel serverless function for question answering via Hugging Face
// POST /api/nlp/qa with body: { question, context }
// Returns: { answer, score }

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
    const { question, context } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'question field is required and must be a non-empty string' });
    }

    if (!context || typeof context !== 'string' || context.trim().length === 0) {
      return res.status(400).json({ error: 'context field is required and must be a non-empty string' });
    }

    // Limit input lengths to prevent abuse
    if (question.length > 500) {
      return res.status(400).json({ error: 'Question too long. Maximum 500 characters allowed' });
    }

    if (context.length > 8000) {
      return res.status(400).json({ error: 'Context too long. Maximum 8,000 characters allowed' });
    }

    // Call Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/deepset/roberta-base-squad2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Adobe-FPA-Analysis/1.0'
      },
      body: JSON.stringify({
        inputs: {
          question: question.trim(),
          context: context.trim()
        },
        options: {
          wait_for_model: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Q&A model is currently busy. Please try again in a moment.' });
      }
      
      if (response.status === 503) {
        return res.status(503).json({ error: 'Q&A model is loading. Please try again in a moment.' });
      }
      
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();

    // Handle potential API error responses
    if (result.error) {
      console.error('Hugging Face model error:', result.error);
      return res.status(500).json({ error: 'Q&A service temporarily unavailable' });
    }

    // Extract answer and confidence score
    const answer = result.answer || 'No answer found';
    const score = Math.round((result.score || 0) * 1000) / 1000; // Round to 3 decimal places

    // If score is very low, provide a more helpful response
    if (score < 0.1) {
      return res.status(200).json({
        answer: 'I cannot find a confident answer to this question in the provided context.',
        score: 0
      });
    }

    // No cache headers for Q&A as it's typically unique per request

    return res.status(200).json({
      answer,
      score
    });

  } catch (error) {
    console.error('Q&A error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to answer question'
    });
  }
}