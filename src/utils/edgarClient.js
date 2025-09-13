// EDGAR API client helper for fetching SEC filings data

export const fetchEDGARSubmissions = async (cik) => {
  if (!cik || cik.trim() === '') {
    throw new Error('CIK is required');
  }

  // Pad CIK to 10 digits with leading zeros (EDGAR format requirement)
  const paddedCik = cik.trim().padStart(10, '0');
  
  try {
    // EDGAR submissions endpoint - no API key required
    const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Adobe-FPA-Analysis contact@example.com', // Required by SEC
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CIK not found. Please check the CIK number and try again.');
      }
      throw new Error(`EDGAR API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to EDGAR. Please check your internet connection and try again.');
    }
    throw error;
  }
};

// Helper to format filing data for display
export const formatFilings = (submissionsData, limit = 5) => {
  if (!submissionsData || !submissionsData.filings || !submissionsData.filings.recent) {
    return [];
  }

  const recent = submissionsData.filings.recent;
  const filings = [];

  // Search through more filings to find the major forms we want
  const maxSearch = Math.min(50, recent.form.length); // Search up to 50 recent filings
  
  for (let i = 0; i < maxSearch && filings.length < limit; i++) {
    const form = recent.form[i];
    const filingDate = recent.filingDate[i];
    const accessionNumber = recent.accessionNumber[i];
    const primaryDocument = recent.primaryDocument[i];

    // Only include major forms (10-K, 10-Q, 8-K, DEF 14A)
    if (form.match(/^(10-K|10-Q|8-K|DEF 14A)/)) {
      // Build EDGAR document URL
      const cleanAccessionNumber = accessionNumber.replace(/-/g, '');
      const documentUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(submissionsData.cik)}/${cleanAccessionNumber}/${primaryDocument}`;

      filings.push({
        form,
        filingDate,
        accessionNumber,
        documentUrl,
        formattedDate: formatFilingDate(filingDate)
      });
    }
  }

  return filings;
};

// Format filing date for display
const formatFilingDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to get company name from submissions data
export const getCompanyName = (submissionsData) => {
  return submissionsData?.name || 'Unknown Company';
};