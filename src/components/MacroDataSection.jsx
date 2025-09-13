import React, { useState, useEffect } from 'react';
import { fetchCPIData, formatCPIObservations } from '../utils/fredClient';

const MacroDataSection = () => {
  const [cpiData, setCpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCPIData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchCPIData(12);
        const formattedObservations = formatCPIObservations(data.observations);
        
        setCpiData({
          ...data,
          formattedObservations
        });
      } catch (err) {
        setError(`Failed to load CPI data: ${err.message}`);
        console.warn('CPI data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCPIData();
  }, []);

  if (loading) {
    return (
      <div className="macro-data-section">
        <h3>Macroeconomic Context</h3>
        <div className="loading-state">Loading CPI data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="macro-data-section">
        <h3>Macroeconomic Context</h3>
        <div className="error-state">
          <p>⚠️ {error}</p>
          <p className="error-help">
            For local development: Add VITE_FRED_API_KEY to your .env file.<br />
            For production: Add FRED_API_KEY as a Vercel environment variable.
          </p>
        </div>
      </div>
    );
  }

  const observations = cpiData?.formattedObservations || [];
  const latestObservation = observations[0];

  return (
    <div className="macro-data-section">
      <h3>Macroeconomic Context</h3>
      
      <div className="macro-overview">
        <div className="macro-metric">
          <h4>Consumer Price Index (CPI-U)</h4>
          {latestObservation ? (
            <p className="latest-value">
              <strong>{latestObservation.formattedValue}</strong> 
              <span className="value-date">({latestObservation.formattedDate})</span>
            </p>
          ) : (
            <p className="no-data">No recent data available</p>
          )}
        </div>
      </div>

      {observations.length > 0 && (
        <div className="recent-observations">
          <h5>Recent 12 Months</h5>
          <div className="observations-grid">
            {observations.map((obs, index) => (
              <div key={obs.date} className="observation-item">
                <span className="obs-date">{obs.formattedDate}</span>
                <span className="obs-value">{obs.formattedValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="data-source">
        <p>
          <small>
            Source: Federal Reserve Economic Data (FRED), St. Louis Fed
            {cpiData?.observations && (
              <>
                {' • '} 
                Updated: {new Date().toLocaleDateString()}
                {' • '}
                {cpiData.observations.length} observations
              </>
            )}
          </small>
        </p>
      </div>
    </div>
  );
};

export default MacroDataSection;