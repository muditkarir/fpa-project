// Vercel serverless function to find latest EDGAR filing
// GET /api/edgar/latest-filing?cik=0000796343&form=10-Q
// Returns: { form, filedAt, accessionNumber, primaryDocumentUrl }

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
    // Extract and validate query parameters
    const { cik = '0000796343', form = '10-Q' } = req.query; // Default to Adobe
    
    if (!cik || !form) {
      return res.status(400).json({ error: 'cik and form parameters are required' });
    }

    // Ensure CIK is properly formatted (10 digits with leading zeros)
    const formattedCik = cik.toString().padStart(10, '0');
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${formattedCik}.json`;

    console.log(`Fetching submissions for CIK ${formattedCik}, form ${form}`);

    // Fetch company submissions with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch(submissionsUrl, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'application/json'
          }
        });

        if (response.ok) break;
        
        if (response.status === 429) {
          // Rate limited, wait and retry
          if (retryCount < maxRetries) {
            console.log('Rate limited, retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            retryCount++;
            continue;
          }
        }

        throw new Error(`EDGAR API responded with status: ${response.status}`);
      } catch (error) {
        if (retryCount >= maxRetries) throw error;
        console.log('Request failed, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        retryCount++;
      }
    }

    const data = await response.json();

    // Find the latest filing of the specified form type
    const { filings } = data;
    if (!filings || !filings.recent) {
      throw new Error('No recent filings found');
    }

    const { form: forms, filingDate: dates, accessionNumber: accessions, primaryDocument: documents } = filings.recent;
    
    if (!forms || !dates || !accessions || !documents) {
      throw new Error('Invalid filings data structure');
    }

    // Find the most recent filing of the requested form type
    let latestIndex = -1;
    for (let i = 0; i < forms.length; i++) {
      if (forms[i] === form) {
        latestIndex = i;
        break; // Arrays are ordered newest first
      }
    }

    if (latestIndex === -1) {
      return res.status(404).json({ 
        error: `No ${form} filings found for CIK ${formattedCik}` 
      });
    }

    const latestFiling = {
      form: forms[latestIndex],
      filedAt: dates[latestIndex],
      accessionNumber: accessions[latestIndex],
      primaryDocument: documents[latestIndex]
    };

    // Construct the primary document URL
    const cleanAccession = latestFiling.accessionNumber.replace(/-/g, '');
    const primaryDocumentUrl = `https://www.sec.gov/Archives/edgar/data/${formattedCik}/${cleanAccession}/${latestFiling.primaryDocument}`;

    // Set cache headers (cache for 1 hour)
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Vary', 'cik, form');

    return res.status(200).json({
      form: latestFiling.form,
      filedAt: latestFiling.filedAt,
      accessionNumber: latestFiling.accessionNumber,
      primaryDocumentUrl,
      cik: formattedCik
    });

  } catch (error) {
    console.error('Latest filing error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to fetch latest filing'
    });
  }
}