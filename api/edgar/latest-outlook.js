// Vercel serverless function to extract MD&A outlook from latest EDGAR filing
// GET /api/edgar/latest-outlook?cik=0000796343
// Returns: { source: { cik, form, filedAt, url }, excerpt: string, confidence: "high|medium|low" }

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required User-Agent
  const userAgent = process.env.EDGAR_USER_AGENT;
  if (!userAgent) {
    console.error('EDGAR_USER_AGENT environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Extract CIK parameter
    const { cik = '0000796343' } = req.query; // Default to Adobe
    const formattedCik = cik.toString().padStart(10, '0');

    // First, get the latest 10-Q filing info
    const latestFilingResponse = await fetch(`${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/edgar/latest-filing?cik=${formattedCik}&form=10-Q`);
    
    if (!latestFilingResponse.ok) {
      const error = await latestFilingResponse.json();
      throw new Error(error.error || 'Failed to get latest filing');
    }

    const filing = await latestFilingResponse.json();
    console.log(`Fetching MD&A from ${filing.primaryDocumentUrl}`);

    // Fetch the HTML document with retry logic
    let htmlResponse;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        htmlResponse = await fetch(filing.primaryDocumentUrl, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml'
          }
        });

        if (htmlResponse.ok) break;
        
        if (htmlResponse.status === 429) {
          // Rate limited, wait and retry
          if (retryCount < maxRetries) {
            console.log('Rate limited, retrying in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            retryCount++;
            continue;
          }
        }

        throw new Error(`Failed to fetch HTML: ${htmlResponse.status}`);
      } catch (error) {
        if (retryCount >= maxRetries) throw error;
        console.log('HTML fetch failed, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        retryCount++;
      }
    }

    const htmlContent = await htmlResponse.text();
    
    // Extract MD&A outlook using heuristics
    const outlookResult = extractOutlookFromHTML(htmlContent);

    // Set cache headers (cache for 6 hours since filings don't change)
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    res.setHeader('Vary', 'cik');

    return res.status(200).json({
      source: {
        cik: filing.cik,
        form: filing.form,
        filedAt: filing.filedAt,
        url: filing.primaryDocumentUrl
      },
      excerpt: outlookResult.excerpt,
      confidence: outlookResult.confidence
    });

  } catch (error) {
    console.error('Outlook extraction error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to extract outlook from filing'
    });
  }
}

function extractOutlookFromHTML(html) {
  try {
    // Initial cleanup - remove scripts, styles, and normalize whitespace
    let cleanHtml = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Step 1: Look for direct outlook headings first
    const outlookHeadingPatterns = [
      // Match various heading patterns for outlook sections
      /<[^>]*(?:heading|h\d|font[^>]*bold|b\b)[^>]*>\s*(?:business\s*)?outlook(?:\s*and\s*trends)?[^<]*<\/[^>]*>/gi,
      /<[^>]*(?:heading|h\d|font[^>]*bold|b\b)[^>]*>\s*forward[^<]*looking[^<]*statements?[^<]*<\/[^>]*>/gi,
      /<[^>]*(?:heading|h\d|font[^>]*bold|b\b)[^>]*>\s*future[^<]*expectations?[^<]*<\/[^>]*>/gi,
      // Look for anchor links or table of contents entries
      /<a[^>]*>\s*(?:business\s*)?outlook(?:\s*and\s*trends)?[^<]*<\/a>/gi,
      // Look for bold text patterns
      /(?:business\s*)?outlook(?:\s*and\s*trends)?(?=\s*[:\-\.]|\s*<)/gi
    ];

    let outlookSection = null;
    let confidence = 'low';

    for (const pattern of outlookHeadingPatterns) {
      const matches = cleanHtml.match(pattern);
      if (matches && matches.length > 0) {
        // Find the position of the first outlook heading
        const headingMatch = cleanHtml.search(pattern);
        if (headingMatch !== -1) {
          // Extract content from this heading until the next major heading
          const fromHeading = cleanHtml.slice(headingMatch);
          
          // Look for the next heading to know where to stop
          const nextHeadingPatterns = [
            /<[^>]*(?:heading|h\d)[^>]*>[^<]+<\/[^>]*>/gi,
            /<[^>]*font[^>]*bold[^>]*>[^<]{10,100}<\/[^>]*>/gi,
            /(?:item\s*\d+|part\s*[iv]+)/gi
          ];
          
          let nextHeadingPos = fromHeading.length;
          for (const nextPattern of nextHeadingPatterns) {
            const nextMatch = fromHeading.search(nextPattern);
            if (nextMatch > 200 && nextMatch < nextHeadingPos) { // Skip immediate matches
              nextHeadingPos = nextMatch;
            }
          }
          
          outlookSection = fromHeading.slice(0, Math.min(nextHeadingPos, 15000));
          confidence = 'high';
          break;
        }
      }
    }

    // Step 2: If no direct outlook heading found, look for MD&A section
    if (!outlookSection) {
      const mdaPatterns = [
        /item\s*2[^a-z]*management[^<]{0,100}discussion[^<]{0,100}analysis/i,
        /management[^<]{0,100}discussion[^<]{0,100}analysis[^<]{0,100}financial[^<]{0,100}condition/i,
        /<[^>]*(?:heading|h\d)[^>]*>[^<]*(?:management|md&a)[^<]*discussion[^<]*<\/[^>]*>/i
      ];

      let mdaStart = -1;
      for (const pattern of mdaPatterns) {
        const match = cleanHtml.search(pattern);
        if (match !== -1) {
          mdaStart = match;
          break;
        }
      }

      if (mdaStart !== -1) {
        // Extract from MD&A section, limiting to reasonable size
        outlookSection = cleanHtml.slice(mdaStart, mdaStart + 25000);
        confidence = 'medium';
      }
    }

    if (!outlookSection) {
      return {
        excerpt: 'MD&A or Outlook section not found in this filing.',
        confidence: 'low'
      };
    }

    // Step 3: Clean and extract meaningful content
    const extractedText = extractMeaningfulContent(outlookSection);
    
    if (!extractedText || extractedText.length < 100) {
      return {
        excerpt: 'Unable to extract meaningful outlook content from filing.',
        confidence: 'low'
      };
    }

    return {
      excerpt: cleanAndTruncateText(extractedText, 2500),
      confidence: confidence
    };

  } catch (error) {
    console.error('HTML parsing error:', error.message);
    return {
      excerpt: 'Error parsing filing HTML content.',
      confidence: 'low'
    };
  }
}

function extractMeaningfulContent(htmlSection) {
  // Remove HTML tags but preserve paragraph structure
  let text = htmlSection
    .replace(/<br[^>]*>/gi, '\n') // Convert <br> to newlines
    .replace(/<\/p>/gi, '\n\n')   // Convert </p> to paragraph breaks
    .replace(/<p[^>]*>/gi, '')    // Remove <p> opening tags
    .replace(/<\/div>/gi, '\n')   // Convert </div> to newlines
    .replace(/<[^>]*>/g, ' ')     // Remove all other HTML tags
    .replace(/&nbsp;/g, ' ')      // Replace &nbsp;
    .replace(/&amp;/g, '&')       // Replace &amp;
    .replace(/&lt;/g, '<')        // Replace &lt;
    .replace(/&gt;/g, '>')        // Replace &gt;
    .replace(/&quot;/g, '"')      // Replace &quot;
    .replace(/&#\d+;/g, ' ')      // Replace numeric entities
    .replace(/&[a-zA-Z]+;/g, ' '); // Replace other entities

  // Clean up whitespace and structure
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Collapse multiple newlines
    .replace(/ +/g, ' ')              // Collapse multiple spaces
    .trim();

  // Split into paragraphs and filter out noise
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => isValidParagraph(p));

  // Take first 5 meaningful paragraphs
  const selectedParagraphs = paragraphs.slice(0, 5);
  
  return selectedParagraphs.join('\n\n');
}

function isValidParagraph(paragraph) {
  // Filter out common noise patterns
  if (paragraph.length < 50) return false;
  
  // Skip table of contents indicators
  if (/^page\s*\d+/i.test(paragraph)) return false;
  if (/^table\s*of\s*contents/i.test(paragraph)) return false;
  if (/^\d+\s*$/.test(paragraph)) return false;
  
  // Skip common disclaimers and boilerplate (but keep if they have substance)
  const boilerplatePatterns = [
    /^this\s*form\s*10-?q/i,
    /^forward[^.]*looking[^.]*statements[^.]*disclaimer/i,
    /^safe\s*harbor/i,
    /^the\s*following\s*discussion/i
  ];
  
  // Only skip if it's short boilerplate
  for (const pattern of boilerplatePatterns) {
    if (pattern.test(paragraph) && paragraph.length < 200) {
      return false;
    }
  }
  
  // Skip if it looks like table data
  return !isTableContent(paragraph);
}

function extractTextFromHtmlSnippet(htmlSnippet) {
  // Simple HTML tag removal and text extraction
  return htmlSnippet
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&lt;/g, '<') // Replace &lt;
    .replace(/&gt;/g, '>') // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#\d+;/g, ' ') // Replace numeric entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function isTableContent(text) {
  // Enhanced heuristics to detect if text is primarily table data or formatting artifacts
  const tableIndicators = [
    /^\$.*\$.*\$/m,                    // Lines with multiple dollar signs
    /^\d+\s+\d+\s+\d+/m,              // Lines starting with multiple numbers
    /\t.*\t.*\t/m,                    // Multiple tabs
    /\b\d{1,3},\d{3}\b.*\b\d{1,3},\d{3}\b/m, // Multiple formatted numbers
    /^\s*\d+\.\d+\s+\d+\.\d+/m,      // Multiple decimal numbers
    /^\s*[\(\$]?\d{1,3}(?:,\d{3})*[\)\$]?\s+[\(\$]?\d{1,3}(?:,\d{3})*[\)\$]?/m, // Financial table format
    /^[\s\d\$\(\),.-]+$/m,            // Lines with only numbers, symbols, and whitespace
    /\b(?:in\s+thousands|in\s+millions)\b/i, // Financial table headers
    /^\s*[A-Z\s]{5,50}\s*\d{1,3}(?:,\d{3})*\s*\d{1,3}(?:,\d{3})*/m // Headers followed by numbers
  ];
  
  // Check if the text has characteristics of table content
  const hasTableIndicators = tableIndicators.some(pattern => pattern.test(text));
  
  // Additional check: if text is mostly numbers and short words, likely a table
  const words = text.split(/\s+/);
  const numberCount = words.filter(word => /^\$?\d{1,3}(?:,\d{3})*\.?\d*\$?$/.test(word)).length;
  const isNumberHeavy = numberCount > words.length * 0.3;
  
  return hasTableIndicators || isNumberHeavy;
}

function cleanAndTruncateText(text, maxLength) {
  // Enhanced text cleaning
  let cleaned = text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines
    .replace(/\.\s*\n\s*\n/g, '.\n\n') // Clean up sentence breaks
    .replace(/^\s*[\d\.\)\-\s]*/, '') // Remove leading numbering/bullets
    .replace(/\s*\n\s*$/, '')       // Clean trailing whitespace
    .trim();

  // Remove common artifacts and page references
  cleaned = cleaned
    .replace(/\b(?:page|p\.)\s*\d+\b/gi, '') // Remove page references
    .replace(/\b(?:see|refer to)\s+(?:page|item|section|part)\s+[\w\d\-\.]+\b/gi, '') // Remove cross-references
    .replace(/\b(?:table|exhibit)\s+[\d\w\-\.]+\b/gi, '') // Remove table/exhibit references
    .replace(/\([^)]{1,3}\)/g, '')  // Remove short parenthetical references like (1), (a)
    .replace(/\s{2,}/g, ' ')        // Clean up multiple spaces again
    .trim();

  // Truncate if needed, trying to break at sentence boundaries
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  let truncated = cleaned.slice(0, maxLength);
  const lastSentence = truncated.lastIndexOf('. ');
  
  if (lastSentence > maxLength * 0.7) {
    // If we can break at a sentence boundary reasonably close to the limit
    return truncated.slice(0, lastSentence + 1).trim();
  }
  
  // Otherwise, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace).trim() + '...';
}