// Client helper for fetching FRED macro data via our secure API proxy

export const fetchFredData = async (seriesId, options = {}) => {
  const { limit = 12, sortOrder = 'desc', ...otherParams } = options;
  
  try {
    // Build query parameters
    const params = new URLSearchParams({
      series_id: seriesId,
      limit: String(limit),
      sort_order: sortOrder,
      ...otherParams
    });

    // Try development server first (localhost:3001), then Vercel serverless function
    const isDev = import.meta.env.DEV;
    const apiUrl = isDev 
      ? `http://localhost:3001/api/fred?${params}`
      : `/api/fred?${params}`;

    console.log(`Fetching FRED data from: ${apiUrl}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch FRED data');
    }

    return result.data;
  } catch (error) {
    console.error('FRED data fetch error:', error.message);
    throw error;
  }
};

// Specific helper for CPI data
export const fetchCPIData = async (limit = 12) => {
  return fetchFredData('CPIAUCSL', { limit });
};

// Helper to format CPI observations for display
export const formatCPIObservations = (observations) => {
  if (!observations || !Array.isArray(observations)) {
    return [];
  }

  return observations
    .filter(obs => obs.value !== '.')  // Filter out missing values
    .map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value),
      formattedDate: formatDate(obs.date),
      formattedValue: formatCPIValue(obs.value)
    }));
};

// Format date from YYYY-MM-DD to readable format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  });
};

// Format CPI value with appropriate precision
const formatCPIValue = (value) => {
  const numValue = parseFloat(value);
  return numValue.toFixed(1);
};