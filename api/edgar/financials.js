// Vercel serverless function to fetch SEC Company Facts financial time series
// GET /api/edgar/financials?cik=0000796343&freq=quarterly
// Returns: { revenue: [], expenses: [], cashFlow: [], calculations: {} }

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
    // Extract query parameters
    const { cik = '0000796343', freq = 'quarterly' } = req.query; // Default to Adobe
    const formattedCik = cik.toString().padStart(10, '0');
    
    // Validate frequency
    if (!['quarterly', 'annual'].includes(freq)) {
      return res.status(400).json({ error: 'freq must be "quarterly" or "annual"' });
    }

    console.log(`Fetching Company Facts for CIK ${formattedCik}, frequency: ${freq}`);

    // Fetch Company Facts from SEC API
    const companyFactsUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${formattedCik}.json`;
    const response = await fetch(companyFactsUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Company not found or no financial data available' });
      }
      throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
    }

    const companyFacts = await response.json();
    
    // Extract financial data
    const financialData = extractFinancialData(companyFacts, freq);
    
    // Set cache headers - cache for 6 hours since financial data updates infrequently
    res.setHeader('Cache-Control', 'public, max-age=21600, stale-while-revalidate=3600');
    
    return res.status(200).json({
      success: true,
      cik: formattedCik,
      entityName: companyFacts.entityName || 'Unknown',
      frequency: freq,
      data: financialData,
      source: 'SEC Company Facts API'
    });

  } catch (error) {
    console.error('SEC Company Facts fetch error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch financial data',
      details: error.message,
      source: 'SEC Company Facts API'
    });
  }
}

// Helper function to extract and process financial data
function extractFinancialData(companyFacts, frequency) {
  const facts = companyFacts.facts || {};
  const gaapFacts = facts['us-gaap'] || {};
  const deiFacts = facts.dei || {};
  
  // Revenue concepts to try (in order of preference)
  const revenueConcepts = [
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet', 
    'Revenues'
  ];
  
  // Operating expense concepts
  const operatingExpenseConcepts = ['OperatingExpenses'];
  const rdConcepts = ['ResearchAndDevelopmentExpense'];
  const sgaConcepts = ['SellingGeneralAndAdministrativeExpenses'];
  
  // Fallback expense concepts
  const fallbackExpenseConcepts = ['CostsAndExpenses', 'CostOfRevenue'];
  
  // Cash flow concepts
  const cashFlowConcepts = {
    operating: 'NetCashProvidedByUsedInOperatingActivities',
    investing: 'NetCashProvidedByUsedInInvestingActivities', 
    financing: 'NetCashProvidedByUsedInFinancingActivities'
  };

  // Extract data for each concept
  const revenue = extractConcept(gaapFacts, revenueConcepts, frequency);
  const operatingExpenses = extractConcept(gaapFacts, operatingExpenseConcepts, frequency);
  const rd = extractConcept(gaapFacts, rdConcepts, frequency);
  const sga = extractConcept(gaapFacts, sgaConcepts, frequency);
  
  // If no operating expenses found, try fallback concepts
  let expenses = operatingExpenses;
  if (!expenses.length) {
    expenses = extractConcept(gaapFacts, fallbackExpenseConcepts, frequency);
  }

  const cashFromOperations = extractConcept(gaapFacts, [cashFlowConcepts.operating], frequency);
  const cashFromInvesting = extractConcept(gaapFacts, [cashFlowConcepts.investing], frequency);
  const cashFromFinancing = extractConcept(gaapFacts, [cashFlowConcepts.financing], frequency);

  // Calculate YoY and TTM where applicable
  const calculations = {
    revenue: {
      yoy: calculateYoY(revenue),
      ttm: frequency === 'quarterly' ? calculateTTM(revenue) : null
    },
    cashFromOperations: {
      yoy: calculateYoY(cashFromOperations),
      ttm: frequency === 'quarterly' ? calculateTTM(cashFromOperations) : null
    }
  };

  return {
    revenue,
    operatingExpenses: expenses,
    rd,
    sga,
    cashFromOperations,
    cashFromInvesting,
    cashFromFinancing,
    calculations
  };
}

// Helper to extract a specific concept with fallback options
function extractConcept(facts, conceptNames, frequency) {
  for (const conceptName of conceptNames) {
    if (facts[conceptName] && facts[conceptName].units && facts[conceptName].units.USD) {
      const data = processConcept(facts[conceptName].units.USD, frequency);
      if (data.length > 0) {
        return data;
      }
    }
  }
  return [];
}

// Process concept data: filter, dedupe, sort
function processConcept(usdData, frequency) {
  // Filter for the right frequency and duration contexts
  const targetFrame = frequency === 'quarterly' ? 'Q' : 'CY';
  
  const filtered = usdData.filter(item => {
    // Must have end date and value
    if (!item.end || item.val == null) return false;
    
    // Must be USD
    if (!item.val || typeof item.val !== 'number') return false;
    
    // Duration contexts only (no instant/point-in-time)
    if (!item.start) return false;
    
    // Prefer 10-K and 10-Q forms
    if (item.form && !['10-K', '10-Q', '8-K'].includes(item.form)) return false;
    
    // Check if it matches the frequency we want
    if (frequency === 'quarterly') {
      // For quarterly, we want items that span roughly 3 months
      const start = new Date(item.start);
      const end = new Date(item.end);
      const months = (end - start) / (1000 * 60 * 60 * 24 * 30);
      return months >= 2 && months <= 4; // 2-4 months for quarterly
    } else {
      // For annual, we want items that span roughly 12 months
      const start = new Date(item.start);
      const end = new Date(item.end);
      const months = (end - start) / (1000 * 60 * 60 * 24 * 30);
      return months >= 10 && months <= 14; // 10-14 months for annual
    }
  });

  // Dedupe by period end date, keeping the latest filed
  const dedupedMap = new Map();
  
  filtered.forEach(item => {
    const key = item.end;
    const existing = dedupedMap.get(key);
    
    if (!existing || new Date(item.filed) > new Date(existing.filed)) {
      dedupedMap.set(key, {
        endDate: item.end,
        value: item.val,
        form: item.form || 'Unknown',
        filed: item.filed
      });
    }
  });

  // Convert to array and sort by end date (newest first)
  return Array.from(dedupedMap.values())
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
}

// Calculate year-over-year growth
function calculateYoY(data) {
  if (data.length < 2) return [];
  
  const yoyData = [];
  
  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    
    // Find the same period from the previous year
    const currentDate = new Date(current.endDate);
    const targetDate = new Date(currentDate);
    targetDate.setFullYear(currentDate.getFullYear() - 1);
    
    // Look for a period that ended around the same time last year (within 45 days)
    const tolerance = 45 * 24 * 60 * 60 * 1000; // 45 days in milliseconds
    
    const priorYear = data.find(item => {
      const itemDate = new Date(item.endDate);
      return Math.abs(itemDate - targetDate) <= tolerance;
    });
    
    if (priorYear && priorYear.value && current.value) {
      const growth = ((current.value - priorYear.value) / Math.abs(priorYear.value)) * 100;
      yoyData.push({
        endDate: current.endDate,
        currentValue: current.value,
        priorYearValue: priorYear.value,
        yoyGrowthPercent: parseFloat(growth.toFixed(2))
      });
    }
  }
  
  return yoyData.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
}

// Calculate trailing twelve months (TTM) for quarterly data
function calculateTTM(data) {
  if (data.length < 4) return [];
  
  const ttmData = [];
  
  for (let i = 0; i <= data.length - 4; i++) {
    const fourQuarters = data.slice(i, i + 4);
    const ttmValue = fourQuarters.reduce((sum, quarter) => sum + (quarter.value || 0), 0);
    
    ttmData.push({
      endDate: fourQuarters[0].endDate, // Most recent quarter end
      ttmValue: ttmValue,
      quarters: fourQuarters.map(q => ({ endDate: q.endDate, value: q.value }))
    });
  }
  
  return ttmData.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
}