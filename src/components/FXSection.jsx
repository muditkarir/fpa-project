import React, { useState, useEffect } from 'react';

const FXSection = () => {
  const [fxData, setFxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFXData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fx/h10');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch exchange rate data');
        }
        
        setFxData(result);
      } catch (err) {
        console.error('FX data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFXData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="fx-live-data">
        <h4>📈 Current Exchange Rates</h4>
        <div className="fx-loading">
          <p>Loading live exchange rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fx-live-data">
        <h4>📈 Current Exchange Rates</h4>
        <div className="fx-error">
          <p>⚠️ Unable to load live exchange rate data: {error}</p>
          <p><em>Please check back later for updated rates.</em></p>
        </div>
      </div>
    );
  }

  if (!fxData || !fxData.data) {
    return null;
  }

  const { data, lastUpdated, source } = fxData;

  return (
    <div className="fx-live-data">
      <h4>📈 Current Exchange Rates</h4>
      <div className="fx-rates-grid">
        {data.eurUsd && (
          <div className="fx-rate-item">
            <div className="fx-rate-label">{data.eurUsd.label}</div>
            <div className="fx-rate-value">{data.eurUsd.value}</div>
            <div className="fx-rate-date">as of {formatDate(data.eurUsd.date)}</div>
          </div>
        )}
        
        {data.gbpUsd && (
          <div className="fx-rate-item">
            <div className="fx-rate-label">{data.gbpUsd.label}</div>
            <div className="fx-rate-value">{data.gbpUsd.value}</div>
            <div className="fx-rate-date">as of {formatDate(data.gbpUsd.date)}</div>
          </div>
        )}
        
        {data.tradeWeightedIndex && (
          <div className="fx-rate-item">
            <div className="fx-rate-label">{data.tradeWeightedIndex.label}</div>
            <div className="fx-rate-value">{data.tradeWeightedIndex.value}</div>
            <div className="fx-rate-date">as of {formatDate(data.tradeWeightedIndex.date)}</div>
          </div>
        )}
      </div>
      
      <div className="fx-source-note">
        <p><em>Source: {source} (live data)</em></p>
      </div>
    </div>
  );
};

export default FXSection;