import React, { useState, useEffect } from 'react';

const FinnhubSection = ({ symbol = 'ADBE' }) => {
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [peers, setPeers] = useState(null);
  const [loading, setLoading] = useState({
    profile: true,
    metrics: true,
    peers: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAllData();
  }, [symbol]);

  const fetchAllData = async () => {
    setLoading({ profile: true, metrics: true, peers: true });
    setErrors({});
    
    // Fetch all three endpoints in parallel
    await Promise.allSettled([
      fetchProfile(),
      fetchMetrics(),
      fetchPeers()
    ]);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/finnhub/profile2?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Profile error:', err);
      setErrors(prev => ({ ...prev, profile: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/finnhub/basic-financials?symbol=${symbol}&metric=all`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Metrics error:', err);
      setErrors(prev => ({ ...prev, metrics: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  };

  const fetchPeers = async () => {
    try {
      const response = await fetch(`/api/finnhub/peers?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch peers');
      const data = await response.json();
      setPeers(data);
    } catch (err) {
      console.error('Peers error:', err);
      setErrors(prev => ({ ...prev, peers: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, peers: false }));
    }
  };

  const formatMetricValue = (key, value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    const percentageMetrics = ['grossMargin', 'operatingMargin', 'netMargin', 'roeTTM', 'roaTTM', 'dividendYield'];
    const ratioMetrics = ['peRatio', 'pbRatio', 'evToSales', 'debtToEquity', 'currentRatio', 'beta'];
    
    if (percentageMetrics.includes(key)) {
      return `${(value * 100).toFixed(1)}%`;
    } else if (ratioMetrics.includes(key)) {
      return value.toFixed(2);
    } else {
      return value.toFixed(2);
    }
  };

  const getMetricDisplayName = (key) => {
    const displayNames = {
      peRatio: 'P/E Ratio',
      pbRatio: 'P/B Ratio',
      evToSales: 'EV/Sales',
      grossMargin: 'Gross Margin',
      operatingMargin: 'Operating Margin',
      netMargin: 'Net Margin',
      roeTTM: 'ROE',
      roaTTM: 'ROA',
      debtToEquity: 'Debt/Equity',
      currentRatio: 'Current Ratio',
      dividendYield: 'Dividend Yield',
      revenueGrowthTTM: 'Revenue Growth',
      beta: 'Beta'
    };
    return displayNames[key] || key;
  };

  const getTopMetrics = (metricsData) => {
    if (!metricsData?.metrics) return [];
    
    // Priority order for display
    const priorityOrder = ['peRatio', 'grossMargin', 'operatingMargin', 'debtToEquity', 'roeTTM'];
    const availableMetrics = Object.keys(metricsData.metrics);
    
    // Get priority metrics that are available
    const topMetrics = priorityOrder.filter(key => availableMetrics.includes(key));
    
    // If we have fewer than 5, add other available metrics
    if (topMetrics.length < 5) {
      const otherMetrics = availableMetrics
        .filter(key => !priorityOrder.includes(key))
        .slice(0, 5 - topMetrics.length);
      topMetrics.push(...otherMetrics);
    }
    
    return topMetrics.slice(0, 5); // Limit to 5 metrics
  };

  return (
    <div className="finnhub-section">
      <h3>Company Fundamentals</h3>
      <p className="data-source-note">
        Data via Finnhub (free tier) — no client-side keys; proxied through a serverless function.
      </p>

      {/* Company Profile */}
      <div className="subsection">
        <h4>Company Profile</h4>
        {loading.profile ? (
          <div className="loading-state">Loading profile...</div>
        ) : errors.profile ? (
          <div className="error-state">Error: {errors.profile}</div>
        ) : profile ? (
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">Name:</span>
              <span className="value">{profile.name}</span>
            </div>
            <div className="profile-item">
              <span className="label">Ticker:</span>
              <span className="value">{profile.ticker}</span>
            </div>
            <div className="profile-item">
              <span className="label">Exchange:</span>
              <span className="value">{profile.exchange}</span>
            </div>
            <div className="profile-item">
              <span className="label">Country:</span>
              <span className="value">{profile.country}</span>
            </div>
            {profile.weburl && (
              <div className="profile-item">
                <span className="label">Website:</span>
                <span className="value">
                  <a href={profile.weburl} target="_blank" rel="noopener noreferrer">
                    {profile.weburl.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              </div>
            )}
            {profile.finnhubIndustry && (
              <div className="profile-item">
                <span className="label">Industry:</span>
                <span className="value">{profile.finnhubIndustry}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data">No profile data available</div>
        )}
      </div>

      {/* Financial Metrics */}
      <div className="subsection">
        <h4>Key Financial Metrics</h4>
        {loading.metrics ? (
          <div className="loading-state">Loading metrics...</div>
        ) : errors.metrics ? (
          <div className="error-state">Error: {errors.metrics}</div>
        ) : metrics ? (
          <div className="metrics-grid">
            {getTopMetrics(metrics).map(key => (
              <div key={key} className="metric-item">
                <span className="metric-label">{getMetricDisplayName(key)}</span>
                <span className="metric-value">
                  {formatMetricValue(key, metrics.metrics[key])}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No financial metrics available</div>
        )}
      </div>

      {/* Peer Companies */}
      <div className="subsection">
        <h4>Peer Companies</h4>
        {loading.peers ? (
          <div className="loading-state">Loading peers...</div>
        ) : errors.peers ? (
          <div className="error-state">Error: {errors.peers}</div>
        ) : peers && peers.peers?.length > 0 ? (
          <div className="peers-container">
            <div className="peers-list">
              {peers.peers.map(ticker => (
                <span key={ticker} className="peer-ticker">{ticker}</span>
              ))}
            </div>
            <p className="peers-note">
              {peers.count} peer companies identified by Finnhub
            </p>
          </div>
        ) : (
          <div className="no-data">No peer data available</div>
        )}
      </div>
    </div>
  );
};

export default FinnhubSection;