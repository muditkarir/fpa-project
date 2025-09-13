import React, { useState, useEffect } from 'react';

const CompanyHeader = ({ symbol = 'ADBE' }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, [symbol]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/finnhub/profile2?symbol=${symbol}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please try again later.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch company data');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap || marketCap === 0) return 'N/A';
    
    // Market cap is usually in millions
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}T`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}B`;
    } else {
      return `$${marketCap.toFixed(0)}M`;
    }
  };

  if (loading) {
    return (
      <div className="company-header loading">
        <div className="loading-content">
          <div className="loading-placeholder"></div>
          <span>Loading company data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-header error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span>Unable to load company data: {error}</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="company-header">
      <div className="company-main-info">
        <div className="company-identity">
          <h2 className="company-name">
            {profile.name}
            <span className="ticker-symbol">({profile.ticker})</span>
          </h2>
          <div className="company-details">
            <span className="exchange">{profile.exchange}</span>
            <span className="separator">•</span>
            <span className="market-cap">{formatMarketCap(profile.marketCapitalization)}</span>
            {profile.country && profile.country !== 'Unknown' && (
              <>
                <span className="separator">•</span>
                <span className="country">{profile.country}</span>
              </>
            )}
          </div>
        </div>
        
        {profile.weburl && (
          <div className="company-link">
            <a 
              href={profile.weburl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="website-link"
            >
              Visit Website →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyHeader;